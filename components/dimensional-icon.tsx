'use client';
import {useId} from 'react';
import {BedDouble as Bed,Car as Vehicle,Utensils as Dining,Compass as Safari,Users as Group,Music2 as Music} from 'lucide-react';
type Kind='coin'|'shield'|'ticket'|'sliders'|'phone'|'document'|'hotel'|'tent'|'bed'|'car'|'meals'|'safari'|'users'|'music';
type Props={size?:number|string;className?:string;strokeWidth?:number;'aria-hidden'?:boolean|'true'|'false'};
function Icon({kind,size=32,className=''}:Props&{kind:Kind}){
 const id=useId().replace(/:/g,''),a=`${id}a`,b=`${id}b`,shine=`${id}s`;
 const cool=['shield','phone','car','safari'].includes(kind),pink=['document','sliders','music'].includes(kind);
 const colors=cool?['#c6f7e9','#55b3a3','#246f73']:pink?['#f8d6e5','#c47c9e','#80546f']:['#fff0b3','#e6b958','#ae7534'];
 const fallback={bed:Bed,car:Vehicle,meals:Dining,safari:Safari,users:Group,music:Music},Glyph=kind in fallback?fallback[kind as keyof typeof fallback]:null;
 return <svg className={`dimensional-icon ${className}`} width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true" focusable="false"><defs><linearGradient id={a} x1="12" y1="8" x2="52" y2="56" gradientUnits="userSpaceOnUse"><stop stopColor={colors[0]}/><stop offset=".5" stopColor={colors[1]}/><stop offset="1" stopColor={colors[2]}/></linearGradient><linearGradient id={b} x1="18" y1="12" x2="46" y2="51" gradientUnits="userSpaceOnUse"><stop stopColor="#fff" stopOpacity=".75"/><stop offset="1" stopColor="#fff" stopOpacity="0"/></linearGradient><radialGradient id={shine}><stop stopColor="#fff" stopOpacity=".75"/><stop offset="1" stopColor="#fff" stopOpacity="0"/></radialGradient></defs><ellipse cx="33" cy="57" rx="21" ry="4" fill="#1d4034" opacity=".14"/>
 {kind==='coin'&&<><circle cx="34" cy="32" r="24" fill="#ad7932"/><circle cx="30" cy="29" r="24" fill={`url(#${a})`} stroke="#f9dfa0" strokeWidth="1.5"/><circle cx="30" cy="29" r="19" stroke="#fff3c8" strokeOpacity=".7" strokeWidth="1.5"/><path d="M22 19h16m-16 6h16m-11-6q12 1 9 9-2 5-12 5l13 12" stroke="#916026" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/><ellipse cx="23" cy="18" rx="12" ry="9" fill={`url(#${shine})`}/></>}
 {kind==='shield'&&<><path d="M35 7q10 9 22 10v18q-1 16-22 24Q14 49 13 35V17q12-1 22-10Z" fill="#26616b"/><path d="M30 4q10 9 22 10v18q-1 16-22 24Q9 46 8 32V14q12-1 22-10Z" fill={`url(#${a})`} stroke="#d6fff0" strokeWidth="1.5"/><path d="M30 10q8 6 16 8v13q-1 12-16 19Q15 43 14 31V18q8-2 16-8Z" fill="#236c73" opacity=".65"/><path d="m21 29 7 7 13-15" stroke="#fff4c6" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/><path d="m13 17 17-7" stroke="white" strokeOpacity=".6" strokeWidth="2" strokeLinecap="round"/></>}
 {kind==='ticket'&&<><path d="M9 21h47v10q-9 4 0 9v12H9V40q9-5 0-9Z" fill="#9a773a"/><path d="M6 16h47v10q-9 4 0 9v12H6V35q9-5 0-9Z" fill={`url(#${a})`} stroke="#fff0bf" strokeWidth="1.5"/><path d="M39 20v22" stroke="#ae7837" strokeWidth="2" strokeDasharray="3 3"/><path d="m16 31 6 6 10-12" stroke="#755931" strokeWidth="3" strokeLinecap="round"/><path d="M10 20h25" stroke="white" strokeOpacity=".6" strokeWidth="2"/></>}
 {kind==='document'&&<><path d="M19 10h24l12 12v35H19Z" fill="#89546d"/><path d="M14 6h24l12 12v35H14Z" fill={`url(#${a})`} stroke="#ffe4ef" strokeWidth="1.5"/><path d="M38 6v13h12" fill="#fce3eb"/><path d="M22 28h19m-19 8h19m-19 8h12" stroke="#86516c" strokeWidth="3" strokeLinecap="round"/></>}
 {kind==='sliders'&&<><rect x="11" y="12" width="46" height="44" rx="12" fill="#86566f"/><rect x="7" y="7" width="46" height="44" rx="12" fill={`url(#${a})`} stroke="#ffe7f1" strokeWidth="1.5"/><path d="M16 19h28M16 29h28M16 39h28" stroke="#79536b" strokeWidth="3" strokeLinecap="round"/><g fill="#fff1dc" stroke="#b78992"><rect x="23" y="14" width="7" height="10" rx="3"/><rect x="35" y="24" width="7" height="10" rx="3"/><rect x="21" y="34" width="7" height="10" rx="3"/></g></>}
 {kind==='phone'&&<><path d="m20 10 11 13-7 7q7 11 16 13l7-8 12 8q-1 15-12 15C27 58 9 37 9 21q0-11 11-11Z" fill="#286e70"/><path d="m17 5 11 13-7 7q7 11 16 13l7-8 12 8q-1 15-12 15C24 53 6 32 6 16Q6 5 17 5Z" fill={`url(#${a})`} stroke="#c5f4e4" strokeWidth="1.5"/><path d="m12 11 9 10m23 15 8 5" stroke="white" strokeOpacity=".65" strokeWidth="2" strokeLinecap="round"/></>}
 {kind==='hotel'&&<><path d="M13 16h42v40H13Z" fill="#a57845"/><path d="M8 10h42v42H8Z" fill={`url(#${a})`} stroke="#ffe8ac"/><path d="M7 9h44v7H7Z" fill="#f9dfa0"/><g fill="#8d673b">{[20,31].map(y=>[16,27,38].map(x=><rect key={`${x}-${y}`} x={x} y={y} width="5" height="6" rx="1"/>))}<path d="M24 52V42a5 5 0 0 1 10 0v10"/></g><path d="M10 55h45" stroke="#d2a668" strokeWidth="3" strokeLinecap="round"/></>}
 {kind==='tent'&&<><path d="m8 53 26-40 25 40Z" fill="#ad703b"/><path d="m4 48 26-40 25 40Z" fill={`url(#${a})`} stroke="#ffe1a6"/><path d="m30 8 8 40H4Z" fill="#e89b67"/><path d="m30 17-9 31h19Z" fill="#725542"/><path d="m30 17 4 31h6Z" fill="#413f38"/><path d="M7 52h48" stroke="#bb925c" strokeWidth="3" strokeLinecap="round"/><path d="m13 37 11-17" stroke="#ffe2ad" strokeWidth="2" strokeLinecap="round"/></>}
 {Glyph&&<><rect x="11" y="12" width="46" height="44" rx="14" fill={colors[2]}/><rect x="7" y="7" width="46" height="44" rx="14" fill={`url(#${a})`} stroke={colors[0]} strokeWidth="1.5"/><Glyph x="17" y="16" width="27" height="27" stroke={colors[2]} strokeWidth="2"/><path d="M15 12h23" stroke="white" strokeOpacity=".5" strokeWidth="2" strokeLinecap="round"/></>}
 </svg>;
}
export const IndianRupee=(p:Props)=><Icon {...p} kind="coin"/>;
export const ShieldCheck=(p:Props)=><Icon {...p} kind="shield"/>;
export const TicketCheck=(p:Props)=><Icon {...p} kind="ticket"/>;
export const Ticket=TicketCheck;
export const SlidersHorizontal=(p:Props)=><Icon {...p} kind="sliders"/>;
export const Phone=(p:Props)=><Icon {...p} kind="phone"/>;
export const FileText=(p:Props)=><Icon {...p} kind="document"/>;
export const Hotel=(p:Props)=><Icon {...p} kind="hotel"/>;
export const Tent=(p:Props)=><Icon {...p} kind="tent"/>;
export const BedDouble=(p:Props)=><Icon {...p} kind="bed"/>;
export const Car=(p:Props)=><Icon {...p} kind="car"/>;
export const Utensils=(p:Props)=><Icon {...p} kind="meals"/>;
export const Compass=(p:Props)=><Icon {...p} kind="safari"/>;
export const Users=(p:Props)=><Icon {...p} kind="users"/>;
export const Music2=(p:Props)=><Icon {...p} kind="music"/>;
