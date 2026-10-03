# Delivery Report

## Approved UI Redesign

Completed on 2026-10-03 following [DESIGN.md](DESIGN.md), with small Conventional
Commits for the shell, dashboard, appointments, customers, courses, sales,
inventory, treatment catalog and login. Production screenshots were regenerated
and reviewed at both widths after each page. Domain types, services, business
rules and routes are unchanged. The historical milestone table below describes
the initial implementation; current assets contain **30 source PNGs and 15 galleries**.

Shared tokens now control the clinic-jade palette, Thai-safe Sarabun scale,
tabular/right-aligned numbers, purpose-specific radii, flat ledger structure,
overlay-only elevation and static loading/reduced-motion behavior. Today’s book
and rooms lead the dashboard; financial reports remain below. Course and stock
counts are explicit, and mobile billing has separate catalog/bill views.

Verification includes axe WCAG 2/2.1 A/AA checks on all main desktop/mobile pages,
booking/receipt dialogs, the mobile drawer and a customer empty state; keyboard
focus/return focus; measured equal numeral advances; actual PDF/XLSX downloads;
and a first-viewport mobile appointment with the banner visible. Build, lint,
12 service tests and dependency audit pass. Automated checks are not full
accessibility certification; physical-device/assistive-technology testing remains.

Recommended gallery leads: **customer profile**, **day appointments**, and
**low stock**, for clear clinical context, real appointment geometry, and
comparable quantities/actions on both devices. Dashboard is the best overview.

## Milestones

| Milestone | Delivered                                                                                                                                         |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0         | Architecture before feature code, typed domain, service contracts/factory, build scaffold, initialized Git                                        |
| 1         | Thai login, three roles, desktop shell/mobile drawer, screenshot-aware demo banner, Pages workflow                                                |
| 2         | Seeded relative-date fixtures, versioned persistence and latency, transactional services, catalog, stock movements/export                         |
| 3         | Searchable customers, role-filtered profiles, visit/purchase history, course sales, reservations and usage history                                |
| 4         | Day/week practitioner and room calendars, booking/edit/reschedule, opening/overlap validation, status flow and atomic course/consumable deduction |
| 5         | Mixed-item sales, payment methods, receipt history/Thai PDF preview/download, Excel exports                                                       |
| 6         | Owner revenue/status dashboard, six-month chart, popular treatments/courses, expiring courses, customer follow-up and low stock                   |
| 7         | 1440px/390px production browser checks, PDF/XLSX verification, role redirects, bundled Thai fonts, lazy pages, dependency audit, bilingual README |
| 8         | 22 PNG captures and 11 configurable Playwright HTML laptop/phone compositions, manifest, README previews                                          |

Each milestone has its own `Milestone N: ...` Git commit and a passing production
build. All data access is through the service layer, not UI localStorage access.

## Architecture and decisions

The sole replacement of an originally selected library was **SheetJS -> ExcelJS**
because the npm SheetJS release had unpatched advisories. This was announced before
the change and the architecture updated. Per-customer receipt lookup and separate
customer visit-history DTOs clarify the initial role-filtered service design;
they do not broaden receptionist/practitioner report access.

Every entry from [DECISIONS.md](DECISIONS.md):

1. Initialize Git because the supplied workspace was not a repository.
2. Reception starts at appointments and has no revenue dashboard.
3. Practitioners may advance their own service statuses; only owner/reception may create/edit.
4. Course defaults: 10 sessions, 12 months, 15% bundle discount; configurable session count/validity.
5. Individual-treatment billing records payment; consumables deduct on completion only.
6. Historical fixtures do not reconstruct present opening stock.
7. Thai PDF is rasterized for reliable glyphs and is not a tax invoice.
8. Week columns belong to practitioners; room mode shows four rooms. Mobile calendars scroll horizontally.
9. Edits persist for the current local day; next-day fixtures regenerate to keep the demo current.
10. Replace npm SheetJS with ExcelJS, patch jsPDF/Vitest, and pin a patched compatible UUID dependency.

Week cells show two appointments and a link to the complete day when more exist.
Course sale is a checkout transaction, so it creates both a course and a receipt.
Reception sees the retail catalog for billing and selected-customer receipts, not
the owner's aggregate revenue dataset. Practitioner snapshots contain no prices,
sales, products, stock, movements or course purchases. Precautions are removed
from reception DTOs before returning them.

## Verification

- Production build and ESLint pass.
- 12 Vitest service tests cover seeded counts, overlap/opening constraints,
  reschedule rollback, course expiry/reservations/cancellation release, status
  order, exactly-once completion, supply rollback, overselling, authoritative
  checkout prices and role redaction/authorization.
- `npm run check:browser` checks all main routes at 1440px and 390px, navigation,
  screenshot mode on both sides of the hash, role redirects and absent sensitive UI.
- Downloads checked as actual `%PDF` files and parsed ExcelJS workbooks, not filenames alone.
- `npm run screenshots` captures all requested scenarios only after ready/font checks.
- Dependency audit reports zero vulnerabilities. ExcelJS is an on-demand large
  chunk, so Vite prints a non-failing chunk-size advisory. No build/type/lint errors.
- Browser verification uses Chromium; Safari/Firefox and hosted Pages require the manual checks below.

## Manual deployment steps

1. Create a GitHub repository named `beauty-clinic`, configure its remote and push `main`.
2. Set repository Settings > Pages > Source to **GitHub Actions**.
3. Allow the workflow's Pages deployment and check the resulting URL.
4. Replace the live URL placeholder in README. For another repo name, update
   `vite.config.ts` base and the URL in `scripts/browser.mjs`.
5. Do not deploy with real customer data. Production reuse requires real server
   auth, authorized DTOs, transactional constraints and server persistence.

## Browser checklist (desktop and mobile)

- [ ] Login as all three roles; switch practitioners and confirm each sees only their schedule.
- [ ] Owner sees revenue/inventory; reception cannot access those routes or precautions; practitioner sees no monetary amounts, sales or course purchases.
- [ ] Browse day/week/room schedules; on mobile scroll calendar columns and use the drawer.
- [ ] Create/edit/reschedule a valid appointment; try practitioner overlap, room overlap and an appointment ending after 20:00.
- [ ] Book with a matching active course; test expired courses and full reservations; cancel to release a reservation.
- [ ] Advance scheduled -> arrived -> in service -> completed. Check one course session and correct supplies deducted once.
- [ ] Exhaust a consumable, attempt completion, and confirm nothing is partially deducted. Receive stock and retry.
- [ ] Search customers, add one, inspect visits/purchases/active courses and role-specific precautions.
- [ ] Sell a course; inspect its expiry, remaining/reserved counts and usage history.
- [ ] Add treatment/course/product to one bill, change quantity/payment, remove with confirmation, pay and open the receipt.
- [ ] Download and open Thai PDF and sales/stock XLSX; confirm legible glyphs and numerical amounts.
- [ ] Receive/issue stock; inspect movement history and low-stock badges; try issuing more than available.
- [ ] Try a search with no results; check empty states, loading states and validation messages.
- [ ] Check `?screenshot=1#/dashboard` and `#/dashboard?screenshot=1` hide the banner.
- [ ] Check refresh persistence and owner reset confirmation; remember next-day demo reset is intentional.

## Generated files

Every row below exists in all three directories. Desktop: 1440×900. Mobile:
390×844 viewport at scale 2 (780×1688 PNG). Gallery: 1920×1280 by default.

| Scenario         | Desktop                                                | Mobile                                                | Gallery                                                |
| ---------------- | ------------------------------------------------------ | ----------------------------------------------------- | ------------------------------------------------------ |
| Dashboard        | [PNG](screenshots/desktop/dashboard.png)               | [PNG](screenshots/mobile/dashboard.png)               | [PNG](screenshots/gallery/dashboard.png)               |
| Week calendar    | [PNG](screenshots/desktop/appointments-week.png)       | [PNG](screenshots/mobile/appointments-week.png)       | [PNG](screenshots/gallery/appointments-week.png)       |
| Day calendar     | [PNG](screenshots/desktop/appointments-day.png)        | [PNG](screenshots/mobile/appointments-day.png)        | [PNG](screenshots/gallery/appointments-day.png)        |
| Room view        | [PNG](screenshots/desktop/appointments-room.png)       | [PNG](screenshots/mobile/appointments-room.png)       | [PNG](screenshots/gallery/appointments-room.png)       |
| Conflict warning | [PNG](screenshots/desktop/booking-conflict.png)        | [PNG](screenshots/mobile/booking-conflict.png)        | [PNG](screenshots/gallery/booking-conflict.png)        |
| Customer courses | [PNG](screenshots/desktop/customer-active-courses.png) | [PNG](screenshots/mobile/customer-active-courses.png) | [PNG](screenshots/gallery/customer-active-courses.png) |
| Courses list     | [PNG](screenshots/desktop/courses.png)                 | [PNG](screenshots/mobile/courses.png)                 | [PNG](screenshots/gallery/courses.png)                 |
| Sales bill       | [PNG](screenshots/desktop/sales-bill.png)              | [PNG](screenshots/mobile/sales-bill.png)              | [PNG](screenshots/gallery/sales-bill.png)              |
| Receipt preview  | [PNG](screenshots/desktop/receipt-preview.png)         | [PNG](screenshots/mobile/receipt-preview.png)         | [PNG](screenshots/gallery/receipt-preview.png)         |
| Low stock        | [PNG](screenshots/desktop/inventory-low-stock.png)     | [PNG](screenshots/mobile/inventory-low-stock.png)     | [PNG](screenshots/gallery/inventory-low-stock.png)     |
| Practitioner     | [PNG](screenshots/desktop/practitioner-schedule.png)   | [PNG](screenshots/mobile/practitioner-schedule.png)   | [PNG](screenshots/gallery/practitioner-schedule.png)   |
| Customers        | [PNG](screenshots/desktop/customers.png)               | [PNG](screenshots/mobile/customers.png)               | [PNG](screenshots/gallery/customers.png)               |
| Course sale      | [PNG](screenshots/desktop/course-sale.png)             | [PNG](screenshots/mobile/course-sale.png)             | [PNG](screenshots/gallery/course-sale.png)             |
| Treatments       | [PNG](screenshots/desktop/treatments.png)              | [PNG](screenshots/mobile/treatments.png)              | [PNG](screenshots/gallery/treatments.png)              |
| Login            | [PNG](screenshots/desktop/login.png)                   | [PNG](screenshots/mobile/login.png)                   | [PNG](screenshots/gallery/login.png)                   |

**Failed/unclean captures: none.** Mobile sales focuses on the in-progress bill;
mobile warning shows the actual rejected booking with the dialog scrolled to the
validation. Receipt uses a seeded mixed transaction for repeatable numbering.
Other pages scroll normally; viewport captures are not full-page exports.
