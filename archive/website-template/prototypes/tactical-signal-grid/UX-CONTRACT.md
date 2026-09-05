# UX Contract

## Product context

- Audience: Product engineers and on-call operators reviewing a fictional checkout path.
- Primary jobs: Assess checkout health, connect a regression to a service/deploy, and acknowledge the next safe intervention.
- Target market(s): Fictional global SaaS; this is a frontend-only deterministic demo.
- Active locales: English.
- Language/content register and native-review policy: Plain operational English; timestamps name UTC explicitly.
- Timezone/calendar policy: Demo timestamps are UTC and use 24-hour clock notation.
- Accessibility target: WCAG 2.2 AA baseline for native semantics, focus, contrast, and keyboard operation.

## Business-context sources

The prototype has no backend policy, auth model, billing behavior, or destructive data lifecycle. The current task brief is the only product authority.

| Domain / scope                        | Authoritative source                                          | Source type        | Reviewed date |
| ------------------------------------- | ------------------------------------------------------------- | ------------------ | ------------- |
| Product scenario and visual direction | `../../observability-design-prompts.md` → Prompt 4            | Current task brief | 2026-09-04    |
| Incident demo data                    | `src/main.jsx` constants                                      | Frontend fixture   | 2026-09-04    |
| Permission model                      | Not applicable — no login or privileged mutation in prototype | Scope decision     | 2026-09-04    |
| Data lifecycle / deletion             | Not applicable — no delete flow                               | Scope decision     | 2026-09-04    |
| Billing / payment                     | Not applicable — payment telemetry is fictional evidence only | Scope decision     | 2026-09-04    |
| Legal / regulatory copy               | Not applicable — fictional demo                               | Scope decision     | 2026-09-04    |

## Visual contract

- Project `DESIGN.md`: `DESIGN.md`
- Token ownership model: `DESIGN.md` generated/documented owner with direct runtime CSS mapping for this new prototype.
- Runtime design-system/token source: `src/styles.css` `:root` custom properties.
- Mapping/export/adapters: `DESIGN.md` frontmatter token names map to the same `--color-*`, `--font-*`, `--radius-*`, and `--space-*` variables; no second adapter.
- Token drift gate: `npx -p @google/design.md designmd lint DESIGN.md` plus `npm run build`.
- Supported themes: Dark command surface only; forced-colors fallback preserves system colors.
- Design-context owner/review policy: Changes to accent, semantic state colors, radius, or type roles update both `DESIGN.md` and `src/styles.css` in the same change.

## Canonical UI Map

| Capability      | Canonical owner                                   | Source of truth             | Allowed variants                    | Verification                        |
| --------------- | ------------------------------------------------- | --------------------------- | ----------------------------------- | ----------------------------------- |
| Table Selection | Not applicable — no row selection or bulk action  | UX contract scope           | none                                | N/A                                 |
| Select/Listbox  | Native `<select>` in `CommandHeader`              | `DESIGN.md` + this contract | native                              | keyboard + browser popup inspection |
| Date            | Not applicable — no date picker                   | UX contract scope           | none                                | N/A                                 |
| Form            | Native labeled controls; no submit form           | This contract               | read-only controls                  | keyboard inspection                 |
| Scrollbar       | Global application stylesheet in `src/styles.css` | `DESIGN.md`                 | stable-gutter drawer/table surfaces | computed style + browser inspection |
| Toast           | `ToastRegion` in `src/main.jsx`                   | This contract               | success / warning / info            | live-region inspection              |
| CRUD            | Not applicable — no CRUD mutation                 | UX contract scope           | none                                | N/A                                 |

## Component behavior

| Component    | Default                                                  | Hover                    | Focus                      | Active                     | Disabled                            | Busy                                       | Error                                |
| ------------ | -------------------------------------------------------- | ------------------------ | -------------------------- | -------------------------- | ----------------------------------- | ------------------------------------------ | ------------------------------------ |
| Button       | Native button with explicit verb                         | Border/background change | Acid outline               | 1px press shift            | Non-interactive, geometry preserved | Not used in async demo                     | Inline status/toast if needed        |
| Icon button  | Visible icon plus accessible name                        | Border and acid color    | Acid outline               | 1px press shift            | Not used                            | Not used                                   | N/A                                  |
| Input        | Labeled search, immediate draft value                    | Stronger border          | Acid outline               | N/A                        | Not used                            | Debounce slot is stable                    | No-results panel below               |
| Secret input | Not applicable                                           | N/A                      | N/A                        | N/A                        | N/A                                 | N/A                                        | N/A                                  |
| Search       | Local draft + 300ms committed filter                     | Border emphasis          | Acid outline               | Clear button available     | Not used                            | No spinner; status region retains geometry | No matching services + clear filters |
| Textarea     | Not applicable                                           | N/A                      | N/A                        | N/A                        | N/A                                 | N/A                                        | N/A                                  |
| Table/list   | Semantic table on desktop; stacked labeled rows at 390px | Row border emphasis      | Native focus on row action | Selected incident in queue | N/A                                 | N/A                                        | No-results state preserves panel     |

## Dataset navigation

- Admin tables: This small fixture renders six service records; no unbounded backend list is implied.
- Exploratory lists: Incident queue renders three active/monitoring fixture signals; no pagination needed for the bounded demo.
- URL state: Not persisted because this prototype has one non-routable demo view and state is intentionally transient/non-shareable.
- Page size: Not applicable.
- Empty/no-results/error/loading treatment: Initial view is populated. Search no-results retains the service surface and offers `Clear filters`; no network loading or server error is implied by deterministic fixtures.
- Back/scroll restoration: Native document scrolling; drawer close restores focus to the triggering control.
- Selection scope: One incident at a time. Arrow keys move the queue selection; the selected incident drives the ribbon label and drawer content.

## Flow ledger

| Operation     | Trigger                                                    | Pending                                        | Success destination  | Success feedback                      | Failure recovery                                  | Focus outcome                       | Source ref              |
| ------------- | ---------------------------------------------------------- | ---------------------------------------------- | -------------------- | ------------------------------------- | ------------------------------------------------- | ----------------------------------- | ----------------------- |
| Open incident | Queue item, ribbon CTA, status CTA, or service next action | Drawer opens immediately from fixture          | Incident drawer      | Selected queue item and ribbon update | N/A — local fixture                               | Close returns focus to trigger      | Prompt 4                |
| Search        | Type in service search                                     | 300ms local commit; draft stays visible        | Same service surface | Result count status                   | No-results clear action                           | Clear returns focus to input        | Premium search contract |
| Environment   | Native environment select                                  | Immediate fixture swap                         | Same overview        | Banner/KPIs update                    | N/A                                               | Native select retains focus         | Prompt 4                |
| Time range    | Native range select                                        | Immediate chart swap                           | Same overview        | Chart labels and ribbon update        | N/A                                               | Native select retains focus         | Prompt 4                |
| Acknowledge   | `Acknowledge incident` in drawer                           | Button remains in place; local fixture updates | Same drawer          | Inline acknowledgement + shared toast | No remote failure in demo scope                   | Focus remains in drawer action area | Prompt 4                |
| Export        | Header `Export`                                            | Browser download starts                        | Same overview        | Shared success toast                  | Browser download failure is outside fixture scope | Focus remains on export button      | Prompt 4                |
| Cancel/back   | Drawer close, Escape, backdrop                             | None                                           | Overview context     | None                                  | N/A                                               | Restore opening control             | Premium drawer contract |

## Navigation and responsive behavior

- Route document title policy: The single view owns `Checkout observability — Lattice Signal`, set in `index.html` and reaffirmed by the app effect.
- Route error / 403 page behavior: Not applicable; no routing, auth, or server boundary.
- Breadcrumb/tab/route-state policy: Breadcrumbs identify the in-product hierarchy; links anchor to the corresponding live surface. No tabs.
- Sidebar/drawer/bottom-sheet transformation: Desktop rail is persistent. At ≤720px it becomes a visibility-controlled overlay menu with scrim, Escape close, focus loop, and trigger restoration. Incident detail is a right-side modal drawer on desktop and full-width drawer on mobile.
- Responsive table strategy: Semantic `<table>` becomes a stacked card per service row with repeated `data-label` headings; all fields and next actions remain available.
- Truncation/full-value access: Important service names, owners, deploys, and evidence wrap; code snippets use `overflow-wrap:anywhere`.
- Focus restoration and sticky-obstruction policy: Focus outlines use the acid token; drawers trap focus and close with Escape; no sticky content covers focused targets.

## Overlays and feedback

- Dialog primitive: `IncidentDrawer` is an app-owned modal drawer with `role="dialog"`, `aria-modal`, labelled heading, backdrop, Escape close, focus containment, internal scroll, and trigger restoration.
- Destructive confirmation levels: No destructive actions exist. Acknowledgement is a reversible local demo state and uses success feedback.
- Toast placement/duration/deduplication: One bottom-right `ToastRegion`, approximately 3.2 seconds, one message at a time.
- Alert/banner scope and persistence: Status banner is page-scoped and persistent while the selected environment is active; drawer inline acknowledgement is persistent for the current fixture state.
- Tooltip delay/dismissal: No tooltip-only information; visible labels carry meaning.
- Unsaved-changes behavior: Not applicable; no forms or drafts.
- Layer/z-index contract: modal drawer/backdrop > mobile navigation > app shell > toast.

## Async and resilience

- Mutation default: Local pessimistic-style acknowledgement semantics; the UI changes only inside the click handler and exposes a stable success result.
- Idempotency and duplicate-submit policy: Acknowledged incidents render a disabled `Incident acknowledged` button; no duplicate action can fire.
- Auto-save/draft recovery: Not applicable.
- Offline/read-stale/write behavior: No network or backend writes; fixture freshness is explicitly labelled.
- Retry/backoff/timeout behavior: Not applicable.
- Version conflict and multi-tab behavior: Not applicable.
- Session expiry/re-authentication: Not applicable; no login wall by requirement.
- Long-running progress and return path: Not applicable.
- Stale-request cancellation/invalidation and pending-state ownership: Local search debounce clears its timer on change; composition state suppresses commit until composition ends.
- Dialog/form preservation and retry after mutation failure: Not applicable to deterministic local acknowledgement.

## Validation

- Schema/validation layer: No product form; native controls are read-only filters.
- Trigger timing: Search commits after 300ms or explicit non-IME Enter.
- Error summary/inline policy: No form errors; no-results is inline and actionable.
- Server error mapping: Not applicable.
- Sensitive-value handling: No secrets or PII; evidence snippets are synthetic and truncated by fixture design.
- `noValidate`, first-invalid focus, duplicate-submit prevention, unsaved changes, and submit recovery: No product form is present; no validation submission occurs.

## Permission and clipboard

- Permission UI strategy: No privileged UI; no auth wall or permission mutation.
- Clipboard copy policy: No copy action; synthetic evidence is visible without implying a secret.
- Disabled-state explanation: Acknowledged state is labelled in the drawer and no longer actionable.

## Verification

- Required static commands: `npm run format:check`, `npm run build`, `python .../audit_project.py ... --mode strict`, and `npx -p @google/design.md designmd lint DESIGN.md`.
- Browser/device/locale/theme matrix: Desktop ~1440px, narrow 390px, keyboard-only drawer/queue/search, reduced-motion media setting, forced-colors static review; English/UTC only.
- Accessibility checks: Native semantics, visible focus, drawer focus loop/Escape, queue arrow navigation, labelled search/clear, table caption/headers, no-results recovery.
- Native-language/domain review and target-user evidence: Fictional English operator copy reviewed against Prompt 4; no external domain policy asserted.
- Component-state/visual regression coverage: Manual browser inspection plus build/static audit; no Storybook or visual runner exists in this new prototype.
- Canonical sibling flow used for comparison: Supplied cypherpunk, brutalism, levels, and kinetic captures; visual synthesis used as reference only.
- Project audit command/result: Run before handoff and report actual output.
- CRUD full-flow evidence: N/A — no CRUD.
- Failure-path evidence: No network failure path in deterministic frontend-only scope; no-results and acknowledgement states are covered.
