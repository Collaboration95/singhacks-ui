# Lattice Signal — prototype design prompts

These are the four prompts produced from the reference capture and three batches of visual analysis agents. Each prompt is intentionally self-contained so one implementation agent can build it without relying on conversation context.

## Prompt 1 — Black Paper / Trace Desk

Build a polished frontend-only observability workspace for a fictional company called **Lattice Signal**. The single job is to help a product engineer answer: “Is our checkout healthy, what changed, and what should I do next?” Open immediately on a populated demo workspace—no login, setup, or empty state.

Use an editorial black-paper visual system inspired by quiet technical publishing: warm ivory content surfaces on a deep charcoal shell, hairline rules, low-radius rectangular cards, no heavy shadows, and generous but disciplined spacing. Pair a restrained serif display face for insight headlines with a highly legible sans or mono utility face for labels, values, timestamps, and code-like evidence. Keep the palette mostly charcoal/ivory, with semantic green, amber, and red reserved for state. Do not make the whole interface monochrome: make anomalies unmistakable through labels, icons, and one controlled accent.

Screen composition: a compact workspace header with product switcher, environment, freshness, and time range; a narrow desktop rail that collapses to a real mobile menu; a hero insight band that says “Checkout is healthy, with one regression worth opening”; four KPI cards for availability, p95 latency, error rate, and error budget; a large current-vs-baseline trend chart; a right-side incident/change feed; a service/endpoint evidence table; and an evidence drawer that opens when an incident or trace is selected.

Make the signature visual a **trace desk**: a horizontal anomaly ribbon or waterfall that visibly connects the selected time window to affected services and the evidence drawer. Use SVG/CSS or lightweight inline data; no external chart library is required. Include working interactions for time range, environment, service filtering, incident selection, drawer open/close, and a small “acknowledge” action with inline feedback.

Responsive rules: at 390px collapse navigation, stack the KPIs and chart, move the incident feed above the service list, and turn each service row into a priority card with an expandable evidence affordance. No horizontal clipping. Use accessible names, visible focus, reduced-motion-safe transitions, and an app-owned drawer/dialog pattern. Verify the result in a real browser at desktop and mobile widths.

The page should feel like “a calm newsroom for live systems”: precise, authored, and quietly memorable. Avoid generic blue SaaS, oversized gradients, glass cards, and decorative data with no operational meaning.

## Prompt 2 — Cobalt Evidence Room

Build a frontend-only observability workspace for **Lattice Signal** with the same checkout-health demo and the same product behavior as the other directions. It must open directly into a credible populated state and be usable without authentication.

Use a data-forward cobalt/lavender visual system: pale lavender-white canvas, saturated cobalt for primary actions, selected states, key values, and one signature analytical series; near-black text; white evidence surfaces; thin border-defined cards; modest or square radii; almost no elevation. Use green, amber, red, and violet only when their labels explain the semantic meaning. Keep secondary copy readable and never let pale metadata carry critical information by itself.

Screen composition: a clear application shell with a left rail and top utility bar; workspace/environment and time controls; a four-card KPI strip; one large overview chart with current vs baseline; secondary cards for error-source mix and latency by service; a ranked service evidence table with status, owner, last deploy, p95, and error budget; a recent activity feed; and a detail side panel that links a selected chart range to exact traces and the deployment that introduced the regression.

Make the signature visual an **evidence rail**: a cobalt-to-lavender trace waterfall or linked brush-style range state that highlights the affected rows when a chart interval is selected. Use inline SVG/CSS data so the visual is crisp and functional. Implement working interactions for time range, environment, chart range selection, filter/search, row selection, detail panel close, and a clear success/failure state for acknowledging an incident.

Responsive rules: collapse the rail into an accessible menu; keep four health metrics readable; stack chart modules; turn the wide table into priority cards or an intentional horizontal surface with an obvious cue; preserve status, timestamp, and next action. Verify at 390px and a desktop width, with keyboard focus and reduced motion.

The page should feel like “a trustworthy evidence room”: calm enough for daily use, precise enough for incident review, and visually strong in a screenshot. Avoid turning every surface cobalt, relying on blue for severity, or reproducing a generic dashboard grid without a connected evidence story.

## Prompt 3 — Evergreen Signal Garden

Build a frontend-only observability workspace for **Lattice Signal** that demonstrates a human-centered path from system health to action. Open on a realistic checkout demo with fresh data, one warning, and one acknowledged incident; skip login and setup.

Use a warm ivory canvas with deep evergreen anchor surfaces, soft white panels, coral for primary intervention, amber for attention, and explicit green/red state tokens. Pair an editorial serif for short insight statements with a calm sans-serif for operational UI. Use generous spacing, rounded cards, hairline borders, and barely visible shadows, but increase contrast for critical telemetry. Illustrations must be CSS/SVG system diagrams rather than stock photography.

Screen composition: a warm workspace header with team/environment and freshness; a plain-language health summary; four decisive KPI cards; a large trend panel with time range and current-vs-baseline; a “signal garden” service map that shows healthy, warning, and failing services with text labels; a compact incident timeline; and an evidence drawer with timeline, owner, suggested next step, and related deploy. Include a service filter and a “show only what needs attention” toggle.

Make the signature visual a **signal garden**: an authored SVG service constellation where nodes softly pulse only when live, change color and label when degraded, and connect to a selected incident. The information must remain understandable without motion or color alone. Use a fallback static state for reduced motion.

Make interactions real: environment/time controls update visible copy or data, the attention toggle filters modules, service nodes open the evidence drawer, incidents can be acknowledged, and feedback is announced inline. At 390px, collapse navigation, stack health metrics, make the constellation a readable vertical list/map, and put urgent incidents before secondary detail. Avoid burying urgent states beneath too much warmth, over-rounding every element, or making copy sound like marketing instead of operations.

The result should feel like “calm under pressure”: humane, distinctive, and immediately actionable.

## Prompt 4 — Tactical Signal Grid

Build a frontend-only observability command center for **Lattice Signal**. Start on a populated checkout workspace with one live regression and a visible remediation path. No login or setup screen.

Use a restrained tactical visual system: near-black command surface, off-white text and panels, crisp 1–2px rules, modular rectangular cards, near-square corners, compact mono utility labels, and one acid yellow/lime intervention accent. Use green, amber, and red for labeled status—not as decoration. Keep the accent localized to active incidents, threshold markers, selected states, and the primary intervention button. Avoid full-neon backgrounds, rainbow charts, and borders around every tiny element.

Screen composition: a compact command header with breadcrumb, environment, time range, freshness, and export; a persistent desktop navigation rail that becomes a real mobile menu; a high-signal status banner; four KPI cards with value, delta, and microtrend; a threshold-aware time-series chart; a severity/source breakdown; a live anomaly ribbon; an incident queue with keyboard-friendly selection; and a searchable service table with owner, deploy, status, and next action. Selecting an incident should open a side drawer with timeline, affected services, evidence snippets, and an “acknowledge” action.

Make the signature visual a **live anomaly ribbon**: a bright but controlled signal strip with a baseline, threshold ticks, and a labeled incident window. The queue and ribbon should reinforce each other. Use inline SVG/CSS and deterministic demo data.

Make interactions real: environment and range controls, table filtering, incident selection, drawer open/close, acknowledge with feedback, and a compact “show only failing” filter. At 390px, collapse navigation and reorder the page as status → KPIs → anomaly ribbon → incident queue → evidence; convert the table into readable cards with no clipping. Include visible keyboard focus, reduced-motion support, semantic labels, and stable layout during feedback.

The result should feel like “a precise instrument with a pulse”: dramatic enough for a hackathon demo, disciplined enough for daily incident response. Avoid turning the product into a cyberpunk costume or sacrificing legibility for texture.
