# Audit run: raw list (task 2.1)

Snapshot of 14 Nov, `chore/ui-sweep` at 39418d1 plus the uncommitted harness. Inputs:
- `npm run test:matrix`: matrix.spec.ts (54 entries × 3 widths × 2 themes = 324 results) and matrix-modes.spec.ts (406 results);
- `npm test` (1250 tests) and `npm run lint` (eslint, stylelint; the contrast test runs in `npm test`).

One row per distinct failure (the same check on the same element); **Where** lists every entry @width/theme it occurs at. Widths: phone 390, tablet 768, desktop 1366. The raw JSON is in `test-results/matrix/` and `test-results/quality/` (gitignored).

**Check fixes during the audit (harness, not findings).** Three checks gave false results on the first pass and were corrected before this list was written:
- *Colour alone* treated two elements without an `aria-label` as having the same label (`null === null`).
- *Overlapping text* counted entries scrolled out of a scroll box (the sandbox event log).
- *Overlapping text* also counted page text behind an open modal dialog.

**Known limit:** the colour check compares one example per state, so examples with different content can hide a colour-only state signal. The greyscale and colour-vision screenshots (`test-results/matrix/modes/vision/`) are judged by eye in task 2.2 to cover it.

Screenshot or harness errors in the run: 0.

| # | Check | Mode | Detail | Where (count) |
|---|---|---|---|---|
| R01 | QB5 axe landmark-unique (moderate) | - | section[aria-labelledby="_r_N_"] | gallery-learn @desktop/dark, gallery-learn @desktop/light, gallery-learn @phone/dark, gallery-learn @phone/light, gallery-learn @tablet/dark, gallery-learn @tablet/light, … +6 (12) |
| R02 | QB5 axe landmark-unique (moderate) | - | div[data-gallery-map="mixed"] > .progress-map-nav[aria-label="Example your path"] / section[aria-labelledby="_r_N_"] | gallery-progress @desktop/dark, gallery-progress @desktop/light, gallery-progress @phone/dark, gallery-progress @phone/light, gallery-progress @tablet/dark, gallery-progress @tablet/light, … +6 (12) |
| R03 | QB5 axe label-content-name-mismatch (serious) | - | g[data-key="1"] / g[data-key="2"] / g[data-key="3"] | sandbox-balanced @desktop/dark, sandbox-balanced @desktop/light, sandbox-balanced @phone/dark, sandbox-balanced @phone/light, sandbox-balanced @tablet/dark, sandbox-balanced @tablet/light, … +12 (18) |
| R04 | QB5 axe label-content-name-mismatch (serious) | - | g[data-key="1"] / g[data-key="10"] / g[data-key="11"] | sandbox-wide @desktop/dark, sandbox-wide @desktop/light, sandbox-wide @phone/dark, sandbox-wide @phone/light, sandbox-wide @tablet/dark, sandbox-wide @tablet/light (6) |
| R05 | Print shows app chrome | print | 1 chrome elements | readiness-ready, readiness-revise (2) |
| R06 | Print shows app chrome | print | 4 chrome elements | screen-certificate (1) |
| R07 | QB4 sideways scroll | 200% + larger text | 221 > 195 | check-cap, check-not-yet-hint, check-unanswered, screen-check (4) |
| R08 | QB4 content past the edge | 200% + larger text | <fieldset class="q-choices" disabled=""><legend>Your answer</legend><l | check-cap, check-not-yet-hint, check-right (3) |
| R09 | QB4 content past the edge | 200% + larger text | <label class="q-choice" data-narrate=""><input type="radio" value="a"  | check-cap, check-confidence, check-not-yet-hint, check-right, check-selected, check-unanswered, … +1 (7) |
| R10 | QB4 content past the edge | 200% + larger text | <label class="q-choice" data-narrate=""><input type="radio" value="b"  | check-cap, check-confidence, check-not-yet-hint, check-right, check-selected, check-unanswered, … +1 (7) |
| R11 | QB4 content past the edge | 200% + larger text | <label class="q-choice" data-narrate=""><input type="radio" value="c"  | check-cap, check-not-yet-hint, check-unanswered, screen-check (4) |
| R12 | QB4 content past the edge | 200% + larger text | <label class="q-choice" data-narrate=""><input type="radio" value="d"  | check-cap, check-not-yet-hint, check-unanswered, screen-check (4) |
| R13 | QB4 sideways scroll | 200% + larger text | 231 > 195 | check-confidence, check-right, check-selected (3) |
| R14 | QB4 content past the edge | 200% + larger text | <fieldset class="q-choices"><legend>Your answer</legend><label class=" | check-confidence, check-selected, check-unanswered, screen-check (4) |
| R15 | QB4 content past the edge | 200% + larger text | <span>The tree is balanced, because the keys are placed one after anot | check-confidence, check-right, check-selected (3) |
| R16 | QB4 content past the edge | 200% + larger text | <span>Search stays O(log n), because a BST always halves the search sp | check-confidence, check-right, check-selected (3) |
| R17 | QB4 sideways scroll | 200% + larger text | 260 > 195 | readiness-ready, readiness-revise (2) |
| R18 | QB4 content past the edge | 200% + larger text | <div class="q-card"><label class="q-stem" for="own-question">Your ques | readiness-ready, readiness-revise (2) |
| R19 | QB4 content past the edge | 200% + larger text | <label class="q-stem" for="own-question">Your question for the lecture | readiness-ready, readiness-revise (2) |
| R20 | QB4 content past the edge | 200% + larger text | <textarea  class="lesson-textarea" rows="3"></textarea> | readiness-ready, readiness-revise (2) |
| R21 | QB4 content past the edge | 200% + larger text | <button type="button" class="module-button module-button-primary" disa | readiness-ready, readiness-revise (2) |
| R22 | QB4 content past the edge | 200% + larger text | <p role="status" class="q-status"></p> | readiness-ready, readiness-revise (2) |
| R23 | QB4 sideways scroll | 200% + larger text | 199 > 195 | screen-pseudocode (1) |
| R24 | QB4 sideways scroll | 200% + larger text | 219 > 195 | screen-settings (1) |
| R25 | QB4 content past the edge | 200% + larger text | <span class="theme-switch-state" aria-hidden="true">On<span class="the | screen-settings (1) |
| R26 | QB4 content past the edge | 200% + larger text | <span class="theme-switch-track"><span class="theme-switch-knob"></spa | screen-settings (1) |
| R27 | QB4 content past the edge | 200% + larger text | <span class="theme-switch-knob"></span> | screen-settings (1) |
| R28 | QB4 content past the edge | 200% + larger text | <span class="theme-switch-state" aria-hidden="true">Off<span class="th | screen-settings (1) |
| R29 | QB6 focus without visible ring | keyboard | SUMMARY Lesson outline (n screens) | animation-first-step-phone, animation-mid-replay-phone, c1-diagnostic-phone, c1-result-all-secure-phone, c1-result-needs-review-phone, check-cap-phone, … +30 (36) |
| R30 | QB6 focus order against reading order | keyboard | INPUT  | sandbox-balanced-desktop, sandbox-chain-desktop, sandbox-described-desktop, sandbox-wide-desktop (4) |
| R31 | QB6 focus order against reading order | keyboard | BUTTON Reset my progress | start-returning-desktop (1) |
| R32 | QB6 focus leaves while open | keyboard | aaMenu | desktop, phone (2) |
| R33 | QB6 focus leaves while open | keyboard | lessonMenu | desktop, phone (2) |
| R34 | QB6 focus after a route change | keyboard | focus on A 'Sandbox' (expected H1) | desktop (1) |
| R35 | QB6 focus after a route change | keyboard | focus on BODY 'Skip to main contentAVL Trees · pre-lect' (expected H1) | phone (1) |
| R36 | QB6 heading out of view after a route change | keyboard |  | phone (1) |

## npm test

Failing tests: 1.
- R37 `tests/ui/quality/scans.test.ts > quality bar 10: one term per concept (terms.ts) > "lesson" (one of the nine parts of the course (C1 to C9)): no synonym in UI wording`

`npm run lint`: pass. `tests/tokens.contrast.test.ts`: pass.

## Reported only: src/live_content (never edited by an agent)

- Harsh words ("wrong", "fail", "incorrect") in 49 strings: conventions.json 5, c4.json 3, c5.json 3, c6.json 1, c9.json 1, misconceptions.json 1, checks.json 22, diagnostic.json 2, readiness.json 11. Some are meta-text, such as conventions.json `feedback.neverSay`, which lists the words never to say. Each string is in `test-results/quality/harsh-words-live-content.json`.
- Term "check": 2 strings use a synonym: c1.json .screens[5].text "Five quick questions from the BST lectures. They show which ideas are "; readiness.json .questions[10].stem "An online exam system stores 30,000 student numbers. Numbers are added"
- Term "hint": 0 strings use a synonym
- Term "lesson": 1 strings use a synonym: rewards.json .certificateText.bonusNote "Proposal: completed lessons could earn a bonus of up to 5% on the COS2"
- Term "sandbox": 0 strings use a synonym

## Not built, so not audited

- The SQLite event log and its JSON fallback (D16): there is no SQLite code in `src/` (proposal question 3).
