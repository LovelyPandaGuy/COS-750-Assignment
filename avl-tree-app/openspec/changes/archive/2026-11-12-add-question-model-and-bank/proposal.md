# Proposal

## Open questions

No `[OPEN]` item blocks the specs (D18). Each item below is an assumption kept in one place. Please read them before `/opsx:apply`.

1. **Assumed, not blocking: items are templates, and the engine writes every answer (CLAUDE.md guardrail, FR-ASM-07, D9).** A bank item names a *kind* (for example "balance factor of a marked node"). Given a seed, the kind builds the tree, the correct answer and each wrong option, all from the engine. Content supplies only the wording around them. A retry is the same item with the next variant seed, so the student gets a new problem, and multiple-choice options reshuffle.
2. **Flagged for you to read at G3: the misconception catalogue (user choice, 12 Nov).** The ID lists no misconceptions, but FR-ASM-02 and FR-ASM-03 need a tag and an explanation for every wrong option. This change drafts 18 entries (for example: counting height in nodes, subtracting the subtrees in the other order, checking balance only at the root, one rotation for a bent shape, fixing a higher unbalanced node instead of the lowest). Each is marked `[beyond ID]` in one content file. C8's wrong choices reuse the existing "need" list, one tag per need, so they add no new wording. Explanations read the conventions module, so none states the formula, a sign's lean or a case name (D19).
3. **Assumed, not blocking: sub-skills and Bloom levels.** Fourteen sub-skill IDs, each tied to one LO, sit in one content record. The SE document's own example uses `identify-rebalance-case`, and the others follow its pattern. Each item's Bloom level defaults to the level the ID gives its LO (for example LO3 Apply, LO7 Apply/Analyse).
4. **Assumed, not blocking: items for C4, C6 and C7 are written now.** Those modules have no screens yet (changes 14, the C6 module and 18). The bank is keyed by module, so their items wait in the bank, and every check step keeps its "coming" line until change 20 shows items.
5. **Assumed, not blocking: C7's items are optional (D4, FR-ASM-01).** They are tagged `optional`, and nothing in this change (or later) may make them block progress.
6. **Assumed, not blocking: one attempt policy per context (D21).** `RETRY_CAP = 3` joins `PRACTICE_HINTS = 2` in `src/modules/config.ts`. A pure `attemptPolicy('check' | 'practice')` returns the cap and the hint allowance. An attempt record carries `hintsUsed`, confidence and the misconception tag, using the `Attempt` type learner storage already has. Storing attempts and enforcing the cap on screen are changes 20 and 21.
7. **Assumed, not blocking: three answer types.** These are `choice` (multiple choice, identify the case, scenario choice), `number` (compute a balance factor or a height) and `tree` (trace an insert: build the final tree). The plan's five question types are kinds within these. The SE's `"mcq" | "case-id" | "trace"` map onto them.
8. **Assumed, not blocking: insert-tracing is marked now, edited later (FR-ASM-04).** The pure marker compares the student's tree with the engine's by structure. It names the first trace step the student's tree does not reach, and it matches known wrong trees to a misconception (a plain BST insert with no rebalance, one rotation for a bent shape, a rotation the wrong way). The constrained tree editor with its edit log is change 20.
9. **Deviation from the SE document, section 6.7.** Its sample item types a case name and a sign's meaning into the item ("Left-Right", "+2 means z is left-heavy"), and hard-codes the correct option. Both go against D19 and the guardrail, so the sample's shape is not adopted. Items are TypeScript records, as module content already is, not JSON.
10. **Assumed, not blocking: the validator runs as a test.** As with `validateModule`, a Vitest test runs `validateBank` over every item for seeds 0 to 99, so `npm test` fails when a tag or explanation is missing. A separate `validate:content` script is still on the "Not yet done" list.

## Why

FR-ASM-01 asks for a formative check after each module from C2 to C8, and every later assessment change (checks and feedback, the scaffold ladder, the diagnostic, readiness) needs one question model to build on (D7). Today each check step shows "coming", and practice items mark themselves ad hoc, with no tags.

## What Changes

- **A question model** (`src/assessment/`): item, instance, response and mark types; Bloom levels; three answer types; option IDs that stay stable across reshuffles.
- **Seeded instantiation:** `instantiate(item, seed, attempt)` builds a problem from the engine. Attempt 1 onwards uses a new variant that differs from the one before, and choice options reshuffle (FR-ASM-07, D9).
- **Marking:** for choice, number and tree answers. Every wrong choice option and every recognised wrong number or tree carries a misconception tag and its own explanation (FR-ASM-03, FR-ASM-04).
- **The attempt policy and attempt record** (D21): `RETRY_CAP` in the one config, and hints used recorded on each attempt.
- **A bank validator** (FR-ASM-02):
  - every tag is present and known
  - every wrong option is tagged and explained
  - the stems pass the D19 wording check and the number-from-facts check
  - modules C2 to C8 each have 2 or 3 items
- **The check bank for C2 to C8:** 16 items over 14 kinds (design decision 5), the misconception catalogue, the sub-skill record and the LO level table, all in `src/content/questions/`.
- Serves FR-ASM-01, FR-ASM-02, FR-ASM-03, FR-ASM-04 (marking only), FR-ASM-07, FR-SCA-03 (the cap constant only), D7, D9, D15, D19 and D21, for LO1 to LO9.

## Out of scope

- Showing items, FeedbackPanel, the confidence rating UI, the tree editor, and storing attempts in learner state (change 20).
- The scaffold ladder, enforcing the retry cap, the mastery threshold, and mapping misconceptions to scaffolds (FR-SCA-01 and FR-SCA-02, change 21).
- C1 diagnostic items and routing (change 22), C9 readiness items (change 23), the event log (change 26).
- Turning the existing practice activities into bank items. Practice keeps its own marking until a later change chooses to move it.

## Capabilities

### New Capabilities
- `question-model`: item and instance shapes, tags, seeded instantiation and variants, marking for each answer type, the attempt policy and record, and the bank validator.
- `question-bank`: the module-check items for C2 to C8, the misconception catalogue, the sub-skill record and the LO level table.

### Modified Capabilities
- None. The check steps keep their "coming" line until change 20.

## Impact

- New code: `src/assessment/` (implementer); `src/content/questions/` (content-author).
- Changed code:
  - `src/modules/config.ts` gains `RETRY_CAP`.
  - `src/modules/validate.ts` exports its wording and number checks so the bank validator reuses them. Behaviour is unchanged.
- No UI, no storage, no new dependency.
- `decisions.md` gains assumed rows for items 1 to 8 and 10.
