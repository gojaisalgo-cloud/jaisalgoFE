# Jaisalmer package marketplace

Updated 2 November 2026. This implements the supplied “Jaisalmer Trip Packages — Complete Research, Pricing & App UX Plan” in the existing Next.js application. That pasted file ends mid-sentence after “Avoid an obvious AI”; no missing continuation was assumed.

## Customer experience

Every package card, including the original collection cards, now has a visible `ⓘ Details` button. It opens an accessible native modal, with a bottom-sheet layout on mobile. The original package URLs remain canonical and render the same information component.

The panel has four sections:

- Overview: stay, group arrangements, charging basis, proposed inclusions, exclusions, route, pickup/drop, child/accessibility/safety and accepted cancellation terms.
- Itinerary: one proposed day entry per day, or an activity sequence for short experiences.
- Stay & venue: operator/property name, address, exact map URL if confirmed, amenities, room/venue photos if verified, culture/food/seating and reporting/show/dinner/return timing. Unknown fields explicitly await confirmation; area-search links are labelled as area searches rather than venue pins.
- Price & extras: traveler count, independent travel and accommodation sharing, stay type/allowance, transfers, optional jeep/guide, special occasion and additional experiences. Itemized full-group estimate, supplier tax allowance, service/payment allowance, ₹99 deduction and balance remain visible. `Choose date` carries the selected non-personal preferences into the existing checkout.

Escape, the close button and clicking outside the desktop dialog close it and restore the opening button’s focus. Background content is inert while the modal is open. Select portals are mounted inside their nearest dialog, preserving modal interactivity. Reduced-motion preferences disable the brief entrance animation.

## Inventory and data

There are 24 seeded planning products: the original 15 plus short camel ride, private-vehicle jeep safari, sunset safari, cultural evening without stay, budget camp-only, Swiss camp-only, open-sky night, complete Sam night and a three-night city/desert/Tanot/Longewala circuit. Existing slugs, admin edits and private booking snapshots are retained. New rows use `INSERT OR IGNORE`; enriching a legacy record on read does not reset its stored costs or content.

Short activities display minutes/hours/evening, rather than misleading 0-night package durations. Card prices explicitly distinguish person, vehicle and tent. A vehicle estimate assumes an actual passenger capacity, never an invented shared-seat rate. Camp-only offers default to own arrival; transfer costs are opt-in. Open-sky sleeping is labelled separately from private tent occupancy.

`types/marketplace.ts` defines the structured package information. `data/discovery-tours.ts` supplies the new provisional products. `lib/booking/package-details.ts` provides cautious defaults for legacy products. The admin editor can set package type, display duration/basis, default stay, venue and add-on prices. The full validated JSON editor exposes every programme, amenity, gallery, reference and tax field. A confirmed venue requires an actual name and a Google Maps URL; unsafe links and duplicate extra IDs are rejected.

The stay library covers no stay, hostel dorm, city hotel, haveli, mud hut, budget tent, Swiss tent, glamping, family tent/cottage, shared swimming-pool resort, private pool suite and open-sky sleeping. Gender-specific dorm and shared-group choices are requests, not promised inventory.

The route library covers city havelis/temples/lake, Bada Bagh, Amar Sagar, Vyas Chhatri, Lodurva, War Museum, Sam, Khuri, Kuldhara, Khaba, Desert National Park, Tanot/Longewala, Pokhran and Ramdevra. These are optional route possibilities, not universal inclusions. District trips need adequate time, current access and appropriate permissions; forward border posts are excluded.

## Pricing and requests

All money is integer paise. The server owns costs, selected extras, tax and totals. Occupancy rounds up rooms and vehicles. A private single-occupancy preference uses one room/tent per traveler. Shared group requests do not assume future guests or reduce the price without verified inventory. Changing the stay type to another unpriced property category remains a request; the base stay allowance is clearly retained.

The existing configurable tax allowance remains a planning fallback. `costs.taxRates` can override tax basis points separately for `cityStay`, `desertStay`, `transport`, `activities`, `meals`, `operations`, `jeep` and `guide`. Each priced extra has its own `taxBps`. No universal statutory rate is claimed. City-only overnight products allocate all nights to city accommodation; other models can specify `cityNights` explicitly.

Extras with `amount: null` display “Price on request”, are saved in the booking choices, and are excluded from the total. A configured amount is charged per traveler for person/ride/flight options; vehicle/tent units round up according to capacity/occupancy, while group/session/boat apply once per booking. The quantity and charging label appear in the cost model. Providers must configure the actual scope and tax before marking a product reviewed.

Requests include quad biking, parasailing, paramotoring, sandboarding, telescope stargazing, camel trek, dune dinner, sunrise photography, clothing photoshoot, photographer, village walk, cooking, heritage walk, boating, birthday/anniversary and proposal setups. Occasions additionally support students, backpacking, couples, families, women-only, corporate and festival groups.

A separate, collapsed illustrative simulator reproduces the supplied brief’s ₹3,200/two-person-tent + ₹1,500/six-person-jeep + ₹2,400/sedan or ₹3,200/six-passenger-transfer model. Two/four/six guests give ₹7,100/₹10,300/₹14,300 group subtotals, before tax/fees/extras. This is labelled unverified, does not form a group and is not the checkout pricing engine. Luggage may require a larger vehicle.

## Research and source boundaries

Sources checked 2 November 2026:

1. [Sam Jaisalmer Desert Camp — operator activity menu](https://samjaisalmerdesertcamp.com/activities/). The published examples distinguish a 15-minute single-rider camel option at ₹399 from a 15-minute jeep option at ₹1,999 for four people. These are reference examples only; date, taxes and availability need confirmation. They are not a JaisalGo supplier contract.
2. [Elite Heritage Camp — 2026–27 operator tariff](https://eliteheritagecamp.com/packages/). The published standard-season Swiss tent example is ₹4,000 plus tax for two guests per accommodation unit/night with a stated meal plan. Festival dates carry different prices. The reference property is not automatically assigned to any app booking.
3. [Rajasthan Tourism — Jaisalmer](https://www.tourism.rajasthan.gov.in/jaisalmer.html). Official destination context supports city/desert/district route discovery and identifies Tanot as roughly 120 km from Jaisalmer. Listing an attraction does not verify current access, fees or opening conditions.
4. [PIB / Ministry of Finance — GST FAQ, 16 September 2025](https://www.pib.gov.in/PressReleasePage.aspx?PRID=2167151&lang=2&reg=48) and [Ministry of Tourism Annual Report 2025–26](https://tourism.gov.in/sites/default/files/2026-02/Ministry%20of%20Tourism%20Annual%20Report_2025-26_english.pdf). These distinguish hotel accommodation treatment from conditional tour-operator treatment. Accordingly, the app supports service-specific configured allowances and requires tax review before live payment, rather than treating every itinerary as subject to one automatic tax rate.
5. [MDN native dialog](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog) and [Radix Select portal container](https://www.radix-ui.com/primitives/docs/components/select). Used for modal focus/inert behavior and in-dialog dropdowns.

Other price bands in the supplied brief have no direct source URLs or contracted rates. They were not promoted to verified offers or fabricated “from” discounts. The new seed costs are explicit provisional model inputs. No railway fare was represented as current without verification. No actual supplier room, performance image, artist, map pin, fixed show time, child rate or live shared inventory was invented.

## Booking and live boundaries

The existing journey remains select → date/options → name/mobile → pay → ticket. No account or customer email is added. Preferences and package information are snapshotted with the server quote; later admin edits cannot change an issued booking. My Bookings and ticket downloads remain private and account-free.

Demo checkout makes no charge or real reservation. Live checkout additionally rejects shared-group/accommodation requests, different unquoted stay categories, unpriced extras and special requests until they have a confirmed supplier quote. Overnight/cultural products require an actual confirmed venue. Existing supplier cost, tax review, gateway, business/contact, policy and live-departure capacity gates continue to apply. Supplier contracting, live group matching and external delivery are not configured integrations.
