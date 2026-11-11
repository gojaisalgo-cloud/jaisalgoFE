'use client';

import {useEffect,useRef} from 'react';

/** Decorative, self-hosted footage; motion preferences are checked before loading. */
export function DesertHeroVideo(){
 const video=useRef<HTMLVideoElement>(null);
 useEffect(()=>{
  const el=video.current;if(!el)return;
  const media=matchMedia('(prefers-reduced-motion: reduce)');
  const connection=(navigator as Navigator&{connection?:{saveData?:boolean;addEventListener?:(type:string,listener:()=>void)=>void;removeEventListener?:(type:string,listener:()=>void)=>void}}).connection;
  let visible=false,disposed=false;
  function sync(){
   if(!el||disposed)return;
   const allowed=!media.matches&&!connection?.saveData;
   el.dataset.motionAllowed=String(allowed);
   if(!allowed||!visible||document.hidden||document.querySelector('dialog[open]')){el.pause();return;}
   if(!el.getAttribute('src'))el.src='/videos/jaisalmer-camel-desert.mp4';
   void el.play().catch(()=>{/* The poster remains visible when autoplay is unavailable. */});
  }
  const observer=new IntersectionObserver(entries=>{visible=entries[0]?.isIntersecting===true;sync()},{threshold:.05});observer.observe(el);
  const dialogs=new MutationObserver(sync);dialogs.observe(document.body,{subtree:true,attributes:true,attributeFilter:['open']});
  document.addEventListener('visibilitychange',sync);media.addEventListener('change',sync);connection?.addEventListener?.('change',sync);
  return()=>{disposed=true;el.pause();observer.disconnect();dialogs.disconnect();document.removeEventListener('visibilitychange',sync);media.removeEventListener('change',sync);connection?.removeEventListener?.('change',sync)};
 },[]);
 return <video ref={video} className="golden-hero-video" width={1280} height={720} poster="/videos/jaisalmer-camel-desert-poster.webp" muted loop playsInline preload="none" aria-hidden="true" tabIndex={-1} disablePictureInPicture/>;
}
