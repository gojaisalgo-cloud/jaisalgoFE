import type {Extra} from '@/types/marketplace';
export const stayOptions = [
 {id:'none',name:'No overnight stay',detail:'Activity or evening only. Confirm the final departure and return plan.'},
 {id:'hostel',name:'Hostel dormitory',detail:'Shared bunk and washroom; mixed or gender-specific dorm must be confirmed.'},
 {id:'city-hotel',name:'Budget city hotel',detail:'Private room; confirm AC, attached bathroom and hot water.'},
 {id:'haveli',name:'Heritage haveli',detail:'Historic property; steps, lift access and room amenities vary.'},
 {id:'mud-hut',name:'Traditional mud hut',detail:'Village stay; confirm cooling, bedding and private or shared washroom.'},
 {id:'budget-tent',name:'Budget desert tent',detail:'Basic bedding; electricity and bathroom arrangements require confirmation.'},
 {id:'swiss-tent',name:'Deluxe Swiss tent',detail:'Request attached bathroom and hot water; not guaranteed until quoted.'},
 {id:'glamping',name:'Luxury glamping tent',detail:'Request AC or heating, sit-out and specified amenities.'},
 {id:'family-cottage',name:'Family tent or cottage',detail:'Confirm beds, maximum occupancy and extra-bed / child charges.'},
 {id:'pool-resort',name:'Resort with shared swimming pool',detail:'Shared swimming pool, subject to seasonal access and property rules.'},
 {id:'private-pool',name:'Private pool suite',detail:'Exclusive swimming pool; privacy, depth and supervision need confirmation.'},
 {id:'open-sky',name:'Open-sky camping',detail:'Mattress or charpai, blankets, weather shelter and toilet arrangements must be confirmed.'}
];
export const stayName=(id:string)=>stayOptions.find(s=>s.id===id)?.name||'Stay to be confirmed';
const requests = [
 ['quad','Quad biking','ride','Duration, safety equipment and minimum age to be quoted.'],
 ['parasailing','Parasailing','person','Operator, wind conditions and safety limits require confirmation.'],
 ['paramotor','Paramotoring','flight / person','Pilot, flight duration, weather and weight limits to be confirmed.'],
 ['sandboard','Sandboarding','person','Equipment, instruction and permitted dune route to be confirmed.'],
 ['stargazing','Telescope stargazing','person','Guide, telescope, sky conditions and duration to be confirmed.'],
 ['camel-trek','Overnight camel trek','person','Route, meals, animal welfare and overnight logistics need a separate quote.'],
 ['private-dinner','Private dune dinner','group','Menu, transfers, privacy and legal venue require confirmation.'],
 ['sunrise-photo','Sunrise photography','group','Timing and transport to be agreed with the operator.'],
 ['clothing-photo','Rajasthani clothing photoshoot','person','Costume, photography permissions and image delivery to be quoted.'],
 ['photographer','Professional photographer','session','Session length and edited image delivery to be agreed.'],
 ['village','Village walk','group','Local host, route and permissions require confirmation.'],
 ['cooking','Rajasthani cooking experience','person','Host, menu, kitchen access and dietary needs to be agreed.'],
 ['heritage','Heritage walk','group','Licensed guide, admissions and route to be quoted.'],
 ['boating','Gadisar boating','boat','Subject to authorized operations, weather and life jackets.'],
 ['birthday','Birthday or anniversary setup','group','Decoration, food and venue permissions require a separate quote.'],
 ['proposal','Private proposal setup','group','Venue, privacy, decoration and photography to be agreed.']
];
export const extraOptions:Extra[]=requests.map(([id,name,unit,description])=>({id,name,unit,description,amount:null,taxBps:0}));
export const tripOccasions=['Student / backpacking','Couples / honeymoon','Family with children','Women-only group','Corporate outing','Photography','Birthday / anniversary','Festival trip'];
export const attractionOptions = [
 {name:'Jaisalmer Fort & Jain temples',circuit:'City'}, {name:'Patwon Ki Haveli',circuit:'City'},
 {name:'Salim Singh Ki Haveli',circuit:'City'},{name:'Nathmal Ki Haveli',circuit:'City'},
 {name:'Gadisar Lake',circuit:'City'},{name:'Vyas Chhatri',circuit:'City'},
 {name:'Bada Bagh',circuit:'Around the city'},{name:'Amar Sagar',circuit:'Around the city'},
 {name:'Lodurva',circuit:'Around the city'},{name:'Jaisalmer War Museum',circuit:'Around the city'},
 {name:'Sam Sand Dunes',circuit:'Desert'},{name:'Khuri dunes & village',circuit:'Desert'},
 {name:'Kuldhara',circuit:'Desert'},{name:'Khaba Fort',circuit:'Desert'},
 {name:'Desert National Park',circuit:'Separate permitted excursion'},
 {name:'Tanot Mata Temple & Longewala',circuit:'Separate full-day excursion'},
 {name:'Pokhran',circuit:'Separate district excursion'},{name:'Ramdevra',circuit:'Separate district excursion'}
];
