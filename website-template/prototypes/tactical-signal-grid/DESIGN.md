---
version: alpha
name: Lattice Signal — Tactical Signal Grid
description: A near-black checkout observability command surface with a paper status band and a single lime signal accent.
colors:
  primary: "#D8FB4A"
  canvas: "#0B0D0F"
  surface: "#111517"
  surface-raised: "#171C1F"
  paper: "#ECEBE1"
  ink: "#111415"
  text: "#F3F1E8"
  text-soft: "#D0D1C7"
  muted: "#89908E"
  line: "#2B3234"
  line-strong: "#56605E"
  accent: "#D8FB4A"
  success: "#6BC58B"
  warning: "#EFB65E"
  danger: "#EF6F65"
  info: "#93AFBC"
typography:
  display:
    fontFamily: '"Arial Narrow", "Inter", "Helvetica Neue", Arial, sans-serif'
    fontSize: "2rem"
    lineHeight: "1.05"
  body:
    fontFamily: '"Inter", "Avenir Next", "Helvetica Neue", Arial, sans-serif'
    fontSize: "0.875rem"
    lineHeight: "1.45"
  mono:
    fontFamily: '"SFMono-Regular", "Cascadia Code", "Roboto Mono", Consolas, monospace'
    fontSize: "0.75rem"
    lineHeight: "1.35"
rounded:
  DEFAULT: "3px"
  sm: "2px"
  md: "5px"
spacing:
  rail: "224px"
  header: "66px"
  card: "16px"
  section: "13px"
components:
  shell:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.text}"
  surface:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
  elevated-surface:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.text-soft}"
  status-banner:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "24px"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.sm}"
    padding: "16px"
  primary-action:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    height: "36px"
  drawer:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "0px"
  secondary-copy:
    textColor: "{colors.text-soft}"
  utility:
    textColor: "{colors.muted}"
  rule:
    backgroundColor: "{colors.line-strong}"
    textColor: "{colors.text}"
  quiet-rule:
    backgroundColor: "{colors.line}"
    textColor: "{colors.text}"
  accent-marker:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.ink}"
  semantic-success:
    backgroundColor: "{colors.success}"
    textColor: "{colors.ink}"
  semantic-warning:
    backgroundColor: "{colors.warning}"
    textColor: "{colors.ink}"
  semantic-danger:
    backgroundColor: "{colors.danger}"
    textColor: "{colors.ink}"
  semantic-info:
    backgroundColor: "{colors.info}"
    textColor: "{colors.ink}"
---

# Lattice Signal Design System

## Overview

### Creative North Star

Lattice Signal is a night-shift control room built like a field instrument: a black command surface, a paper briefing strip, measured data marks, and one live signal that tells an operator where to put their attention. It should feel closer to a flight recorder and a well-made oscilloscope than to a cyberpunk game UI.

### Product context and register

- **Audience and primary job:** Product engineers and on-call operators answer “is checkout healthy, what changed, and what should I do next?” from a populated workspace.
- **Target market(s) and evidence:** Fictional global SaaS checkout platform; the current task brief is the authoritative product evidence for this frontend-only prototype.
- **Locale(s) and language policy:** English, UTC labels in the demo. Keep times explicit and do not imply a device-local timezone.
- **Usage scene:** Desktop-first incident response at a glance, with a 390px narrow mobile review mode for a person checking the next action away from the desk.
- **Register:** Product/tool. The interface is dramatic only where telemetry earns emphasis; routine controls stay quiet and familiar.
- **Memorable signature:** The live anomaly ribbon joins baseline, threshold ticks, the selected incident window, and the queue/drawer state in one horizontal instrument.
- **Restraint:** Cards, labels, and service rows do not receive lime by default. Semantic green, amber, red, and blue-gray are labeled state colors, not ambient decoration.
- **Anti-references:** Avoid full-neon cyberpunk, rainbow analytics, rounded fintech tiles, dark glassmorphism, stock imagery, and decorative grid noise that competes with the signal.
- **Token ownership/runtime mapping:** This is a new prototype using Model A: this file is the documented token owner, mapped directly to CSS custom properties in `src/styles.css`. No duplicated theme adapter exists; any durable token change updates both files and is checked with `designmd lint` plus a runtime build.

## Colors

The command canvas and surfaces stay near-black so the paper band and active signal can be read immediately. `paper` is reserved for the status band, signal breakdown, and incident queue; `ink` is its text. `accent` is the intervention/selection/threshold color and must remain localized. `success`, `warning`, `danger`, and `info` always travel with a text label, icon, or state name. `line` and `line-strong` create structure without boxing every tiny value.

## Typography

The display stack uses a condensed system face for short insight headlines only. Body copy uses a neutral sans fallback, while `mono` owns breadcrumbs, utility labels, IDs, timestamps, values, chart annotations, and evidence snippets. Uppercase is reserved for compact utility labels; sentences remain sentence case. The English-only prototype has no locale-specific font override; future locales must keep the mono data role and adjust line height before reducing text size.

## Layout

The desktop shell uses a 224px persistent rail and a 66px command header. The main canvas is a fluid grid with 13px section gaps, 4-up KPIs, an analytical two-column row, a full-width anomaly ribbon, and a lower queue/evidence split. The 390px mode collapses the rail into an overlay menu, stacks status → KPIs → anomaly ribbon → analysis → incident queue → service evidence, and turns each service row into a labeled card. The page owns document scrolling; only bounded evidence/drawer surfaces scroll internally. No important value is single-line clipped.

## Elevation & Depth

Hierarchy comes from tonal surfaces and crisp rules, not shadows. The paper band and queue are the two high-contrast briefing surfaces. The drawer may use one restrained shadow to separate an active layer from the command surface; static cards do not. The backdrop is a translucent dark veil only when the drawer is open.

## Shapes

The shape language is modular and near-square: 2–5px radii, 1px rules, 2px signal strokes, and compact rectangular status tags. Circular shapes are reserved for status nodes, avatars, and the instrument’s signal core. The lime button is rectangular and measured; there are no pill controls.

## Components

### Foundational visual states

Default surfaces are quiet and low-contrast. Hover raises a border one step. `:focus-visible` is a 2px acid outline with a 3px offset. Selected queue items invert to ink with a lime signal edge. Busy states preserve button geometry. Disabled acknowledgement uses a labeled success treatment, not opacity alone. Empty/no-results keeps the service-panel footprint and offers `Clear filters`.

### Buttons and actions

The emphasis × intent system has one primary action: acid solid for acknowledge/open selected incident. Dark solid is the paper-band inspection action. Ghost outline is for export and utility controls. Semantic warning, success, and danger are expressed in tags and adjacent copy; they do not become arbitrary button colors.

### Navigation and data display

The rail uses a small line icon family and one active left rule. Breadcrumbs represent `Signal control / Checkout / Overview`. Tables remain true tables on desktop; at narrow widths each row becomes a labeled stacked card without removing owner, deploy, status, or next action. The anomaly ribbon and trend chart use deterministic inline SVG with an accessible title/description and text legends.

### Forms and overlays

Environment and time range use native `<select>` controls because the platform-owned option popup is acceptable for this demo and no authored popup geometry is promised. Service search is a labeled text input with a debounced local commit, IME-safe composition handling, explicit clear button, and result status. Incident details use an app-owned modal drawer with focus containment, Escape/backdrop close, focus restoration, an internal scroll region, and a stable acknowledgement feedback slot.

### Iconography

Icons are deterministic inline SVG, 1.7px round strokes, and 13–16px optical sizes. Icon-only controls have visible accessible names. Important actions keep text labels; icons never carry semantic state alone.

### Motion

Motion is limited to drawer entrance, toast entrance, and short control transitions. It uses 160–220ms ease-out and never animates the telemetry itself. `prefers-reduced-motion: reduce` collapses transitions and drawer motion to an effectively instant state change.

### Content and data visualization

Copy uses calm operational verbs: `Inspect regression`, `Open incident`, `Acknowledge incident`, and `Clear filters`. Times are UTC. Chart series are observed, baseline, threshold, and selected window; no series exists only to make a composition colorful. Every state color is accompanied by a label, and chart captions repeat the meaning in text.

## Do's and Don'ts

- **Do:** Keep the selected incident, ribbon window, queue item, and drawer title synchronized.
- **Do:** Make the next safe intervention visible before the operator opens detail.
- **Don't:** Spread lime across navigation, charts, or all active-looking controls.
- **Don't:** Turn operational evidence into a decorative cyberpunk texture or a wall of tiny bordered boxes.
