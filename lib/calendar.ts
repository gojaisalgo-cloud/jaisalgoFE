/** Calendar arithmetic uses UTC date-only values, independently of the visitor's time zone. */
export function calendarDate(value:string){const d=new Date(value+'T12:00:00Z');return /^\d{4}-\d{2}-\d{2}$/.test(value)&&!Number.isNaN(d.getTime())&&d.toISOString().slice(0,10)===value?d:undefined}
export function calendarISO(d:Date){return d.toISOString().slice(0,10)}
export function calendarMonth(value:string){return value.slice(0,7)+'-01'}
export function calendarMove(value:string,days:number){const d=calendarDate(value)!;d.setUTCDate(d.getUTCDate()+days);return calendarISO(d)}
export function calendarMoveMonth(value:string,offset:number){const d=calendarDate(value)!,day=d.getUTCDate();d.setUTCDate(1);d.setUTCMonth(d.getUTCMonth()+offset);const end=new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+1,0)).getUTCDate();d.setUTCDate(Math.min(day,end));return calendarISO(d)}
export function calendarDays(month:string){const first=calendarMonth(month),offset=calendarDate(first)!.getUTCDay();return Array.from({length:42},(_,i)=>calendarMove(first,i-offset))}
export function calendarAllowed(value:string,min?:string,max?:string){return !!calendarDate(value)&&(!min||value>=min)&&(!max||value<=max)}
export function calendarLabel(value:string,long=false){const d=calendarDate(value);return d?new Intl.DateTimeFormat('en-IN',{timeZone:'UTC',day:'numeric',month:long?'long':'short',year:'numeric',...(long?{weekday:'long'}:{})}).format(d):'Select date'}
