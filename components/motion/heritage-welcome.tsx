'use client';
import {useEffect,useRef} from 'react';

const palette=['#FF9933','#4169E1','#22C55E','#EC4899','#FACC15','#8B5CF6','#06B6D4'];
type Point={x:number;y:number};
const width=600,height=168;
const ease=(n:number)=>{const t=Math.max(0,Math.min(1,n));return t*t*(3-2*t)};

/** Rasterize each silhouette once; animation only interpolates the cached points. */
function silhouette(kind:'hands'|'namaste'|'greeting'|'mustache',count:number):Point[]{
 const mask=document.createElement('canvas');mask.width=width;mask.height=height;
 const ctx=mask.getContext('2d',{willReadFrequently:true});if(!ctx)return [];
 ctx.fillStyle='#fff';ctx.strokeStyle='#fff';ctx.lineCap='round';ctx.lineJoin='round';
 if(kind==='namaste'||kind==='greeting'){
  ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=kind==='namaste'?'600 79px Georgia, serif':'600 59px Georgia, serif';
  ctx.fillText(kind==='namaste'?'Namaste':'Khamma Ghani Sa',width/2,height/2,width-28);
 }else if(kind==='hands'){
  ctx.lineWidth=5;
  // Two palms meet at the fingertips, with fingers and angled sleeve cuffs.
  const palm=new Path2D('M 296 22 C 291 15 286 23 285 36 L 278 74 L 265 98 C 259 108 261 118 267 125 L 285 137 L 299 114 L 300 31 C 300 24 298 21 296 22 M 286 40 L 285 87 M 279 58 L 279 91 M 273 77 L 272 97 M 265 97 L 267 106 M 300 65 L 290 94 L 288 111');
  ctx.stroke(palm);ctx.save();ctx.translate(width,0);ctx.scale(-1,1);ctx.stroke(palm);ctx.restore();
  ctx.fill(new Path2D('M 261 119 L 289 137 L 275 159 L 244 143 Z M 339 119 L 311 137 L 325 159 L 356 143 Z'));
 }else{
  ctx.fill(new Path2D('M 300 86 C 280 57 259 60 240 78 C 217 102 184 105 171 83 C 159 61 184 45 196 60 C 200 66 196 72 190 72 C 197 60 179 58 177 69 C 172 93 205 82 220 66 C 243 39 272 45 300 67 C 328 45 357 39 380 66 C 395 82 428 93 423 69 C 421 58 403 60 410 72 C 404 72 400 66 404 60 C 416 45 441 61 429 83 C 416 105 383 102 360 78 C 341 60 320 57 300 86 Z'));
 }
 const pixels=ctx.getImageData(0,0,width,height).data,candidates:Point[]=[];
 for(let y=5;y<height-5;y+=2)for(let x=8;x<width-8;x+=2)if(pixels[(y*width+x)*4+3]>100)candidates.push({x,y});
 if(!candidates.length)return [];
 return Array.from({length:count},(_,i)=>candidates[Math.floor(i*candidates.length/count)]);
}
export function HeritageWelcome(){
 const canvas=useRef<HTMLCanvasElement>(null),container=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  const el=canvas.current,box=container.current;if(!el||!box)return;
  const ctx=el.getContext('2d');if(!ctx)return;
  const media=matchMedia('(prefers-reduced-motion: reduce)'),small=matchMedia('(max-width:700px)').matches;
  const hardware=navigator as Navigator&{deviceMemory?:number};
  const lean=small||(hardware.hardwareConcurrency||4)<4||(hardware.deviceMemory||4)<4;
  const count=lean?800:1200,shapes=(['hands','namaste','greeting','mustache'] as const).map(kind=>silhouette(kind,count));
  if(shapes.some(shape=>!shape.length))return;
  const seeds=Array.from({length:count},(_,i)=>{const angle=i*2.399963,cluster=i%7;return {x:width/2+Math.cos(cluster*Math.PI*2/7)*24+Math.cos(angle)*Math.sqrt(i/count)*240,y:height/2+Math.sin(cluster*Math.PI*2/7)*18+Math.sin(angle)*Math.sqrt(i/count)*70}});
  let frame=0,last=0,elapsed=0,drawn=0,visible=false,covered=false,disposed=false;
  const scale=Math.min(devicePixelRatio||1,lean?1.5:2);el.width=width*scale;el.height=height*scale;ctx.scale(scale,scale);
  function draw(time:number){
   if(!ctx||!el)return;ctx.clearRect(0,0,width,height);
   const stage=time<3000?0:time<5000?1:time<7500?2:3;
   const stageStart=[0,3000,5000,7500][stage],duration=stage===0?1500:stage===3?1100:650;
   for(let i=0;i<count;i++){
    const progress=media.matches?1:ease((time-stageStart-(i%19)*9)/duration),from=stage===0?seeds[i]:shapes[stage-1][i],to=shapes[stage][i];
    const settle=time>=9000,breath=settle?Math.sin(time/2100+i*.027)*.35:Math.sin(time/630+i*.31)*.6*(1-progress);
    let x=from.x+(to.x-from.x)*progress,y=from.y+(to.y-from.y)*progress+breath;
    if(stage===3){const tip=Math.max(0,(Math.abs(to.x-width/2)-70)/70);const idlePhase=(time-9000)%18000;const curl=media.matches?0:time<9000?Math.sin(Math.min(1,(time-7500)/1500)*Math.PI)*2.2:idlePhase<1200?Math.sin(idlePhase/1200*Math.PI)*.8:0; y-=tip*curl;}
    if(time<1500&&!media.matches){const cluster=i%7,blend=ease(time/1000);x=(width/2+Math.cos(cluster*Math.PI*2/7)*58)*(1-blend)+x*blend;y=(height/2+Math.sin(cluster*Math.PI*2/7)*25)*(1-blend)+y*blend;}
    ctx.globalAlpha=media.matches?.95:Math.min(1,time/500)*(.84+Math.sin(i*.7+time/1600)*.12);
    ctx.fillStyle=palette[i%7];ctx.beginPath();const radius=stage===0&&time<1000?3-ease(time/1000)*1.5:stage===1||stage===2?2:stage===3?1.55:1.5;ctx.arc(x,y,radius,0,Math.PI*2);ctx.fill();
   }
   ctx.globalAlpha=1;el.dataset.stage=['hands','namaste','greeting','mustache'][stage];
  }
  function tick(now:number){
   frame=0;if(disposed||!visible||covered||document.hidden||media.matches)return;
   if(last)elapsed+=Math.min(now-last,80);last=now;
   // The settled visual barely moves: cap its redraw rate at 12 FPS.
   if(elapsed<9000||now-drawn>83){draw(elapsed);drawn=now}
   frame=requestAnimationFrame(tick);
  }
  function sync(){cancelAnimationFrame(frame);frame=0;last=0;covered=Boolean(document.querySelector('dialog[open]'));if(media.matches){elapsed=9000;draw(9000);return}if(visible&&!covered&&!document.hidden&&!disposed)frame=requestAnimationFrame(tick)}
  const observer=new IntersectionObserver(entries=>{visible=entries[0]?.isIntersecting===true;sync()},{threshold:.08});observer.observe(box);
  const resize=new ResizeObserver(()=>{if(el.clientWidth)box.dataset.ready='true'});resize.observe(el);
  const dialogs=new MutationObserver(sync);dialogs.observe(document.body,{subtree:true,attributes:true,attributeFilter:['open']});
  document.addEventListener('visibilitychange',sync);media.addEventListener('change',sync);
  draw(media.matches?9000:0);
  return()=>{disposed=true;cancelAnimationFrame(frame);observer.disconnect();resize.disconnect();dialogs.disconnect();document.removeEventListener('visibilitychange',sync);media.removeEventListener('change',sync)};
 },[]);
 return <div ref={container} className="heritage-welcome" role="img" aria-label="Namaste. Khamma Ghani Sa. A warm Rajasthani welcome."><span className="heritage-welcome-fallback">Namaste · Khamma Ghani Sa</span><canvas ref={canvas} aria-hidden="true"/></div>;
}
