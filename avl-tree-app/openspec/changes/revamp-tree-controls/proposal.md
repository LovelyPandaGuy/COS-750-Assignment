# Proposal

## Open questions

Each question has a recommendation, and the specs, design and tasks follow it.

**Status after the human skim (14 Nov 2026):**
- The user accepted the recommendations for questions 1 to 9 as written.
- The user answered yes to questions 10 and 11.
- Question 12 (requirement IDs) is the only item still open. It does not block the build.

1. **Which "control strip" does this change build? (D23, INDEX item 13.)** The D23 strip already exists. It is `src/ui/module/ControlStrip.tsx` (module-framework, requirement "Control strip"): Back, Next and "I know this, skip" on one side, Show the rule and Hint (n) on the other, in the same place on every step. It sits outside `src/ui/replay/**`. The replay's own controls are `StepControls`. **Recommendation:**
   - Leave the module strip as it is.
   - Lay `StepControls` out on the same two-sided pattern, directly under the caption. Replay navigation (Back, Play/Pause, Step, and a new **Replay** button) goes on the start side. Progress and Speed go on the other side.
   - Learning aids stay in the module strip, because the replay has none of its own.
   - Cover D20 (skip) and D21 (hint count) with characterization scenarios against the existing strip. If one of them fails, the fix is a separate base change.

   Assumed, not blocking.
2. **Hint count wording (D21).** The strip reads "Hint (2)". The number is the hints left, but the label does not say so. **Recommendation:** the content-author changes `playerCopy.hint` to "Hint, 2 left" (flagged, beyond the ID). That is a one-line content edit, no code. If you would rather keep `src/content/modules/` out of this change, the scenario stays at "the number shown equals hints left" and the wording moves to a later change. Assumed, not blocking.
3. **What the caption holds, and the live region (D22, D23).** **Recommendation:**
   - The caption under the tree is the existing step sentence (`sentenceFor`), at most two sentences, plus "Nodes visited: n" on a search (FR-VIS-11).
   - The caption becomes the replay's **only** polite live region.
   - The Text representation becomes the fuller text: a visible paragraph headed "The whole tree" with `describeTree`, as in 1f note 4. It is not live, so nothing is announced twice. (Changed 14 Nov 2026 by the user while writing tests: a disclosure would have duplicated the tree view's own "Describe tree" button.)
   - The tree plus the caption is the FR-LRN-02 floor (D22). They are never hidden.

   Assumed, not blocking.
4. **What the switcher's boxes mean in a replay (D22, INDEX item 11).** `Representation` is `diagram | text | pseudocode | animation`. 1f draws boxes for Diagram, Text, Pseudocode and Read aloud. **Recommendation:**
   - Draw boxes for Diagram, Text and Pseudocode.
   - The primary representation's box is ticked, disabled and carries the visible word "main", so it cannot be turned off.
   - `animation` has no box. It is the Watch replay itself, and it plays on the diagram, so when `animation` is primary the Diagram box is the one that is locked on.
   - Read aloud is not rendered (D26). Change 24 adds it.
   - The switcher is framed as "Show:" choices, with no learning-style wording.

   Assumed, not blocking.
5. **Defaults "from module data" do not exist yet (D22).** `Step` in `src/modules/schema.ts` has `primary` but no `supporting` list (change 12 planned both). **Recommendation:**
   - `ReplayPlayer` gains an optional `representations: { primary, supporting }`. When it is passed, the player shows the switcher with those boxes ticked and resets them for each new operation.
   - With no prop, the player has no switcher and shows everything, which is today's behaviour, so no caller changes.
   - Adding `supporting` to `Step` and passing it from `InsertReplay` is a follow-up base change. It is listed below.

   Assumed, not blocking.
6. **The switcher in Do it yourself (1h).** In 1h the switcher bar also holds "Mode: Watch / Do it yourself" and stays while Do it yourself is open. `ReplayPlayer` unmounts in that mode, and `ModeSwitch` (`src/ui/practice/`) owns the mode. **Recommendation:**
   - The switcher takes an optional `mode` (value plus onChange) and draws the mode radio group in the same bar.
   - `ReplayPlayer` also takes an optional controlled `shown`, so an outer host can own the switcher and keep it across modes.
   - Having `ModeSwitch` host the switcher is a follow-up in the practice lane.
   - 1h is covered here at component level.

   Assumed, not blocking.
7. **Replays now slide (D32 superseded by A1).** **Recommendation:**
   - The replay passes `slots` = the in-order keys of the trace's final tree, so every key keeps its x at every position, and rotations move nodes only up or down (A1 question 1).
   - It passes `transitionMs = min(TREE_TRANSITION_MS, step duration / 2)`, so a node settles before the next tick at any speed. Today that is 300 ms at all three speeds.
   - Reduced motion snaps (A1).
   - Record this as D103, replacing D32's "nodes do not slide".

   Assumed, not blocking.
8. **`announce` and `overlay` (A1 questions 7 and 9).** **Recommendation:**
   - The replay passes **no** `announce`, because the caption is its live region and a second region would be read twice. A scenario checks this.
   - The replay draws nothing over the tree, so it does not use `overlay`.

   Not blocking.
9. **Inverted current line (1f note, FR-VIS-04).** Today the current line uses the pale `--code-highlight` fill. 1f draws it inverted. **Recommendation:** inverted from existing tokens: `--text-primary` background with `--bg-surface` text, bold, the ▶ marker and `aria-current="step"`. No new token. Assumed, not blocking; record as D104.
10. **Contract and stub files for RepresentationSwitcher. Answered 14 Nov 2026: yes.** The user approved the three edits below (the contract lists and re-export, the stub file and its index line, and the test counts) as part of this change. Building it means following the foundation's own rule in `src/ui/contracts.ts`:
    - move the name from `STUBBED` to `BUILT`;
    - re-export `ComponentProps<typeof RepresentationSwitcher>`;
    - delete `src/ui/stubs/RepresentationSwitcher.tsx` and its line in `src/ui/stubs/index.ts`;
    - have the test-writer change the counts in `tests/ui/contracts.test.tsx` (19/26 → 20/25).

    These files are outside `src/ui/replay/**`, and the user has approved editing them in this change. The real component lives at `src/ui/replay/RepresentationSwitcher.tsx`. The contract gains the optional `mode` and `task` (question 6).
11. **D19 cleanup in replay content. Answered 14 Nov 2026: yes.** The content-author fixes the D19 wording in this change. The replay copy still types the range "outside −1 to +1" (`replayCopy.sentence.imbalance`), passes raw case codes to "Case X", and `pseudocode.insert` line 3 types "(bf +2 or −2)". 1f's conflict list says the range must come from the conventions module. **Recommendation:**
    - the content-author rewrites these through `conventionsWording()` (`rangeText`, `num`, `caseName`) in `src/content/replay.ts` and `src/content/pseudocode.ts`;
    - the panel takes the case name from `caseName`;
    - a source scan test guards it.

    The rewritten strings are still flagged as beyond the ID.
12. **Requirement IDs.** I could not open the SE document from here. IDs below come from the archived `step-replay`, `pseudocode-panel` and `module-framework` specs and the 1f and 1h screen specs. **NFR-03** (motion) is still unconfirmed from A1 (question 10 there). LO6 and LO7 stay `[OPEN]` until the unit-to-module mapping (INDEX item 2).

## Why

Screen 1f is the core teaching screen. Today the replay redraws each step in place, so nodes jump; A1 fixed that only for callers that pass `slots`. The step sentence sits in the side column rather than under the tree. The controls do not follow the D23 two-sided pattern, and there is no Replay button. The current pseudocode line is a pale tint rather than inverted. The representation switcher is a placeholder, so a student cannot choose what to see. The replay's wording still types the balance range and case codes that D19 says must come from the conventions module. This change brings the three components and the caption up to 1f, 1h, D22, D23, D29 to D32 and the quality bar.

## What Changes

- **Caption under the tree** (D23, D22): the step sentence (one or two sentences), and the visited count on a search, directly under the tree. It is the replay's single polite live region. Tree plus caption is the FR-LRN-02 floor and is never hidden.
- **StepControls revamp** (FR-VIS-03, D23, D29, D32):
  - a two-sided strip: Back, Play/Pause, Step and a new Replay on one side; "Step p / n", progress and Speed (0.5×, 1×, 2×) on the other;
  - keys stay Space, ← →, [ ];
  - Back still restores the previous tree exactly;
  - steps take 1200 ms at 1×;
  - the strip wraps to two rows at 390 px.
- **Stable steps** (A1 follow-up): the replay passes its final tree's keys as `slots` and a capped `transitionMs`. Nodes slide between steps and snap under reduced motion. No `announce` and no `overlay`.
- **PseudocodePanel revamp** (FR-VIS-04, D30, D31, D19):
  - the current line is inverted, bold, with ▶ and `aria-current`;
  - it still shows the five-step C6 outline;
  - the case is named beside the line on imbalance and rotation steps, with the name taken from `conventionsWording().caseName`.
- **RepresentationSwitcher built** (FR-LRN-02, FR-VIS-06, D22, D26):
  - "Show:" Diagram, Text and Pseudocode boxes; the primary box is locked on and marked "main";
  - the other boxes default from the step and toggle on demand;
  - an optional Mode group (Watch / Do it yourself) and a task title, as in 1h;
  - no Read aloud box.
- **Text representation**: a visible "The whole tree" paragraph (1f note 4). The tree view's own "Describe tree" button stays.
- **D19 cleanup in replay content** (question 11), with a scan test.
- **Learning aids** (D20, D21): scenarios confirm the existing module strip shows the hints left and offers skip only on content and example steps. The wording is set by question 2.
- Every quality-bar line becomes a scenario.
- Serves FR-VIS-03, FR-VIS-04, FR-VIS-06, FR-VIS-07, FR-VIS-10, FR-VIS-11, FR-LRN-02, NFR-02, NFR-03 ([OPEN], question 12) and NFR-04; decisions D19 to D23, D26, D29 to D32. Outcomes LO6 and LO7 ([OPEN], question 12).

## Out of scope

- Any edit to `src/ui/tree/**`, `src/ui/module/**`, `src/ui/practice/**`, `src/replay/**`, `src/modules/**` or `tokens.css`. The only exceptions are the approved contract and stub edits in question 10.
- Adding `supporting` to the module `Step` schema, and passing representations from `InsertReplay` or `ModulePlayer` (follow-up base change, question 5).
- `ModeSwitch` hosting the switcher in Do it yourself (follow-up, question 6). RotationMenu, InOrderStrip and TaskPrompt are unchanged.
- Read aloud (change 24, D26). "Add to lecture questions" in 1f (FR-SCA-01, other lane).
- Line-level insert pseudocode (D30 stands).
- New tokens. Any engine change.

## Capabilities

### New Capabilities
- `ui-tree-controls`: the caption, the replay control strip layout and Replay button, stable steps in the replay, the representation switcher, the whole-tree text, D19 in replay content, learning-aid placement, and the quality bar for these components.

### Modified Capabilities
- `step-replay`: reading order (switcher, tree, caption, controls, panel, text); the live region moves to the caption; Replay joins the touch and pointer controls.
- `pseudocode-panel`: the current line is inverted; the case name comes from the conventions wording.

## Impact

- Code (implementer): `src/ui/replay/ReplayPlayer.tsx`, `StepControls.tsx`, `PseudocodePanel.tsx`, `StepExplanation.tsx`, `replay.css`, new `src/ui/replay/RepresentationSwitcher.tsx` and `src/ui/replay/Caption.tsx`. Also, as approved in question 10: `src/ui/contracts.ts`, `src/ui/stubs/index.ts`, and deletion of `src/ui/stubs/RepresentationSwitcher.tsx`.
- Content (content-author, flagged beyond the ID): `src/content/replay.ts` (switcher, Replay, caption and whole-tree labels; D19 rewrites), `src/content/pseudocode.ts` (line 3 from the conventions), and `src/content/modules/player.ts` (hint wording, question 2).
- Callers: no change. Every new `ReplayPlayer` prop is optional. `InsertReplay` and the C4 search replay keep working. They gain the caption, sliding, the new strip and the inverted line automatically.
- Tests: `tests/ui/step-controls.test.tsx`, `replay-player.test.tsx` and `contracts.test.tsx` are extended; new `tests/ui/representation-switcher.test.tsx` and `tests/ui/replay-content.test.ts`; new `tests/visual/replay.spec.ts`.
- Decisions to record after the human skim: D103 (replay slides with stable slots, replacing D32), D104 (inverted line from existing tokens), D105 (caption is the live region; Text is the visible whole-tree paragraph), D106 (switcher boxes, primary locked, defaults via prop until the schema has `supporting`).
