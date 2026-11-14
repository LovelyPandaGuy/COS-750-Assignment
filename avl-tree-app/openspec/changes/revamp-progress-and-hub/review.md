# Review notes: revamp-progress-and-hub

## Build (tasks 1 and 2)

- **Red tests (task 1.3).** Unit tests failed only in the three new files under `tests/ui/progress/` and the contract counts. The visual suite failed only in `tests/visual/progress.spec.ts` (11 cases, 30 others passed). At the user's choice, the red tests were not committed.
- **Test edit during build (role crossing, flagged).** `hub.test.tsx` "D27 calm markup" scanned raw HTML for "locked", while the same file requires `data-state="locked"`, so the two tests contradicted each other. The check now covers text, `aria-label` and `title`, which is what a student sees or hears (D27). This was a test-writer edit, not an implementer edit.
- **Existing rules the new files had to meet:**
  - `tests/routes.test.ts`: the gallery now uses `paths` from `src/routes`;
  - `tests/ui/breakpoints.test.ts`: no width numbers outside `breakpoints.ts`, so a comment was reworded.
- **New baselines:**
  - `progress-{light,dark}-{phone,tablet,desktop}`;
  - `progress-greyscale-desktop`;
  - `progress-menu-phone-open-phone`.
- **Regenerated baselines (the gallery page grew):** `gallery-{light,dark}-{phone,tablet,desktop}` and `gallery-greyscale-desktop`.
  - Old height to new: phone 9948 to 15190, tablet 6196 to 10822, desktop 5122 to 7812.
  - Above the old height, phone is pixel-identical.
  - Tablet and desktop also differ in one 190 by 155 px block: the base gallery's sample tree. The old baseline still showed the pre-D97 tree ("h1 · bf 0", outline rings) and had passed only because the block is under the 0.1% tolerance. The new baseline shows the D97 tree the page already draws. This change did not cause the difference.
- **Checks:** `npm test` 1038 passed; typecheck, lint and build clean; `npm run test:visual` 41 passed; `openspec validate --all` 31 passed.

## Critique (task 3.1, read-only)

Every gallery state was scored at 390, 768 and 1366 px in light and dark, with greyscale and deuteranopia, protanopia and tritanopia at 1366. The menu was checked open, in the page at 768 and 1366 and in the cell at 390. Screenshots are in the session scratchpad (`prog/`).

| # | Finding | Quality bar | Severity |
| --- | --- | --- | --- |
| P1 | A locked lesson's reason is a third flex child beside the title column, not under it. At 390 and in the 768 menu this squeezes the title to half width; in the 1366 row it shrinks the title and reason to two slivers of 2 to 3 letters. | 1, 4 | major |
| P2 | `overflow-wrap: anywhere` on titles and reasons splits words mid-word in the 1366 row ("Exampl / e lesson"). | 4, 10 | major |
| P3 | At 1366, the compact MasteryBadge under C2 ("Developing") overflows into C3's column. | 4 | minor |
| P4 | The summary link has the same dashed border as an open lesson, so in greyscale it reads as one more lesson in the open state. | 7 | minor |

**Passes:**
- **States (quality bar 7):** the four states differ by word, symbol and border style (solid, thick, dashed, dotted) in greyscale and in all three colour-vision simulations. Done stays neutral ink in light and dark; the badges are separate.
- **Size and fit (quality bars 4 and 8):** no horizontal scroll at the three widths (tests), targets of at least 44 px, and running text of at least 16 px.
- **Menu at a glance:** at 390 the panel is in the flow at full width; from 768 it is anchored under the button, elevated, and inside the viewport.
- **Start and hub:** one primary action each; the privacy notice is always visible text; nothing reads as a score or a fail.
- **Quality bar 9:** no transitions, so nothing slides.
- **Quality bar 2:** tokens only (lint).
- **Quality bar 1:** the components follow frame 1e (map, card, phases, sandbox and lecture-question cards) and frame 1b (panel, ResumeCard, privacy, reset), except the deliberate departures in proposal questions 2, 7 and 8.

## Polish (task 3.2)

- **P1, fixed (`LessonLink.tsx` markup):** the reason is inside the text column, under the state word and the optional word. It is still the accessible description of the item.
- **P2, fixed:** `overflow-wrap: break-word` replaces `anywhere`. In the 1366 row, the symbol sits above the text and the side padding is `--space-2`, so words stay whole.
- **P3, fixed:** the mastery column can wrap and has no left padding in the row.
- **P4, fixed:** the summary has a 4 px double border, a style no lesson state uses.
- **Re-checked** at 390 (dark), 768 (menu open in the page) and 1366 (light and achromatopsia).
- **Baselines regenerated** for the intended look: the 8 progress baselines and the 7 gallery baselines (the gallery page includes this section).
- **Checks:** `npm test` 1038 passed; typecheck, lint and build clean; `npm run test:visual` 41 passed; `openspec validate revamp-progress-and-hub --strict` valid.

**Quality bar after polish:**

| # | Result | Basis |
| --- | --- | --- |
| 1 | pass | Frames 1b and 1e, with the departures recorded in proposal questions 2, 7 and 8. |
| 2 | pass | Lint. |
| 3 | pass | Default, hover (title underline), focus (base ring), the four lesson states, and disabled (locked) present. |
| 4 | pass | Three widths. |
| 5 | pass | axe in the unit tests. |
| 6 | pass, pending the a11y-checker | Keyboard tests. |
| 7 | pass | Greyscale and colour-vision simulations. |
| 8 | pass | Visual test. |
| 9 | pass | No transitions. |
| 10 | pass | No locked, fail, wrong or score words from the components. |
