# UX Contract

## Product context

- **Audience:** Product and platform engineers reviewing a checkout workspace.
- **Primary jobs:** Confirm health, isolate the meaningful regression, connect a time range to services/traces, and acknowledge the incident.
- **Target market(s):** Fictional global developer-tooling product.
- **Active locales:** English UI; UTC is always explicit in evidence timestamps.
- **Language/content register:** Plain operational English; no marketing claims inside the workspace.
- **Timezone/calendar policy:** Demo telemetry is labelled UTC; no date picker is in scope.
- **Accessibility target:** WCAG 2.2 AA baseline.

## Business-context sources

This prototype has no backend, permission system, billing surface, retention policy, or legal flow. The current task brief is the authoritative business/design source.

| Domain / scope                                   | Authoritative source                            | Source type          | Reviewed date |
| ------------------------------------------------ | ----------------------------------------------- | -------------------- | ------------- |
| Product behavior and checkout demo               | `../observability-design-prompts.md` (Prompt 2) | Current task brief   | 2026-09-04    |
| Permission model                                 | Not applicable; read-only fictional demo        | Scope decision       | 2026-09-04    |
| Data lifecycle / deletion / billing / legal copy | Not applicable; no such UI or mutation          | Scope decision       | 2026-09-04    |
| Market and content conventions                   | Current task brief and `DESIGN.md`              | Product/design brief | 2026-09-04    |

## Visual contract

- **Project `DESIGN.md`:** [`DESIGN.md`](./DESIGN.md)
- **Token ownership model:** `DESIGN.md` is normative for this new prototype.
- **Runtime source:** `src/styles.css`, `:root` semantic variables.
- **Mapping:** `DESIGN.md` “Token mapping” table → CSS variables → `App.jsx` component classes.
- **Token drift gate:** `npx -p @google/design.md designmd lint DESIGN.md`; compare changed variables to the table; run the premium audit manifest.
- **Supported themes:** Light only; forced-colors behavior remains platform-owned.

## Canonical UI Map

| Capability      | Canonical owner                                                  | Source of truth                           | Allowed variants                             | Verification                |
| --------------- | ---------------------------------------------------------------- | ----------------------------------------- | -------------------------------------------- | --------------------------- |
| Table Selection | `ServiceEvidenceTable` behavior in `src/App.jsx`                 | This contract and the task brief          | row/detail trigger; priority-card equivalent | keyboard + browser QA       |
| Select/Listbox  | Native `<select>` in the workspace control strip                 | This contract; platform popup is accepted | native                                       | keyboard + browser QA       |
| Date            | Not applicable; no date picker surface                           | This contract                             | none                                         | not applicable              |
| Form            | Not applicable; no product form surface                          | This contract                             | none                                         | not applicable              |
| Scrollbar       | Global baseline in `src/styles.css`                              | `DESIGN.md` + this contract               | `scrollbar-gutter` on table overflow only    | computed style + browser QA |
| Toast           | `toast` state and live region in `src/App.jsx`                   | This contract                             | success / info / danger                      | live-region + browser QA    |
| CRUD            | Not applicable; acknowledge is a bounded demo mutation, not CRUD | This contract                             | none                                         | not applicable              |

## Component behavior

| Component   | Default                                         | Hover                               | Focus                 | Active                                    | Disabled                           | Busy                     | Error                                  |
| ----------- | ----------------------------------------------- | ----------------------------------- | --------------------- | ----------------------------------------- | ---------------------------------- | ------------------------ | -------------------------------------- |
| Button      | Native button with labelled action              | Border/background shift             | 3px lavender outline  | Cobalt/selected surface                   | Reduced opacity, no handler effect | Fixed geometry + spinner | Toast or inline status                 |
| Icon button | Named via `aria-label`                          | Surface tint                        | Same visible outline  | Selected surface where applicable         | Reduced opacity                    | Not used                 | Toast if action cannot complete        |
| Input       | Local value updates immediately                 | —                                   | Border + outline      | —                                         | —                                  | No remote loading        | No-results state below table           |
| Search      | Labelled local service filter with custom clear | Clear action visible when non-empty | Input focus ring      | —                                         | —                                  | No remote request        | “No services match” with clear filters |
| Table/list  | Native table, ranked by p95                     | Row surface tint                    | Button/action outline | Selected row edge + mobile card highlight | —                                  | Not used                 | Empty/no-results recovery              |

## Dataset navigation

- **Admin tables:** This static service list is intentionally bounded to seven demo records and renders all matching records.
- **Exploratory lists:** Not applicable.
- **URL state:** Override for this single-route frontend-only demo: environment, time range, search, filter, sort, and selected range remain local state because there is no router or shareable backend record.
- **Page size:** No pagination for the bounded demo set.
- **Empty/no-results/error/loading:** No-results has an explicit clear-filters action; the initial page is deterministically populated; acknowledge has a bounded pending state and success state; no remote loading or server error exists in scope.
- **Back/scroll restoration:** Native browser scrolling remains the page owner; hash links move to the relevant workspace section.
- **Selection scope:** One selected range and one selected service at a time. The active range affects the table highlight and rail labels; opening a row selects its related range and opens the same detail drawer. No bulk selection exists.

## Flow ledger

| Operation            | Trigger                                       | Pending                       | Success destination           | Success feedback                            | Failure recovery                                                                       | Focus outcome                       | Source ref |
| -------------------- | --------------------------------------------- | ----------------------------- | ----------------------------- | ------------------------------------------- | -------------------------------------------------------------------------------------- | ----------------------------------- | ---------- |
| Search               | Type in “Search services”                     | None; local result update     | Same service evidence section | Live result count                           | Clear filters button                                                                   | Clear returns focus to input        | Prompt 2   |
| Filter               | “All services / Impacted only”                | None                          | Same table/card surface       | Result count updates                        | Toggle off                                                                             | Focus stays on filter               | Prompt 2   |
| Select range         | Chart, range preset, rail, or “Open evidence” | None                          | Evidence drawer opens         | Linked range label and affected rows update | Close drawer                                                                           | Focus returns to triggering control | Prompt 2   |
| Select service       | Service row/card or latency row               | None                          | Evidence drawer opens         | Related range and deployment update         | Close drawer                                                                           | Focus returns to triggering control | Prompt 2   |
| Acknowledge incident | “Acknowledge incident” in detail drawer       | Button stays stable for 620ms | Same detail drawer            | Inline success state + polite toast         | Demo does not simulate server failure; button remains safe and no duplicate activation | Focus stays in drawer               | Prompt 2   |
| Cancel/back          | Close button, scrim, or Escape                | None                          | Previous workspace view       | None                                        | Drawer remains closed                                                                  | Focus returns to opener             | Prompt 2   |

## Navigation and responsive behavior

- **Route document title policy:** The single route sets `document.title` to `Checkout health — Lattice Signal` on mount and the HTML fallback uses the same title.
- **Route error / 403 behavior:** Not applicable; no router, auth, or server routes.
- **Breadcrumb/tab/route-state policy:** Breadcrumbs are static workspace hierarchy; hash links target real sections. No tabs.
- **Sidebar/drawer transformation:** Persistent left rail at desktop; at 820px it becomes a modal focus-trapped navigation drawer with Escape, scrim close, and focus restoration.
- **Responsive table strategy:** At 600px the table becomes stacked priority cards. Every card keeps service, status, owner, deployment, p95, error budget, and an explicit evidence action. A visible cue explains the transformation.
- **Truncation/full-value access:** Important service/deploy identifiers are wrapped or exposed in the detail drawer; ellipsis is used only for secondary labels with a full-value action nearby.
- **Focus restoration and sticky-obstruction policy:** Drawer close returns focus to the triggering control. Drawer actions are inside a sticky footer. Page content uses normal document scrolling with visible themed scrollbars.

## Overlays and feedback

- **Dialog primitive:** App-owned modal detail drawer in `src/App.jsx`; `role="dialog"`, `aria-modal`, Escape, focus containment, background inertness, and a labelled close control.
- **Destructive confirmation levels:** None; the demo is read-only and acknowledge is reversible/low-risk.
- **Toast placement/duration/deduplication:** One bottom-right live region, bottom-left on mobile; one message at a time, auto-dismissed after 3.8s, with an explicit dismiss button.
- **Alert/banner scope and persistence:** Insight banner is page-scoped and persistent; acknowledge success is drawer-scoped and persistent while the drawer is open.
- **Tooltip delay/dismissal:** No tooltip-only information is used; icon-only controls have accessible names.
- **Unsaved-changes behavior:** Not applicable.
- **Layer/z-index:** Detail drawer and its scrim sit above mobile navigation; toast sits above both.

## Async and resilience

- **Mutation default:** Pessimistic simulated acknowledge; success is shown only after the bounded demo delay.
- **Idempotency and duplicate-submit policy:** Acknowledge disables during the pending window and becomes a success state after completion.
- **Auto-save/draft recovery:** Not applicable.
- **Offline/read-stale/write behavior:** All telemetry is local deterministic demo data; the footer labels it simulated.
- **Retry/backoff/timeout behavior:** Not applicable; no remote request.
- **Version conflict and multi-tab behavior:** Not applicable.
- **Session expiry/re-authentication:** Not applicable; there is no login/setup wall.
- **Long-running progress and return path:** Not applicable.
- **Stale-request cancellation/invalidation:** No remote request; local filter is synchronous.
- **Dialog/form preservation and retry after mutation failure:** Drawer stays open during acknowledge; no failure path is simulated in the first pass.

## Validation

- **Schema/validation layer:** Not applicable; no form.
- **Trigger timing:** Not applicable.
- **Error summary/inline policy:** No form errors; no-results and status feedback are inline and labelled.
- **Server error mapping:** Not applicable.
- **Sensitive-value handling:** No secrets, tokens, or PII are used.
- **`noValidate`, first-invalid focus, duplicate-submit prevention, unsaved changes, and submit recovery:** No product form; duplicate acknowledge is prevented.

## Permission and clipboard

- **Permission UI strategy:** No permissions in scope; all evidence is labelled read-only.
- **Clipboard copy policy:** Trace buttons announce a simulated trace-explorer handoff; no secret or raw backend value is copied.
- **Disabled-state explanation:** Pending acknowledge communicates its state in text and retains button geometry.

## Verification

- **Required static commands:** `npm run format:check`, `npm run typecheck`, `npm run build`, `python .../audit_project.py . --mode strict`, and `npx -p @google/design.md designmd lint DESIGN.md`.
- **Browser/device/locale/theme matrix:** Desktop width around 1440px and 390px mobile; keyboard focus; reduced motion; forced-colors inspection where available. English/UTC only.
- **Accessibility checks:** Native semantics, labelled controls, visible focus, modal drawer Escape/focus restoration, search clear, status text, and responsive card equivalence.
- **Native-language/domain review and target-user evidence:** Not applicable for fictional English-only demo; the current task brief is the product evidence.
- **Component-state/visual regression coverage:** Manual browser QA is the first-pass coverage; no test runner exists in this prototype.
- **Canonical sibling flow used for comparison:** Supplied Atlas, Cream, and Executive application captures for shell density, KPI rhythm, table framing, and activity feed patterns.
- **Project audit command/result:** Run before handoff and report the actual JSON summary.
- **CRUD full-flow evidence:** Not applicable.
- **Failure-path evidence:** No backend failure path is in scope; no-results and bounded mutation feedback are covered.
