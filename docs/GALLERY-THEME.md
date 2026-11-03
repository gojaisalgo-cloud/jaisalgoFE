# Reference-inspired gallery theme — 25 October 2026

## Direction
The user's seven supplied references informed the visual treatment: charcoal/olive surfaces, warm ivory typography, restrained gold accents, arched images, a cinematic centered hero, rounded photographic travel cards, collected postcards and a layered destination deck. Their art, museum, Rome and resort images were not copied into this Jaisalmer website. Existing licensed documentary photographs and their attribution records remain in use.

## Landing page
- Rounded, inset fort photograph with the headline “Where the golden stories begin.”
- Primary “Book a package” action scrolls to a new package collection directly after the hero.
- Three existing briefs: The Golden City escape, The classic desert night and Just the two of you. Each displays its duration, traveler and accommodation preferences, quote status, itinerary link and prominent “Book now” action.
- “Book now” routes to the corresponding `/packages/[slug]#enquire`, where the package and duration initialize from the selected brief. The page explains that a written quote and availability confirmation are required. No reservation, payment, price or supplier availability is fabricated.
- Layered six-scene destination gallery has category controls, previous/next buttons, focusable keyboard arrow navigation and horizontal swipe handling. Vertical page scrolling is preserved.
- Theme extends to listings, details, form fields, navigation and footer. No application dependency was added.

## Verification
Strict TypeScript, lint and six domain tests passed for this update; the production webpack build generated all 65 pages. The final cosmetic polish was rebuilt with Node 20.20.2. Mobile navigation opens and closes with Escape. At 390px, the landing page and selected package form fit the viewport; the first booking link opens the correct package with a three-day duration. Desktop checks confirm all three Book now links are visible in the collection. The gallery category and next controls update the active scene.

Final checks also passed for the two HTTP route/link and API scenarios. Homepage document width matched 1440px, 768px, 390px and 360px viewports; tablet package cards had no internal overflow. Keyboard Right Arrow advanced the selected scene from Gadisar Lake to Bada Bagh.

The local preview remains on port 3001. Enquiry delivery is unconfigured; users can prepare and download a brief. No supplier integration or instant booking service has been enabled. Full browser-runner/axe limitations from `VERIFICATION.md` still apply.

## Motion update
Added finite, staggered headline entrances, a 2.4-second hero image zoom and a small scroll-linked image drift. Package cards reveal as they enter the viewport, with a desktop stagger and no extra mobile delay. Fine-pointer hover lifts the cards and fans the postcard composition; booking links have an arrow and light sweep. Collection changes and the active destination copy animate in, while the destination deck uses a slower eased transition. No auto-advancing carousel or animation dependency was added.

Motion styles live in `app/motion.css`. `ScrollExperience` uses a passive scroll listener with requestAnimationFrame, an IntersectionObserver and cleanup on navigation. Reduced-motion changes remove prepared reveal styles and the scroll listener; CSS disables transitions and entrance effects. Content remains visible without JavaScript.

Verification: production build and TypeScript passed. In-app browser at 1440px and 390px confirmed the title transform settles to identity, all three prepared package cards reveal at full opacity, desktop stagger is removed on mobile, hero drift changes on scroll, and the gallery next control still selects Gadisar Lake. Both viewport widths have no horizontal overflow. Reduced-motion behavior was checked in source rules; the live OS setting was not changed.
