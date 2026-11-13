# Proposal

## Open questions

No `[OPEN]` item blocks the specs (D18). Each item below is an assumption kept in one place. Please read them before `/opsx:apply`.

1. **Assumed, not blocking: where the check items appear.** Each module's Check activity keeps its intro step, then shows one bank item per step (2 or 3 items, in bank order), then the summary step. The "coming later" line goes. The step list is built from the bank, so content files gain no question text (D7, D19).
2. **Assumed, not blocking: a module completes when every required item has been answered correctly (D20, FR-LRN-05, FR-SCA-05).** An answer counts on any attempt. C7's items are optional (D4): answering them correctly still completes C7, but leaving them never blocks the next module. The cap of 3 attempts and the "continue anyway" outcome are change 21, so until then a student who keeps missing can still leave through Back or the hub and no module is completed.
3. **Assumed, not blocking: which question a learner sees.** The seed comes from the profile ID and the item ID, and the attempt number is the count of stored attempts at that item. Reloading shows the same question, and each Try again shows a new variant (D9, FR-ASM-07).
4. **Assumed, not blocking: the tree editor for "trace an insert" (chk6-tree) is built from existing parts (FR-ASM-04).** The student starts from the given tree, inserts the listed keys one at a time with a plain search-tree insert, and uses the rotation menu to rebalance, with Undo and Reset. The editor logs each edit. It marks by structure through the existing marker.
5. **Assumed, not blocking: the review link goes to the module's Explore activity (D27, cf. D43).** A check has no rule text on the page to open in place. Attempts are stored, so leaving to review loses nothing (FR-LRN-04).
6. **Assumed, not blocking: confidence is two optional buttons, "Sure" and "Not sure", before Check answer (FR-ASM-05 groundwork).** Skipping them records no confidence. Nothing reads it yet.
7. **Flagged for the team: the recommendation rule (D20, "routing cut-offs" waits on the team).** After a check, the app suggests the next module when every required item was right on the first attempt, and suggests looking over the module again when any was not. The student still chooses (D28). The one number sits in the one config.
8. **Assumed, not blocking: completing a module moves `currentModule` on.** If the learner's current module is the one just completed, it becomes the next module in the guided order, so Start's "Continue" and the Hub point forward.

## Why

Every check step shows "coming in a later step", no module can be completed, and the prerequisite notes, the C2 sandbox suggestion and result-based routing all wait for a result. FR-ASM-01 needs a check after each module, FR-ASM-03 an explanation for every answer, and FR-LRN-05 a module that completes only through its check. The bank and marker are built (change 19); nothing shows them yet.

## What Changes

- **Check items on screen:** the Check activity of C2 to C8 shows bank items one per step, with a choice, number or tree answer, an optional confidence rating, and a Check answer button.
- **Four-part feedback (D27):** verdict ("That's right" or "Not quite yet"), why (names the misconception where there is one), a Review link, and the next step (Try again with a new variant, or Next). No cross glyph, no red, no "wrong" or "fail" wording, and no attempt markers that use them.
- **Storing results:** each marked answer is saved as an attempt with hints used and confidence. A module is completed when its required items are right.
- **Result-based routing:** the "Where next?" panel suggests the next module or looking over this one again, by the rule above.
- **Tree editor** for the trace-an-insert item, from existing components.
- Serves FR-ASM-01, FR-ASM-03, FR-ASM-04 (editor), FR-ASM-07, FR-LRN-04, FR-LRN-05, FR-SCA-05, D4, D9, D20, D21, D27, D28, for LO1 to LO9 (checks).

## Capabilities

### New Capabilities
- `module-checks`: how a module's Check activity presents, marks, stores and completes on its bank items.
- `check-feedback`: the four-part feedback shown after each checked answer.

### Modified Capabilities
- `module-framework`: the check placeholder requirement is replaced by real check steps.
- `route-choice`: the recommendation depends on the check result.
- `learner-session`: screens can record an attempt and complete a module, and both are saved.

## Out of scope

- The scaffold ladder (hint, worked example, guided step-through), the retry cap, "continue anyway" with a recorded lecture question, and mastery thresholds (change 21, FR-SCA-01 to FR-SCA-03).
- Updating sub-skill status, the readiness summary, the C1 diagnostic and C9 (changes 22, 23).
- The event log and export (change 26). Route events keep going to the no-op sink.
- New bank items or new misconceptions.
