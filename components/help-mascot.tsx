'use client';
import {useId} from 'react';
/** Original JaisalGo desert guide, articulated in SVG for crisp, lightweight motion. */
export function HelpMascot({className=''}:{className?:string}){
 const id=useId().replace(/:/g,''),body=id+'body',face=id+'face',sand=id+'sand';
 return <span className={`help-mascot ${className}`} aria-hidden="true"><svg viewBox="0 0 160 180" fill="none" focusable="false"><defs><radialGradient id={body} cx=".3" cy=".25" r=".8"><stop stopColor="#67d8d6"/><stop offset=".5" stopColor="#22a9b1"/><stop offset="1" stopColor="#086579"/></radialGradient><radialGradient id={face} cx=".3" cy=".2" r=".9"><stop stopColor="#8ae9dc"/><stop offset=".6" stopColor="#26b3b7"/><stop offset="1" stopColor="#08748a"/></radialGradient><linearGradient id={sand} x1="30" y1="10" x2="100" y2="50" gradientUnits="userSpaceOnUse"><stop stopColor="#ffdf96"/><stop offset=".5" stopColor="#eca955"/><stop offset="1" stopColor="#c8753e"/></linearGradient></defs>
 <ellipse cx="84" cy="166" rx="48" ry="7" fill="#234f47" opacity=".16"/>
 <path d="M53 141q-16 24-4 25h22l7-24m21-2q-4 27 7 27h23q6-6-15-25" fill={`url(#${body})`}/>
 <path d="M108 86q32 6 40 32 5 15-5 19-9 4-11-10l-5 7q-6 1-7-5l-2-14-16-9" fill={`url(#${body})`}/>
 <g className="help-mascot-wave"><path d="M52 91Q21 80 17 50q-10-10-9-19 2-5 6 1l6 9-2-22q1-8 6-3l4 22 4-28q4-6 7 0l-1 29 9-19q5-5 7 1l-8 25 9-6q7 1 2 7L40 62q8 16 26 18" fill={`url(#${body})`}/><path d="M23 51q8-5 17 1" stroke="#087b89" strokeWidth="2" strokeLinecap="round"/></g>
 <path d="M44 87q4-27 36-27 39-1 43 36l4 37q-3 25-43 26-44 0-47-24Z" fill={`url(#${body})`}/>
 <ellipse cx="79" cy="128" rx="26" ry="19" fill="#9ce9d5" opacity=".15"/>
 <g className="help-mascot-head"><path d="M43 61q0-32 38-33 42-1 45 35l-1 26q-4 25-40 25-36-1-42-26Z" fill={`url(#${face})`}/>
 <path d="M43 44q-5-21 22-28 40-14 58 14l4 16q-25-9-40 0-24 7-44-2Z" fill={`url(#${sand})`}/><path d="M48 33q30-15 62-7M48 41q26-12 69-5" stroke="#ffe6b3" strokeWidth="3" strokeLinecap="round" opacity=".65"/><path d="m76 18 15 26q7-6 14-6L92 14" fill="#d9824d"/><path d="m82 18 13 23" stroke="#ffcc7a" strokeWidth="2"/>
 <g className="help-mascot-eyes"><ellipse cx="65" cy="64" rx="12" ry="15" fill="#eaf9ee"/><ellipse cx="98" cy="64" rx="12" ry="15" fill="#eaf9ee"/><ellipse cx="68" cy="66" rx="7" ry="10" fill="#18404a"/><ellipse cx="96" cy="66" rx="7" ry="10" fill="#18404a"/><circle cx="70" cy="62" r="3" fill="white"/><circle cx="98" cy="62" r="3" fill="white"/></g>
 <path d="M55 46q8-6 17-1m18 0q8-5 15 1" stroke="#17505a" strokeWidth="4" strokeLinecap="round"/>
 <path d="M62 86q20 10 41-2-2 20-20 20-17 0-21-18Z" fill="#154450"/><path d="M65 87q18 7 35-1l-3 8q-15 5-28-1Z" fill="#fff9e9"/><path d="M76 101q7-8 17-1" fill="#ef9e91"/><ellipse cx="51" cy="81" rx="7" ry="4" fill="#ffc19f" opacity=".4"/><ellipse cx="113" cy="80" rx="6" ry="4" fill="#ffc19f" opacity=".4"/>
 </g><path d="m68 117 15 10 17-12" stroke="#ffd28a" strokeWidth="4" strokeLinecap="round"/><circle cx="83" cy="129" r="5" fill={`url(#${sand})`}/>
 </svg></span>;
}
