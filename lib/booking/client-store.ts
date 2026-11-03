const prefix='jaisalgo_access_';
const validId=(id:string)=>/^jg_[a-f0-9]{20}$/.test(id);
const validKey=(key:string)=>/^[a-zA-Z0-9-]{32,100}$/.test(key);
export function saveAccess(id:string,key:string){if(!validId(id)||!validKey(key))return false;try{localStorage.setItem(prefix+id,key);return true}catch{return false}}
export function readAccess(id:string){try{return localStorage.getItem(prefix+id)||''}catch{return ''}}
export function savedReservations(){try{return Object.keys(localStorage).filter(k=>k.startsWith(prefix)&&validId(k.slice(prefix.length))).map(k=>({id:k.slice(prefix.length),access:localStorage.getItem(k)||''})).filter(r=>validKey(r.access)).slice(-25)}catch{return []}}
export function privateTicketUrl(origin:string,id:string,key:string){if(!validId(id)||!validKey(key))throw Error('Invalid ticket link.');return `${origin}/reservations/${id}#key=${encodeURIComponent(key)}`}
export function parseTicketLink(value:string,origin:string){try{const url=new URL(value,origin),id=url.pathname.match(/^\/reservations\/(jg_[a-f0-9]{20})\/?$/)?.[1],access=new URLSearchParams(url.hash.slice(1)).get('key')||'';if(url.origin!==origin||!id||!validKey(access))return null;return {id,access}}catch{return null}}
