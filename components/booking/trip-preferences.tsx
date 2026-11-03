'use client';
import {Dropdown} from '@/components/dropdown';
import type {Tour} from '@/data/catalog';
import type {Choices} from '@/lib/booking/pricing';
import {money} from '@/lib/booking/pricing';
import {bundledJeep} from '@/lib/booking/package-clarity';
import {packageDetails} from '@/lib/booking/package-details';
import {stayOptions,tripOccasions} from '@/data/travel-options';
export function TripPreferences({tour:t,choices:c,onChange,extras=true}:{tour:Tour;choices:Choices;onChange:(c:Choices)=>void;extras?:boolean}){
 const d=packageDetails(t),set=(patch:Partial<Choices>)=>onChange({...c,...patch});
 return <div className="trip-preferences">
  <div className="form-grid">
   {c.travelers>1&&<label>Children in your group<Dropdown aria-label="Children in your group" value={c.children||0} onValueChange={v=>set({children:Number(v)})}>{Array.from({length:c.travelers},(_,i)=><option key={i} value={i}>{i===0?'No children':`${i} ${i===1?'child':'children'} · included in total`}</option>)}</Dropdown></label>}
   <label>How will you travel?<Dropdown aria-label="Travel arrangement" value={c.travelMode||'Private'} onValueChange={v=>set({travelMode:v as Choices['travelMode'],...(v==='Solo'?{travelers:1,children:0}:{})})}><option value="Private">Private group / family</option><option value="Shared">Join a shared group · request</option><option value="Solo">Solo traveler</option></Dropdown></label>
   {t.nights>0&&c.stayType!=='open-sky'&&<label>Your accommodation<Dropdown aria-label="Room sharing" value={c.rooming||'private'} onValueChange={v=>set({rooming:v as Choices['rooming']})}><option value="private">Private room / tent · 2 sharing</option><option value="single">Private room / tent · 1 each</option><option value="shared">Shared accommodation · request</option></Dropdown></label>}
   {t.nights>0&&<label>Stay type<Dropdown aria-label="Stay type" value={c.stayType||d.stayType} onValueChange={v=>set({stayType:v})}>{stayOptions.filter(s=>d.stayOptions.includes(s.id)).map(s=><option value={s.id} key={s.id}>{s.name}{s.id!==d.stayType?' · request':''}</option>)}</Dropdown></label>}
   {t.nights>0&&<label>Stay allowance<Dropdown aria-label="Stay allowance" value={c.stay} onValueChange={v=>set({stay:v as Choices['stay']})}><option value="Budget">Budget allowance</option><option value="Comfort">Standard allowance</option><option value="Premium">Premium allowance</option></Dropdown></label>}
   {c.stayType==='hostel'&&<label>Dorm preference<Dropdown aria-label="Dorm preference" value={c.dorm||'mixed'} onValueChange={v=>set({dorm:v as Choices['dorm']})}><option value="mixed">Mixed dorm · request</option><option value="women">Women’s dorm · request</option><option value="men">Men’s dorm · request</option></Dropdown></label>}
  </div>
  {(c.children||0)>0&&<p className="request-note">Children are included in your {c.travelers} travelers. The estimate uses the same allowance for every traveler. Child rates, beds and activity eligibility need a supplier quote before real payment; one adult must lead the booking.</p>}
  <p className="sharing-preview">Estimate: {c.travelMode==='Shared'?'Shared group experience requested':c.travelMode==='Solo'?'Solo travel':'Your own travel party'}{t.nights>0?c.stayType==='open-sky'?' with open-sky sleeping; no private tent is promised.':c.rooming==='shared'?' with shared accommodation requested.':c.rooming==='single'?' with one private room or tent per traveler.':' with a private room or tent for every two travelers.':'. No overnight stay.'}</p>
  {(c.travelMode==='Shared'||c.rooming==='shared')&&<p className="request-note">Group matching, shared seats and dorm availability need confirmation. The estimate models your own group’s costs; it assumes no future travelers or sharing discount.</p>}
  {t.nights>0&&<p className="field-hint">{stayOptions.find(s=>s.id===c.stayType)?.detail} A swimming pool is a property amenity, separate from sharing travel.</p>}
  <div className="checkout-options">
   <label><input type="checkbox" checked={c.transport} onChange={e=>set({transport:e.target.checked})}/>Add city transfer allowance <small>Pickup, drop & vehicle type need confirmation · up to 4 / vehicle</small></label>
   {d.kind!=='activity'&&d.kind!=='cultural'&&<>{!bundledJeep(t)&&<label><input type="checkbox" checked={c.jeep} onChange={e=>set({jeep:e.target.checked})}/>Jeep safari <small>₹1,800 / vehicle allowance · up to 4</small></label>}<label><input type="checkbox" checked={c.guide} onChange={e=>set({guide:e.target.checked})}/>Private city guide <small>₹1,500 / group allowance</small></label></>}
  </div>
  {extras&&<details className="extra-requests"><summary>Experiences &amp; special requests <span>Optional</span></summary><label>Travel occasion<Dropdown aria-label="Travel occasion" value={c.occasion||''} onValueChange={v=>set({occasion:v})}><option value="">No special occasion</option>{tripOccasions.map(o=><option key={o}>{o}</option>)}</Dropdown></label><div className="extra-options">{d.extras.map(e=><label key={e.id}><input type="checkbox" checked={!!c.addons?.includes(e.id)} onChange={event=>set({addons:event.target.checked?[...(c.addons||[]),e.id]:(c.addons||[]).filter(id=>id!==e.id)})}/><span><strong>{e.name}</strong><small>{e.amount===null?'Price on request':`${money(e.amount)} / ${e.unit} · estimate`}</small></span></label>)}</div><p className="fine">Unpriced requests are saved with your trip and excluded from the total. They need a separate quote before a real payment.</p></details>}
 </div>;
}
