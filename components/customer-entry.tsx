'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
import {usePathname} from 'next/navigation';
import Link from 'next/link';
import {X,ShieldCheck,Sun,LogOut} from 'lucide-react';
import {Photo} from '@/components/photo';

type User={name:string;email:string};
type GoogleAccounts={initialize:(options:{client_id:string;nonce:string;auto_select:boolean;callback:(response:{credential:string})=>void})=>void;renderButton:(element:HTMLElement,options:Record<string,string|number>)=>void;disableAutoSelect:()=>void};
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
 const dialog=useRef<HTMLDialogElement>(null),googleButton=useRef<HTMLDivElement>(null),seen=useRef(false),generation=useRef(0);
 const [open,setOpen]=useState(false),[configured,setConfigured]=useState(false),[user,setUser]=useState<User|null>(null),[consent,setConsent]=useState(false),[phase,setPhase]=useState<'idle'|'loading'|'ready'|'saving'>('idle'),[error,setError]=useState('');
 const dismiss=useCallback(()=>{generation.current++;seen.current=true;try{sessionStorage.setItem(seenKey,'1')}catch{}setOpen(false);setConsent(false);setPhase('idle');setError('')},[]);
 useEffect(()=>{let live=true;const controller=new AbortController();fetch('/api/auth/session',{cache:'no-store',signal:controller.signal}).then(r=>r.json()).then(data=>{if(!live)return;setConfigured(data.configured===true);setUser(data.user||null);let wasSeen=seen.current;try{wasSeen=wasSeen||sessionStorage.getItem(seenKey)==='1'}catch{}if(data.configured&&!data.user&&!wasSeen&&!privatePath(path)){seen.current=true;try{sessionStorage.setItem(seenKey,'1')}catch{}setOpen(true)}}).catch(()=>{});return()=>{live=false;controller.abort()}},[path]);
 useEffect(()=>{const show=()=>{setError('');setOpen(true)};window.addEventListener('jaisalgo:open-account',show);return()=>window.removeEventListener('jaisalgo:open-account',show)},[]);
 useEffect(()=>{if(!open)return;const el=dialog.current;if(!el)return;const trigger=document.activeElement instanceof HTMLElement?document.activeElement:null,overflow=document.body.style.overflow;el.showModal();document.body.style.overflow='hidden';return()=>{el.close();document.body.style.overflow=overflow;if(trigger?.isConnected)trigger.focus({preventScroll:true})}},[open]);
 useEffect(()=>{
  if(!open||!consent||user||!configured)return;
  const current=++generation.current,element=googleButton.current;let active=true,resize:ResizeObserver|undefined;
  const valid=()=>active&&generation.current===current;
  (async()=>{
   try{
    const response=await fetch('/api/auth/google/challenge',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({consent:true})}),challenge=await response.json();if(!response.ok)throw Error(challenge.error||'Could not start sign-in.');
    await loadGoogle();if(!valid()||!googleButton.current)return;
    window.google!.accounts.id.initialize({client_id:challenge.clientId,nonce:challenge.nonce,auto_select:false,callback:async({credential})=>{
     if(!valid())return;setPhase('saving');setError('');
     try{const res=await fetch('/api/auth/google',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({credential,nonce:challenge.nonce,consent:true})}),data=await res.json();if(!res.ok)throw Error(data.error||'Sign-in could not be completed.');if(valid()){setUser(data.user);dismiss()}}
     catch(e){if(valid()){setError(e instanceof Error?e.message:'Please try again.');setConsent(false);setPhase('idle')}}
    }});
    let lastWidth=0;const render=()=>{if(!valid()||!element)return;const width=Math.min(400,Math.floor(element.clientWidth));if(width===lastWidth||width<1)return;lastWidth=width;element.replaceChildren();window.google!.accounts.id.renderButton(element,{type:'standard',theme:'outline',size:'large',text:'continue_with',shape:'pill',width})};render();if(element){resize=new ResizeObserver(render);resize.observe(element)}setPhase('ready');
   }catch(e){if(valid()){setError(e instanceof Error?e.message:'Google sign-in could not load.');setConsent(false);setPhase('idle')}}
  })();return()=>{active=false;resize?.disconnect();element?.replaceChildren()};
 },[open,consent,user,configured,dismiss]);
 async function signOut(){setPhase('saving');setError('');try{const r=await fetch('/api/auth/session',{method:'POST'});if(!r.ok)throw Error('Could not sign out. Please try again.');window.google?.accounts.id.disableAutoSelect();setUser(null);dismiss()}catch(e){setError(e instanceof Error?e.message:'Please try again.');setPhase('idle')}}
 if(!open)return null;
 return <dialog ref={dialog} className="customer-entry ph-no-capture" data-posthog-private aria-labelledby="customer-title" onCancel={e=>{e.preventDefault();dismiss()}} onClick={e=>{if(e.target===e.currentTarget){const r=e.currentTarget.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dismiss()}}}>
  <button type="button" className="customer-close" aria-label="Close account popup" onClick={dismiss} autoFocus><X size={20}/></button>
  <div className="customer-art"><Photo id="fort" sizes="(max-width: 640px) 100vw, 420px"/><div className="customer-art-copy"><span><Sun size={20}/>JAISALGO</span><h2>A golden state<br/>of mind.</h2><p>Your next Jaisalmer story starts here.</p></div></div>
  <div className="customer-panel"><span className="customer-eyebrow">YOUR JAISALGO ACCOUNT</span><h2 id="customer-title">{user?'Good to see you.':'A little closer to your next escape.'}</h2>
   {user?<><p className="customer-intro">You’re signed in with Google.</p><div className="customer-profile"><strong>{user.name}</strong><span>{user.email}</span></div><Link className="button" href="/my-bookings" onClick={dismiss}>My bookings</Link><p className="customer-note">Use your private booking link or access key to view a reservation.</p><button type="button" className="customer-guest" disabled={phase==='saving'} onClick={signOut}><LogOut size={16}/>Sign out</button></>:<>
    <p className="customer-intro">Continue with Google, or explore Jaisalmer as a guest.</p>
    {configured?<><label className="customer-consent"><input type="checkbox" checked={consent} disabled={phase==='saving'} onChange={e=>{setConsent(e.target.checked);setPhase(e.target.checked?'loading':'idle');setError('')}}/><span>I agree to share my name and Google email with JaisalGo’s private travel-desk WhatsApp group for enquiry support.</span></label><div className="customer-google-area" aria-busy={phase==='loading'||phase==='saving'}><div ref={googleButton} className="customer-google" hidden={!consent||phase==='saving'}/>{(!consent||phase!=='ready')&&<p role="status">{phase==='saving'?'Completing your sign-in…':phase==='loading'?'Loading Google sign-in…':'Confirm the notice above to continue with Google.'}</p>}</div></>:<p className="customer-note">Google sign-in is being connected. You can continue browsing and booking as a guest.</p>}
    {error&&<p className="customer-error" role="alert">{error}</p>}
    <button type="button" className="customer-guest" onClick={dismiss}>Continue as a guest <span aria-hidden="true">→</span></button>
    <p className="customer-note"><ShieldCheck size={16}/>Google sign-in is optional. No booking or payment is made.</p><p className="customer-legal">By signing in, you agree to our <Link href="/terms" onClick={dismiss}>terms</Link> and acknowledge our <Link href="/privacy-policy" onClick={dismiss}>privacy notice</Link>.</p>
   </>}
  </div>
 </dialog>;
}
