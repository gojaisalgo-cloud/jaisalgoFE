import type {Package} from '@/types';
export type Filters={q:string;days:string;style:string;category:string;safari:string;area:string;tour:string;sort:string};
export const defaults:Filters={q:'',days:'',style:'',category:'',safari:'',area:'',tour:'',sort:'recommended'};
export function filterPackages(items:Package[],filters:Filters){
 const q=filters.q.toLowerCase().trim();
 return items.filter(p=>(!q||[p.title,p.subtitle,p.area,p.styles.join(' ')].join(' ').toLowerCase().includes(q))&&(!filters.days||p.days===Number(filters.days))&&(!filters.style||p.styles.some(s=>s===filters.style))&&(!filters.category||p.category===filters.category)&&(!filters.safari||p.safari===filters.safari)&&(!filters.area||p.area===filters.area)&&(!filters.tour||p.tour===filters.tour)).sort((a,b)=>filters.sort==='duration-asc'?a.days-b.days:filters.sort==='duration-desc'?b.days-a.days:filters.sort==='name'?a.title.localeCompare(b.title):0);
}
