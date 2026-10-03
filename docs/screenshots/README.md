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
| courses                 | Active courses list                           | Owner        |
| sales-bill              | Treatment + course + product, unpaid bill     | Owner        |
| receipt-preview         | Seeded mixed-sale Thai receipt                | Owner        |
| inventory-low-stock     | Low-stock filtered retail/supply list         | Owner        |
| practitioner-schedule   | Only the selected practitioner's appointments | Practitioner |

Each name has a `.png` in `desktop/`, `mobile/`, and `gallery/`. A generated
`manifest.json` records the exact paths and capture timestamp. Week cells show the
first two appointments; the count link opens the full day. Mobile calendars are
intentionally horizontally scrollable, not scaled to illegible text.

The conflict screenshot is taken after the warning is visible, with the booking
dialog scrolled to it on mobile. The receipt uses a seeded transaction to keep its
number reproducible. No scenario requires real customer data or a backend.
