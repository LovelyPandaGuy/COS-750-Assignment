# Design critique (task 2.2)

Read-only pass with the `frontend-design` skill over the matrix baselines (`tests/visual/__screenshots__/matrix/`), against the screen specs (`.claude/docs/design/screens/`) and `quality-bar.md`. The look itself is not up for change: rows judge how tokens and components are applied. IDs continue into `findings.md` (task 3.1) as source "critique".

Screens viewed: start (first visit, returning, storage unavailable, reset open), hub, module-c3 (start, outline open), check states (not-yet-hint, cap), sandbox-chain, readiness-revise, certificate; phone, tablet and desktop; light and dark. The greyscale and colour-vision captures in `test-results/matrix/modes/vision/` were used for item 2.

| # | Screen / state | Width, theme | What | Bar line | Proposed fix | Lane |
|---|---|---|---|---|---|---|
| K01 | check-not-yet-hint, check-cap | all, dark | After answering, the disabled radios render as bright grey filled discs: heavier than the selected answer, and the chosen option loses its accent fill. The light theme shows faint grey discs. | 2 (dark parity), 3 | Style `.q-choice input:disabled` with existing tokens (`--disabled-bg`, `--border-control`); keep the chosen option's accent dot. | polisher |
| K02 | check-not-yet-hint, check-cap | phone | On a phone the stem starts about 500 px down (three-row top bar, outline summary, prerequisite note, intro paragraph), and the Hint button sits about 1400 px down, below the verdict panel. | 4 (fold) | Move the prerequisite note below the question or collapse it; put Hint before the verdict panel. Order is layout markup, but moving Hint changes spec order. | polisher, `[OPEN]` for Hint order (screen spec 1i) |
| K03 | all pages | phone | The top bar takes three rows (title, crumb plus save pill, three buttons), about 120 px, on every screen. | 4 (fold) | Put the save pill and the three buttons on one row. | polisher |
| K04 | module-c3-start | desktop 1366×768 | The tree card is about 300 px tall with wide empty margins. The first prediction option is at the fold and Next is below it. | 4 (fold) | Cap the tree card's height to its content at desktop width. | polisher |
| K05 | check-not-yet-hint | all | The review link in the verdict panel is indented past the panel's text column. | 3 (spacing) | Align it to the text column with the existing spacing token. | polisher |
| K06 | readiness-revise | all | The "Evaluate" Bloom badge has no shape glyph and no tint, but Remember, Understand and Apply have both. Its level is told apart by text only, so it reads as unfinished. | 7, 3 | Needs a Bloom token and shape for Evaluate. | `[OPEN]` new token (design) |
| K07 | hub | all | The "Readiness summary" row has a dotted border and no status label, unlike every lesson row above it. | 3 (consistency) | Give it a status label like the lesson rows, or set it apart as a separate link under the list. | `[OPEN]` design (screen spec 1b silent) |
| K08 | screen-certificate | phone, dark | The disabled "Generate certificate" button is a muted indigo fill that reads as enabled, and "Next" below it is also a filled primary, so the screen shows two primaries. | 3 (button hierarchy), 2 | Disabled buttons use `--disabled-bg` / `--disabled-text` in dark as in light; one primary per screen. | polisher |
| K09 | sandbox | all | "Clear" is a bare text button among outlined buttons. If it is meant as tertiary, the design doesn't say so. | 3 | Confirm against the design system's button set. | `[OPEN]` design |
| K10 | prerequisite note, start, hub copy | all | "module" (prerequisite note, start intro, resume) and "lesson" ("Lesson 2 of 9", "Lesson check") appear on the same screen. This is the term scan's failure R74, seen in place. | 10 | Change the wording in `src/content/` to "lesson". | content-author |
| K11 | module-c3-start | desktop | On load, the screen heading shows the focus ring (programmatic focus on `tabindex=-1`). It is correct for keyboard users but looks like a stray box to a mouse user. | 6 | Decide whether headings focused by the app show the ring (D-row). | `[OPEN]` decision |
| K12 | start-storage-unavailable | phone | The explanation ("This browser isn't saving your progress…") comes after the primary button, below the fold. Only the "Not being saved" pill is visible at first. | 4, empty/error states | Place the note before the button at phone width. | polisher |

## Checked items (task 2.2 list)

- **Empty, loading and error states:** K12. Storage unavailable is otherwise complete in both themes. There is no loading state to see, because content is bundled. The SQLite event log is not built (D16), so its fallback was not audited.
- **Dark-theme parity:** K01 and K08. The other screens viewed match their light versions.
- **Terms, spacing and button hierarchy between screens:** K05, K07, K08, K09 and K10.
- **The outline panel at each width:** checked, no overlap with the tree at phone, tablet or desktop.
  - At phone and tablet, the open outline pushes the screen down inline, which is expected for a disclosure.
  - At desktop, it is a sticky column beside the content.
  - Its summary has no visible focus ring, which is audit row R29 (`<summary>` is not in the shared `:focus-visible` selector in `tokens.css`).
- **Whitespace pushing Next, Hint or the tree below the fold:** K02, K03 and K04.
- **Hover-only affordances on touch:** checked, none. The scan of 28 `:hover` rules found none that reveal content (task 1.5).
