---
version: alpha
name: "Lattice Signal — Cobalt Evidence Room"
description: "A calm, data-forward observability workspace where a selected signal range stays visibly connected to the traces, services, and deployment that explain it."
colors:
  primary: "#3544C8"
  background: "#F7F6FF"
  surface: "#FFFFFF"
  surfaceSelected: "#F0EFFF"
  text: "#181725"
  textMuted: "#777286"
  border: "#E0DDEC"
  lavender: "#A9A7F4"
  violet: "#7653B4"
  success: "#197A59"
  warning: "#A46308"
  danger: "#B53D55"
typography:
  sans:
    fontFamily: '"Avenir Next", "Inter", "Helvetica Neue", Arial, sans-serif'
    fontSize: "14px"
    lineHeight: "1.45"
  mono:
    fontFamily: '"SFMono-Regular", "Cascadia Code", "Roboto Mono", Menlo, monospace'
    fontSize: "10px"
    lineHeight: "1.4"
rounded:
  DEFAULT: "0.25rem"
  sm: "0.25rem"
  md: "0.5rem"
  lg: "0.75rem"
spacing:
  page-gutter: "34px"
  card-gap: "13px"
  section-gap: "18px"
  mobile-gutter: "12px"
components:
  button:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    rounded: "{rounded.sm}"
    height: "34px"
    typography: "{typography.sans}"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.md}"
    padding: "19px"
  dialog:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.lg}"
    width: "448px"
  evidence-rail:
    backgroundColor: "{colors.surfaceSelected}"
    textColor: "{colors.primary}"
    rounded: "{rounded.md}"
  status-success:
    backgroundColor: "{colors.success}"
    textColor: "{colors.surface}"
  status-warning:
    backgroundColor: "{colors.warning}"
    textColor: "{colors.surface}"
  status-danger:
    backgroundColor: "{colors.danger}"
    textColor: "{colors.surface}"
  status-violet:
    backgroundColor: "{colors.violet}"
    textColor: "{colors.surface}"
  metadata:
    textColor: "{colors.textMuted}"
    typography: "{typography.mono}"
  divider:
    backgroundColor: "{colors.border}"
    height: "1px"
  trace-baseline:
    backgroundColor: "{colors.lavender}"
    height: "2px"
---

# Lattice Signal Design System

## Overview

### Creative North Star

The product is a trustworthy evidence room: a quiet incident-review desk with a cobalt tracing pencil laid across a pale lavender work surface. Each analytical selection must leave a visible trail into the service rows, exact traces, and introducing deployment. The visual reference is an annotated operations notebook, not a generic SaaS card grid.

### Product context and register

- **Audience and primary job:** Product and platform engineers need to answer whether checkout is healthy, what changed, and what to inspect next without leaving the workspace.
- **Target market(s) and evidence:** Fictional global developer-tooling product; the current task brief is the only business evidence and supplies the checkout-health demo.
- **Locale(s) and language policy:** English UI, UTC timestamps, and explicit labels for all simulated telemetry. No locale switching is in scope for this prototype.
- **Usage scene:** Daily desktop monitoring with a 390px mobile fallback for incident review away from a desk. Density is compact enough to scan, with generous breathing room around the evidence chain.
- **Register:** Product tool. Familiar operations patterns lead; cobalt-to-lavender evidence linking supplies the distinctive expression.
- **Memorable signature:** The evidence rail under the chart turns a selected time interval into a linked set of service lanes. The same range highlights the affected service rows and repopulates the detail panel.
- **Restraint:** Static surfaces use white, hairline borders, square-ish corners, and no decorative elevation. Cobalt is reserved for primary action, selection, links, and the current analytical series.
- **Anti-references:** Avoid generic blue admin grids, neon cyberpunk command centers, glassmorphism, rainbow charts, and severity conveyed by blue alone. Avoid large gradients except for the restrained selection-to-evidence wash.
- **Token ownership/runtime mapping:** This new prototype uses `DESIGN.md` as the normative token source. The direct runtime adapter is `src/styles.css` `:root`; component rules consume those variables. The mapping is documented in the token table below and checked with `designmd lint` plus the premium audit manifest.

### Token mapping

| DESIGN.md token                         | Runtime variable                | Primary consumers                                     |
| --------------------------------------- | ------------------------------- | ----------------------------------------------------- |
| `colors.primary`                        | `--cobalt`                      | Primary buttons, selected range, current chart, links |
| `colors.background`                     | `--canvas`                      | Application canvas and shell                          |
| `colors.surface`                        | `--surface`                     | Evidence cards, table, drawers                        |
| `colors.surfaceSelected`                | `--surface-selected`            | Selected navigation, evidence, and rows               |
| `colors.text` / `textMuted`             | `--text` / `--text-muted`       | Headings and supporting copy                          |
| `colors.border`                         | `--line`                        | Card, table, and control boundaries                   |
| `colors.success` / `warning` / `danger` | `--green` / `--amber` / `--red` | Labeled status, deltas, and feedback                  |
| `typography.sans` / `mono`              | `--sans` / `--mono`             | Product copy and telemetry labels                     |
| `rounded.*`                             | `--radius-*`                    | Controls, cards, evidence lanes, drawer               |

## Colors

The canvas is `#F7F6FF`, a lavender-white that keeps a long operational page brighter than a dark incident console. White evidence surfaces are separated with `#E0DDEC` hairlines rather than shadows. Saturated cobalt `#3544C8` marks only the main action, current analytical series, selected navigation, selected ranges, and links. `#A9A7F4` is a supporting trace tone, never an unlabelled severity cue.

Green, amber, red, and violet are semantic roles. Every status badge pairs color with a written label and an icon: Healthy, Watch, and Degraded. Error-source mix labels repeat each category beside its bar. Forced-colors mode gives control back to the platform. Focus uses a high-contrast lavender outline and is never communicated by color alone.

## Typography

`Avenir Next` is the first available display/body face, with a compatible sans fallback for environments where it is absent. Its slightly human geometry keeps the page from reading like a terminal while remaining compact. `SFMono-Regular` and compatible monospace fallbacks carry timestamps, versions, p95 values, and small operational labels so evidence reads as inspectable data.

Headings use tight tracking and medium-heavy weights; body copy remains 10–14px depending on density. Labels use sentence case except for short mono eyebrows and service identifiers. Important metadata is not rendered in pale text without a stronger adjacent value or label.

## Layout

The desktop shell reserves a 238px navigation rail and a 70px utility bar, then places content in a fluid column with a 34px page gutter. The signature overview is the largest surface, followed by the evidence rail inside it; the incident card is adjacent but subordinate. KPI cards are a four-column strip. Secondary breakdowns sit in a two-column row, while the service evidence table spans the content width.

The rail disappears at 820px and is replaced by a focus-trapped overlay navigation drawer. At 600px, controls become a two-column block, metrics remain a readable two-by-two grid, chart modules stack, and the table becomes explicit priority cards. The cards repeat labels for owner, deploy, p95, and error budget and include a visible “Priority view” cue; no columns are silently clipped.

## Elevation & Depth

Default hierarchy comes from tonal layers, spacing, cobalt selection edges, and thin borders. Cards and table rows have no static shadow. The only elevation is the app-owned detail/navigation overlay, where a restrained shadow separates the active evidence surface from the scrim. The drawer footer is sticky inside the drawer so its action remains reachable without changing the page scroll owner.

## Shapes

Controls use `4px` corners; cards use `8px`; the detail sheet uses `12px` only as a mobile surface transition. Borders are 1px and quiet. The rail uses small square-ish nodes and rounded 3px trace segments to suggest a plotted signal rather than decorative pills. Status badges may be compact rectangles, never ambiguous color dots without text.

## Components

### Foundational visual states

Interactive elements have visible hover, `:focus-visible`, pressed/selected, disabled, and busy states. Selected evidence uses a cobalt edge plus a lavender surface. Disabled actions keep geometry and reduce opacity. The app-owned toast has a stable bottom placement and a polite live region. The demo uses a compact busy spinner only inside the acknowledge button; reduced motion removes its animation.

### Buttons and actions

Buttons follow an emphasis × intent model. Solid cobalt is the primary safe action; bordered neutral controls handle refresh, close, and view options; semantic status is reserved for acknowledgement feedback. Labels name the action (“Open evidence”, “Acknowledge incident”, “Close detail”), and button geometry does not change while busy. There are no destructive actions in this read-only demo.

### Navigation and data display

The persistent rail uses text plus icons and marks Overview with `aria-current`. The top bar carries the breadcrumb, freshness, and profile utility. The native environment/time selects are intentionally platform-owned because the prototype accepts OS popup geometry. The overview chart exposes an accessible label and text caption, clickable evidence windows, and keyboard activation. The service table is a native read-oriented table with labelled sortable headers. Its mobile representation repeats the same data and action in a priority card.

### Forms and overlays

Search is a local filter, so visible results update immediately rather than dispatching a remote request. A custom clear button returns focus to the search input. The detail panel is an app-owned modal drawer with Escape dismissal, focus containment, background inertness, a close button, and focus restoration to the triggering control. It contains the selected range, affected services, exact trace IDs, and introducing deployment in one inspectable chain.

### Iconography

Icons are deterministic inline SVGs with a consistent 1.8px outline stroke, 13–19px optical sizes, and no external icon dependency. They support labels but never replace the text required to understand a status or next action.

### Motion

Motion is limited to button hover feedback, the acknowledge busy state, and tiny state transitions that clarify selection. Durations stay below 200ms for routine feedback. The evidence rail is legible and static by default; `prefers-reduced-motion: reduce` removes transforms and animations and disables smooth scrolling.

### Content and data visualization

Copy is direct, specific, and operational: “Checkout is healthy with one regression worth opening.” Values are deterministic demo data, formatted in compact telemetry notation (`842ms`, `0.34%`, `12:00–12:15 UTC`). The chart uses cobalt for current, a dashed lavender-gray baseline, and a labelled translucent selection window. The rail labels every service lane and uses “linked”/“baseline” text so meaning survives grayscale and assistive technology.

## Do's and Don'ts

- **Do:** Make every selected range resolve into a visible, inspectable evidence chain.
- **Do:** Preserve status, timestamp, owner, and next action when the desktop table becomes mobile cards.
- **Don't:** Use cobalt as a blanket background or let severity depend on blue, red, amber, or green alone.
- **Don't:** Add ornamental charts, stock imagery, heavy shadows, or silent horizontal clipping that compete with the evidence story.
