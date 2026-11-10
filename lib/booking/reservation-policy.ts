import type {Tour} from '@/data/catalog';
import type {Choices} from './pricing';
import {packageDetails} from './package-details';
import {pendingRequests} from './preferences';

export const reservationTerms='Pay ₹99 to record your reservation. This amount is credited towards your trip total. The travel desk will confirm supplier arrangements, the final package price and any requested extras. Pay the remaining balance at check-in or on your visit date after confirmation. Any price changes require your agreement before further payment. If JaisalGo cannot confirm your trip, the ₹99 reservation amount will be refunded. Contact the travel desk for cancellation and refund assistance.';

export function reservationNeedsConfirmation(t:Tour,choices:Choices){
 const details=packageDetails(t);
 return !t.confirmed||!t.taxReviewed||t.policy.startsWith('Draft')||t.policy.length<50||pendingRequests(t,choices).length>0||((t.nights>0||details.culture.proposed)&&!details.venue.confirmed);
}
