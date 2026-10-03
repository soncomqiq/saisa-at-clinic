# Clinic Workspace Design

**Status: approved and implemented on 2026-10-03.** Every redesigned page passed
its production screenshot gate at both widths. The audit below is the historical
baseline; original images remain in Git at commit `4e8f99f`, while the linked
capture paths now show the approved redesign.

## 1. Intent and scope

Make the clinic day easy to read: who is receiving treatment, which room they are
in, who arrives next, and what needs attention before the next appointment.

This is a visual/copy redesign, not a new product or a new authorization model.
Keep domain types, services, business rules, persistence, routes, exports and role
permissions unchanged. Reuse the existing service DTOs, calendar geometry, dialogs,
formatters, chart library and page components. Change presentation and UI-local
view state only. No new service requests or domain fields are needed.

The smaller, safer alternative to replacing the component system is to remove
unnecessary framing, fix information order and centralize tokens in the existing
Tailwind/shadcn setup. That is the chosen approach.

The architecture's light sage direction, Sarabun font and feature boundaries are
retained. There is no proposed architecture deviation. Reception still starts at
appointments and never gains the owner dashboard. Practitioner views remain
restricted to their own appointments and permitted customer information.

## 2. Screenshot audit

Baseline regenerated with `npm run screenshots` on 2026-10-03. Production build
passed and all **22 screenshots** were reviewed individually: 11 scenarios at
1440 x 900 and 390 x 844; mobile PNGs have device scale factor 2.

The findings below refer to the actual captures, not a blanket assumption about
shadcn. Most current containers have borders rather than shadows; there is no
glassmorphism or emoji greeting. The problem is repeated framing and information
hierarchy. Do not replace one template palette with another template layout.

| Scenario (both captures reviewed)                                                                                             | Concrete finding                                                                                                                                                                                                                                                                    | Planned correction                                                                                                                                                                                                         |
| ----------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Dashboard desktop](screenshots/desktop/dashboard.png), [mobile](screenshots/mobile/dashboard.png)                            | Four equal KPI boxes dominate. Revenue chart is the largest desktop block; appointments are a narrow side list without rooms. No appointment is visible in the first mobile viewport. Labels and support text are pale. `ใส่ใจทุกการกลับมา` is filler.                              | Main appointment timeline and room summary first. Revenue becomes an unboxed ledger section below it. Remove metric icons, filler and low-value lifetime totals from the first-screen emphasis, not their underlying data. |
| [Day desktop](screenshots/desktop/appointments-day.png), [mobile](screenshots/mobile/appointments-day.png)                    | Good time-grid structure, but event time/treatment text is very small. Status depends on pastel color and a distant legend. Room is absent. Mobile title, subtitle, button, controls and legend consume about half the viewport.                                                    | Keep the grid, enlarge critical text, show room and explicit status, compact controls and remove promotional subtitle.                                                                                                     |
| [Week desktop](screenshots/desktop/appointments-week.png), [mobile](screenshots/mobile/appointments-week.png)                 | Tiny two-line chips and repeated circular initials make the week look like a mini dashboard. Treatments/rooms are hidden. Mobile opens on Monday while today's row is below the fold.                                                                                               | Remove initials. Use readable day/practitioner rows with time, customer and room. Let the week scroll instead of shrinking type to fit seven days. Position the current-day row in view when appropriate.                  |
| [Room desktop](screenshots/desktop/appointments-room.png), [mobile](screenshots/mobile/appointments-room.png)                 | The same anonymous blue blocks appear in every room. Practitioner is missing, so reception must open each item to understand room handoffs. Oversized mobile controls precede useful content.                                                                                       | Show practitioner in each room block. Retain the time grid and room columns; use compact controls and sticky time/header context.                                                                                          |
| [Practitioner desktop](screenshots/desktop/practitioner-schedule.png), [mobile](screenshots/mobile/practitioner-schedule.png) | A single desktop lane stretches across an extremely wide canvas, but its text remains tiny. The phone view wastes space on duplicate date/subtitle/legend before the next treatment. Room is absent.                                                                                | Use a restrained reading width for the single-practitioner book, put time/name/room first, and remove duplicated context. No prices or added owner controls.                                                               |
| [Conflict desktop](screenshots/desktop/booking-conflict.png), [mobile](screenshots/mobile/booking-conflict.png)               | The error has useful recovery information, but is one dense paragraph beneath a generic form. Middle-dot metadata competes with it. The mobile capture scrolls the customer out of sight, and a field label is clipped below the sticky header.                                     | Give the form clear groups and a compact customer/time summary. Keep header/footer within their own layout regions. Present the unchanged service message in a readable inline alert with safe scroll padding.             |
| [Customer desktop](screenshots/desktop/customer-active-courses.png), [mobile](screenshots/mobile/customer-active-courses.png) | The profile repeats the customer's name inside each course card. Administrative metadata gets the first mobile screen; course expiry/counts are below it. Every note, including routine absence of a precaution, uses warning treatment.                                            | Compact identity and phone, meaningful precaution before treatment information, then a course ledger with explicit remaining/reserved/expiry values. Do not repeat the profile name on every row.                          |
| [Courses desktop](screenshots/desktop/courses.png), [mobile](screenshots/mobile/courses.png)                                  | A three-column wall of identical rounded cards repeats `ใช้งานได้` and progress bars. Numeric fractions, reserved counts and expiry dates cannot be compared down columns. The expiring first course looks like all the others.                                                     | Desktop ledger with aligned numeric/expiry columns; compact mobile records with the same field order. Expiry deserves a clear text label, not another decorative progress bar.                                             |
| [Sales desktop](screenshots/desktop/sales-bill.png), [mobile](screenshots/mobile/sales-bill.png)                              | Generic bag icons and large product tiles repeat with no useful visual distinction. Desktop payment controls fall below the captured fold. Mobile bill occupies the whole capture and pushes item selection away. Type, unit price and course validity are joined with middle dots. | Compact catalog rows and one genuinely framed bill tool. Separate item metadata into labeled lines/columns. Keep amount/payment action easy to reach without hiding bill lines.                                            |
| [Receipt desktop](screenshots/desktop/receipt-preview.png), [mobile](screenshots/mobile/receipt-preview.png)                  | The receipt has an appropriately paper-like hierarchy; preserve it. Desktop line-item text is small and logo/white space consumes a large share. Mobile amount alignment works, but the paper border inside the dialog adds framing.                                                | Preserve document structure and total emphasis, use readable type and tabular/right-aligned numbers. Paper boundary is a document preview, not a nested decorative card.                                                   |
| [Stock desktop](screenshots/desktop/inventory-low-stock.png), [mobile](screenshots/mobile/inventory-low-stock.png)            | Price and quantity columns are left-aligned. `3 / 8` obscures actual balance versus minimum. Receive/issue icons are near-identical; history tab has an awkward icon-over-text wrap. Mobile heading/banner/toolbar delays the first product and returns to repeated boxes.          | Separate balance and minimum, align numbers right, use a compact exception list. Give stock tools clear Thai accessible names and hover/focus labels; keep tabs text-only.                                                 |

### Shared-source findings outside the capture set

- [Dashboard](../src/features/dashboard/Dashboard.tsx) confirms the KPI-first DOM
  order and hardcoded chart colors, sizes and tooltip radius. Its existing snapshot
  already contains room/practitioner/customer data for the proposed timeline.
- [Calendar](../src/features/appointments/Calendar.tsx) confirms the reusable
  practitioner/room grid and duration-based blocks. Week cells deliberately show
  two appointments with a full-day link; keep that behavior, not an invented
  calendar engine. Add missing context in presentation only.
- [Shared CSS](../src/styles.css) uses many unrelated font sizes (including
  9-11px event/metadata text), hardcoded colors, similar 5-6px radii and no global
  tabular-number rule. Body paragraphs have 1.7 line height, but labels/buttons/
  event blocks do not share a consistent Thai-safe rhythm.
- Login has a decorative sage gradient and slogan; the submit action appends an
  arrow in [Login](../src/features/auth/Login.tsx). These were source-inspected,
  not present in the 22-screenshot set. Replace with a compact branded login form.
- Existing source has skeleton shimmer and an overlay fade, not a universal
  page-load fade/slide. Keep feedback-only motion, remove overlay fade and shimmer,
  and explicitly support reduced motion.
- Customers list, treatment catalog, empty states and focus behavior are not
  separate scenarios in the current capture set. Verify them during implementation
  with supplementary viewport captures; do not claim this baseline audited them
  visually. Gallery device-frame backgrounds are outside the in-app visual system.

## 3. Product-specific principles

1. **The next customer outranks a total.** Today, room, time and customer come
   before charts, lifetime metrics or decorative identity.
2. **Treatments have a location and a handoff.** Appointment blocks expose the
   missing room/practitioner context without requiring a detail dialog.
3. **Counts must be auditable.** Show remaining sessions separately from reserved
   sessions, and stock separately from its minimum. Align comparable numbers.
4. **Calm does not mean faint.** Thai labels, precautions and financial values stay
   readable; color marks state, not decoration or prestige.
5. **One workspace, different permissions.** Keep the same visual vocabulary for
   each role without teasing revenue, prices or precautions they cannot access.

## 4. Color system

Accent: a deeper **clinic jade**, drawn from washable treatment linens and glazed
clinical tile. It communicates practical care, not cosmetics advertising. Use it
for a primary action, selected navigation and active treatment, not every surface.
White working surfaces and neutral text keep the workspace from becoming a wall
of sage. These six named hex values are the entire base palette:

| Name            | Token         | Hex       | Use                                            |
| --------------- | ------------- | --------- | ---------------------------------------------- |
| Clean linen     | `--canvas`    | `#F3F6F4` | Outer application canvas only                  |
| Treatment white | `--surface`   | `#FFFFFF` | Working surface, controls, paper               |
| Record ink      | `--ink`       | `#25362F` | Body, headings, numbers                        |
| Secondary ink   | `--ink-muted` | `#58675F` | Metadata, labels, chart axes; control outlines |
| Ledger rule     | `--rule`      | `#CBD6CF` | Non-interactive hairlines/grid boundaries      |
| Clinic jade     | `--accent`    | `#316B58` | Primary controls, selection indicator, focus   |

No purple/indigo, pink gradients, cream/terracotta combination, glass overlays,
decorative color blobs or colored metric-icon circles. The neutral canvas is not
cream. Borders do not turn each section into a floating white card.

### Semantic states

Use the same foreground/background pair for a state in the book, timeline, lists,
dialogs and labels. These additional colors are semantic, not new base accents.

| Existing state | Thai label (unchanged) | Foreground | Background | Non-color cue                                  |
| -------------- | ---------------------- | ---------- | ---------- | ---------------------------------------------- |
| `scheduled`    | นัดแล้ว                | `#3C5B70`  | `#EAF0F4`  | Explicit label; solid side rule                |
| `arrived`      | มาถึงแล้ว              | `#755A18`  | `#F7F0DA`  | Explicit label; waiting group                  |
| `inService`    | กำลังรับบริการ         | `#245E4C`  | `#E3EFEA`  | Explicit label; strongest side rule            |
| `completed`    | เสร็จสิ้น              | `#51645A`  | `#EEF2EF`  | Explicit label; quieter row, no fading text    |
| `cancelled`    | ยกเลิก                 | `#8A4235`  | `#F6E9E5`  | Explicit label; no booking-grid block as today |
| `noShow`       | ไม่มาตามนัด            | `#5B615D`  | `#ECEFED`  | Explicit label; no booking-grid block as today |

Use arrived colors for approaching expiry and low stock; cancelled colors for
blocked actions and zero stock. Always state `ใกล้หมดอายุ`, `สต็อกต่ำ`, or the actual
error as text. Unexpired normal courses need no repeated green badge. New labels
are presentation descriptions, not new domain statuses.

All text pairs must pass WCAG AA 4.5:1 for normal text. Main button white/jade,
ink/surface, secondary ink/surface and secondary ink/canvas are mandatory pairs.
Control edges and keyboard focus must pass 3:1 against adjacent surfaces. Ledger
rule is for decorative separators, never the sole identifiable control boundary.

Plan-stage sRGB contrast calculation: ink/white **12.75:1**, secondary/white
**5.97:1**, secondary/canvas **5.48:1**, white/jade **6.22:1**, jade/canvas
**5.72:1**. All six status pairs are at least **5.47:1**. These validate the
specified pairs; implementation must still check actual composed/hover/focus colors.

## 5. Typography and numbers

Keep **Sarabun**, locally bundled, as the single family. Its looped Thai forms
remain distinct in customer names and operational records, and its Latin/numeric
glyphs sit comfortably beside Thai text. This is a deliberate fit for a Thai
appointment book, not a reason to add an editorial display font or change the
architecture. Prefer better hierarchy over a novelty font replacement.

| Token            | Size | Weight | Line height | Use                                                           |
| ---------------- | ---- | ------ | ----------- | ------------------------------------------------------------- |
| `--text-meta`    | 12px | 400    | 1.6         | Secondary dates/IDs, axes; never sole appointment information |
| `--text-body`    | 14px | 400    | 1.7         | Body, table rows, labels, buttons, alerts                     |
| `--text-lead`    | 16px | 500    | 1.6         | Customer in timeline, major bill values, prominent fields     |
| `--text-section` | 20px | 600    | 1.6         | Section/dialog title                                          |
| `--text-page`    | 24px | 600    | 1.6         | Page title, daily revenue, receipt total                      |

Use only weights 400/500/600. No viewport-scaled fonts, letter spacing tricks,
9px status text or uppercase branding. Page titles remain 24px on both target
widths and wrap when needed. Fields, calendar blocks and buttons retain at least
1.6 line height so tone marks are not clipped. Search/selection text is 16px on
phones to avoid input zoom; use the existing lead token, not a sixth size.

Apply `font-variant-numeric: tabular-nums lining-nums` to money, quantities,
dates, phone numbers and times. Keep Thai Baht formatting and existing Thai
Buddhist-year date display. Never manually reconstruct currency or change the
stored integer-satang model.

Right-align price, total, stock, minimum, remaining, reserved and quantity columns
including their headers. Text/date columns stay left-aligned; time gutter stays
right-aligned. Mobile records use consistent end-aligned numeric fields. Verify
the bundled font actually supplies equal numeral advances before declaring this
complete; CSS alone is not proof. No second font for numbers.

## 6. Tokens and construction

One authoritative token block in `src/styles.css`, published through Tailwind 4
`@theme inline` and shadcn CSS-variable aliases. No parallel palette files or
per-component hardcoded color/font/radius/shadow overrides.

### Token inventory

- Spacing: `--space-1: 4px`, `--space-2: 8px`, `--space-3: 12px`,
  `--space-4: 16px`, `--space-6: 24px`, `--space-8: 32px`, `--space-12: 48px`.
  Use 24px desktop gutters and 16px mobile gutters; section separation 32px,
  related-label spacing 4px, record padding 12-16px. Density comes from hierarchy,
  not tiny type or stacked vowels touching the next line.
- Radius: `--radius-none: 0`, `--radius-small: 2px` (status/event corners),
  `--radius-control: 4px` (buttons/fields), `--radius-tool: 6px` (bill/calendar
  boundary), `--radius-overlay: 8px` (dialogs/popovers). No pill tabs or decorative
  circular initials. Section bands and ledger rows have radius zero.
- Borders: `--border-hairline: 1px`; default rule uses ledger rule. Controls use
  secondary ink for an AA-distinguishable edge. Focus uses a 2px jade outline with
  2px offset. Error outline uses its semantic foreground plus readable text.
- Elevation: `--shadow-flat: none`; `--shadow-floating: 0 12px 32px
rgb(37 54 47 / 0.14)`, only for actual dialogs/popovers/drawer. Receipt paper
  within a dialog uses a hairline, not another shadow.
- Motion: `--duration-feedback: 120ms`; only action-state color/focus feedback.
  No entrance, card-lift, scale, page fade, animated chart or skeleton shimmer.
  Reduced motion removes nonessential transitions and smooth scrolling.
- Dimensions: `--header-height: 56px`, `--sidebar-width: 216px`,
  `--target-size: 44px`, `--calendar-hour-height: 160px`,
  `--calendar-column-min: 200px`, `--calendar-time-width: 56px`.
  A 30-minute booking gets 80px of true duration height; do not inflate an event
  to obscure the next slot. Week records grow vertically rather than shrink type.
  Sizing review changed the initial 144px/hour proposal: three 14px Thai lines at
  1.7 line height plus 8px vertical padding need 79.4px, not 72px. Larger shared
  grid geometry solves this without distorting individual appointment durations.
- Layout tracks: desktop dashboard timeline/secondary rail about 2:1; bill
  catalog/receipt tool about 2:1. These are layout tokens, not decorative card
  dimensions. At 390px each becomes one track in task order.

### shadcn/Tailwind mapping

`--background -> --canvas`, `--foreground -> --ink`, `--card/--popover -> --surface`,
`--card-foreground/--popover-foreground -> --ink`, `--primary -> --accent`,
`--primary-foreground -> --surface`, `--secondary/--muted -> --canvas`,
`--secondary-foreground -> --ink`, `--muted-foreground -> --ink-muted`,
`--border -> --rule`, `--input -> --ink-muted`, `--ring -> --accent`,
`--destructive -> cancelled foreground`, `--destructive-foreground -> --surface`.

shadcn `--accent` normally means a tinted selection surface. Map that concept to
canvas plus a jade side rule rather than creating a competing named brand accent;
keep clinic palette names namespaced if required to avoid a CSS-variable collision.
Publish radius, spacing, type, dimensions and status tokens through Tailwind aliases.
Recharts must read the same resolved CSS tokens for stroke, axes and tooltip,
not preserve inline hex constants or its own type scale.

Use border-bottom and whitespace for section structure. Cards are allowed only
when a single record genuinely needs independent grouping; default customer,
course, stock and catalog lists are ledgers. Do not put cards inside cards. The
calendar is a framed work tool; the bill is a framed work tool; the receipt is a
document. These boundaries have distinct purposes and must not become a page-wide
generic card system.

## 7. Layout plan and ASCII wireframes

Wireframes use English placeholders to remain ASCII; actual UI copy is Thai.
The clinical identity is the business name and a restrained jade wordmark, not a
flower icon attached to every object. Keep existing navigation destinations.

### Shell

Desktop: slim white navigation rail, full clinic name, role and sign-out at bottom;
active page has a jade rule and text emphasis, not a large tinted rounded tile.
Keep useful navigation icons but remove avatars without identity value, repeated
location breadcrumbs and generic `พื้นที่ทำงาน` eyebrow. Header carries date and
current workspace context without repeating the page title twice.

Mobile: 56px header with clinic name and 44px menu target; existing drawer with
clear active route and role. Page title/actions share a compact header where they
fit. No tall hero, greeting or decorative subtitle. The slim demo banner and both
screenshot-query forms remain intact.

### Owner dashboard: today's appointment book first

```text
1440px
NAV | Today: date                                      [Book appointment]
    | -----------------------------------------------------------------
    | TODAY'S TIMELINE                         | ROOM SUMMARY
    | Time    Customer / treatment             | Room 1  In service / name
    |         Practitioner / room     Status  | Room 2  Next booking / time
    | NOW ----------------------------------  | Room 3  No booking now
    | 14:00   Next customer           Arrived  | Room 4  Next booking / time
    | 14:30   Customer                Booked   |
    | [Open appointment detail]               | ATTENTION (text rows)
    | -----------------------------------------------------------------
    | Revenue today: amount   Receipt count   | Expiring / idle / low stock
    | Six-month chart        Popular services and courses

390px
Clinic name                                             [Menu]
Today / date                                [Book appointment]
-------------------------------------------------------------
Room summary: compact labeled rows
TODAY'S TIMELINE
14:00  Customer name                            Arrived
       Treatment
       Practitioner                 Room 2
14:30  Next customer                            Booked
-------------------------------------------------------------
Revenue today / receipt count
Six-month chart / popular items
Follow-up and stock exceptions
```

The timeline owns at least two thirds of desktop content width and is first in
DOM/task order. Room summary uses a definition list, not four new KPI cards. On
mobile room context must remain compact enough to show at least one appointment
in the initial 390 x 844 viewport with the demo banner visible.

Sort today's existing records by time. Emphasize persisted `inService` and
`arrived` records; label the next still-scheduled arrival by its actual time. Mark
the current time separately. A past-time scheduled record is still `นัดแล้ว`, not
silently `ไม่มาตามนัด`; show it without inventing a new status. After closing hours,
show today's completed timeline and daily money, not an empty marketing message.

Room summaries join existing appointments, rooms, staff, customers and treatments.
Time overlap alone can be labeled `มีนัดในช่วงเวลานี้`, but **never** proves
`กำลังรับบริการ`. Use that label only for persisted `inService`. With no matching
booking say `ไม่มีนัดในช่วงเวลานี้`, not a clinical claim about cleaning or room
readiness. Do not create timers that advance status or refresh/mutate services.

Existing appointment details/status actions remain in their current flow. A
dashboard row may open the existing detail presentation or use the current
appointments link; no new route, transition or automatic slot recommendation.
Revenue, all six status counts, popular treatments/courses, expiring courses,
unused-session customers and low stock remain accessible below the main book.

### Appointment calendar

```text
1440px
NAV | Appointments                                 [Book appointment]
    | [Previous] [Today] [Next]  Date              [Day | Week | Room]
    | -----------------------------------------------------------------
    | TIME  | Practitioner A | Practitioner B | Practitioner C | ...
    | 10:00 |                |                |                |
    | 10:15 | Time range     |                |                |
    |       | CUSTOMER       |                |                |
    |       | Treatment      |                |                |
    |       | Room / status  |                |                |
    | 10:30 |----------------|----------------|----------------|
    | NOW ============================================================
    | ...   | Booked intervals keep their real duration/position

390px
Appointments                              [Book appointment]
[Previous] Date [Next] [Today]
[Day | Week | Room]
-------------------------------------------------------------
TIME | Practitioner A      | next column is horizontally scrollable
     | Time / customer     |
     | Treatment           |
     | Room       Status   |
```

Time gutter and practitioner/room headers stay visible during scrolling. Strong
hour rule, quieter half-hour rule and faint 15-minute divisions make slot geometry
clear. No gradient grid background. Minimum 200px lanes; do not show more lanes by
making names unreadable. Whole event is an accessible button with a descriptive
name and visible focus, not just a hover tooltip.

For 30-minute slots reserve 80px; use customer/time/status-room at readable sizes,
and expose the full treatment through focus/click detail if space is insufficient.
Longer blocks can show the full treatment. Truncation must never hide all of a
customer's name or the entire interval. Do not enlarge a block beyond its duration.
Room mode substitutes room columns and shows practitioner inside each block.

Week stays a seven-day appointment summary with practitioner columns, two readable
records and the existing full-day link. Allow greater height instead of 9px chips;
current-day row is the initial focal point only when that week contains today.
Mobile scroll positions must be deterministic for captures. Practitioner mode
keeps only their lane, adds room context and limits the desktop reading width.
No patient precautions in room blocks or reception previews.

### Customer profile

```text
1440px
NAV | [Back to customers] Customer name             [Sell course]
    | Phone                     ID / joined / visit count
    | -----------------------------------------------------------------
    | PRECAUTION (only when authorized; meaningful note emphasized)
    | -----------------------------------------------------------------
    | [Active courses | Treatment history | Purchases]
    | Course                 Remaining   Reserved   Expiry     [History]
    | Facial treatment       7 / 10      1          date
    | Spa treatment          8 / 10      0          date

390px
[Back] Customer name
Phone / ID                                     [Sell course]
-------------------------------------------------------------
Precaution (authorized roles only)
[Active courses | Treatment history | Purchases]
Course name
Remaining 7 / 10             Reserved 1
Expiry date                  [Usage history]
-------------------------------------------------------------
Next course / history records
Secondary administrative metadata below key working information
```

Keep precautions above treatment content for owner/practitioner; omit that area
entirely for reception, not a padlocked teaser. Routine `ไม่มีข้อควรระวังที่แจ้งไว้`
is neutral text, not an amber warning. No new editing capability is introduced.
Practitioner profile uses the permitted treatment-history view and no purchase
or course tab. Do not duplicate the customer's name on their own course rows.

## 8. Remaining page direction

| Page               | Desktop                                                                                                                                                                       | Mobile                                                                                                                                                                                                                                                    |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Customers          | Search-first directory; customer/phone/last visit/course count in a ledger. No anonymous initial circles.                                                                     | Compact separated records with name/phone on first two lines; primary view-profile action is obvious.                                                                                                                                                     |
| Courses            | Course/customer, remaining, reserved, expiry and usage action in aligned columns. Remove progress bars and repeated healthy badges.                                           | Same field sequence in two-column record details; one record should not consume half the screen. No boxed section around the list.                                                                                                                        |
| Sales              | Compact searchable catalog with text type/price/stock; clear add tool with Thai accessible name. One bounded bill, right-aligned quantities/amounts and payment section.      | Catalog and current bill have clear text view controls or anchors; preserve selected lines when switching UI views. A 44px bottom payment summary may link to the existing payment area, but must not cover content or trigger a different checkout path. |
| Products and stock | Exception count as text/filter, separate numeric stock/minimum columns, restrained movement ledger. Receive/issue are two distinguishable tools with Thai hover/focus labels. | Compact stock records; balance/minimum and named actions near the product. Avoid large warning banner + tall tab + another tall filter stack.                                                                                                             |
| Treatment catalog  | Category headings and service/duration/price rows rather than repeated sparkle tiles.                                                                                         | Same readable list, no generic icon per treatment. Keep prices restricted as today.                                                                                                                                                                       |
| Login              | One unframed, constrained form with clinic name above it; no split promotional gradient, slogan, shield illustration or trailing arrow.                                       | Same form, first-screen role/email/password/action; 16px controls, no marketing header. Preserve demo credentials and role/practitioner selection.                                                                                                        |
| Receipt            | Restrained paper document, clear identity/number/date, readable line items and total. Export controls outside the captured receipt element.                                   | Same hierarchy with wrapped labels; explicit numerical alignment and no mini-card interpretation of the document. Preserve PDF generation and fictional-document notice.                                                                                  |

Desktop row hover is allowed only for actually selectable rows. Static rows do
not lift, brighten or advertise clickability. Selected tabs use an underline or
simple rule, not a miniature elevated pill. Segmented calendar modes are flat.

## 9. Thai copy system

Use plain operational Thai. No slogans, greetings, doubled page subtitles,
sentence fragments about premium care or metadata joined by middle dots. Put
related facts in aligned fields or separate lines with actual labels. Existing
domain status/role labels remain exactly as defined.

| Purpose                                | Standard copy                                                |
| -------------------------------------- | ------------------------------------------------------------ |
| Open booking form                      | จองคิวใหม่                                                   |
| Create/update appointment submission   | บันทึกนัดหมาย                                                |
| Open existing booking editor           | แก้ไขนัดหมาย                                                 |
| Cancel appointment confirmation action | ยกเลิกนัดหมาย                                                |
| Mark no-show confirmation action       | บันทึกไม่มาตามนัด                                            |
| Arrival / start / finish command       | บันทึกการมาถึง / เริ่มบริการ / จบบริการ                      |
| Add/save customer                      | เพิ่มลูกค้า / บันทึกลูกค้า                                   |
| Open course sale / submit course sale  | ขายคอร์ส / บันทึกการขายคอร์ส                                 |
| Checkout                               | รับชำระเงิน                                                  |
| Stock tools / submissions              | รับเข้าสินค้า / บันทึกรับเข้า; เบิกออกสินค้า / บันทึกเบิกออก |
| Excel export / PDF download            | ส่งออก Excel / ดาวน์โหลด PDF                                 |
| Dialog dismissal                       | ปิด; กลับ when abandoning a destructive confirmation         |
| Remove bill line / clear bill          | ลบรายการ / ล้างรายการขาย                                     |
| Reset confirmation                     | คืนข้อมูลตัวอย่าง                                            |

Trigger and submission labels may differ because opening a form and saving it are
different actions. For the same action, reuse the same wording in page, dialog,
tooltip, toast and accessible name. The generic shared confirmation primitive
must receive an action-specific label; do not leave every destructive action as
`ยืนยัน`. Keep confirmation and actual state-transition authorization unchanged.

### Empty, loading and error copy

| State                             | What happened                | Next step                                                         |
| --------------------------------- | ---------------------------- | ----------------------------------------------------------------- |
| No appointments for selected date | ไม่มีนัดหมายในวันที่เลือก    | Owner/reception: จองคิวใหม่; practitioner: เลือกวันอื่น           |
| Customer search has no match      | ไม่พบลูกค้าที่ตรงกับคำค้น    | ตรวจสอบชื่อหรือเบอร์โทรศัพท์; ล้างคำค้น                           |
| No active courses                 | ไม่มีคอร์สที่ใช้งานได้       | Owner/reception: ขายคอร์ส; no unavailable action for practitioner |
| No course usages                  | ยังไม่มีประวัติการใช้คอร์ส   | ครั้งจะถูกบันทึกเมื่อจบบริการ                                     |
| Stock search has no match         | ไม่พบสินค้าที่ตรงกับคำค้น    | ล้างคำค้นหรือเปลี่ยนประเภทสินค้า                                  |
| No low stock                      | ไม่มีสินค้าที่ต่ำกว่าขั้นต่ำ | ดูสินค้าทั้งหมด                                                   |
| Bill has no lines                 | ยังไม่มีรายการขาย            | เพิ่มบริการ คอร์ส หรือสินค้า                                      |
| UI request failed                 | โหลดข้อมูลไม่สำเร็จ          | ลองใหม่ using the existing refresh operation                      |
| UI save failed                    | บันทึกไม่สำเร็จ              | Preserve input; show service's precise reason inline              |

Service error strings must stay untouched because services are out of scope.
Render the original message exactly; do not parse Thai strings to infer new rules
or make false claims about the specific conflicting party. If it already contains
a recovery instruction, do not repeat another generic one. Error styling may add
an alert heading and line wrapping, not change the authoritative business reason.

Loading uses static, dimension-stable blocks, a Thai accessible loading name and
`aria-busy`; no simulated page entrance. Success toasts are brief statements about
the completed action and never the only record of a saved result. Keep inline
errors in the relevant form and do not let notifications cover payment/actions.

## 10. Accessibility and motion

- WCAG AA text/control contrast gates using the actual resolved tokens, including
  status labels, placeholder text, selected modes and chart axes. Never use
  opacity to make completed records unreadable.
- 44px mobile interaction targets. Short calendar intervals remain geometrically
  accurate; their surrounding book has alternate full-day/detail access if an
  interval is too short for a touch target. Focus outline must be visible outside
  clipped event/card containers.
- Keyboard order follows visible task order. All icon-only tools have Thai
  accessible names and labels on hover **and focus**. Keep Radix dialog focus
  trapping, Escape behavior and return focus. A mobile drawer must return focus
  to its menu trigger.
- Sticky modal title/footer must occupy independent header/footer regions, with
  only the form body scrolling. Add scroll padding so focused labels/errors are
  not hidden underneath. No content overlap at browser zoom.
- No page-load animation. Reduced-motion mode uses static skeletons, no animated
  charts, no smooth calendar scrolling and no hover transform.
- Use status words and structural cues in addition to color. Error text is not
  replaced by a red border, warning icon or tooltip alone.

## 11. Generic-default review and revisions

This is the review of the proposed plan against the supplied defaults. Changes
below are already incorporated above; they are not implementation claims.

| Generic default rejected                        | Revision made to the plan                                                                                                                                                                    | Why                                                                                   |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Identical rounded, softly shadowed sections     | Replaced an initial idea of separate timeline/room/revenue cards with an unframed appointment ledger, text room summary and lower financial band. Radius/elevation depend on actual purpose. | Otherwise a schedule-first dashboard would still look like a rearranged template.     |
| KPI icons in colored circles                    | Removed first-screen KPI cards and all metric icons; retain a plain daily-money line below the book. Removed circular practitioner initials.                                                 | Totals and identity need labels, not decorative shapes.                               |
| Decorative gradients, glass, emoji, greeting    | Explicitly remove login gradient/slogan, gradient grid backgrounds and animated chart fill; no greeting banner. Retain only the required slim fictional-data banner.                         | The front-desk task is not a spa landing page.                                        |
| Icons before headings/labels and small eyebrows | Keep icons for real tools/navigation only; plain section headings, no `พื้นที่ทำงาน` caption or shield before login. Meaningful warnings get a single icon only if it improves recognition.  | Repeated symbols make all information compete and hide task hierarchy.                |
| Trailing arrows and middle-dot metadata         | Remove login arrow; separate phone/time/room/validity fields and standardize verb-specific actions. Navigation arrows remain real back/previous/next tools.                                  | Users must understand an action and locate a fact, not decode ornamental punctuation. |
| Page-load fade/slide and hover on every card    | Static layout/skeletons; brief feedback only after a user action. Hover/focus only on true interactive controls/rows.                                                                        | Constant motion and false clickability distract during treatment handoffs.            |
| A new set of stock shadcn overrides             | Use one token source with aliases for primitives, charts, status and typography; no local hex/radius/type exceptions.                                                                        | A coherent product needs repeatable rules, not page-specific cosmetic patches.        |

Review verdict: **ready for approval, not implementation**. Main reason: the
proposed information order follows a clinic day rather than a screenshot-friendly
metric grid, and it fits the existing authorized data boundary.

Implementation completed after approval. The original verdict above records the
plan-stage review, not a remaining approval gate.

## 12. Implementation and verification gate (after approval only)

1. Add central tokens and restyle shared primitives/shell through them.
2. Redesign in this order: shell, dashboard, appointments, customers/profile,
   courses, sales/receipt, products/stock/treatment catalog, login.
3. After **each page**, run `npm run screenshots`, inspect both viewport versions
   against this document and repair that page before proceeding. Use supplementary
   captures for login, customer directory, treatment catalog, empty states and
   user-action states missing from the standard capture set.
4. Keep screenshot scenario coverage and role setup. Locator/capture framing may
   adapt to changed presentation; scripts must not fabricate state, hide content
   mismatches or change domain data to make the redesign appear successful.
5. Check keyboard focus, dialog scrolling, actual WCAG contrast and reduced motion.
   Confirm no changed domain/service/rule/route diff; rerun existing tests/browser
   checks for accidental regressions. Preserve screenshot-query banner behavior.
6. Build and lint before each small Conventional Commit, scoped to the touched
   page. Preserve the user's existing instruction-file changes.
7. Run `npm run gallery` after the approved pages pass. Review each composition and
   recommend strongest images based on task clarity, type legibility and mobile
   usefulness, not visual ornament. Do not regenerate galleries during this plan
   phase or present the baseline as redesigned output.

### Concrete acceptance checks

- At 1440px dashboard, today's appointments are the main element; room and
  practitioner are visible without opening a dialog. Financial reports remain.
- At 390 x 844, the real UI (banner included) shows at least one appointment on
  dashboard/calendar/practitioner pages without a marketing-height header.
- Customer mobile view shows contact, authorized precaution and the start of
  working course/history information before nonessential administrative facts.
- Event times and names use at least body size when presented as primary content;
  small metadata never becomes the only way to identify an appointment.
- Course/stock/bill quantities use labeled fields and aligned tabular numerals;
  remaining and reserved counts are not relabeled or silently recomputed.
- All six appointment states retain the same Thai wording and business meaning.
  No purple/indigo token, decorative gradient, repeated metric-icon circles or
  floating section-card pattern remains in the app.
- Actions/empty/error states use the copy system and keep the original business
  error explanations and input values. Financial/PDF and role behavior is unchanged.
- No horizontal page overflow at target widths; deliberate calendar scrolling
  stays inside the book. Focused labels are not clipped under sticky regions.
- Static loading/reduced-motion behavior and AA contrast are verified, not inferred
  from screenshots. Existing build, lint, service and browser checks pass.

## 13. Implementation results

- All page changes use the central palette, Thai type scale, semantic state,
  spacing and primitive tokens. Domain types, services, business rules and routes
  have no diff from the approved-plan baseline.
- Repeated KPI/cards/initials, promotional copy, middle-dot metadata, decorative
  gradients and load animations were removed. Existing dates, prices, course
  reservations, stock mutations and receipt generation are unchanged.
- The production screenshot gate ran after each page. Coverage expanded from 22
  to 30 screenshots to include customer directory, course-sale dialog, treatment
  catalog and login; all 15 desktop/mobile pairs have gallery compositions.
- Axe WCAG 2/2.1 A/AA checks pass for all main pages at 1440px and 390px, plus
  the booking dialog, receipt, mobile drawer and customer empty state. Actual
  success-toast contrast was repaired through the same status tokens.
- Keyboard focus and focus return pass for booking dialogs/mobile drawer.
  Reduced motion uses static loading/overlays. Sarabun numeral advances were
  measured and are equal with tabular-numeral styling.
- The real mobile dashboard, with the demo banner visible, shows a complete
  appointment within the first viewport. PDF/XLSX downloads and role restrictions
  still pass. Build, lint, 12 service tests and dependency audit pass.
- These are automated Chromium checks and visual reviews, not a claim of full
  accessibility certification. Safari/Firefox, assistive technology and physical
  devices remain useful manual verification targets.

Strongest service-gallery images: customer profile (precautions and session counts
read cleanly on both devices), day calendar (real booking geometry and room/status
context), and low stock (comparable quantities and clear movement actions).
Dashboard is the strongest operational overview; it deliberately shows the
appointment book rather than prioritizing a financial chart for the screenshot.
