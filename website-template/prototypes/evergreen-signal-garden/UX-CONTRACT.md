# UX Contract

## Product context

- **Audience:** Product and platform engineers on a checkout team.
- **Primary jobs:** Establish health, locate the meaningful regression, identify the owner, and take or hand off the next action.
- **Target market(s):** Fictional global SaaS demo; no market-specific data behavior is represented.
- **Active locales:** English (`en`).
- **Language/content register:** Plain operational English; no promotional claims. Native-language review is not applicable to this fictional English-only prototype.
- **Timezone/calendar policy:** Timeline times are deterministic demo-local times; relative ages are labels, not calculations.
- **Accessibility target:** WCAG 2.2 AA baseline.

## Business-context sources

This is a frontend-only fictional prototype with no domain API, permission model, billing, retention, or legal policy. The current task brief and `../observability-design-prompts.md` are the product evidence for the visible demo state.

| Domain / scope                                | Authoritative source                            | Source type           | Reviewed date |
| --------------------------------------------- | ----------------------------------------------- | --------------------- | ------------- |
| Demo workspace, states, and interaction scope | `../observability-design-prompts.md` · Prompt 3 | Current product brief | 2026-09-04    |
| Visual identity and layout direction          | `../observability-design-prompts.md` · Prompt 3 | Current product brief | 2026-09-04    |
| Existing app policy                           | None; standalone prototype                      | Not applicable        | 2026-09-04    |

## Visual contract

- **Project `DESIGN.md`:** `./DESIGN.md`
- **Token ownership model:** `DESIGN.md` owns durable visual intent and normative token values; CSS `:root` in `src/styles.css` is the runtime adapter.
- **Runtime design-system/token source:** `src/styles.css` custom properties.
- **Mapping/export/adapters:** Manual one-to-one mapping documented in `DESIGN.md` and kept in the `:root` token block; capability ownership is machine-readable in `premium-ui.json`.
- **Token drift gate:** `npm run format:check`, then review frontmatter against `src/styles.css:1` when tokens change.
- **Supported themes:** Warm light workspace only; forced-colors fallback preserves system operability.
- **Design-context owner/review policy:** Any future screen reuses the same token names, status language, button intent, drawer behavior, and mobile ordering.

## Canonical UI Map

| Capability     | Canonical owner                        | Source of truth                | Allowed variants       | Verification                      |
| -------------- | -------------------------------------- | ------------------------------ | ---------------------- | --------------------------------- |
| Select/Listbox | Native environment `<select>`          | This contract + `DESIGN.md`    | native                 | Keyboard + visible closed control |
| Date           | Not applicable; range is named buttons | This contract                  | authored range buttons | Keyboard + `aria-pressed`         |
| Scrollbar      | Global application stylesheet          | `DESIGN.md` + `src/styles.css` | no geometry exception  | Computed style / visible scroll   |
| Toast          | Inline shared status region in `App`   | This contract                  | polite inline status   | Live-region inspection            |
| CRUD           | Not applicable; no persisted CRUD      | This contract                  | local demo mutation    | Acknowledge state + feedback      |

## Component behavior

| Component   | Default                                       | Hover           | Focus                | Active                      | Disabled                     | Busy                                              | Error                                                               |
| ----------- | --------------------------------------------- | --------------- | -------------------- | --------------------------- | ---------------------------- | ------------------------------------------------- | ------------------------------------------------------------------- |
| Button      | Soft white or coral by intent                 | Tonal lift      | 3px coral ring       | Pressed tonal state         | Same geometry, lower opacity | Acknowledge keeps width and says `Acknowledging…` | Inline status region explains failure if a future mutation is added |
| Icon button | 36px circular control with name               | Soft white fill | Coral ring           | Darker icon                 | No handler when disabled     | Not used                                          | Not used                                                            |
| Input       | Soft paper field with visible search icon     | Border tone     | Coral ring           | n/a                         | n/a                          | Not remote                                        | Empty/no-result copy stays in the panel                             |
| Search      | Immediate local filter with clear button      | Border tone     | Coral ring           | n/a                         | n/a                          | No remote work                                    | No results offers clear filter                                      |
| Table/list  | Semantic table desktop; priority cards mobile | Row/action tint | Focus ring on action | Selected service is labeled | n/a                          | No async table load                               | Empty attention/filter states are explicit                          |

## Dataset navigation

- **Admin tables:** None; the small deterministic service set is fully rendered.
- **Exploratory lists:** None; no unbounded list is present.
- **URL state:** Not persisted because environment, range, service filter, and attention view are transient demo controls in a standalone prototype.
- **Page size:** Not applicable.
- **Empty/no-results/error/loading treatment:** Search no-results has a clear action; attention-only with no open signal explains acknowledged history. No network loading is implied.
- **Back/scroll restoration:** The evidence drawer restores focus to the triggering service or incident control on close; the document keeps its scroll position.
- **Selection scope:** One incident and one service can be selected. Selection changes the drawer and the SVG connection; it does not silently mutate data.

## Flow ledger

| Operation              | Trigger                               | Pending                                           | Success destination                               | Success feedback                          | Failure recovery                                                                 | Focus outcome                                            | Source ref |
| ---------------------- | ------------------------------------- | ------------------------------------------------- | ------------------------------------------------- | ----------------------------------------- | -------------------------------------------------------------------------------- | -------------------------------------------------------- | ---------- |
| Open incident evidence | Incident card or `Open active signal` | None                                              | Non-modal evidence drawer                         | Inline polite status                      | N/A in local demo                                                                | Drawer close button receives focus                       | Prompt 3   |
| Open service evidence  | SVG node, mobile node, or table row   | None                                              | Non-modal evidence drawer                         | Inline polite status                      | N/A in local demo                                                                | Drawer close button receives focus                       | Prompt 3   |
| Acknowledge incident   | Drawer or incident row action         | Button remains in place and says `Acknowledging…` | Same drawer, incident status becomes Acknowledged | Inline polite status names the incident   | Local state is unchanged until completion; button remains disabled while pending | Focus remains on drawer action                           | Prompt 3   |
| Change environment     | Native environment select             | None                                              | Same workspace, visible data context updates      | Inline status names environment and range | N/A in local demo                                                                | Native select retains focus                              | Prompt 3   |
| Change time range      | Authored range button group           | None                                              | Same trend panel with new deterministic series    | Inline status names selected range        | N/A in local demo                                                                | Selected range button retains focus                      | Prompt 3   |
| Search/filter services | Search field and clear button         | Immediate local filter                            | Garden and evidence index update                  | Result count updates inline               | Clear filter                                                                     | Input retains focus; clear refocus is native button flow | Prompt 3   |
| Toggle attention view  | Switch-like checkbox                  | None                                              | Garden, incident queue, and evidence index filter | Inline status explains hidden states      | Toggle off restores all                                                          | Checkbox retains focus                                   | Prompt 3   |
| Close evidence         | Drawer close / `Close evidence`       | None                                              | Workspace                                         | No extra status                           | N/A                                                                              | Focus returns to trigger                                 | Prompt 3   |

## Navigation and responsive behavior

- **Route document title policy:** `document.title` is `Production checkout health · Lattice Signal` or `Staging checkout health · Lattice Signal` based on the environment control.
- **Route error / 403 page behavior:** Not applicable; there are no routes or authorization states.
- **Breadcrumb/tab/route-state policy:** The workspace header and eyebrow establish scope; top links are in-page anchors.
- **Sidebar/drawer/bottom-sheet transformation:** The top navigation becomes an explicit menu at 920px. The evidence drawer remains non-modal on desktop and becomes a full-width fixed evidence surface on mobile.
- **Responsive table strategy:** Semantic table on desktop; priority cards on mobile retain service, status, owner, p95, deploy age, and next step.
- **Truncation/full-value access:** Service names remain in full where possible; code evidence wraps; deploy names remain accessible in the drawer.
- **Focus restoration and sticky-obstruction policy:** Fixed header and drawer do not obscure focused content; closing the drawer restores the triggering control.

## Overlays and feedback

- **Dialog primitive:** App-owned persistent/non-modal drawer (`role="dialog"`, `aria-modal="false"`); no background inerting or focus trap is claimed.
- **Destructive confirmation levels:** None; acknowledging a local demo incident is reversible and does not require confirmation.
- **Toast placement/duration/deduplication:** No transient toast. One inline `role="status"` region near the workspace toolbar persists the latest meaningful feedback.
- **Alert/banner scope and persistence:** Health summary and status labels persist while true; feedback region reflects the latest control outcome.
- **Tooltip delay/dismissal:** No essential information is tooltip-only.
- **Unsaved-changes behavior:** Not applicable.
- **Layer/z-index contract:** Header 20, drawer 40; no nested popover is used.

## Async and resilience

- **Mutation default:** Local acknowledge mutation is pessimistic-shaped: button enters a bounded pending state, then commits local state.
- **Idempotency and duplicate-submit policy:** Acknowledged incidents cannot be acknowledged again; pending button is disabled.
- **Auto-save/draft recovery:** Not applicable.
- **Offline/read-stale/write behavior:** No remote connection is implied; footer states that this is deterministic demo data.
- **Retry/backoff/timeout behavior:** Not applicable.
- **Version conflict and multi-tab behavior:** Not applicable.
- **Session expiry/re-authentication:** Not applicable; there is no login wall.
- **Long-running progress and return path:** Not applicable.
- **Stale-request cancellation/invalidation and pending-state ownership:** No remote requests; local filter is synchronous.
- **Dialog/form preservation and retry after mutation failure:** No remote failure path exists in this frontend-only demo.

## Validation

- **Schema/validation layer:** Not applicable; no product form.
- **Trigger timing:** Immediate for local controls.
- **Error summary/inline policy:** Search and attention view have explicit empty/no-results copy.
- **Server error mapping:** Not applicable.
- **Sensitive-value handling:** No sensitive values are collected or persisted.
- **`noValidate`, first-invalid focus, duplicate-submit prevention, unsaved changes, and submit recovery:** Not applicable; no form submission exists.

## Permission and clipboard

- **Permission UI strategy:** Not applicable; the demo is intentionally open.
- **Clipboard copy policy:** No copy action is exposed; code-like evidence is readable text only.
- **Disabled-state explanation:** The only disabled state is pending acknowledgment, whose button label communicates the reason.

## Verification

- **Required static commands:** `npm run format:check`, `npm run typecheck`, `npm run build`, and the frontend-design-premium `audit_project.py` strict audit.
- **Browser/device/locale/theme matrix:** Desktop width and 390px mobile width; warm light and forced-colors/reduced-motion source paths.
- **Accessibility checks:** Semantic buttons/links/select/input, visible focus, `aria-pressed`, drawer labeling, status live region, and mobile priority order.
- **Native-language/domain review and target-user evidence:** Not applicable to fictional English-only demo.
- **Component-state/visual regression coverage:** Manual browser inspection of default, staging, time-range, attention-only, no-results, selected drawer, acknowledged drawer, and mobile states.
- **Canonical sibling flow used for comparison:** Local reference captures under `organic/application` and `charm/application` informed context header, KPI, and evidence density; the signal garden is bespoke to this direction.
- **Project audit command/result:** `python .../audit_project.py . --mode strict` after dependencies are installed.
- **CRUD full-flow evidence:** Not applicable.
- **Failure-path evidence:** Not applicable to local deterministic data; no network failure is represented.
