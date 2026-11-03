'use client';
import {useEffect} from 'react';
import {usePathname} from 'next/navigation';
export function ScrollExperience(){
  const path=usePathname();
  useEffect(()=>{
    const media=matchMedia('(prefers-reduced-motion: reduce)');
    const elements=Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
    const hero=document.querySelector<HTMLElement>('.cinematic-hero');
    let observer:IntersectionObserver|undefined;
    let frame=0;
    const render=()=>{
      frame=0;
      if(!hero)return;
      const rect=hero.getBoundingClientRect();
      const progress=Math.max(0,Math.min(1,-rect.top/rect.height));
      hero.style.setProperty('--hero-drift',`${progress*42}px`);
    };
    const scroll=()=>{if(!frame)frame=requestAnimationFrame(render)};
    const stop=()=>{
      observer?.disconnect();
      window.removeEventListener('scroll',scroll);
      window.removeEventListener('resize',scroll);
      cancelAnimationFrame(frame);
      frame=0;
      hero?.style.removeProperty('--hero-drift');
      elements.forEach(el=>el.classList.remove('reveal-ready','is-revealed'));
    };
    const start=()=>{
      stop();
      if(media.matches)return;
      if('IntersectionObserver'in window){
        observer=new IntersectionObserver(entries=>{
          for(const entry of entries)if(entry.isIntersecting){
            entry.target.classList.add('is-revealed');
            observer?.unobserve(entry.target);
          }
        },{threshold:.08,rootMargin:'0px 0px -24px 0px'});
        elements.forEach(el=>{
          // Content is readable without JS; only prepare off-screen elements.
          if(el.getBoundingClientRect().top>innerHeight){
            el.classList.add('reveal-ready');
            observer?.observe(el);
          }
        });
      }
      if(hero){
        render();
        window.addEventListener('scroll',scroll,{passive:true});
        window.addEventListener('resize',scroll,{passive:true});
      }
    };
    start();
    media.addEventListener('change',start);
    return()=>{stop();media.removeEventListener('change',start)};
  },[path]);
  return null;
}
