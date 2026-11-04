import {analyticsPage,privateAnalyticsPage} from './posthog-schema';

/** Heatmap buffers use URLs as keys. Keep only public paths and numeric interaction data. */
export function sanitizeHeatmap(value:unknown,origin:string){
  const safe:Record<string,{x:number;y:number;type:string;target_fixed:boolean}[]>={};
  if(!value||typeof value!=='object'||Array.isArray(value))return safe;
  for(const [url,points] of Object.entries(value)){
    let parsed:URL;try{parsed=new URL(url)}catch{continue}
    const path=analyticsPage(parsed.pathname);if(parsed.origin!==origin||privateAnalyticsPage(path)||path==='/not-found'||!Array.isArray(points))continue;
    const key=origin+path;
    safe[key]=[...(safe[key]||[]),...points.filter(p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.y)&&['click','mousemove','rageclick','deadclick'].includes(p.type)).map(p=>({x:p.x,y:p.y,type:p.type,target_fixed:p.target_fixed===true}))];
  }
  return safe;
}
/** Replay attributes/text are masked by the SDK. This additionally scrubs rrweb metadata URLs. */
export function sanitizeReplayUrls(value:unknown,origin:string,depth=0):unknown{
  if(depth>60)return null;
  if(typeof value==='string'&&/^https?:\/\//.test(value)){try{const u=new URL(value);return u.origin===origin?origin+analyticsPage(u.pathname):'[external resource]'}catch{return '[redacted]'}}
  if(Array.isArray(value))return value.map(v=>sanitizeReplayUrls(v,origin,depth+1));
  if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([key,v])=>[key,sanitizeReplayUrls(v,origin,depth+1)]));
  return value;
}
