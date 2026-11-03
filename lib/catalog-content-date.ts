import type {Tour} from '@/data/catalog';

function stable(value:unknown):unknown {
  if(Array.isArray(value))return value.map(stable);
  if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).sort(([a],[b])=>a.localeCompare(b)).map(([key,item])=>[key,stable(item)]));
  return value;
}
function content(t:Tour) {
  const keys:(keyof Tour)[]=['slug','title','subtitle','days','nights','image','styles','category','safari','area','tour','highlights','stayLabel','inclusions','exclusions','itinerary','accommodation','transport','meals','notes','faq','published','confirmed','taxReviewed','policy','costs','sourceNote','details'];
  return stable(Object.fromEntries(keys.map(key=>[key,t[key]])));
}
/** The server supplies the date. Saving an unchanged package is not fresh content. */
export function catalogueContentDate(previous:Tour|undefined,next:Tour,now=new Date().toISOString()):string|undefined {
  return previous&&JSON.stringify(content(previous))===JSON.stringify(content(next))?previous.contentModifiedAt:now;
}
