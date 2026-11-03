# Search intent and page map

This map uses the supplied target queries and actual catalogue/editorial content. It is a content strategy, not measured keyword demand. No search volumes, difficulty scores, ranks or traffic forecasts have been invented. Validate priorities with Search Console once real impressions exist.

## Hubs and editorial intent

| Existing canonical path | Primary intent | Supporting queries / role |
| --- | --- | --- |
| `/` | JaisalGo / Jaisalmer travel planning | Brand discovery; introduce city, desert and booking options |
| `/packages` | Jaisalmer tour packages | Jaisalmer packages, trip packages, holiday packages, travel packages, tour package price; compare genuine itineraries and estimates |
| `/experiences` | Things to do in Jaisalmer | Heritage, food, cultural evenings and desert experiences |
| `/places` | Places to visit in Jaisalmer | Destination discovery rather than another package catalogue |
| `/travel-guide` | Jaisalmer travel guide | Navigate planning topics; avoid duplicating each guide’s detailed intent |
| `/travel-guide/first-time-jaisalmer` | Planning a first Jaisalmer visit | Choosing nights, city versus desert, occupancy, transport and understanding the full total |
| `/travel-guide/best-time-to-visit` | Best time to visit Jaisalmer | Seasons, heat, night layers and date-dependent prices; not a live forecast |
| `/itineraries/2-day-jaisalmer` | Jaisalmer itinerary for 2 days | A suggested route, distinct from buying a two-day package |
| `/itineraries/3-day-jaisalmer` | Jaisalmer itinerary for 3 days | A suggested city-and-desert sequence |
| `/places/sam-sand-dunes` | Sam Sand Dunes visiting guide | Atmosphere, facilities and comparison questions |
| `/travel-guide/sam-versus-khuri` | Sam versus Khuri | Compare location/experience choices without promising quiet or luxury |
| `/travel-guide/desert-camp-checklist` | Jaisalmer desert camp booking checklist | Private tent, attached bathroom, meal and transfer questions |
| `/travel-guide/camel-or-jeep` | Camel safari vs jeep safari in Jaisalmer | Safety, suitability, ride scope and charge basis |
| `/travel-guide/budget-planning` | Jaisalmer trip cost | Whole-trip cost breakdown; source benchmarks remain separate from JaisalGo estimates |
| `/travel-guide/how-to-reach` | How to reach Jaisalmer and the dunes | Current-service checks, pickup and arrival buffers; no invented departures |
| `/travel-guide/packing-and-accessibility` | What to pack for a Jaisalmer desert trip | Layers, daytime essentials, access and family/solo planning |
| `/travel-guide/responsible-thar-travel` | Responsible Jaisalmer travel | Conservation, residents, welfare and permission checks |

The other existing place, experience and itinerary pages retain their distinct subject: named attraction, activity context, or one-/four-day planning route. Each receives unique metadata, its own canonical, an Article graph and a collection link. They are not copies of the commercial catalogue.

## Published package intents

All are existing catalogue entries. Descriptions continue to distinguish provisional models from confirmed supplier services. These intents do not assert live availability.

| `/packages/` slug | Primary commercial intent |
| --- | --- |
| `golden-city-day` | Jaisalmer city day trip |
| `sam-desert-night` | Weekend desert camping trip |
| `city-and-dunes` | Jaisalmer 2 days / 1 night city-and-desert package |
| `golden-city-escape` | Jaisalmer 3 days / 2 nights heritage-and-desert package |
| `jaisalmer-unhurried` | Four-day Jaisalmer city-and-desert trip |
| `budget-desert` | Backpacker / solo-oriented desert trip |
| `premium-desert` | Premium city-and-desert stay planning |
| `family-jaisalmer` | Jaisalmer family tour package |
| `couples-escape` | Jaisalmer couple package |
| `friends-adventure` | Jaisalmer friends / adventure group trip |
| `heritage-photography` | Jaisalmer heritage photography trip |
| `custom-private` | Private Jaisalmer trip planning |
| `khuri-slow` | Khuri overnight desert trip |
| `tanot-longewala` | Tanot and Longewala day excursion |
| `royal-jaisalmer-holiday` | Five-day Jaisalmer holiday itinerary |
| `short-camel-ride` | Short Jaisalmer camel ride |
| `jeep-dune-safari` | Jaisalmer jeep dune safari |
| `sunset-desert-safari` | Sunset desert safari experience |
| `desert-cultural-evening` | Desert cultural evening |
| `budget-camp-only` | Budget overnight camp stay without assuming transfers |
| `swiss-camp-only` | Private Swiss-tent stay option |
| `open-sky-desert-night` | Open-sky overnight desert experience |
| `sam-complete-experience` | Sam desert night with the listed activity model |
| `desert-border-circuit` | Multi-day desert, Tanot and Longewala circuit |

## Cannibalization and expansion rules

- Preserve `/packages` and `/packages/[slug]`; do not also publish `/jaisalmer-tour-packages` copies. Existing indexed URLs and booking URLs remain stable.
- Sorting, dates, traveller choices and category filters remain usable but noindex, with canonical links to the base route. Campaign parameters consolidate to the same canonical without making a public page noindex.
- “Best packages” is a comparison query for the main catalogue, not a claim that every product is the best. Unverified luxury facilities, pool access, child tariffs and shared-seat prices are not SEO promises.
- Family, couple, solo, private-group and accommodation questions belong to their genuine package and explanatory guide. Do not generate a page for every parameter combination.
- Create origin-city pages only after real departures, transport and genuinely distinct products exist. There is no verified Delhi/Mumbai/Ahmedabad departure catalogue to publish now.
- After a package is retired, decide whether a genuinely equivalent successor warrants a targeted permanent redirect. Otherwise keep the correct 404; do not redirect unrelated products to the homepage.
