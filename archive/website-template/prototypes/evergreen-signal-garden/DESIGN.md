---
version: alpha
name: Lattice Signal — Evergreen Signal Garden
description: A calm, evidence-first checkout observability workspace where a warm operational canvas meets a deep evergreen service constellation.
colors:
  background: "#f5f1e8"
  surface: "#fffdf8"
  primary: "#123f37"
  primary-soft: "#205a4e"
  intervention: "#e87863"
  attention: "#c98722"
  success: "#2c7d55"
  danger: "#c84d4d"
  text: "#1b312b"
  muted: "#6d7b74"
typography:
  sans:
    fontFamily: "Avenir Next, Avenir, Helvetica Neue, Arial, sans-serif"
  serif:
    fontFamily: "Newsreader, Iowan Old Style, Palatino Linotype, Palatino, Georgia, serif"
  mono:
    fontFamily: "DM Mono, SFMono-Regular, Consolas, Liberation Mono, monospace"
rounded:
  DEFAULT: "0.75rem"
  sm: "0.5625rem"
  md: "0.75rem"
  lg: "1.4375rem"
spacing:
  page-gutter: "38px"
  section-gap: "22px"
  page-max: "1384px"
components:
  app-shell:
    { backgroundColor: "{colors.background}", textColor: "{colors.text}" }
  button-primary:
    {
      backgroundColor: "{colors.intervention}",
      textColor: "{colors.text}",
      rounded: "{rounded.md}",
      height: "42px",
    }
  button-quiet:
    {
      textColor: "{colors.primary-soft}",
      rounded: "{rounded.md}",
      height: "42px",
    }
  card:
    {
      backgroundColor: "{colors.surface}",
      rounded: "{rounded.lg}",
      padding: "27px",
    }
  drawer: { backgroundColor: "{colors.surface}", width: "440px" }
  map:
    {
      backgroundColor: "{colors.primary}",
      textColor: "{colors.surface}",
      rounded: "0.8125rem",
    }
  status-warning: { textColor: "{colors.attention}" }
  status-healthy: { textColor: "{colors.success}" }
  status-failing: { textColor: "{colors.danger}" }
  supporting-copy: { textColor: "{colors.muted}" }
---

# Lattice Signal Design System

## Overview

### Creative North Star

The product is a calm newsroom for live systems: a warm desk where the operator can read the state of checkout, follow the one meaningful anomaly, and hand the next person a precise action. The memorable device is the signal garden — a deep evergreen service constellation with labeled nodes, a coral incident thread, and a readable evidence path.

### Product context and register

- **Audience and primary job:** Product and platform engineers answer “Is checkout healthy, what changed, and what should I do next?” in a busy incident-review context.
- **Target market(s) and evidence:** Fictional global SaaS product; the brief and observability prototype direction are the authoritative evidence for this demo.
- **Locale(s) and language policy:** English UI and plain-language operational copy. No localization surface is represented in this frontend-only prototype.
- **Usage scene:** Desktop monitoring at a shared team workspace, with a 390px mobile path for quick review and handoff. The page must remain useful when attention is scarce.
- **Register:** Product. Familiar dashboard behavior leads; the garden contributes authored character without turning the workspace into a brand page.
- **Memorable signature:** A deterministic SVG service constellation connects healthy, warning, and failing nodes to the selected incident. Motion is supportive only; labels, shape, and text carry the state.
- **Restraint:** Keep panels quiet, data contrast high, and semantic colors sparse. Coral is reserved for intervention and selected evidence; amber and red are reserved for attention states.
- **Anti-references:** No generic blue SaaS, glass cards, stock imagery, oversized gradients, or promotional copy. The surface should feel calm under pressure rather than like a marketing landing page.
- **Token ownership/runtime mapping:** This file owns the durable visual tokens for this standalone prototype. Runtime adapters are the CSS custom properties in `src/styles.css`; components consume those variables rather than repeating hex values. Capability ownership is recorded in `premium-ui.json`; the manual drift gate is `npm run format:check`, followed by comparing the CSS `:root` block against this frontmatter when tokens change.

## Colors

The warm ivory canvas (`#F5F1E8`) and soft white surface (`#FFFDF8`) separate page and evidence without relying on heavy elevation. Deep evergreen (`#123F37`) anchors the garden and the product mark. Coral (`#E87863`) is the one intervention color: open evidence, selected links, and the primary action. Amber (`#C98722`), green (`#2C7D55`), and red (`#C84D4D`) are semantic state colors, always paired with text, a status mark, or a distinct treatment. Critical telemetry uses red text and pale red surfaces rather than muted metadata.

Borders use `rgba(27, 49, 43, 0.13)` as the hairline baseline. The visible focus ring uses coral with a 3px outline. Charts use coral for current, muted evergreen for baseline, and annotation text that names the deploy window. Forced-colors mode returns system-operable scrollbar and control colors.

## Typography

Calm operational UI uses the sans stack `Avenir Next, Avenir, Helvetica Neue, Arial, sans-serif`. Short insights and evidence titles use `Newsreader` with an Iowan/Palatino/Georgia fallback. Telemetry, timestamps, environment labels, and code evidence use `DM Mono` with a system monospace fallback. Body copy stays between 11px and 14px in dense modules, with 1.45–1.65 line height; headings create the hierarchy rather than bolding every label.

The serif is deliberately limited to the page insight and drawer title so the interface remains a tool. Numeric values use a strong sans weight and the critical red treatment. Labels use sentence case unless they are machine-like utility labels, which use the mono uppercase eyebrow treatment.

## Layout

The desktop page uses a 1384px maximum content width with 38px outer gutters and a 22px module gap. The scan order is status → metrics → current-vs-baseline trend → incident queue → service constellation → evidence index. The overview uses a wide trend panel beside a compact incident timeline; mobile changes the order to trend → urgent incidents → service constellation → evidence cards.

The header is a warm sticky workspace bar with product identity, navigation, environment, freshness, and account context. At 920px navigation becomes a real menu. At 680px the page uses 16px gutters, stacks all metrics, replaces the wide constellation with a vertical connected service list, and replaces the table with priority cards. No module depends on horizontal clipping; the only internal horizontal scroller is the code evidence line.

## Elevation & Depth

Hierarchy comes from tonal layering, hairline borders, and a barely visible 10px/34px soft shadow. Static content does not float dramatically. The evergreen garden uses color and constellation lines for depth rather than shadows. The evidence drawer owns a single stronger shadow because it is a transient side surface; it is non-modal and does not lock the page behind it.

## Shapes

Large evidence panels use the `1.4375rem` radius token, KPI cards follow the same family, and controls use a quieter `0.75rem` radius. Status chips are compact rounded rectangles, not decorative pills. The garden nodes are slightly tighter `0.8125rem` rectangles so their labels read like operational tags inside a living map. Hairline borders remain visible on ivory surfaces.

## Components

### Foundational visual states

Default controls are soft white with hairline borders. Hover adds a small tonal lift; focus-visible adds a high-contrast 3px coral outline; active controls use a coral or evergreen surface; disabled controls retain geometry and lower opacity. Busy acknowledgment keeps the same button width. Success, warning, failing, and acknowledged states use status text plus a ring-and-core mark, never color alone.

### Buttons and actions

Solid coral is the primary safe intervention (`Open active signal`, `Acknowledge incident`). Quiet and outlined controls handle closing, filtering, and inspection. Button labels use the action verb. Acknowledge is reversible local demo state and stays in the drawer while it commits; it announces a success message in the shared status region.

### Navigation and data display

The navigation is a top workspace bar, with a mobile disclosure menu. The trend chart always names its unit, range, current line, baseline line, latest value, and deploy annotation. Service evidence uses a semantic table on desktop and intentionally structured cards on mobile. Incident items are semantic buttons inside articles, with a sibling acknowledge button to avoid nested controls.

### Forms and overlays

Environment uses a native select because OS-owned option geometry is accepted for this prototype; its closed state is styled only as a compact context control. Time range uses an authored button group with `aria-pressed`. The service search has a visible accessible label and app-owned clear button. The drawer is an app-owned, non-modal `role="dialog"` surface with close control, focus restoration, internal scrolling, and a full-width mobile variant.

### Iconography

Icons are deterministic inline SVGs with a consistent 1.8px rounded stroke. Icon-only controls have an accessible name; text remains adjacent wherever status or action could be ambiguous.

### Motion

Only warning/failing SVG nodes breathe softly in the live constellation, and the drawer uses a short entrance transition. `prefers-reduced-motion: reduce` removes transitions and animation; the React motion hook also sets a static-mode note. Labels, shapes, values, and status text remain complete without motion.

### Content and data visualization

Copy is direct and operational: “needs a look,” “threshold crossed,” “open evidence,” and “no action needed.” Relative time appears beside exact timeline times where audit order matters. The deterministic chart uses p95 milliseconds, coral current, evergreen baseline, amber/red state treatments, and a named deploy annotation. Demo data is visibly labeled as deterministic rather than implying a live backend.

## Do's and Don'ts

- **Do:** Make one meaningful regression obvious and give it a next step in the same visual neighborhood.
- **Do:** Pair every semantic state color with a word, mark, value, or structural treatment.
- **Don't:** Soften an urgent signal until it reads like decoration or hide it below secondary evidence on mobile.
- **Don't:** Add marketing language, stock imagery, gratuitous gradients, or motion that is required to understand the system.
