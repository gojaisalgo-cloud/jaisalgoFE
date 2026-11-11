export const particlePalette=['#FF9933','#2563EB','#16A34A','#EC4899','#FACC15','#7C3AED','#EF4444'] as const;
export const artWidth=640,artHeight=360;
export type ParticlePoint={x:number;y:number;color:number};
// Ram retains seven natural illustration tones, while the other scenes keep their palette.
const ramPalette=['#49AFE0','#2076B5','#E84D3C','#F3AA37','#FFF0B8','#182E3C','#8F322A'];
export const renderColorCount=particlePalette.length+ramPalette.length;
const rgb=[...particlePalette,...ramPalette].map(color=>[1,3,5].map(start=>parseInt(color.slice(start,start+2),16)));
export const colorSteps=rgb.flatMap(from=>rgb.map(to=>Array.from({length:17},(_,step)=>`rgb(${from.map((v,i)=>Math.round(v+(to[i]-v)*step/16)).join(',')})`)));
const assets=['namaste-man','rajasthani-elder','ram-bow'];
function loadImage(name:string){return new Promise<HTMLImageElement>((resolve,reject)=>{const img=new window.Image();img.onload=()=>resolve(img);img.onerror=()=>reject(new Error('Cultural artwork could not load'));img.src=`/art/heritage/${name}.svg`})}
function morton(x:number,y:number){let result=0;for(let bit=0;bit<10;bit++){result|=((x>>bit)&1)<<(bit*2);result|=((y>>bit)&1)<<(bit*2+1)}return result}
function nearest(r:number,g:number,b:number,offset=0){let match=offset,distance=Infinity;rgb.forEach((v,i)=>{if(i<offset||i>=offset+7)return;const d=(v[0]-r)**2+(v[1]-g)**2+(v[2]-b)**2;if(d<distance){distance=d;match=i}});return match}
/** Samples actual alpha and colour boundaries of the original vector assets once. */
function sample(ctx:CanvasRenderingContext2D,count:number,natural=false):ParticlePoint[]{
 const data=ctx.getImageData(0,0,artWidth,artHeight).data,edges:ParticlePoint[]=[],fill:ParticlePoint[]=[];
 for(let y=2;y<artHeight-2;y+=2)for(let x=2;x<artWidth-2;x+=2){
  const index=(y*artWidth+x)*4;if(data[index+3]<150)continue;
  const point={x,y,color:nearest(data[index],data[index+1],data[index+2],natural?7:0)};
  const edge=[index-8,index+8,index-artWidth*8,index+artWidth*8].some(n=>data[n+3]<100||Math.abs(data[n]-data[index])+Math.abs(data[n+1]-data[index+1])+Math.abs(data[n+2]-data[index+2])>160);
  (edge?edges:fill).push(point);
 }
 if(!edges.length&&!fill.length)throw new Error('Empty cultural artwork');
 const edgeCount=Math.min(Math.round(count*(natural?.35:.55)),edges.length),result:ParticlePoint[]=[];
 for(const [points,n] of [[edges,edgeCount],[fill.length?fill:edges,count-edgeCount]] as const)for(let i=0;i<n;i++)result.push(points[Math.floor(i*points.length/n)]);
 return result.sort((a,b)=>morton(a.x,a.y)-morton(b.x,b.y));
}
function caption(ctx:CanvasRenderingContext2D,text:string,y=316,size=37){ctx.fillStyle=particlePalette[4];ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`600 ${size}px "JaisalGo Devanagari"`;ctx.fillText(text,artWidth/2,y,artWidth-36)}
export async function culturalTargets(count:number){
 await document.fonts.load('600 40px "JaisalGo Devanagari"');
 const images=await Promise.all(assets.map(loadImage)),mask=document.createElement('canvas');mask.width=artWidth;mask.height=artHeight;
 const ctx=mask.getContext('2d',{willReadFrequently:true});if(!ctx)throw new Error('Canvas is unavailable');
 const targets:ParticlePoint[][]=[];
 ctx.fillStyle=particlePalette[5];ctx.save();ctx.translate(-130,25);ctx.scale(1.5,1.5);ctx.fill(new Path2D('M300 86C280 57 259 60 240 78C217 102 184 105 171 83C159 61 184 45 196 60C200 66 196 72 190 72C197 60 179 58 177 69C172 93 205 82 220 66C243 39 272 45 300 67C328 45 357 39 380 66C395 82 428 93 423 69C421 58 403 60 410 72C404 72 400 66 404 60C416 45 441 61 429 83C416 105 383 102 360 78C341 60 320 57 300 86Z'));ctx.restore();caption(ctx,'खम्मा घणी सा',255,42);targets.push(sample(ctx,count));
 ctx.clearRect(0,0,artWidth,artHeight);caption(ctx,'नमस्ते',178,110);targets.push(sample(ctx,count));
 images.forEach((image,i)=>{const isRam=assets[i]==='ram-bow';ctx.clearRect(0,0,artWidth,artHeight);if(isRam)ctx.drawImage(image,178,0,284,293.5);else ctx.drawImage(image,205,8,230,268);caption(ctx,isRam?'श्री राम':'खम्मा घणी सा');targets.push(sample(ctx,count,isRam))});
 const dust=Array.from({length:count},(_,i)=>{const a=i*2.399963,r=Math.sqrt((i+.5)/count);return {x:artWidth/2+Math.cos(a)*r*296,y:artHeight/2+Math.sin(a)*r*148,color:i%7}}).sort((a,b)=>morton(a.x,a.y)-morton(b.x,b.y));
 return {targets,dust};
}
