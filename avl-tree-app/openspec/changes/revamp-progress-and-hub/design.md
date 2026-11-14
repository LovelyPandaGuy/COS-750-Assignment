# Design: revamp-progress-and-hub

## Context

See `proposal.md` for the reasons and the open questions; this file covers how. What exists today:

- **Pages.** `src/pages/Start.tsx` and `src/pages/Hub.tsx` use first-pass components in `src/components/` (ProgressMap, ResumeCard, ActivityList, ConfirmDialog). Those read `src/content/` and `src/routes` directly. The contracts point ProgressMap, ResumeCard and ActivityList at them.
- **Stubs.** StartPanel, PrivacyNotice, ResetProgressLink, UnitCard, SandboxCard, LectureQuestionsCard and PathModeToggle are stubs in `src/ui/stubs/`, with narrow props in `src/ui/contracts.ts`.
- **ConfirmDialog** already traps focus, starts on Cancel and closes on Escape (wireframe 1b note 4). It is reused as it is.
- **TopBar** has `progress` (in a `nav` named by `progressLabel`, D117) and `actions` slots. Both are used unchanged.
- **Tokens.** `tokens.css` has the neutral ink and border tokens and the `--mastery-*` tokens. No new token is needed.
- **Copy.** The D3 start copy already exists in `src/content/start.ts` and is not changed.

## Goals / Non-Goals

**Goals:**
- Every Start, hub and navigation state can be drawn from props alone, so the later policy and wiring change only computes inputs.
- Each component state can be checked in the gallery at three widths and in two themes.

**Non-Goals:**
- Any policy, storage or routing code.
- Changes to `src/components/`, `src/pages/` or `src/ui/base/`.

## Decisions

1. **One state type, `LessonState = 'done' | 'current' | 'open' | 'locked'`, owned by `src/ui/progress/types.ts`.** It is shared by the map, menu, unit card and the activity list's own `PhaseState = 'done' | 'next' | 'to-do'`. Each item is `{ id, title, state, href, optional?, reason?, mastery? }`. `reason` is required by type when the state is `locked` (a discriminated union), so a locked item cannot render without its text.
   - *Alternative:* D20's `upcoming`/`later`. Rejected, because it cannot express the ID's locked lessons.
   - *Alternative:* a boolean `locked` beside the state. Rejected, because it allows contradictions such as done and locked.
2. **Words come in one `labels` object per component** (state words, symbols, optional word, headings and button labels), following the `learn` components' pattern. Symbols are text in the labels (for example ✓, ▶, ○, ◌), so they are never icon-only and never the only signal.
3. **A locked item is an `<a aria-disabled="true">` without `href`, made focusable with `tabIndex=0`.** Its reason is visible in a `<span id>` and referenced by `aria-describedby`. A click or Enter is prevented. This meets "reachable by keyboard" and "announces why".
   - *Alternative:* a disabled `<button>`. Rejected, because it cannot be focused, so the reason would never be announced.
4. **ProgressMap is an `<ol>` inside a `nav` named by its label.** Direction is CSS only: `flex-direction: column` by default, and `row` inside `@media (min-width: 1366px)`. The last item is the summary link (from props). The border style lives on `[data-state]`:

   | State | Border |
   | --- | --- |
   | done | solid |
   | current | thick (`--border-strong` width) |
   | open | dashed |
   | locked | dotted |

   Done uses `--text-primary` and `--border-default` only. The MasteryBadge sits in its own row under the item, never inside the done ring.
5. **LessonMenu is a disclosure button plus a panel, not a menu role** (`role="menu"` would need arrow-key roving and would hide links from Tab).
   - The panel holds a `nav` with the same item renderer as the map.
   - In the page flow, the panel is a sibling rendered right after the button. At 390 px it spans the content width; from 768 px it is absolutely positioned under the button, with `max-inline-size: 100vw - gutters` (proposal question 4).
   - Escape is handled on the panel and the button. On close, focus goes to the button only if focus was inside the panel.
   - Following a link calls `onNavigate` (optional) and closes the panel.
6. **LessonProgress is `<p>{label}</p>` plus a `<span aria-hidden>` track and fill**, the fill sized by `inline-size: calc(100% * completed / total)` through a style custom property. A `<progress>` element was rejected: its styling differs per browser, and it would announce a second percentage beside the label.
7. **ResetProgressLink owns the dialog's open state.** Props are `{ label, dialog: { title, body, cancelLabel, confirmLabel }, onReset }`. It renders the existing ConfirmDialog only while open, and keeps a ref to its trigger to return focus on cancel. The body comes from the screen; the dialog's description test uses fixture text, and one content test checks that the real `startCopy` body names what is erased.
8. **StartView and HubView compose the parts and hold no state of their own.**
   - StartView takes `panel`, an optional `resume`, `privacy` and `reset`. It renders ResumeCard only when `resume` is given.
   - HubView takes `map`, `current` (UnitCard plus phases plus the continue action), `sandbox` and `lectureQuestions`. Its grid is `1fr` with a 360 px side column from 1366 px (wireframe 1e), stacked below that.
9. **Contracts** (proposal question 1):
   - Widen the six stub interfaces into `ComponentProps<typeof X>` re-exports from `src/ui/progress/`, and move them to BUILT (25 and 20).
   - Repoint ProgressMap, ResumeCard and ActivityList to `src/ui/progress/`. Pages import the old files by path, so they are unaffected.
   - Delete the six stubs and their index lines.
   - StartView, HubView, LessonProgress and LessonMenu stay out of the contracts (proposal question 10).
10. **Gallery.** `src/ui/progress/ProgressGallery.tsx` shows every state with fixture text ("Example …") inside a `MemoryRouter`, mounted by one line in `src/gallery/Gallery.tsx`, as LearnGallery is. `tests/visual/progress.spec.ts` checks widths, targets, text size and greyscale, and takes screenshots, following `tests/visual/learn.spec.ts`.

## Risks / Trade-offs

- [Two components share a name (ProgressMap, ResumeCard, ActivityList) until wiring] → The contracts point at the new ones, and the old ones are imported by path only. The wiring change deletes the old ones. This is recorded in the proposal (question 12) and in the follow-up.
- [The pages still say "Nothing is locked" (the `module-hub` spec) while this change draws locks] → Nothing here reaches a page. The policy change modifies `module-hub` and supersedes D20 in one place.
- [A focusable `aria-disabled` link can confuse a few screen readers] → The reason text is visible and in the description, so the meaning is always available. The a11y-checker listens in task 4.1.
- [The menu panel pushes content down on a phone] → This is chosen deliberately over a drawer that covers the tree (ID 8.3, the tree is the largest region). It is closed by default, and Escape closes it.
- [Ten items in a column make the hub long on a phone] → Each item is one line (ID, title, state word) with its reason on a second line only when locked. The UnitCard follows directly after.
