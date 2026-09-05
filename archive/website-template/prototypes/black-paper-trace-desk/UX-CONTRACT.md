# UX Contract

## Product context

- **Audience:** Product and platform engineers.
- **Primary jobs:** Read checkout health, identify a change/regression, and open linked evidence.
- **Target market(s):** Fictional global SaaS demo; no production account or PII is represented.
- **Active locales:** English; all demo timestamps are explicitly UTC.
- **Language/content register:** Plain operational language, sentence case; no marketing claims in the workspace.
- **Accessibility target:** WCAG 2.2 AA baseline.

## Business-context sources

The current-task brief is the only authoritative product source for this frontend-only prototype. It requires a populated checkout workspace, deterministic demo data, a trace desk, service evidence, real responsive interactions, and no login/setup wall. There is no API, permission, billing, deletion, or legal workflow in scope.

| Domain / scope                  | Authoritative source                               | Source type           | Reviewed date |
| ------------------------------- | -------------------------------------------------- | --------------------- | ------------- |
| Workspace behavior and content  | `../../observability-design-prompts.md` → Prompt 1 | Current product brief | 2026-09-04    |
| Visual direction and scan order | `../../pattern-synthesis.md`                       | Maintained synthesis  | 2026-09-04    |

## Visual contract

- **Project `DESIGN.md`:** `DESIGN.md`
- **Token ownership model:** Existing runtime CSS is canonical; `DESIGN.md` mirrors the accepted values.
- **Runtime source:** `src/styles.css` `:root` custom properties.
- **Mapping:** `DESIGN.md` frontmatter → matching CSS custom property roles → `src/App.tsx` components.
- **Token drift gate:** Review token pairs and run `npm run format:check` plus `npm run build` after token changes.
- **Supported themes:** One warm paper/charcoal theme; forced-colors hands contrast back to the platform.

## Canonical UI Map

| Capability               | Canonical owner                                         | Source of truth             | Allowed variants                  | Verification                        |
| ------------------------ | ------------------------------------------------------- | --------------------------- | --------------------------------- | ----------------------------------- |
| Select/Listbox           | Native `<select>` in workspace header                   | `DESIGN.md` + this contract | native                            | Keyboard and popup inspection       |
| Scrollbar                | Global application stylesheet                           | `DESIGN.md`                 | stable gutter on desktop table    | Computed style / browser inspection |
| Status feedback          | Inline `role="status"` region in `App` and incident row | this contract               | inline / live region              | Acknowledge interaction             |
| Drawer                   | `EvidenceDrawer` in `src/App.tsx`                       | this contract               | persistent app-owned drawer       | Keyboard, Escape, focus return      |
| Read-only evidence table | Semantic `<table>` plus mobile priority-card variant    | this contract               | desktop table / mobile disclosure | Narrow viewport and keyboard        |

Table selection, CRUD, date pickers, authored comboboxes, upload, and destructive confirmation are not applicable to this prototype.

## Component behavior

- Buttons use native semantics, visible hover/focus/pressed/disabled states, and stable dimensions. Icon-only buttons have accessible names.
- Search is local and immediate. A non-empty query exposes an app-owned clear button that clears the field and restores all matching services. No remote request is made.
- Native environment and range selects update visible metrics, chart values, workspace context, and live status copy.
- Service filters are mutually exclusive `All`, `Needs attention`, and `Healthy` buttons with `aria-pressed`.
- Incident, trace span, chart marker, and service controls select the evidence subject and open the drawer. Selection is never hover-only.
- Acknowledge is a local, idempotent UI action: the button becomes disabled `Acknowledged`, the incident row gets inline confirmation, the drawer footer updates, and the live status region announces the same action.

## Flow ledger

| Operation                | Trigger                               | Pending                                  | Success destination      | Success feedback                        | Failure recovery                          | Focus outcome                         |
| ------------------------ | ------------------------------------- | ---------------------------------------- | ------------------------ | --------------------------------------- | ----------------------------------------- | ------------------------------------- |
| Environment change       | Header select                         | None; deterministic local update         | Same workspace           | Live status announces environment       | Not applicable                            | Select keeps focus                    |
| Time range change        | Header select                         | None; deterministic local update         | Same workspace           | Live status announces range             | Not applicable                            | Select keeps focus                    |
| Search/filter            | Service field or filter button        | None; local render                       | Same evidence panel      | Result count updates                    | Reset view clears query/filter            | Input/button keeps focus              |
| Incident/trace selection | Feed row, chart marker, or trace span | Drawer open transition                   | Evidence drawer          | Drawer title and linked evidence update | Close and retry by selecting another item | Drawer close returns focus to trigger |
| Acknowledge incident     | `Acknowledge` button                  | Button preserves footprint; local update | Same feed/drawer context | Inline status plus live announcement    | Idempotent disabled state                 | Action retains focus                  |
| Close drawer/menu        | Close button, scrim, or Escape        | None                                     | Overview context         | No toast                                | Reopen from original trigger              | Focus returns to trigger              |

## Navigation and responsive behavior

- **Document title:** `Checkout Observatory — Lattice Signal`; set by `App` on mount. This prototype has one route.
- **Sidebar:** Persistent desktop rail becomes a real overlay dialog navigation menu below 840px. The menu traps focus, closes on Escape/scrim/close button, and restores focus to the menu trigger.
- **Responsive table:** Desktop uses a semantic service/endpoint table with a deliberate minimum width and visible scrollbar ownership. At 560px it is replaced by independently understandable priority cards with explicit disclosure and “Open trace evidence”.
- **Ordering:** At narrow widths the scan order is insight → KPIs → trace desk → trend → incidents → service evidence. No columns are clipped.
- **Truncation:** Primary names wrap or ellipsize only where the full value remains available through the drawer/disclosure; no essential action depends on hover.

## Overlays and feedback

- **Drawer primitive:** `EvidenceDrawer` uses `role="dialog"`, `aria-modal="true"`, labeled title/summary, a bounded internal scroller, scrim close, Escape close, focus trap, and trigger focus restoration.
- **Feedback:** One polite live status region plus persistent inline acknowledgement state; no browser alerts or transient-only critical feedback.
- **Layer order:** Scrim 30, menu/drawer 31; header popover remains in the page layer and closes through its own toggle.
- **Motion:** CSS transitions are brief and fully reduced under `prefers-reduced-motion: reduce`.

## Async and resilience

This is deterministic frontend-only state with no network or persistence. There are no stale remote requests, offline writes, conflicts, sessions, or long-running jobs. Acknowledge is local and idempotent; changing filters cannot strand a paged list because no pagination is used.

## Verification

- **Static:** `npm run format:check`, `npm run typecheck`, `npm run build`.
- **Project audit:** `python /Users/speedpowermac/.codex/plugins/cache/openai-curated-remote/frontend-design-premium/1.4.0/skills/frontend-design-premium/scripts/audit_project.py . --mode strict`.
- **Browser matrix for parent QA:** desktop wide, 390px narrow, keyboard focus/Escape drawer and menu, search clear/no-results, environment/range changes, incident/trace/service selection, acknowledge feedback, and reduced-motion preference.
- **Canonical sibling flow:** None; this is a new standalone prototype. The current-task prompt and local pattern synthesis are the comparison sources.
