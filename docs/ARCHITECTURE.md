# Architecture

## Product and structure

Frontend-only Thai clinic demo. React, TypeScript, Vite, Tailwind, shadcn-style
Radix primitives, lucide-react, Recharts, date-fns, React Router HashRouter.
Vite base is `/beauty-clinic/`. All displayed business data is fictional.

```
src/domain/             entities, permissions, status vocabulary
src/services/           interfaces, factory, mock repository, seed, transactions
src/components/         shell and shared UI primitives
src/features/           auth, dashboard, appointments, customers, courses, sales, inventory
src/lib/                Thai formatting and PDF/export presentation
scripts/                Playwright capture and HTML gallery composition
tests/                  service-rule regression tests
docs/screenshots/       desktop, mobile, gallery
```

## Routes

`/login`, `/dashboard`, `/appointments`, `/customers`, `/customers/:id`,
`/courses`, `/sales`, `/inventory`, `/treatments`. Unauthorized routes redirect
to the role's first allowed page. Practitioner starts at appointments.

## Domain

Role: owner, receptionist, practitioner. Staff: two doctors, three therapists,
two receptionists. Four rooms. Treatment: category, duration minutes, price,
consumables (product and quantity). Product: retail/consumable, stock, minimum,
price, unit. Customer: name, phone, precaution. Course purchase: customer,
treatment, total/remaining sessions, bought/expires dates, sale id, usage history.
Appointment: customer, practitioner, room, treatment, start/end, status, optional
course purchase. Sale: customer, lines (treatment/course/product), payment,
total, timestamp. Stock movement: product, signed quantity, reason, timestamp.
Session: role, staff id, display name. Money is integer satang internally.

## Services and persistence

`ClinicService` supplies login/logout/session, a role-filtered snapshot, booking,
rescheduling/editing, status transitions, course sale, checkout, customer creation,
stock movements, per-customer receipt lookup, and reset. Reception receives retail
catalog items for billing and per-customer receipts, but no aggregate sales snapshot.
Components only call the service factory; they never
import seeds or read localStorage. Snapshot DTOs redact sensitive fields before
returning them (prices/revenue/sales for practitioner; precautions for reception).
Mutations authorize against the stored session, clone repository state, validate
the complete transaction, persist only after success, then return. Simulated
latency 120ms. Versioned localStorage key stores domain data, session separately.
Dates are local-calendar based; seeded PRNG uses fixed seed and dates relative
to the current local day. Reset recreates the dataset. Simultaneous tabs serialize
mutations with Web Locks when available, otherwise same-tab promise queue.

The factory is the only implementation selector. A future Spring Boot REST
adapter implements the same asynchronous interface, replacing snapshot with
role-filtered DTO endpoints and mutations with server transactions. Server must
repeat authorization, interval exclusion, course reservation, stock constraints,
and idempotent completion. Do not treat fake auth as production security.

## Rules

- Open daily 10:00–20:00. Duration comes from treatment, end must fit opening.
- Active bookings cannot overlap either practitioner or room (half-open intervals).
- Only scheduled -> arrived/cancelled/no-show; arrived -> in-service/cancelled;
  in-service -> completed. Terminal statuses cannot change.
- Course must match customer and treatment, be unexpired on appointment date,
  and remaining sessions must cover all active reservations including this one.
- Deduct one course session only on completion, append usage once.
- Completion consumes treatment supplies; product checkout consumes retail stock.
- Validate all stock/course effects before committing. Stock never negative.
- Reschedule and edit use the same validation as create, excluding the edited id.
- Errors carry Thai explanations and UI displays them inline and in toasts.

## Permission matrix

| Page/action                | Owner             | Reception              | Practitioner                            |
| -------------------------- | ----------------- | ---------------------- | --------------------------------------- |
| Dashboard/revenue          | all               | no                     | no                                      |
| Appointments               | manage all        | manage all             | own only, advance own status            |
| Customers                  | all + precautions | manage, no precautions | booked customers, history + precautions |
| Courses                    | sell/read         | sell/read              | no                                      |
| Sales/PDF/export           | all               | all                    | no                                      |
| Inventory/movements/export | all               | no                     | no                                      |
| Treatments/catalog prices  | all               | read                   | no                                      |
| Reset demo                 | yes               | no                     | no                                      |

Practitioner customer history excludes purchases and financial data. Permissions
are enforced by both routes and service mutations, not merely hidden controls.

## UI and libraries

Light sage accent with white surfaces, charcoal type, semantic amber/red/blue
status accents. Thai Sarabun typography, stable calendar grids, mobile card lists
and drawer. Radix Dialog and AlertDialog provide accessible shadcn-style modal
primitives; Sonner toasts. Recharts for revenue. date-fns for calendar arithmetic.
ExcelJS generates actual XLSX (replaced SheetJS after dependency advisory review).
Thai receipt PDF is generated from a receipt DOM
with html2canvas + jsPDF, preserving Thai glyphs without relying on PDF core fonts.
Receipt stays available as an in-app preview. Playwright waits for explicit ready
state and fonts before screenshots, including receipt and validation warning.
Vitest tests service contracts. Production build and lint gate every milestone.

## Delivery

GitHub Actions builds and deploys dist to Pages. Capture script builds and starts
Vite preview under the correct base, resets each isolated browser context, and
captures desktop/mobile scenarios. Gallery script renders paired PNGs in an HTML
laptop/phone composition. README embeds galleries and documents fictional data.
