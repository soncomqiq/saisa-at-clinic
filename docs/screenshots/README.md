# Service Gallery Assets

Run `npm run screenshots`, then `npm run gallery`. Both scripts close their own
browser/server resources. Captures run on the production build at the correct Vite
base with isolated sessions, local Thai timezone, bundled fonts, explicit loading
checks and `screenshot=1`. Seed data is relative to the capture day.

Desktop: **1440 × 900**, scale 1. Mobile: **390 × 844**, scale 2, so PNGs are
**780 × 1688** physical pixels. Gallery: **1920 × 1280** by default.
Set `GALLERY_WIDTH` and `GALLERY_HEIGHT` or edit the constants at the top of
[the gallery script](../../scripts/gallery.mjs).

| Name                    | Scenario                                      | Role         |
| ----------------------- | --------------------------------------------- | ------------ |
| dashboard               | Daily activity and six-month revenue          | Owner        |
| appointments-week       | Week calendar, practitioner columns           | Owner        |
| appointments-day        | Day timeline                                  | Owner        |
| appointments-room       | Four-room timeline                            | Owner        |
| booking-conflict        | Actual rejected overlapping booking           | Owner        |
| customer-active-courses | Profile with active courses and precautions   | Owner        |
| customers               | Searchable customer directory                 | Owner        |
| courses                 | Active courses list                           | Owner        |
| course-sale             | Course sale form with fixed save action       | Owner        |
| sales-bill              | Treatment + course + product, unpaid bill     | Owner        |
| receipt-preview         | Seeded mixed-sale Thai receipt                | Owner        |
| inventory-low-stock     | Low-stock filtered retail/supply list         | Owner        |
| treatments              | Grouped service, duration and price catalog   | Owner        |
| practitioner-schedule   | Only the selected practitioner's appointments | Practitioner |
| login                   | Clinic login form                             | Login screen |

Each name has a `.png` in `desktop/`, `mobile/`, and `gallery/`. A generated
`manifest.json` records the exact paths and capture timestamp. Week cells show the
first two appointments; the count link opens the full day. Mobile calendars are
intentionally horizontally scrollable, not scaled to illegible text.

The conflict screenshot is taken after the warning is visible, with the booking
dialog body scrolled to it on mobile; identity summary and save action remain
visible. Mobile sales switches to the actual bill view and focuses the bill.
The receipt uses a seeded transaction to keep its
number reproducible. No scenario requires real customer data or a backend.

Current total: **30 source PNGs and 15 compositions**. Strongest gallery leads:
customer-active-courses, appointments-day, and inventory-low-stock. The first
shows clinical precautions and explicit course counts, the second real interval
geometry and room/status context, and the third comparative stock numbers and
clear actions. All three retain useful mobile information instead of shrinking
the desktop layout into unreadable cards.
