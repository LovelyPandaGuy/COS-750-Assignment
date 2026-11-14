# Findings (task 3.1)

Sources:
- the audit run: `audit-raw.md` rows R01 to R36, plus R74 from `npm test`;
- the critique: `critique.md` rows K01 to K12.

The reviewer and a11y-checker (task 2.3) have not run yet: their agent files don't exist. Duplicates are merged: one row per cause, listing every source row.

**Decisions (task 4.1):** the user asked on 14 Nov to resolve groups 5 to 7. The assumed triage, for the user to confirm:
- every row that can be fixed with existing tokens and components is **accept**;
- every row that needs a new token, component, design or wording decision is **defer** and marked `[OPEN]`;
- rows that turned out to be harness errors are **reject**.

| ID | Screen | State | Width | Theme / mode | Severity | Bar | Proposed fix | New token? | Lane | Source | Decision | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| F-001 | gallery (dev only) | gallery-learn, gallery-progress | all | both | minor | 5 | Give each gallery section a unique name. The gallery is not built for production. | no | shared | R01, R02 | defer | open |
| F-002 | sandbox, tree view | sandbox-balanced, sandbox-wide | all | both | blocker (WCAG 2.5.3) | 5 | The node name must contain the visible text ("bf +5", "Unbalanced"). This changes the node-name wording in `src/content/treeView.ts`. `aria-hidden` on the visible text was tried and does not satisfy axe or 2.5.3. | no, `[OPEN]` wording | A | R03, R04 | defer | open |
| F-003 | any, route change | module-c3-start → sandbox | 390, 1366 | light | — | 6 | None needed: `useScreen` already focuses the new h1. The check read focus before the route's effect ran; it now waits up to 1 s. | no | shared | R34, R35, R36 | reject (harness) | closed |
| F-004 | start, sandbox | start-returning, sandbox-* | 1366 | light | — | 6 | None needed: focus moves from the foot of one column to the head of the next. The check now compares stops in the same column only. | no | shared | R30, R31 | reject (harness) | closed |
| F-005 | all pages | any | 390 | both | major | 4 | The top bar takes three rows on a phone. The pill and three buttons don't fit one 358 px row, so this needs a layout decision. | no, `[OPEN]` design | shared | K03 | defer | open |
| F-006 | lesson check | check-not-yet-hint | 390 | both | major | 4 | Hint sits about 1400 px down, below the verdict panel. The prerequisite note pushes the question down. The order is set by screen spec 1i. | no, `[OPEN]` design | shared | K02 | defer | open |
| F-007 | lesson | module-c3-start | 1366×768 | both | minor | 4 | The tree card is tall with empty margins, and Next is below the fold. Cap the card to its content. | no | A | K04 | defer | open |
| F-008 | lesson | every lesson screen | all | both | blocker (WCAG 2.4.7) | 6 | The outline summary had no focus ring. `tabIndex={0}` puts it under the shared `[tabindex]:focus-visible` ring. | no | shared | R29 | accept | fixed |
| F-009 | readiness, certificate | readiness-ready, readiness-revise, screen-certificate | 1366 | print | minor | 7 | A shared print rule in `shell.css` hides the skip link, header, outline and control strip on every page. | no | shared | R05, R06 | accept | fixed |
| F-010 | lesson check | check-* | 200% | light | major | 4 | Choice fieldsets were min-content wide. Fix: `min-width: 0` on `.q-choices` / `.q-values`, and long words in choices wrap. | no | B | R07–R16 | accept | fixed |
| F-011 | readiness | readiness-ready, readiness-revise | 200% | light | major | 4 | The lecture-question textarea was wider than the column. Fix: full width with border-box. | no | B | R17–R22 | accept | fixed |
| F-012 | Aa menu / settings | screen-settings | 200% | light | minor | 4 | The theme switch row now wraps. | no | shared | R24–R28 | accept | fixed |
| F-013 | lesson title | screen-pseudocode | 200% | light | minor | 4 | "algorithm)" in the h1 was wider than the column. Fix: h1 to h3 break long words. | no | shared | R23 | accept | fixed |
| F-014 | readiness | readiness-* | all | both | major | 7, 3 | The Evaluate Bloom badge has no shape glyph or tint. | yes, `[OPEN]` | B | K06 | defer | open |
| F-015 | hub | hub | all | both | minor | 3 | The "Readiness summary" row has no status label and a different border from the lesson rows. | no, `[OPEN]` design | B | K07 | defer | open |
| F-016 | lesson check | check-not-yet-hint, check-cap | all | dark | major | 2, 3 | After marking, disabled radios showed as bright grey discs. Unchosen ones now step back (opacity), and the chosen one keeps `accent-color`. | no | B | K01 | accept | fixed |
| F-017 | feedback panel | check-not-yet-hint | all | both | polish | 3 | The review link was indented past the text column. Its inline padding is removed. | no | B | K05 | accept | fixed |
| F-018 | certificate | screen-certificate | all | dark | major | 2, 3 | The disabled Generate button read as enabled. `.module-button:disabled` now uses the disabled tokens instead of opacity. | no | B | K08 | accept | fixed |
| F-019 | Aa menu | any page | all | both | major | 6 | Focus could Tab out while open. `useFocusWrap` now wraps Tab inside the panel. | no | shared | R32 | accept | fixed |
| F-020 | lesson menu | gallery-progress | all | both | major | 6 | As F-019, for the lesson menu. | no | B | R33 | accept | fixed |
| F-021 | certificate | screen-certificate | all | both | minor | 3 | Two primary buttons (Generate and Next) are on one screen. | no, `[OPEN]` design | B | K08 | defer | open |
| F-022 | sandbox | sandbox-* | all | both | polish | 3 | "Clear" is a bare text button among outlined buttons. | no, `[OPEN]` design | A | K09 | defer | open |
| F-023 | start, lesson | start-*, prerequisite note | all | both | major | 10 | "module" is now "lesson" in `src/content/navigation.ts` and `start.ts`, the ID document's term (42 uses against 1). For the user to read. | no | content-author | R74, K10 | accept | fixed |
| F-024 | lesson | module-c3-start | 1366 | both | polish | 6 | A heading focused by the app shows the ring to mouse users on load. | no, `[OPEN]` decision | shared | K11 | defer | open |
| F-025 | start | start-storage-unavailable | 390 | both | minor | 4 | The "not saving" explanation comes after the primary button. | no, `[OPEN]` design | B | K12 | defer | open |

## Harness corrections during the fixes

These are test-writer changes; each one is listed so it can be reviewed.
- **Print check:** ignores chrome hidden with `visibility`, and names what it finds.
- **Route-focus check:** waits up to 1 s for the route's effect (F-003).
- **Focus-order check:** compares stops in the same column only (F-004).

## For a human (`[OPEN]`, task 8.1 not yet done)

- **Design:** F-005, F-006, F-007, F-014, F-015, F-021, F-022, F-025.
- **Wording (content-author):** F-002.
- **Decision:** F-024.
- **Dev-only:** F-001.
