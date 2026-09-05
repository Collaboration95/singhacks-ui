---
version: alpha
name: "Lattice Signal — Black Paper / Trace Desk"
description: "A calm, editorial observability desk for answering what changed in checkout and where the signal travels."
colors:
  primary: "#D4C564"
  shell: "#1D1E1C"
  shellRaised: "#272824"
  background: "#E9E4DA"
  surface: "#F5F1E8"
  surfaceRaised: "#EEE9DF"
  text: "#262722"
  textSecondary: "#595950"
  textMuted: "#817E73"
  border: "#CDC6B9"
  borderLight: "#DDD6CA"
  signal: "#D4C564"
  signalDeep: "#867B2F"
  healthy: "#3F7256"
  warning: "#9D672F"
  critical: "#A74D42"
  info: "#5F6E77"
typography:
  display:
    fontFamily: "Iowan Old Style, Palatino Linotype, Book Antiqua, Georgia, serif"
    fontSize: "3.7rem"
    lineHeight: "0.99"
  body:
    fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "0.8125rem"
    lineHeight: "1.6"
  utility:
    fontFamily: "SFMono-Regular, Consolas, Liberation Mono, Menlo, monospace"
    fontSize: "0.5625rem"
    lineHeight: "1.4"
rounded:
  DEFAULT: "3px"
  sm: "3px"
  md: "6px"
spacing:
  unit: "4px"
  panel: "24px"
  section: "40px"
  pageInline: "clamp(22px, 3.5vw, 52px)"
components:
  button:
    backgroundColor: "#D4C564"
    textColor: "#1D1E1C"
    rounded: "3px"
    padding: "0 12px"
    height: "34px"
  card:
    backgroundColor: "#F5F1E8"
    textColor: "#262722"
    rounded: "3px"
    padding: "24px"
  drawer:
    backgroundColor: "#F5F1E8"
    textColor: "#595950"
    width: "min(100%, 452px)"
  table:
    backgroundColor: "#F5F1E8"
    textColor: "#595950"
    rounded: "3px"
    padding: "12px"
---

# Lattice Signal Design System

## Overview

### Creative North Star

Lattice Signal is a newsroom desk for live systems: warm paper evidence laid over a charcoal filing cabinet, with the trace waterfall acting like a marked-up proof sheet. The interface is for product and platform engineers who need a five-second health read and a credible next step during an active workday.

### Product context and register

- **Audience and primary job:** Product and platform engineers answer “Is checkout healthy, what changed, and what should I do next?” without leaving the workspace.
- **Target market(s) and evidence:** Fictional global SaaS product; this prototype is grounded by `../../observability-design-prompts.md` and `../../pattern-synthesis.md`.
- **Locale(s) and language policy:** English UI, fixed UTC demo timestamps, plain operational language; no locale switch is in scope.
- **Usage scene:** Desktop-first investigation with a real 390px mobile fallback for a quick incident check.
- **Register:** Product/tool surface with editorial restraint; it is not a marketing page.
- **Memorable signature:** The horizontal trace desk makes a selected regression travel across service lanes and into the evidence drawer.
- **Restraint:** KPIs, tables, and controls stay quiet so a warning is legible without a neon command-center costume.
- **Anti-references:** Generic blue SaaS dashboards, glass cards, oversized gradients, heavy shadows, and decorative charts without an operational question.
- **Token ownership/runtime mapping:** Runtime CSS variables in `src/styles.css` are canonical for this standalone prototype. This file mirrors those values; components consume the CSS variables. Drift is checked by reviewing the frontmatter against `src/styles.css` and `npm run format:check`/`npm run build`.

## Colors

The shell uses `shell` (#1D1E1C) and `shellRaised` (#272824); the work surface uses `background` (#E9E4DA), `surface` (#F5F1E8), and `surfaceRaised` (#EEE9DF). `text`, `textSecondary`, `textMuted`, `border`, and `borderLight` establish the ink hierarchy. `healthy`, `warning`, and `critical` are semantic state colors and always appear with text or an icon. `signal` and `signalDeep` are the single controlled editorial accent for selected trace spans, thresholds, and primary intervention. No state is communicated by color alone. Focus uses `signalDeep`; forced-colors mode returns control to the platform.

## Typography

The `display` role uses a restrained system serif for insight headlines and short section titles. `body` uses a legible system sans for copy and controls. `utility` uses a compact mono stack for labels, timestamps, values, trace IDs, and deploy versions. Body copy stays sentence case; utility labels may use uppercase tracking for navigation and telemetry. Numeric values use mono so columns and deltas stay stable. The stack has system fallbacks and does not require a font download.

## Layout

Desktop uses a 232px persistent rail and a fluid paper canvas. The main content is capped at 1390px with `pageInline` padding. The scan order is insight → health metrics → trace desk → trend and incident activity → service evidence. Cards are low-radius and border-defined. At 840px the rail becomes an overlay menu; at 560px controls wrap, KPIs stack, the incident feed remains before service evidence, and the wide table becomes priority cards with disclosure. Scroll remains document-owned except for bounded evidence surfaces such as the drawer and horizontal desktop table. Geometry is reserved during feedback; no content depends on hover.

## Elevation & Depth

Hierarchy comes from the charcoal/paper tonal split, hairline rules, and a small number of inset accents. Static cards have no heavy shadow. A scrim and restrained directional shadow are reserved for the mobile menu and evidence drawer so their ownership is clear. The product surface never uses glass blur or a decorative gradient background.

## Shapes

Most controls and panels use `3px` corners; workspace identity blocks may use `6px`. Dividers are 1px rules. Status marks are circles, the trace regression marker is a diamond, and icon buttons keep a square edge language. Buttons are rectangular rather than pill-shaped so the desk reads like a technical publication.

## Components

### Foundational visual states

Default surfaces are ivory with a charcoal ink hierarchy. Hover darkens the rule or lifts the paper tone; focus-visible uses a 2px `signalDeep` ring; pressed actions move 1px; selected traces use `signal`; disabled acknowledge actions retain their footprint and use muted ink; warning/error/success pair semantic color with a label or icon. Motion is limited to short state transitions and has a reduced-motion override.

### Buttons and actions

Primary safe intervention uses `signal` (`button-signal`); utilities use the quiet outline (`button-quiet`). Icon-only actions have explicit accessible names. Acknowledge uses the same verb in the incident feed and drawer, keeps the control width stable, and reports inline plus through the shared status region.

### Navigation and data display

The desktop rail is a persistent navigation landmark. The mobile menu is an app-owned dialog with Escape and focus restoration. The service/endpoint evidence surface is a semantic read-only `<table>` on desktop; mobile renders the same records as accessible priority-card disclosures. Charts are inline SVG with visible titles, units, legends, labels, and a text summary. The trace desk uses HTML/CSS lanes with native buttons over a deterministic inline data model.

### Forms and overlays

Environment and time range are native `<select>` controls because platform-owned menus are acceptable for these low-risk choices. Service search is a local search field with an app-owned clear button. The evidence drawer is a persistent-width app-owned dialog variant with a labeled title, `aria-modal`, internal scrolling, Escape close, focus trap, scrim close, and trigger focus return. Routine feedback uses the inline/status region rather than a transient toast stack.

### Iconography

Icons are a local inline SVG set with a 1.7px round stroke, sized 13–20px. Icons support labels; they never carry severity or action meaning by themselves. Icon-only buttons always expose an accessible name.

### Motion

Transitions use short ease-out/ease-in-out changes for hover, selected trace height, and drawer affordances. There is no ambient polling animation. `prefers-reduced-motion: reduce` removes transform and transition timing while preserving state changes.

### Content and data visualization

Copy is plain, specific, and operational: “Open evidence”, “Acknowledge incident”, “No services match this view.” Timestamps are deterministic UTC demo values. Charts use charcoal for current, muted ink for baseline, red for the regression marker, and the controlled signal for the selected trace window. Every chart has a nearby evidence action and a text description.

## Do's and Don'ts

- **Do:** Let the trace desk connect the incident, the affected services, and the evidence drawer.
- **Do:** Pair every semantic state color with a word, icon, or shape and keep the next action close to the evidence.
- **Don't:** Turn every panel into a dark, neon, rounded, or elevated card.
- **Don't:** Hide the table relationship, drawer close, or urgent incident behind hover-only behavior.
