# Traveller package clarity — 3 November 2026

This is an additive information pass on the existing application. No routes, payment actions, rates, tax calculations, rounding, ticket access or inventory mechanisms were replaced. Existing package and booking records remain readable; the private database was not reset.

## One package summary

`lib/booking/package-clarity.ts` derives six card highlights and grouped details from the package, selected choices and the same quote used at checkout. It covers stay allocation, rooms, transfers, food, safari, entertainment, timings, admissions and extras. The existing city/desert night allocation, occupancy rounding and four-traveller transfer model are preserved. It does not infer meals from a meal allowance, AC from a price tier, attached bathrooms from a tent name, or dune bashing from a jeep ride.

Missing supplier specifications display **Not specified**. Statuses are Included, Not included, Optional, Proposed and Not specified. Supplier facts marked Included are presented as Proposed until the package is confirmed. The base stay and selected transfer charges are explicitly allowances until contracted. A generated default stay category is distinguished from a supplied stay specification so a fallback Swiss-tent label is not mistaken for an assigned room.

The `(i)` panel retains its existing four sections: Overview, Itinerary, Stay & venue, Price & extras. Its overview now has a six-part glance, a visual city/desert night split and grouped accordions. All original policy, safety, venue/map, source-reference, itinerary and customisation features remain. Decorative destination imagery is reduced in the desktop modal and omitted from the mobile modal header so information appears sooner; it remains on cards and the standalone package page. Verified property galleries and map behavior remain unchanged. No room or property photos were invented.

## Optional supplier specifications

The existing operator JSON editor accepts optional `details.travellerFacts`; old payloads need no changes. Its fields are validated by `travellerFactsSchema`. Example (only use facts actually agreed with a supplier):

```json
{
  "stay": {"roomType": "Standard double room", "climate": "Non-AC", "bathroom": "Attached"},
  "transport": {
    "vehicleType": "Sedan", "climate": "AC", "seats": 4, "arrangement": "Private",
    "pickup": "Agreed Jaisalmer pickup point", "drop": "Not included — one-way pickup only",
    "transfers": {"status": "included", "note": "One-way pickup; return transfer excluded"},
    "sightseeing": {"status": "not-included"}
  },
  "meals": {
    "breakfast": {"status": "included"}, "lunch": {"status": "not-included"},
    "dinner": {"status": "not-included"}, "snacks": {"status": "not-included"},
    "water": {"status": "not-specified"}, "dietary": "Supplier-confirmed vegetarian menu"
  },
  "experiences": {
    "camel": {"status": "optional", "note": "Separate dated quote required"},
    "jeep": {"status": "not-included"}, "duneBashing": {"status": "not-included"},
    "dance": {"status": "not-specified"}, "music": {"status": "not-specified"},
    "bonfire": {"status": "not-included"}, "dj": {"status": "not-included"},
    "desertDinner": {"status": "not-included"}
  },
  "schedule": {"departure": "Supplier-confirmed time", "arrival": "Supplier-confirmed return", "freeTime": "As agreed in the itinerary"},
  "entryTickets": {"status": "not-included"}
}
```

Place this object inside `details.travellerFacts`, retain the rest of the existing package fields and update the old description/inclusion lists consistently. Assigned property, address, map and gallery stay in `details.venue`. Check-in/check-out can also be recorded in `schedule`. Do not use this illustrative JSON as actual supplier information. The admin validator rejects overnight contradictions and known conflicts between meal statuses and the old no-meal or named breakfast/dinner statements.

## Selection and price boundaries

Priced occupancy/allowance changes, group counts, transfer selection, jeep/guide allowances, priced extras, dated rates and taxes still use the existing server-owned quote. Generic pricing labels now say allowance instead of asserting an unspecified inclusion. Per-person figures are explicitly rounded up; the exact group total, token and balance remain visible.

Hotel-only, tent-only, dorm, resort and other alternative stay requests do not silently rewrite the contracted night split or invent an upgrade tariff. Shared matching, children and unpriced activities retain their supplier-quote gates. Non-four-seat or different private/shared vehicle specifications require a vehicle-specific quote before real payment; the estimate explicitly retains the existing four-traveller transfer model. There is no invented bus/tempo/SUV tariff. Partial pickup/drop coverage and local sightseeing transport can be specified independently in the transport facts and notes.

A jeep explicitly present in the base supplier facts cannot also produce the separate optional jeep charge: normalised selections and the preference UI omit that duplicate. Other existing rates and selection behavior remain unchanged. Unknown facts and optional extras are never labelled as included merely because a monetary allowance exists.

## Checkout and ticket consistency

The same selected summary is expandable within the one-page checkout. New drafts save an optional `clarity` snapshot alongside the existing quote, choices and arrangements. It is copied to the booking on verified settlement and shown on its ticket; later catalogue edits cannot change it. Downloaded tickets include saved inclusion statuses, room/vehicle/meal details, available timings and excluded unpriced requests. Older tickets keep their existing arrangement fallback. No account, email, additional mandatory field or booking step was introduced.

## Verification

43 Node tests pass, including the existing 37 pricing/payment/inventory/privacy tests and six new traveller-information cases. New coverage includes positive-cost/unknown-inclusion separation, all catalogue night totals, breakfast-only/dinner-only/no meals, explicit negative statuses, mixed hotel/desert nights, singles/children/shared requests, open-sky sleeping, partial transfers, vehicle specifications/capacity quote gates, duplicate jeep prevention and immutable ticket facts. TypeScript/production build and the isolated administrator HTTP check pass. Manual responsive and demo-ticket results are recorded in VERIFICATION.md.

The seeded catalogue is still provisional. Exact properties, actual room photos, AC/bathrooms, menus, pickup/drop points and times cannot be supplied without operator data. The UI now exposes these gaps rather than guessing. Live supplier/gateway validation and the previously recorded lint/browser-runner limits are unchanged.
