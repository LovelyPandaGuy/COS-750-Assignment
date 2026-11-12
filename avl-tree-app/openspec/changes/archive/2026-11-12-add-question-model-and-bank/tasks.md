# Tasks

## 1. Red tests

- [x] 1.1 Write `tests/assessment/question-model.test.ts` from every `question-model` scenario, named after the FR each serves. Cover:
  - tags: complete, missing, unknown, sub-skill of another LO
  - determinism, and the answer matches a direct engine call
  - retries differ and options reshuffle
  - choice options: tagged and explained; marking by ID after a shuffle
  - number parsing: the sign slip and unreadable input
  - tree marking: structurally equal, plain insert, second rotation alone, keys lost
  - the attempt policy and the single-place scan of the config
  - the attempt record passing the learner-state validator
  - the validator catching a typed case name and an invented number

  Use small fixture items inside the test for the failure cases. Verify they fail only because `src/assessment/` does not exist yet.
- [x] 1.2 Write `tests/assessment/question-bank.test.ts` from every `question-bank` scenario. Cover:
  - per-module counts and outcomes
  - C7 optional
  - kinds present
  - the LO level table against the ID
  - item levels fit their outcome
  - sub-skills are unique, each with an LO
  - the catalogue against the misconceptions produced over seeds 0 to 99, with `beyond ID` marks and one tag per need
  - neutral wording
  - the reversed-conventions render
  - `validateBank` over the bank reports nothing

  Pin the delete fallbacks (design decision 5) by hand-checked expected values. Commit tasks 1.1 and 1.2 as the red tests.

## 2. Model

- [x] 2.1 Add `src/assessment/types.ts`, `instantiate.ts` and `mark.ts` (design decisions 2 to 4), plus `RETRY_CAP` in `src/modules/config.ts` and `attempt.ts` (decision 7). Verify the determinism, variant, option, number, tree and attempt tests pass, using the test fixtures.
- [x] 2.2 Export `statesConvention` and `numbersIn` from `src/modules/validate.ts` without changing its behaviour. Add `src/assessment/validate.ts` (decision 8). Verify the validator scenarios pass and every existing module validator test still passes.

## 3. Kinds (implementer)

- [x] 3.1 Kinds for C2 to C4: `bst-height`, `sorted-search`, `node-height`, `balance-factor`, `is-avl`, `search-visits`. Verify each answer matches a direct engine call over seeds 0 to 99.
- [x] 3.2 Kinds for C5 and C6: `rotation-result`, `rotations-needed`, `lowest-unbalanced`, `rebalance-case`, `insert-final-tree`, with the known wrong trees for marking. Verify that no case name appears outside `conventions.ts` and that the tree-marking tests pass on real instances.
- [x] 3.3 Kinds for C7 and C8: `delete-rebalances` and `delete-root`, each with a bounded search and a pinned fallback, and `scenario-choice` over `answersOf` and `reasonOf`. Verify the fallback tests pass.

## 4. Content (content-author)

- [x] 4.1 Add `src/content/questions/outcomes.ts` (levels from the ID, marked `ID`), `subSkills.ts` (14 entries) and `misconceptions.ts` (18 entries marked `beyond ID`, plus the 7 need tags from `NEEDS`). Verify the record tests pass.
- [x] 4.2 Add `src/content/questions/checks.ts` with the 16 items from design decision 5. Each item has a stem, option labels where needed, `why.correct`, `why.other` for number items, and a `why` for every misconception its kind can produce. All convention wording goes through `ConventionsWording`. Mark each new sentence `[beyond ID]`. Verify `question-bank.test.ts` and `validateBank` pass.

## 5. Review

- [x] 5.1 Run `npm test`, `npm run typecheck`, `npm run lint`, `npm run build` and `openspec validate --all`, and verify they pass. Also check that:
  - there are no new `[OPEN]` markers
  - no file under `src/content/questions/` imports an engine function, only types
  - `src/assessment/` has no React import
- [ ] 5.2 Run the `reviewer` role in a fresh context against both specs, LO1 to LO9 and the conventions module. There is no UI, so the a11y-checker is not needed. Verify the report passes or its findings are resolved.

## Workflow follow-up

- Add assumed rows to `.claude/docs/decisions.md` for proposal items 1, 3 to 8 and 10. Record the misconception catalogue as drafted and pending your G3 read (item 2). Note the deviation from the SE document's section 6.7 (item 9).
- G3: read `src/content/questions/misconceptions.ts` and `checks.ts`, and resolve each `[beyond ID]` sentence.
- Change 20 uses `instantiate`, `mark` and `attemptRecord` to show the items and store attempts. Change 21 maps each misconception to a scaffold (FR-SCA-02).
- The user merges and archives; agents do not.
