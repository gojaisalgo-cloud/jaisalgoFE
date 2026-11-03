# Simplified booking and digital tickets

The active UI uses white cards on warm ivory, sandstone gold accents, deep forest actions and charcoal text. Local Cormorant supplies editorial headings; Manrope supplies interface text, forms, prices and tickets. The existing JaisalGo wordmark and licensed destination photos remain. The supplied boarding-pass images guide the ticket proportions, perforated divider and QR stub. They are reference material, not site content. Scroll reveals and parallax were removed; remaining short transitions respond to direct interaction and respect reduced motion.

## One page to payment

Package → date/options + essential contact details on one page → payment → ticket.

- Date is visibly preselected to tomorrow, with two travelers, comfort stay and transport included. The date and group size remain editable.
- Name and mobile are the only personal inputs. Browser autofill is enabled. Indian 10-digit numbers normalize to +91; international numbers require a country code.
- Stay/transport/safari/guide controls are retained in a collapsed customization section. Totals recalculate immediately.
- Total, token and due-date balance remain visible before paying. Explicit policy consent is retained. There is no account creation or separate contact/review page.
- The main CTA creates the server-side hold and opens secure payment directly. In demo mode it runs an explicitly labelled simulation and immediately opens the sample ticket.
- Payment retries reuse the order. Pending/authorized/failed states do not issue a ticket; verified capture does. Existing expiry, capacity, webhook signature and idempotency controls are retained.

## No address collection

Customer forms, enquiry payloads, booking snapshots, admin booking rows and ticket exports no longer request or include an email address. A database initialization migration removes the old field from existing draft/booking JSON without changing payment references, prices, access keys or accepted terms. Razorpay receives name/mobile prefill only and its optional address field is hidden using its documented Checkout option: [Razorpay Standard Checkout](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/integration-steps).

Local trip-brief creation requires no personal information: dates, traveler count and duration are enough, with preferences collapsed. Only a configured enquiry-delivery flow requests a name and mobile number. Business support uses the configured WhatsApp number. The live support gate uses `NEXT_PUBLIC_WHATSAPP_NUMBER`.

## Ticket and later access

- Digital ticket shows the booking ID, lead traveler, date, meeting time, location, group size and payment status. Meeting time remains “To be confirmed”; no supplier time is fabricated.
- Download Ticket generates a standalone PNG with real booking facts and a QR. Share Ticket opens the device share sheet where supported, or copies a private link, with a selectable fallback when clipboard access is unavailable.
- QR generation is local using [node-qrcode](https://github.com/soldair/node-qrcode). The QR opens the same private ticket; it is not a supplier admission validator.
- My Bookings lists reservations whose access keys are saved on this browser, including bookings made before this refinement. It never exposes bookings by an unverified mobile-number lookup.
- Private links put the access key in the URL fragment, which is not sent to the server as part of the page request. A valid imported ticket is saved to the device; its fragment is removed from the address bar when storage succeeds.
- The private link/QR grants access to the booking. Share it only with the travel party. Clearing storage loses local access; a saved link/key restores it. No cross-device phone recovery or OTP service is claimed.
- There is no customer authentication step to complete a booking. The protected operator desk retains its separate existing authentication; no public customer login or placeholder OTP is introduced.

## Verification

Eighteen domain/payment/privacy/ticket tests passed, including normalized mobile contact, removal of unwanted personal fields, private-link origin validation, escaped ticket text and gateway configuration. Production build and TypeScript passed. Isolated admin integration passed after the contact change. Real-browser verification and final responsive checks are recorded in `VERIFICATION.md`.

The application still defaults to demo. Real gateway/SMS delivery, supplier times and confirmed inventory require business configuration and staging validation described in `BOOKING-SYSTEM.md`.


## Shared dropdowns

`components/dropdown.tsx` and `app/dropdown.css` now provide the same menu treatment for planning preferences, booking choices, package discovery and operator controls. Rounded white panels, muted icons, short budget descriptions and selected checkmarks follow the supplied visual reference. Keyboard/typeahead, focus management and collision positioning use [Radix Select](https://www.radix-ui.com/primitives/docs/components/select). Named hidden inputs preserve the original form values, including empty filter choices.

## Final finishing pass

The light theme now uses warmer ivory surfaces, clearer muted text, larger package/detail labels, consistent 44–48px controls, visible keyboard focus and restrained hover feedback. The ₹99 token and full estimate remain the strongest pricing elements. The mobile inclusions layout uses one column for easier reading.

Homepage previews now show how many matches remain and link to the full catalogue with the selected category preserved. The price note covers per-person, per-tent and per-vehicle products. Day trips display “1 day · no stay”. Demo and gateway-test wording distinguish simulated activity from real travel.

Checkout preferences and the selected date now survive Back to package → Choose date. Only non-personal trip preferences appear in the URL. Browser date bounds and server validation use the same local-date window. Invalid input returns concise customer wording rather than a raw schema dump; errors receive focus and have clearance above the sticky mobile payment bar. Mobile navigation closes on Escape, outside pointer interaction or route change.

## Colour and typography — 3 November 2026

`app/finishing.css` defines the palette/type layer and defines the active palette and type hierarchy. Canvas is `#fbfaf7`, cards are white, main text is `#252c28`, supporting text is `#626760`, primary actions are `#2f4a3d`, and gold is `#8c673a`. The ₹99 token uses a cream/gold badge, separate from the charcoal full estimate. Selected category icons use white on forest.

Cormorant headings give discovery and editorial pages a lighter royal character. Manrope keeps package names, controls, checkout and booking facts clear. Body copy is generally 15–17px; inputs use 16px; labels and actions use 13–15px. Package titles are 23–24px, prices 29–32px, and marketing headings scale with the viewport. Supporting captions have been enlarged and darkened. Old small-font overrides were removed from navigation and cost lines.

At narrow widths, card actions stack, the ticket payment summary becomes vertical, and information facts use one column. Selection menus, focus rings, policy consent and the fixed booking action remain usable. No booking data, payment logic or authentication requirements changed in this visual pass.

## Booking audit refinements

The existing one-page flow now checks date/group availability before payment, shows a mobile price breakdown and handles stale quotes without creating an order. Optional children count stays within the total group; child rates and activity eligibility remain supplier-confirmed. Name/mobile and non-personal preferences can resume from this tab's session storage for up to two hours, then are cleared on successful booking. Explicit consent is requested again when package terms/revision change.

Retry, pending, authorized, expired and review states have distinct actions. Restart releases the old unpaid hold and preserves the form. Tickets distinguish active, cancelled and refunded records; their downloads include the itinerary and saved arrangements. The royal ivory/forest/gold design and existing routes are retained. Full findings and limits are in BOOKING-AUDIT.md.

## Directional controls — 3 November 2026

`components/directional-control.tsx` provides a decorative Lucide arrow cue and a labelled icon-only button. Forty-six arrow instances now share the same 18px/1.75-stroke treatment. Labelled secondary links use one rounded, bordered surface instead of disconnected underlines; primary CTAs keep their forest hierarchy. Photo, editorial and saved-ticket cues remain within the existing single card link, with no nested interactive elements or additional tab stops.

`app/controls.css`, imported after the palette/type layer, defines 44px icon-only targets, subtle hover/active/focus/disabled states and reduced-motion support. Gallery, menu and detail-close buttons reuse the component. Native disclosure and Radix selection semantics remain intact. Text arrow glyphs were replaced throughout application TSX. All destinations, event handlers and booking actions are preserved. Date/traveller fields stack below 375px to prevent dropdown overhang.

## Traveller information clarity

Each package card now shows six consistent facts rather than inferring meals or transport from costs. The existing (i) panel groups stay, vehicle, meal, safari, entertainment, timing and extra-cost facts behind clean accordions. A visible city/desert night split and unit counts use the same allocation as pricing. Included, Not included, Optional, Proposed and Not specified labels retain text meaning without relying on colour.

The selected summary continues into checkout and new immutable ticket snapshots. Unknown or unpriced upgrades stay visibly outside the total; unavailable combinations are not invented. Optional supplier facts can be entered through the existing operator JSON editor. See PACKAGE-CLARITY.md for the data contract, examples and verification.
