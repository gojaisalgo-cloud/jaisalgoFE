export type PackageKind = 'tour' | 'activity' | 'cultural' | 'camp';
export type ChargeUnit = 'person' | 'vehicle' | 'tent';
export type Extra = {id:string;name:string;unit:string;amount:number|null;taxBps:number;description:string};
export type InclusionStatus = 'included' | 'not-included' | 'optional' | 'not-specified' | 'proposed';
export type ServiceFact = {status:InclusionStatus;note?:string};
/** Optional supplier facts. Missing fields must never become positive inclusions. */
export type TravellerFacts = {
 stay?:{roomType?:string;climate?:'AC'|'Non-AC';bathroom?:'Attached'|'Shared'};
 transport?:{vehicleType?:string;climate?:'AC'|'Non-AC';seats?:number;arrangement?:'Private'|'Shared';pickup?:string;drop?:string;transfers?:ServiceFact;sightseeing?:ServiceFact};
 meals?:Partial<Record<'breakfast'|'lunch'|'dinner'|'snacks'|'water',ServiceFact>> & {dietary?:string};
 experiences?:Partial<Record<'camel'|'jeep'|'duneBashing'|'dance'|'music'|'bonfire'|'dj'|'desertDinner',ServiceFact>>;
 schedule?:{departure?:string;arrival?:string;checkIn?:string;checkOut?:string;freeTime?:string};
 entryTickets?:ServiceFact;
};
export type PackageDetails = {
  travellerFacts?:TravellerFacts;
  stayTypeSpecified?:boolean;
  kind:PackageKind;
  duration:string;
  chargeUnit:ChargeUnit;
  unitCapacity:number;
  defaultTransport:boolean;
  stayType:string;
  stayOptions:string[];
  location:string;
  venue:{name:string;address:string;mapUrl:string;confirmed:boolean;gallery:string[]};
  amenities:{washroom:string;climate:string;occupancy:string;pool:string;accessibility:string};
  culture:{proposed:boolean;programme:string;setting:string;seating:string;food:string;reporting:string;performance:string;dinner:string;returnTime:string};
  pickup:string;
  children:string;
  safety:string;
  attractions:string[];
  extras:Extra[];
  marketReference:{label:string;source:string;note:string}|null;
};
