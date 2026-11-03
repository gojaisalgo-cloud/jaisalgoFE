import {z} from 'zod';
const text=z.string().trim().min(1).max(3000),photo=z.enum(['fort','fort-day','haveli','lake','sam','khuri','sunset','bada','lanes']);
const stay=z.enum(['none','hostel','city-hotel','haveli','mud-hut','budget-tent','swiss-tent','glamping','family-cottage','pool-resort','private-pool','open-sky']);
const fact=z.object({status:z.enum(['included','not-included','optional','not-specified','proposed']),note:text.optional()}),climate=z.enum(['AC','Non-AC']);
export const travellerFactsSchema=z.object({
 stay:z.object({roomType:text.optional(),climate:climate.optional(),bathroom:z.enum(['Attached','Shared']).optional()}).optional(),
 transport:z.object({vehicleType:text.max(100).optional(),climate:climate.optional(),seats:z.number().int().min(1).max(60).optional(),arrangement:z.enum(['Private','Shared']).optional(),pickup:text.optional(),drop:text.optional(),transfers:fact.optional(),sightseeing:fact.optional()}).optional(),
 meals:z.object({breakfast:fact.optional(),lunch:fact.optional(),dinner:fact.optional(),snacks:fact.optional(),water:fact.optional(),dietary:text.optional()}).optional(),
 experiences:z.object({camel:fact.optional(),jeep:fact.optional(),duneBashing:fact.optional(),dance:fact.optional(),music:fact.optional(),bonfire:fact.optional(),dj:fact.optional(),desertDinner:fact.optional()}).optional(),
 schedule:z.object({departure:text.optional(),arrival:text.optional(),checkIn:text.optional(),checkOut:text.optional(),freeTime:text.optional()}).optional(),entryTickets:fact.optional()
});
export const packageDetailsSchema=z.object({
 travellerFacts:travellerFactsSchema.optional(),stayTypeSpecified:z.boolean().optional(),
 kind:z.enum(['tour','activity','cultural','camp']),duration:text.max(100),chargeUnit:z.enum(['person','vehicle','tent']),unitCapacity:z.number().int().min(1).max(12),defaultTransport:z.boolean(),stayType:stay,stayOptions:z.array(stay).min(1).max(12),location:text.max(200),
 venue:z.object({name:text.max(200),address:text,mapUrl:z.union([z.literal(''),z.url().regex(/^https:\/\/(www\.google\.com\/maps|maps\.google\.com\/|maps\.app\.goo\.gl\/)/)]),confirmed:z.boolean(),gallery:z.array(photo).max(8)}),
 amenities:z.object({washroom:text,climate:text,occupancy:text,pool:text,accessibility:text}),
 culture:z.object({proposed:z.boolean(),programme:text,setting:text,seating:text,food:text,reporting:text,performance:text,dinner:text,returnTime:text}),
 pickup:text,children:text,safety:text,attractions:z.array(text.max(200)).max(25),
 extras:z.array(z.object({id:z.string().regex(/^[a-z0-9-]{2,60}$/),name:text.max(100),unit:z.enum(['person','group','vehicle','tent','ride','flight / person','session','boat']),amount:z.number().int().min(100).max(50000000).nullable(),taxBps:z.number().int().min(0).max(3000),description:text})).max(25).refine(items=>new Set(items.map(i=>i.id)).size===items.length,'Extra IDs must be unique.'),
 marketReference:z.object({label:text.max(200),source:z.url().regex(/^https:\/\//),note:text}).nullable()
}).refine(d=>!d.venue.confirmed||!!d.venue.mapUrl&&!/to be confirmed/i.test(d.venue.name),'A confirmed venue needs an actual name and exact map URL.').refine(d=>d.chargeUnit!=='tent'||d.unitCapacity===2,'Tent estimates use two-person occupancy.').refine(d=>d.stayOptions.includes(d.stayType),'Default stay must be an offered stay preference.');
