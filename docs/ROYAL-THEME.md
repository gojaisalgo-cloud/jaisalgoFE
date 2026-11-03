# Light royal Rajasthani theme

The user's current direction replaces the earlier dark palette with warm ivory (#fcf8ef), sandstone paper (#f4ebdc), maroon (#803b37) and antique gold. `app/royal-theme.css` is the final theme layer, after the shared layouts and motion styles.

## Visible changes
- Light navigation, maroon wordmark and sun motif.
- Split opening: “Royal roots. Golden journeys.” beside a bright, gold-framed arched fort photograph. On phones the portrait moves below the copy.
- Subtle jaali-inspired geometry drawn as an original code-native SVG in `public/ornaments/jaali.svg`; no external image request.
- Arched package photographs above ivory descriptions, gold rules and maroon Book now actions.
- Light parchment backgrounds for the layered gallery, desert editorial, planner and footer.
- Lighter fields, filter controls, quote panels, detail pages and feedback states.

Existing package routes and enquiry behavior remain: Book now opens the selected package enquiry. There is no instant reservation or payment. Authentic destination photos and all existing attribution records remain in use. Motion from the preceding update is retained, with gentle photo drift adapted to the new frame and reduced motion respected.

## Verification
Production build and strict TypeScript passed. HTTP route/internal-link test passed. In-app browser checks at 1440, 768, 390 and 360px showed no document overflow. Tablet package cards had no internal overflow. Mobile navigation opened with dark text on ivory and closed with Escape. The Golden City Book now link opened its package enquiry with the correct package and three-day duration. The gallery next button selected Gadisar Lake. Light form colors, desktop hero, mobile hero and all three landing package cards were visually inspected.

No full automated browser/axe or field performance score is claimed; prior environment limits remain in `VERIFICATION.md`.
