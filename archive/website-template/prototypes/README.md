# Lattice Signal prototype set

Four standalone React/Vite observability dashboard directions were built from
the captured TypeUI reference library and the synthesized design prompts.
Each prototype is intentionally self-contained and uses deterministic demo
telemetry, inline SVG/CSS visuals, responsive behavior, and an evidence drawer.

| Direction | Prototype | Signature | Local URL |
| --- | --- | --- | --- |
| Black Paper / Trace Desk | `black-paper-trace-desk` | Editorial serif hierarchy and a trace-waterfall desk | http://127.0.0.1:4173/ |
| Cobalt / Evidence Room | `cobalt-evidence-room` | Sharp cobalt evidence rail with linked service rows | http://127.0.0.1:4174/ |
| Evergreen / Signal Garden | `evergreen-signal-garden` | Warm, rounded signal constellation for human handoff | http://127.0.0.1:4175/ |
| Tactical / Signal Grid | `tactical-signal-grid` | Near-black command surface with an anomaly ribbon | http://127.0.0.1:4176/ |

Each folder includes `DESIGN.md`, `UX-CONTRACT.md`, `premium-ui.json`, and
`premium-audit.json` beside its source and build output.

## QA captures

The `qa/` folder contains final desktop full-page captures, 390×844 mobile
captures, and evidence-drawer captures where available. Git tracks only files
whose names end in `-final.png`; earlier exploratory captures remain local.
The four final desktop frames are:

- `qa/black-paper-trace-desk/desktop-final.png`
- `qa/cobalt-evidence-room/desktop-final.png`
- `qa/evergreen-signal-garden/desktop-final.png`
- `qa/tactical-signal-grid/desktop-final.png`

## Verification

- All four prototypes pass their available Prettier checks and production
  builds.
- Black Paper, Cobalt, and Evergreen also pass TypeScript checks.
- All four pass the strict frontend-design-premium audit with zero findings.
- Browser QA covers the 1440px desktop and 390px mobile layouts, service
  search/clear, environment and time controls, evidence drawers, acknowledge
  flows, and mobile navigation.
