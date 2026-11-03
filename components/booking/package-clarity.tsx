import {BedDouble,Car,Utensils,Compass,Users,Ticket,Hotel,Tent,ChevronDown,IndianRupee,Music2} from 'lucide-react';
import type {Tour} from '@/data/catalog';
import type {PackageClarity,ClarityGroup} from '@/lib/booking/package-clarity';
import {inclusionLabel,packageClarity} from '@/lib/booking/package-clarity';
import {money,type Choices} from '@/lib/booking/pricing';
import type {InclusionStatus} from '@/types/marketplace';
const icons={stay:BedDouble,transport:Car,meals:Utensils,safari:Compass,rooming:Users,tickets:Ticket};

export function InclusionBadge({status}:{status:InclusionStatus}){return <span className="inclusion-badge" data-status={status}>{inclusionLabel[status]}</span>}

export function PackageHighlights({tour,choices}:{tour:Tour;choices:Choices}){
 const data=packageClarity(tour,choices);
 return <div className="package-card-highlights" aria-label="Package highlights">{data.highlights.map(h=>{const Icon=icons[h.id as keyof typeof icons];return <div key={h.id}><span><Icon size={14} strokeWidth={1.75} aria-hidden="true"/>{h.label}</span><strong>{h.value}</strong></div>})}</div>;
}

export function StayRoute({data}:{data:PackageClarity}){return <div className="clarity-route" aria-label="Stay and transfer arrangement"><div className="clarity-route-stops">{data.stays.length?data.stays.map(s=>{const Icon=s.kind==='city'?Hotel:Tent;return <div key={s.kind}><Icon size={18} strokeWidth={1.65} aria-hidden="true"/><span><strong>{s.nights} {s.nights===1?'night':'nights'}</strong>{s.label}</span></div>}):<div><BedDouble size={18} aria-hidden="true"/><span><strong>No overnight stay</strong>Activity / day visit only</span></div>}</div><p><Users size={14} aria-hidden="true"/>{data.roomSummary}</p><p><Car size={14} aria-hidden="true"/>{data.transportSummary}</p><small>Base estimate arrangement · property and vehicle specifications below.</small></div>}

function FactGroup({group}:{group:ClarityGroup}){return <details className="clarity-accordion"><summary><span><strong>{group.title}</strong><small>{group.summary}</small></span><ChevronDown size={18} strokeWidth={1.75} aria-hidden="true"/></summary><dl className="clarity-facts">{group.rows.map((r,i)=><div key={r.label+i}><dt>{r.label}</dt><dd>{r.status?<InclusionBadge status={r.status}/>:r.value}{r.note&&<small>{r.note}</small>}</dd></div>)}</dl></details>}

export function ClarityDetails({data,only}:{data:PackageClarity;only?:string[]}){return <div className="clarity-details">{data.groups.filter(g=>!only||only.includes(g.id)).map(g=><FactGroup key={g.id} group={g}/>)}</div>}

export function ClarityOverview({data}:{data:PackageClarity}){
 const group=(id:string)=>data.groups.find(g=>g.id===id)!;
 const glimpses=[{title:'Stay',icon:BedDouble,value:group('stay').summary,status:group('stay').status},{title:'Transport',icon:Car,value:group('transport').summary,status:group('transport').status},{title:'Meals',icon:Utensils,value:group('meals').summary,status:group('meals').status},{title:'Safari',icon:Compass,value:group('safari').summary,status:group('safari').status},{title:'Activities',icon:Music2,value:group('activities').summary,status:group('activities').status},{title:'Pricing',icon:IndianRupee,value:`${money(data.pricing.total)} group · ${money(data.pricing.perPerson)} / person, rounded up`,status:data.pricing.provisional?'proposed' as const:'included' as const}];
 return <section className="clarity-overview" aria-label="What's included at a glance"><h3>What’s included at a glance.</h3><p className="clarity-caption">Based on your selected estimate. Missing supplier details are marked.</p><div className="clarity-glance">{glimpses.map(({title,icon:Icon,value,status})=><div key={title}><span><Icon size={17} strokeWidth={1.75} aria-hidden="true"/>{title}</span><strong>{value}</strong><InclusionBadge status={status}/></div>)}</div><StayRoute data={data}/>{data.requests.length>0&&<div className="clarity-requests"><strong>Needs a separate quote</strong><ul>{data.requests.map(r=><li key={r}>{r}</li>)}</ul></div>}<ClarityDetails data={data}/><p className="clarity-caption">{data.priceNote}</p></section>;
}

export function SelectedPackageClarity({data}:{data:PackageClarity}){return <details className="selected-package-clarity"><summary><span><strong>Your package, clearly</strong><small>{data.staySummary} · {data.transportSummary}</small></span><ChevronDown size={18} strokeWidth={1.75} aria-hidden="true"/></summary><StayRoute data={data}/>{data.requests.length>0&&<ul className="clarity-pending-list">{data.requests.map(r=><li key={r}>{r}</li>)}</ul>}<ClarityDetails data={data}/><p className="clarity-caption">{data.priceNote}</p></details>}
