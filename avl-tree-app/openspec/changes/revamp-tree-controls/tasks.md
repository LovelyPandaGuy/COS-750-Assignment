# Tasks

Scope: `src/ui/replay/**`, the RepresentationSwitcher contract and stub edits (proposal question 10, approved 14 Nov 2026), the `src/content/` replay wording (question 11, approved 14 Nov 2026), and tests.

The user accepted the recommendations for questions 1 to 9. Question 12 (requirement IDs) is still open but does not block any task here.

## 1. Red tests (test-writer)

- [x] 1.1 Extend `tests/ui/step-controls.test.tsx` and `tests/ui/replay-player.test.tsx` for the "Replay control strip", "Step timing", "Caption under the tree" and "Stable steps in the replay" requirements, and the modified `step-replay` requirements. That means:
  - the two named groups and their order;
  - Replay restarting and disabled;
  - the speed ends;
  - the caption directly after the tree, as the single live region, with the tree's `announce` region empty;
  - the visited count;
  - a fast-check property that each key's x is constant over every insert position;
  - a rotation step that changes only y;
  - `transitionMs` 300 at each speed;
  - Back restoring the previous tree;
  - reduced-motion snap, reusing the A1 harness;
  - the new reading order.

  Name each test after its FR, D or QB ID. Verify that the new cases fail for the expected reason and that the old cases still pass.
- [x] 1.2 Write `tests/ui/representation-switcher.test.tsx` (defaults, on demand, reset on a new operation, no switcher without props, controlled `shown`, the mode group, no Read aloud, no learning-style wording, axe). Write `tests/ui/replay-content.test.ts`: the D19 source scan, the conventions `vi.mock` case and range follow-through, and the QB10 wording scan. Extend the pseudocode tests: the inverted rule and its contrast pair in `tests/tokens.contrast.test.ts`, the five-line outline, and `caseName` beside the line, including a property over insert traces. Add the D20 and D21 characterization cases to `tests/ui/module-player.test.tsx`. Update `tests/ui/contracts.test.tsx` to 20 built and 25 stubbed. Verify that each new case fails only for the missing behaviour.
- [ ] 1.3 Write `tests/visual/replay.spec.ts`: the C6 Worked example insert replay with everything shown, at 390, 768 and 1366. It checks no page scroll, the strip groups stacked at 390 and side by side above, 44 px targets and `--type-body` text. Add a keyboard-order test (QB6) and an axe sweep over the held, start, imbalance and end states (QB5). Verify that `npm test` and `npm run test:visual` fail only in the new cases. Then ask the user before committing the red tests.
  - Status 14 Nov 2026: written. The keyboard-order and axe cases are in `tests/ui/replay-quality.test.tsx`, and `npm test` fails only in the new cases (37 tests in 11 files). The exception is `tests/ui/stylelint.test.ts`, which already failed before this change because the `stylelint` package is not installed here. `npm run test:visual` was **not run**: no Playwright browsers are installed in this environment, and the baselines are macOS (D97). Run it on a developer machine before ticking this task.

## 2. Build

- [x] 2.1 Content (content-author, `src/content/` only, flagged beyond the ID; question 11 approved): add the `replayCopy.switcher`, `controls.replay`, group, caption and whole-tree labels, and add Replay to the help line. Rewrite `sentence.imbalance` and `sentence.rotation` and `panel.caseLabel` to take a case name and `rangeText`. Build `pseudocode.insert` line 3 from the conventions wording. Change `playerCopy.hint` to say how many are left (question 2). Verify that `replay-content.test.ts` and the existing conventions-wording tests pass.
- [x] 2.2 StepControls (implementer): the two named groups, `onReplay` and the Replay button with its disabled rules, and the layout classes (design decision 5). Verify that the `step-controls` tests pass.
- [x] 2.3 RepresentationSwitcher (implementer): build `src/ui/replay/RepresentationSwitcher.tsx` (design decision 3). Then move the name to `BUILT` in `src/ui/contracts.ts` and delete the stub and its index line (question 10, approved). Verify that `representation-switcher.test.tsx` and `contracts.test.tsx` pass.
- [x] 2.4 ReplayPlayer and panel (implementer): add `Caption.tsx`, and change `StepExplanation` to the visible "The whole tree" paragraph. In `ReplayPlayer`, add `representations` and `shown`, the new reading order, `slots` and the capped `transitionMs`, and pass no `announce`. In `PseudocodePanel`, add the inverted current-line rule and take the case from `caseName`. Update `replay.css` with tokens only (design decisions 1, 2, 4 and 6). Verify that the whole `npm test` suite passes with no caller outside `src/ui/replay/` changed, and that `npm run typecheck` and `npm run lint` pass.

## 3. Critique, then polish

- [ ] 3.1 Critique (read-only): use the `frontend-design` skill to score the replay with the switcher, tree, caption, strip and panel at 390, 768 and 1366. Score it against every line of `.claude/docs/design/quality-bar.md` and screen specs 1f and 1h. Write the findings to `openspec/changes/revamp-tree-controls/review.md` under "Critique". Do not edit code. Verify the file lists all ten quality-bar lines, each with pass or a finding.
- [ ] 3.2 Polish (ui-polisher; CSS and layout markup in `src/ui/replay/` only; no tokens, logic, tests or content): fix each critique finding inside the design system. Verify that `npm test`, `npm run lint` and `npm run test:visual` pass, update only the replay baselines that changed (D97), and confirm that every quality-bar line in `review.md` now reads pass.

## 4. Review

- [ ] 4.1 Full check: `npm test`, `npm run typecheck`, `npm run lint`, `npm run build`, `npm run test:visual` and `openspec validate revamp-tree-controls --strict` all pass. Then the `reviewer` (fresh context, against the spec, D19, D22, D23, the conventions module and the quality bar) and the `a11y-checker` must report pass, or their findings must be resolved. The a11y-checker runs the keyboard-only pass, greyscale and the three colour-vision simulations (D25), and reduced motion with the OS setting on. Record the results in `review.md`.

## Workflow follow-up

- After the human skim, record D103 to D106 (proposal, Impact) in `.claude/docs/decisions.md`, and mark D32 as replaced by D103. Add INDEX items 11, 13 and 14 as handled in the build (design still to update).
- Follow-up base change: add `supporting` to `Step` and pass `representations` from `InsertReplay` and `ModulePlayer` (question 5).
- Follow-up practice-lane change: `ModeSwitch` hosts the switcher with `mode`, so it stays in Do it yourself (question 6, screen 1h).
- A human merges (the developer who did not write it) and runs `/opsx:archive`. Agents do not.
