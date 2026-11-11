/** Footer destinations are existing canonical pages; unbuilt destinations stay as text. */
export type FooterItem={label:string;href?:string};
export type FooterGroup={id:string;title:string;items:FooterItem[];note?:string};

export const footerGroups:FooterGroup[]=[
 {id:'jaisalgo',title:'JaisalGo',items:[
  {label:'Our story',href:'/about'},{label:'Editorial standards',href:'/editorial-policy'},{label:'Photo & film credits',href:'/photo-credits'},{label:'Contact JaisalGo',href:'/contact'},
 ]},
 {id:'quick-links',title:'Quick links',items:[
  {label:'Jaisalmer tourism',href:'/'},{label:'Tour packages',href:'/packages'},{label:'Things to do',href:'/experiences'},{label:'Sightseeing guides',href:'/places'},{label:'Suggested itineraries',href:'/itineraries'},
 ]},
 {id:'desert-experiences',title:'Popular desert experiences',items:[
  {label:'Desert safari',href:'/experiences/desert-safari'},{label:'Camel safari',href:'/experiences/camel-safari'},{label:'Jeep safari',href:'/experiences/jeep-safari'},{label:'Desert evenings',href:'/experiences/desert-evening'},{label:'Camel or jeep?',href:'/travel-guide/camel-or-jeep'},
 ]},
 {id:'places',title:'Places to visit in Jaisalmer',items:[
  {label:'Jaisalmer Fort',href:'/places/jaisalmer-fort'},{label:'Patwon Ki Haveli',href:'/places/patwon-ki-haveli'},{label:'Gadisar Lake',href:'/places/gadisar-lake'},{label:'Sam Sand Dunes',href:'/places/sam-sand-dunes'},{label:'Khuri',href:'/places/khuri'},{label:'Bada Bagh',href:'/places/bada-bagh'},{label:'Kuldhara',href:'/places/kuldhara'},
 ]},
 {id:'stays',title:'Desert camps & stays',items:[
  {label:'Overnight desert stays',href:'/experiences/overnight-desert'},{label:'Where to stay',href:'/travel-guide/where-to-stay'},{label:'Camp booking checklist',href:'/travel-guide/desert-camp-checklist'},{label:'Sam or Khuri',href:'/travel-guide/sam-versus-khuri'},{label:'Premium stay preferences',href:'/packages/luxury-jaisalmer-packages'},
 ]},
 {id:'tour-ideas',title:'Popular Jaisalmer tour ideas',items:[
  {label:'One day in the Golden City',href:'/itineraries/1-day-jaisalmer'},{label:'A two-day city & desert escape',href:'/itineraries/2-day-jaisalmer'},{label:'A slower three-day itinerary',href:'/itineraries/3-day-jaisalmer'},{label:'Four days to explore',href:'/itineraries/4-day-jaisalmer'},{label:'Two-night package comparison',href:'/packages/2-nights-3-days-jaisalmer'},
 ]},
 {id:'routes',title:'Popular travel routes',items:[
  {label:'Delhi to Jaisalmer',href:'/jaisalmer-travel-from/delhi'},{label:'Jaipur to Jaisalmer',href:'/jaisalmer-travel-from/jaipur'},{label:'Jodhpur to Jaisalmer',href:'/jaisalmer-travel-from/jodhpur'},{label:'Ahmedabad to Jaisalmer',href:'/jaisalmer-travel-from/ahmedabad'},{label:'Mumbai to Jaisalmer',href:'/jaisalmer-travel-from/mumbai'},{label:'All origin city guides',href:'/jaisalmer-travel-from'},
 ],note:'Plan the journey here separately from your local package.'},
 {id:'rajasthan',title:'Top destinations in Rajasthan',items:[
  {label:'Jaisalmer',href:'/places'},{label:'Jodhpur'},{label:'Jaipur'},{label:'Udaipur'},{label:'Bikaner'},{label:'Pokhran'},
 ],note:'Considering a wider Rajasthan trip? These are nearby and onward travel ideas; our destination guides focus on Jaisalmer.'},
 {id:'guides',title:'Jaisalmer travel guides',items:[
  {label:'Your first Jaisalmer visit',href:'/travel-guide/first-time-jaisalmer'},{label:'Best time to visit',href:'/travel-guide/best-time-to-visit'},{label:'Trip cost & budgeting',href:'/travel-guide/budget-planning'},{label:'Jaisalmer after dark',href:'/travel-guide/jaisalmer-at-night'},{label:'International visitor guide',href:'/travel-guide/international-visitors'},
 ]},
 {id:'culture',title:'Rajasthani culture & heritage',items:[
  {label:'Heritage walks',href:'/experiences/heritage-walk'},{label:'Folk music & cultural evenings',href:'/experiences/folk-culture'},{label:'Local food & craft',href:'/experiences/food-and-craft'},{label:'Nathmal Ki Haveli',href:'/places/nathmal-ki-haveli'},{label:'Salim Singh Ki Haveli',href:'/places/salim-singh-ki-haveli'},
 ]},
 {id:'travellers',title:'Travel experiences for everyone',items:[
  {label:'Family holidays',href:'/packages/jaisalmer-family-packages'},{label:'Trips for two',href:'/packages/jaisalmer-honeymoon-packages'},{label:'Solo travel',href:'/packages/jaisalmer-solo-packages'},{label:'Friends & groups',href:'/packages/jaisalmer-group-packages'},{label:'Budget-minded escapes',href:'/packages/budget-jaisalmer-packages'},{label:'Gadisar photography',href:'/experiences/lake-photography'},
 ]},
 {id:'information',title:'Important travel information',items:[
  {label:'How to reach Jaisalmer',href:'/travel-guide/how-to-reach'},{label:'Getting around locally',href:'/travel-guide/local-transport'},{label:'Packing & accessibility',href:'/travel-guide/packing-and-accessibility'},{label:'Responsible Thar travel',href:'/travel-guide/responsible-thar-travel'},{label:'Desert National Park',href:'/places/desert-national-park'},
 ]},
 {id:'support',title:'Help & support',items:[
  {label:'My bookings',href:'/my-bookings'},{label:'Create a custom trip brief',href:'/plan-your-trip'},{label:'Cancellation & refund guidance',href:'/cancellation-policy'},
 ]},
];

export const footerStories=[
 {title:'Why explore Jaisalmer with JaisalGo?',text:'A good trip starts with a clear plan. JaisalGo brings together destination guides, suggested itineraries and package comparisons for the Golden City and its surrounding desert. Review the night split, proposed inclusions and full group estimate before reserving. Named accommodation, final services and availability still need supplier confirmation.'},
 {title:'Discover the magic of Jaisalmer',text:'Follow the lanes of Jaisalmer Fort, pause at Patwon Ki Haveli and make time for Gadisar Lake. Beyond the city, compare a camel outing, a jeep safari or a night around Sam or Khuri. Folk music, local food and sandstone craftsmanship add their own chapter. Choose the experiences that suit your pace, with time to enjoy the place between stops.'},
 {title:'Plan your Rajasthan journey with JaisalGo',text:'Build your Jaisalmer chapter around your arrival, your people and the time you have on the ground. Use our origin city guides to consider connections from Jaipur, Jodhpur and other Indian cities, then plan city and desert days separately. Travel to Jaisalmer is booked separately from local packages. Check current connections and conditions before committing to a wider Rajasthan route.'},
] as const;

/** Only render social accounts explicitly configured by the site owner. */
export function footerSocialLinks(env:Record<string,string|undefined>=process.env){
 return [
  {label:'Instagram',kind:'instagram',value:env.NEXT_PUBLIC_INSTAGRAM_URL,hosts:['instagram.com','www.instagram.com']},
  {label:'Facebook',kind:'facebook',value:env.NEXT_PUBLIC_FACEBOOK_URL,hosts:['facebook.com','www.facebook.com']},
  {label:'YouTube',kind:'youtube',value:env.NEXT_PUBLIC_YOUTUBE_URL,hosts:['youtube.com','www.youtube.com','youtu.be']},
 ].flatMap(({label,kind,value,hosts})=>{try{if(!value)return [];const url=new URL(value);return url.protocol==='https:'&&!url.username&&!url.password&&hosts.includes(url.hostname)&&url.pathname!=='/'?[{label,kind,href:url.href}]:[]}catch{return []}});
}
