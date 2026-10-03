# Decisions

1. Repository was not initialized; initialize Git locally and retain the supplied instructions.
2. Reception has no dashboard: revenue is owner-only. Reception starts at appointments.
3. Practitioner status progression is allowed for own appointments; creation/editing stays with reception/owner.
4. Courses use a treatment's unit price with a 15% bundle discount and configurable sessions/validity (default 10 sessions, 12 months).
5. Billing an individual treatment records payment only. Consumables are deducted on completion, never twice at checkout.
6. Past seeded completed appointments and purchases are historical fixtures; opening stock is the present balance, not reconstructed from six months of movements.
7. Thai receipt is a rasterized PDF for reliable glyph rendering; it is a demo receipt, not a tax invoice.
8. Week view has practitioner columns inside each day; room view has four room columns for a selected day. Mobile calendars scroll horizontally with a visible date control.
9. Persist edits for the current local day; on the next day regenerate the dated demo fixtures so the public demo never becomes stale. This daily reset is documented in README.
10. Architecture deviation: replace npm SheetJS with dynamically loaded ExcelJS because SheetJS's npm release has unpatched advisories. Upgrade jsPDF and Vitest to patched versions.
