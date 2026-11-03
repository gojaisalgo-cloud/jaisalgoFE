import type {EditorialEntry} from '@/types';

export const searchPages:Record<string,{title:string;description:string;image?:string;noindex?:boolean}>={
  '/':{title:'Jaisalmer Trips, Desert Safaris & Travel Guide',description:'Plan your Jaisalmer trip with city and desert itineraries, safari and camping options, clear package estimates and practical travel guides.',image:'khuri'},
  '/packages':{title:'Jaisalmer Tour Packages · Itineraries & Prices',description:'Compare Jaisalmer tour packages, desert stays and safari options. See duration, room sharing, meals, transport and provisional price estimates before booking.',image:'sam'},
  '/jaisalmer-travel-from':{title:'Jaisalmer Trips from Indian Cities · Travel Planning',description:'Plan how to reach Jaisalmer from Delhi, Gujarat, Jaipur or Bengaluru. Compare connection choices, arrival plans and local packages with origin travel kept separate.',image:'khuri'},
  '/places':{title:'Places to Visit in Jaisalmer',description:'Explore Jaisalmer Fort, Gadisar Lake, carved havelis, Sam and Khuri. Find practical visiting notes and plan realistic city and desert routes.'},
  '/experiences':{title:'Things to Do in Jaisalmer · City & Desert',description:'Discover heritage walks, desert evenings, overnight stays, local food and folk culture. Understand the experience and what to check before choosing a package.',image:'sam'},
  '/itineraries':{title:'Jaisalmer Itineraries · 1 to 4 Days',description:'Plan one day, a weekend or a longer Jaisalmer trip with suggested city and desert itineraries, practical timing notes and room for your own pace.',image:'lake'},
  '/travel-guide':{title:'Jaisalmer Travel Guide · Plan Your Trip',description:'Practical Jaisalmer travel guides covering the best time to visit, Sam or Khuri, safari choices, trip budgets, transport, packing and camp booking.',image:'khuri'},
  '/about':{title:'About JaisalGo · Thoughtful Jaisalmer Travel Planning',description:'Learn how JaisalGo approaches Jaisalmer destination research, clear package information and responsible city and desert travel.'},
  '/contact':{title:'Contact & Jaisalmer Trip Enquiries',description:'Create a Jaisalmer travel brief with your dates, group and preferences. Review the available enquiry options and delivery status before sending.'},
  '/plan-your-trip':{title:'Plan Your Jaisalmer Trip · Create a Travel Brief',description:'Build a simple Jaisalmer trip brief around your dates, travellers, budget, stay and interests. Explore without an account or an email address.',image:'lake'},
  '/photo-credits':{title:'Jaisalmer Photography · Sources & Image Licences',description:'View the photographers, original sources and Creative Commons licences for the documentary Jaisalmer images used by JaisalGo.'},
  '/privacy-policy':{title:'Privacy Notice & Analytics Choices',description:'Read how JaisalGo handles trip briefs, booking details and optional anonymous analytics, including your privacy choices.',noindex:true},
  '/terms':{title:'Planning & Booking Terms',description:'Review the current planning and booking terms, supplier quote requirements and conditions that apply before a real reservation.',noindex:true},
  '/cancellation-policy':{title:'Cancellation & Refund Guidance',description:'Understand quote-specific cancellation terms, payment conditions and the refund policy information to confirm before booking.',noindex:true},
};

const editorialTitles:Record<string,string>={
  'places/jaisalmer-fort':'Jaisalmer Fort: a city within a fort',
  'places/gadisar-lake':'Gadisar Lake: the quieter side of Jaisalmer',
  'places/sam-sand-dunes':'Sam Sand Dunes: plan your visit',
  'places/khuri':'Khuri dunes: a slower desert escape',
  'places/desert-national-park':'Desert National Park: beyond the dunes',
  'experiences/heritage-walk':'Jaisalmer heritage walks',
  'experiences/desert-evening':'Desert evenings in Jaisalmer',
  'experiences/overnight-desert':'Overnight desert stays in Jaisalmer',
  'experiences/lake-photography':'Gadisar Lake photography',
  'experiences/food-and-craft':'Jaisalmer food and local craft',
  'experiences/folk-culture':'Folk music and cultural evenings',
  'itineraries/1-day-jaisalmer':'Jaisalmer itinerary for one day',
  'itineraries/2-day-jaisalmer':'Jaisalmer itinerary for 2 days',
  'itineraries/3-day-jaisalmer':'Jaisalmer itinerary for 3 days',
  'itineraries/4-day-jaisalmer':'Jaisalmer itinerary for 4 days',
  'travel-guide/first-time-jaisalmer':'Jaisalmer travel guide for your first visit',
  'travel-guide/best-time-to-visit':'Best time to visit Jaisalmer',
  'travel-guide/sam-versus-khuri':'Sam or Khuri? Choose your Jaisalmer desert stay',
  'travel-guide/desert-camp-checklist':'Jaisalmer desert camp booking checklist',
  'travel-guide/camel-or-jeep':'Camel safari vs jeep safari in Jaisalmer',
  'travel-guide/how-to-reach':'How to reach Jaisalmer and the dunes',
  'travel-guide/responsible-thar-travel':'Responsible travel in Jaisalmer and the Thar',
  'travel-guide/packing-and-accessibility':'What to pack for a Jaisalmer desert trip',
  'travel-guide/budget-planning':'Jaisalmer trip cost and budget planning',
};
export function editorialTitle(collection:string,item:EditorialEntry):string {
  return editorialTitles[`${collection}/${item.slug}`] || `${item.title} · Jaisalmer visitor guide`;
}

export const publicStaticPaths=Object.entries(searchPages).filter(([,page])=>!page.noindex).map(([path])=>path);

/** Deliberate links between existing, distinct guides. No keyword doorway routes. */
export function guideLinks(desert=false):{path:string;title:string}[] {
  return desert?[
    {path:'/places/sam-sand-dunes',title:'Sam Sand Dunes visiting guide'},
    {path:'/travel-guide/desert-camp-checklist',title:'What to check before booking a camp'},
    {path:'/travel-guide/camel-or-jeep',title:'Camel safari or jeep safari?'},
    {path:'/jaisalmer-travel-from',title:'Plan your journey from your city'},
  ]:[
    {path:'/travel-guide/first-time-jaisalmer',title:'Plan your first Jaisalmer trip'},
    {path:'/itineraries/2-day-jaisalmer',title:'A suggested 2-day itinerary'},
    {path:'/travel-guide/budget-planning',title:'Build your full trip budget'},
    {path:'/jaisalmer-travel-from',title:'Plan your journey from your city'},
  ];
}
