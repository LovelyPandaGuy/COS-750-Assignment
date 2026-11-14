# Review notes: add-ui-foundation

These are the quality-bar results (`.claude/docs/design/quality-bar.md`) for the gallery and the base components, as of 13 Nov. The main session ran them in-session, because `.claude/agents/` does not define the reviewer and a11y-checker subagents.

| # | Check | Result | How |
| --- | --- | --- | --- |
| 1 | Matches the screen spec | n/a | No screen in this change; components follow design system section 04, with gaps D117 to D120 |
| 2 | Tokens only | pass | `npm run lint` (stylelint, D124) and `tests/ui/base/base-css.test.ts` |
| 3 | Every state exists | pass | Gallery: Button default, hover, focus, pressed and disabled per variant; chip static, link, hover, button and disabled; badge per state, compact, with change |
| 4 | 390, 768 and 1366 px, no horizontal scroll | pass | `npm run test:visual`, 7 baselines (macOS, D122) |
| 5 | axe | pass | `tests/ui/base/*`, `tests/ui/contracts.test.tsx`, `tests/ui/shell.test.tsx` |
| 6 | Keyboard only | partly checked | Tab order in the gallery is row by row and skips disabled buttons; Enter and Space activate (Playwright). Still to do: your full keyboard-only run |
| 7 | Not colour alone; greyscale and colour-vision | pass in emulation | Greyscale baseline; Chrome emulation for protanopia, deuteranopia, tritanopia and achromatopsia: chips read by glyph and word, badges by fill and word. Still to do: your own DevTools check (D25) |
| 8 | Targets 44 px; text 16 px | pass | Button and interactive chip `min-height` and `min-width` are `--target-min`; body type is 16 px. Labels are 14 px and used for metadata only |
| 9 | Reduced motion | pass | No transitions or animations in `base.css` |
| 10 | Calm wording | pass | `baseCopy` has no fail, wrong, score, rank or average; the change is shown against the student's own last try |

Changes made at the polish step, using the `frontend-design` skill:
- **OutcomeChip** uses `--radius-md` (D120), because wrapped outcome text collided with the pill's ends.
- **MasteryBadge:** the pill holds only the icon and word, and the change line sits beside it.
- **Visual tolerance** tightened from 1% to 0.1%, because 1% let the radius change through unnoticed (D122).
