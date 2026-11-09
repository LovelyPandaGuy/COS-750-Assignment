# Proposal

## Open questions

1. **[OPEN] One change in flight per capability (CLAUDE.md).** `add-rotations` is still active on `avl-engine` (only its review task 3.2 is left) and this change also modifies `avl-engine`. The deltas touch different requirements, so they do not collide, but the rule says to finish one first. Recommended: archive `add-rotations` before running `/opsx:apply` here. The generator's case-targeting also relies on `avlInsert` from that change (already in the code).
2. **Assumed, not blocking: scope of "extend validity".** You chose all four extensions: BST-order check, all offending nodes, stored-height check, violation kind. The SE (FR-ENG-05) asks only for valid or not plus the first offending node, so these go beyond it and are flagged for you to read. `checkAvl` keeps its current behaviour; the new detail is a separate report function.
3. **Assumed, not blocking: case-targeted generation.** FR-ASM-07 asks for seeded tracing variants; case-identification questions (C5, C6) also need a sequence that forces a chosen case (LL, RR, LR, RL). Included as one requirement. Drop it if you want the generator plain.
4. **Assumed, not blocking: seeds are a stable contract.** Seeds will be stored in the event log and replayed, so the random algorithm must not change silently. The design fixes one small PRNG and a test pins its first outputs.
5. **D2 (lecturer to confirm).** "Left-heavy" and "right-heavy" labels follow the balance-factor sign. They are read from the conventions module so a sign change is a one-line edit.
6. **Out of the engine: D9's cap of 3 retries** and the shuffling of multiple choice belong to the assessment layer, not here.

## Why

Questions marked by the engine (FR-ASM-04) and retries as new seeded variants (D9, FR-ASM-07) both need engine support that does not exist yet: a richer validity report so feedback can say what is wrong with a tree, and a deterministic generator of trees and insert sequences. Without the generator, each retry would have to be hand-authored, and answers could not stay engine-computed.

## What Changes

- Add a tree analysis report: BST-order violations, every node whose balance factor is out of range (with its balance factor and which way it leans), and nodes whose stored height disagrees with the real shape. `checkAvl` is unchanged.
- Add a small seeded random source and generators for insert sequences and trees (plain BST or AVL).
- Add a generator for an insert sequence whose last AVL insert triggers a chosen case.
- Add a deterministic way to derive a new seed for each retry.
- Serves FR-ENG-05 (extended), FR-ASM-04 (marking support), FR-ASM-07, NFR-08 in part, D9. LOs: engine support for LO2, LO3, LO6, LO7 questions.

## Capabilities

### New Capabilities
- `seeded-generator`: seeded random insert sequences, trees and case-targeted sequences, with per-retry seed derivation.

### Modified Capabilities
- `avl-engine`: modifies "Validity check" (existing text and scenario kept, scenarios added) and adds a "Tree analysis report" requirement.

## Out of scope

Question content, retry caps, multiple-choice shuffling and storage of seeds (assessment layer); traces and search (FR-ENG-06, 09); AVL delete (FR-ENG-08); any UI; exporting generators as fast-check arbitraries for tests.

## Impact

- New: `src/engine/random.ts`, `src/engine/generate.ts`, `src/engine/analyse.ts`; small additions to `conventions.ts` (violation kind labels) and `index.ts`; tests under `tests/engine/`.
- Unchanged: `validity.ts` behaviour, all existing tests.
- No new dependencies.
