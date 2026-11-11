'use client';
import {useEffect,useRef,useState} from 'react';
import Image from 'next/image';
import {artWidth,artHeight,renderColorCount,colorSteps,culturalTargets,type ParticlePoint} from '@/lib/motion/heritage-particles';

const durations=[2800,2000,3300,3300,3300,4800,2500];
const names=['mustache','namaste','woman','namaste-man','rajasthani-elder','ram-bow','arrival'];
const ease=(n:number)=>{const t=Math.max(0,Math.min(1,n));return t*t*(3-2*t)};
export function HeritageWelcome(){
 const canvas=useRef<HTMLCanvasElement>(null),container=useRef<HTMLDivElement>(null),paused=useRef(false),resume=useRef<()=>void>(()=>{});
 const [isPaused,setPaused]=useState(false);
 useEffect(()=>{
  const el=canvas.current,box=container.current;if(!el||!box)return;
  const ctx=el.getContext('2d');if(!ctx)return;
  const media=matchMedia('(prefers-reduced-motion: reduce)'),hardware=navigator as Navigator&{deviceMemory?:number};
  const lean=matchMedia('(max-width:700px)').matches||(hardware.hardwareConcurrency||4)<4||(hardware.deviceMemory||4)<4;
  const count=lean?2600:4600,scale=Math.min(devicePixelRatio||1,lean?1.5:2);
  el.width=artWidth*scale;el.height=artHeight*scale;ctx.scale(scale,scale);
  let frame=0,last=0,elapsed=0,visible=false,covered=false,disposed=false,ready=false,slowFrames=0,stride=1;
  let targets:ParticlePoint[][]=[],dust:ParticlePoint[]=[];
  const pointer={x:-1000,y:-1000};
  function draw(time:number){
   if(!ctx||!ready||!el)return;
   let local=time%22000,stage=0;while(local>=durations[stage]){local-=durations[stage];stage++}
   const to=stage===6?dust:targets[stage],from=stage===0?dust:targets[stage-1];
   const gathering=stage===0,dispersing=stage===6,span=gathering?1550:dispersing?1600:1050;
   ctx.clearRect(0,0,artWidth,artHeight);
   for(let i=0;i<count;i+=stride){
    const a=from[i],b=to[i],t=ease((local-(i%23)*7)/span);
    let x=a.x+(b.x-a.x)*t,y=a.y+(b.y-a.y)*t;
    const drift=Math.sin(time/1050+i*.13)*.45;
    y+=drift*(stage===5?1-t:1-t*.7);
    if(gathering||dispersing){const swirl=Math.sin(t*Math.PI)*(gathering?9:6);x+=Math.cos(i*.07+time/1600)*swirl;y+=Math.sin(i*.07+time/1600)*swirl;}
    if(stage===0&&b.y<210)y-=Math.max(0,Math.abs(b.x-320)-115)/90*Math.sin(time/650)*1.5*t;
    if((stage===3||stage===4)&&b.color===5&&b.y>128&&b.y<170)y-=Math.sin(time/700)*.65*t;
    if(stage>=2&&stage<=4&&b.y<278){const bow=Math.sin(Math.max(0,local-1200)/1400)*.8*t;y+=bow;}
    // Keep the reference bowstring alive without distorting the pose.
    if(stage===5&&b.color===12){const stringX=b.y<110?391-b.y*.513:334.8+(b.y-110)*1.02;if(Math.abs(b.x-stringX)<2)x+=Math.sin(time/180)*.25*t;}
    const dx=x-pointer.x,dy=y-pointer.y,d=Math.hypot(dx,dy);if(stage!==5&&d<65&&d>1){const push=(1-d/65)*2.5;x+=dx/d*push;y+=dy/d*push;}
    ctx.globalAlpha=(stage===5?.98:.9+Math.sin(i*.31+time/1900)*.08)*(time<500?Math.min(1,time/500):1);
    ctx.fillStyle=colorSteps[a.color*renderColorCount+b.color][Math.round(t*16)];
    ctx.beginPath();ctx.arc(x,y,b.y>300?1.7:stage===5?1.65:lean?1.65:1.45,0,Math.PI*2);ctx.fill();
   }
   ctx.globalAlpha=1;if(el.dataset.stage!==names[stage])el.dataset.stage=names[stage];
  }
  function tick(now:number){
   frame=0;if(disposed||!ready||!visible||covered||document.hidden||media.matches||paused.current)return;
   const delta=last?now-last:0;if(last)elapsed+=Math.min(delta,90);last=now;
   // Sustain the full shape on slower hardware by drawing a stable subset.
   if(delta>28&&delta<150)slowFrames++;else slowFrames=Math.max(0,slowFrames-1);
   if(slowFrames>80)stride=2;
   draw(elapsed);frame=requestAnimationFrame(tick);
  }
  function sync(){cancelAnimationFrame(frame);frame=0;last=0;covered=Boolean(document.querySelector('dialog[open]'));if(!ready||media.matches||paused.current)return;if(visible&&!covered&&!document.hidden&&!disposed)frame=requestAnimationFrame(tick)}
  resume.current=sync;
  const observer=new IntersectionObserver(entries=>{visible=entries[0]?.isIntersecting===true;sync()},{threshold:.08});observer.observe(box);
  const dialogs=new MutationObserver(sync);dialogs.observe(document.body,{subtree:true,attributes:true,attributeFilter:['open']});
  const move=(e:PointerEvent)=>{if(e.pointerType!=='mouse')return;const r=el.getBoundingClientRect();pointer.x=(e.clientX-r.left)/r.width*artWidth;pointer.y=(e.clientY-r.top)/r.height*artHeight};
  const leave=()=>{pointer.x=-1000;pointer.y=-1000};
  box.addEventListener('pointermove',move);box.addEventListener('pointerleave',leave);document.addEventListener('visibilitychange',sync);media.addEventListener('change',sync);
  culturalTargets(count).then(data=>{if(disposed)return;targets=data.targets;dust=data.dust;ready=true;elapsed=350;draw(elapsed);box.dataset.ready='true';sync()}).catch(()=>{/* Keep the accessible, original static artwork visible on failure. */});
  return()=>{disposed=true;cancelAnimationFrame(frame);observer.disconnect();dialogs.disconnect();resume.current=()=>{};box.removeAttribute('data-ready');box.removeEventListener('pointermove',move);box.removeEventListener('pointerleave',leave);document.removeEventListener('visibilitychange',sync);media.removeEventListener('change',sync)};
 },[]);
 function toggle(){paused.current=!paused.current;setPaused(paused.current);resume.current()}
 return <div ref={container} className="heritage-welcome" role="group" aria-label="Indian cultural welcome"><span className="heritage-welcome-fallback"><Image src="/art/heritage/namaste-man.svg" width={100} height={116} alt="" unoptimized/><span>नमस्ते<small>खम्मा घणी सा</small></span></span><canvas ref={canvas} role="img" aria-label="Colourful particles form a Rajasthani mustache, नमस्ते, a woman and two Rajasthani men with folded hands, खम्मा घणी सा, and Lord Ram with his bow."/><button type="button" className="heritage-welcome-pause" onClick={toggle} aria-label={isPaused?'Play welcome animation':'Pause welcome animation'} aria-pressed={isPaused}>{isPaused?'Play':'Pause'}</button></div>;
}
