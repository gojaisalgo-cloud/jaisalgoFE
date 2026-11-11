'use client';
import {captureBehaviour,captureBehaviourOnce,setCustomerAnalyticsIdentity} from '@/lib/analytics/posthog-client';
import {measurement,resetAnalyticsForLogout} from '@/lib/analytics/client';
import {useCallback,useEffect,useRef,useState} from 'react';
import {usePathname,useRouter} from 'next/navigation';
import Link from 'next/link';
import {X,ShieldCheck,Sun,LogOut,ArrowRight} from 'lucide-react';
import {Photo} from '@/components/photo';

type User={name:string;email:string};
type GoogleAccounts={initialize:(options:{client_id:string;nonce:string;auto_select:boolean;callback:(response:{credential:string})=>void})=>void;renderButton:(element:HTMLElement,options:Record<string,string|number|(()=>void)>)=>void;disableAutoSelect:()=>void};
declare global {interface Window{google?:{accounts:{id:GoogleAccounts}}}}
let googleScript:Promise<void>|undefined;
function loadGoogle(){
 if(window.google?.accounts.id)return Promise.resolve();
 if(!googleScript)googleScript=new Promise<void>((resolve,reject)=>{
  const script=document.createElement('script');script.src='https://accounts.google.com/gsi/client';script.async=true;script.defer=true;
  script.onload=()=>resolve();script.onerror=()=>{script.remove();googleScript=undefined;reject(Error('Google could not load. Please try again.'))};document.head.appendChild(script);
 });return googleScript;
}
const privatePath=(path:string)=>/^\/(book|reservations|verify|admin|my-bookings|api)(\/|$)/.test(path);
const seenKey='jaisalgo-entry-seen';
export function CustomerEntry(){const path=usePathname();return <CustomerEntryPanel key={path} path={path}/>}
function CustomerEntryPanel({path}:{path:string}){
 const router=useRouter(),bookingsSignIn=path==='/my-bookings';
 const dialog=useRef<HTMLDialogElement>(null),googleButton=useRef<HTMLDivElement>(null),seen=useRef(false),generation=useRef(0);
 const [open,setOpen]=useState(false),[configured,setConfigured]=useState(false),[user,setUser]=useState<User|null>(null),[phase,setPhase]=useState<'idle'|'loading'|'ready'|'saving'>('idle'),[error,setError]=useState('');
 const dismiss=useCallback(()=>{generation.current++;seen.current=true;try{sessionStorage.setItem(seenKey,'1')}catch{}setOpen(false);setPhase('idle');setError('')},[]);
 const closePrompt=()=>{captureBehaviour('auth_prompt_dismissed');dismiss();if(bookingsSignIn)router.replace('/')};
 useEffect(()=>{let live=true;let welcomeTimer:ReturnType<typeof setTimeout>|undefined;const started=Date.now();const controller=new AbortController();fetch('/api/auth/session',{cache:'no-store',signal:controller.signal}).then(r=>r.json()).then(data=>{if(!live)return;setConfigured(data.configured===true);setUser(data.user||null);setCustomerAnalyticsIdentity(data.user?.analyticsId);let wasSeen=seen.current;try{wasSeen=wasSeen||sessionStorage.getItem(seenKey)==='1'}catch{}if(!data.user&&(bookingsSignIn||(data.configured&&!wasSeen&&!privatePath(path)))){const showWelcome=()=>{if(!live||(!bookingsSignIn&&seen.current))return;seen.current=true;try{sessionStorage.setItem(seenKey,'1')}catch{}setOpen(true)};if(bookingsSignIn)showWelcome();else welcomeTimer=setTimeout(showWelcome,Math.max(0,5000-(Date.now()-started)))}}).catch(()=>{});return()=>{live=false;clearTimeout(welcomeTimer);controller.abort()}},[path,bookingsSignIn]);
 useEffect(()=>{const show=()=>{seen.current=true;setError('');setOpen(true)};window.addEventListener('jaisalgo:open-account',show);return()=>window.removeEventListener('jaisalgo:open-account',show)},[]);
 useEffect(()=>{if(!open)return;const el=dialog.current;if(!el)return;captureBehaviourOnce('auth-prompt','auth_prompt_viewed');const trigger=document.activeElement instanceof HTMLElement?document.activeElement:null,overflow=document.body.style.overflow;el.showModal();document.body.style.overflow='hidden';return()=>{el.close();document.body.style.overflow=overflow;if(trigger?.isConnected)trigger.focus({preventScroll:true})}},[open]);
 useEffect(()=>{
  if(!open||user||!configured)return;
  const current=++generation.current,element=googleButton.current;let active=true,resize:ResizeObserver|undefined;
  const valid=()=>active&&generation.current===current;
  (async()=>{
   try{
    const response=await fetch('/api/auth/google/challenge',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({consent:true})}),challenge=await response.json();if(!response.ok)throw Error(challenge.error||'Could not start sign-in.');
    await loadGoogle();if(!valid()||!googleButton.current)return;
    window.google!.accounts.id.initialize({client_id:challenge.clientId,nonce:challenge.nonce,auto_select:false,callback:async({credential})=>{
     if(!valid())return;setPhase('saving');setError('');
     try{const res=await fetch('/api/auth/google',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({credential,nonce:challenge.nonce,consent:true,measurement:measurement()})}),data=await res.json();if(!res.ok)throw Error(data.error||'Sign-in could not be completed.');if(valid()){setCustomerAnalyticsIdentity(data.user?.analyticsId);setUser(data.user);dismiss();router.refresh()}}
     catch(e){if(valid()){captureBehaviour('login_failed',{sign_in_method:'google',reason:'unknown'});setError(e instanceof Error?e.message:'Please try again.');setPhase('idle')}}
    }});
    let lastWidth=0;const render=()=>{if(!valid()||!element)return;const width=Math.min(400,Math.floor(element.clientWidth));if(width===lastWidth||width<1)return;lastWidth=width;element.replaceChildren();window.google!.accounts.id.renderButton(element,{type:'standard',theme:'outline',size:'large',text:'continue_with',shape:'pill',width,click_listener:()=>captureBehaviour('login_started',{sign_in_method:'google'})})};render();if(element){resize=new ResizeObserver(render);resize.observe(element)}setPhase('ready');
   }catch(e){if(valid()){setError(e instanceof Error?e.message:'Google sign-in could not load.');setPhase('idle')}}
  })();return()=>{active=false;resize?.disconnect();element?.replaceChildren()};
 },[open,user,configured,dismiss,router]);
 async function signOut(){setPhase('saving');setError('');try{const r=await fetch('/api/auth/session',{method:'POST'});if(!r.ok)throw Error('Could not sign out. Please try again.');captureBehaviour('logout_completed');resetAnalyticsForLogout();window.google?.accounts.id.disableAutoSelect();setUser(null);dismiss();router.refresh()}catch(e){setError(e instanceof Error?e.message:'Please try again.');setPhase('idle')}}
 if(!open)return null;
 return <dialog ref={dialog} className="customer-entry ph-no-capture" data-posthog-private aria-labelledby="customer-title" onCancel={e=>{e.preventDefault();closePrompt()}} onClick={e=>{if(e.target===e.currentTarget){const r=e.currentTarget.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closePrompt()}}}>
  <button type="button" className="customer-close" aria-label="Close account popup" onClick={closePrompt} autoFocus><X size={20}/></button>
  <div className="customer-art"><Photo id="khuri" sizes="(max-width: 640px) 100vw, 600px"/><div className="customer-art-copy"><span><Sun size={18} aria-hidden="true"/>JAISALGO</span><p>A golden state of mind.</p></div><span className="customer-token-badge"><strong>₹99</strong><span>to reserve</span></span></div>
  <div className="customer-panel"><span className="customer-eyebrow">JAISALMER IS CALLING</span><h2 id="customer-title">{user?'Good to see you.':bookingsSignIn?'Sign in to My bookings':'Your next desert escape starts with ₹99.'}</h2>
   {user?<><p className="customer-intro">You’re signed in with Google.</p><div className="customer-profile"><strong>{user.name}</strong><span>{user.email}</span></div><Link className="button" href="/my-bookings" onClick={dismiss}>My bookings</Link><p className="customer-note">Use your private booking link or access key to view a reservation.</p><button type="button" className="customer-guest" disabled={phase==='saving'} onClick={signOut}><LogOut size={16}/>Sign out</button></>:<>
    {bookingsSignIn?<p className="customer-intro">Continue with Google to view the bookings and tickets saved on this device.</p>:<><p className="customer-intro">A little now. More adventure later.<br/>Your ₹99 token counts towards the package total.</p><Link className="button customer-explore" href="/packages" onClick={dismiss}>Find your Jaisalmer escape <ArrowRight size={18} aria-hidden="true"/></Link><p className="customer-offer-terms">Final services &amp; availability require supplier confirmation. <Link href="/cancellation-policy" onClick={dismiss}>Booking terms</Link></p></>}<div className="customer-signin-label"><span>{bookingsSignIn?'Continue with Google':'Or continue with Google'}</span></div>
    {configured?<><p className="customer-note">By continuing with Google, you agree to share your name and Google email with JaisalGo’s private travel-desk WhatsApp group for enquiry support.</p><div className="customer-google-area" aria-busy={phase==='loading'||phase==='saving'}><div ref={googleButton} className="customer-google" hidden={phase==='saving'}/>{(phase!=='ready')&&<p role="status">{phase==='saving'?'Completing your sign-in…':phase==='loading'?'Loading Google sign-in…':'Loading Google sign-in…'}</p>}</div></>:<p className="customer-note">{bookingsSignIn?'Google sign-in is temporarily unavailable. Please try again later.':'Google sign-in is being connected. You can continue browsing and booking as a guest.'}</p>}
    {error&&<p className="customer-error" role="alert">{error}</p>}
    {bookingsSignIn?<Link className="customer-guest" href="/packages" onClick={dismiss}>Continue browsing</Link>:<button type="button" className="customer-guest" onClick={closePrompt}>Continue as a guest <span aria-hidden="true">→</span></button>}
    <p className="customer-note"><ShieldCheck size={16}/>{bookingsSignIn?'Sign-in is required for My bookings. No booking or payment is made.':'Google sign-in is optional. No booking or payment is made.'}</p><p className="customer-legal">By signing in, you agree to our <Link href="/terms" onClick={dismiss}>terms</Link> and acknowledge our <Link href="/privacy-policy" onClick={dismiss}>privacy notice</Link>.</p>
   </>}
  </div>
 </dialog>;
}
