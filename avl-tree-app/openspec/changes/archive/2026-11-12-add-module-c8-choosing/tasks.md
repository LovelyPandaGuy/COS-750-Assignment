# Tasks

## 1. Red tests

- [x] 1.1 Write `tests/modules/structure-comparison.test.ts` and `tests/modules/c8.test.ts` from every non-UI scenario in `structure-comparison` and `module-c8-choosing`. Cover:
  - the record: four structures, every cell a cost class, every need answered, source marks, the ID rows and the AVL trade-off
  - binary search probes for 70 in 10 to 70, and the property over sizes 1 to 64
  - a typed probe count rejected by the validator
  - scenario answers: the BST example, every structure the answer somewhere, two answers and a named answer rejected, record scenarios valid
  - seeded scenario choice and option order, and New scenario changing the scenario
  - C8 validation, goals text, hook and array and trade-off facts, hash step costs from the record, the Red-Black mention only once, the worked scenario facts, practice coverage, summary text
  - the calm-wording scan over every scenario feedback and hint

  Name each test after the LO or FR it serves. Verify they fail only because the code and content do not exist.
- [x] 1.2 Write `tests/ui/c8-module.test.tsx` from every UI scenario:
  - C8 plays instead of the skeleton
  - the check placeholder leaves completed modules unchanged
  - array probes shown as text
  - the comparison table's headers and cells, and Show the rule
  - keyboard-only choose and Check, with focus on the feedback
  - Check with no choice
  - the hash table "Not quite yet" reason and "That's right"
  - hints count down, then Review
  - New scenario resets
  - nothing stored
  - Back then Next keeps the choice and hints
  - no skip on practice
  - axe on every C8 step

  Verify they fail only because the code does not exist and that all existing tests still pass.

## 2. Framework logic

- [x] 2.1 Add `src/modules/compare.ts`: the structure, cost, need and scenario types, `binarySearchProbes`, `answerOf`, `reasonOf` and `structureSummary` inputs. Extend `src/modules/schema.ts` with `arrays`, `table`, `scenario`, `scenarios` and the `scenario` practice kind. Extend `src/modules/facts.ts` with array and scenario facts. Verify the probe and answer tests pass on fixtures.
- [x] 2.2 Extend `src/modules/validate.ts`: `scenario` problems (no or several answers, unknown need, a named structure or Red-Black), array numbers in the fact numbers, and scenario text in the number and D19 scans. Verify the validator tests pass on their fixtures, and that the C2, C3 and C5 tests still pass.
- [x] 2.3 Add `pickScenario(step, seed)` to `src/modules/generators.ts` (seeded scenario and Fisher-Yates option order; New scenario always changes the scenario when there is more than one). Verify the seeded-choice tests pass.

## 3. Content (content-author, flagged for G3)

- [x] 3.1 Write `src/content/modules/structures.ts`: the four entries, the need labels and unmet sentences, the record summary, and at least six scenarios whose answers cover all four structures. Mark every entry `[ID]` or `[beyond ID]`. Verify the record and scenario tests pass.
- [x] 3.2 Write `src/content/modules/c8.ts` (the ID's C8 bullets, `RACE_KEYS`, each string beyond the ID marked) and register C8 in `src/modules/registry.ts`. Add the scenario feedback, hints and New scenario label to `src/content/modules/practice.ts`. Verify the C8 tests, the validator test over all registered modules and the calm-wording scan pass.

## 4. UI

- [x] 4.1 Add `src/ui/module/ArrayView.tsx` and `src/ui/module/ComparisonTable.tsx` (tokens only, sideways scroll at 360 px, probe labels and yes or no in text). Render them from `ModulePlayer` for steps with `arrays` or `table`. Verify the array and table UI tests and axe pass.
- [x] 4.2 Add `src/ui/module/practice/ScenarioPractice.tsx` (a controlled fieldset of radios, Check, `PracticeFeedback`, New scenario). Add `choice` and `checked` to the player's `PracticeState`, and wire hints and Review through the existing control strip. Verify the C8 UI tests, the module-player tests and the C3 and C5 practice tests pass.

## 5. Review

- [x] 5.1 Run `npm test`, `npm run typecheck`, `npm run lint`, `npm run build` and `openspec validate --all`. Verify:
  - all of them pass
  - there are no new `[OPEN]` markers
  - there are no edits under `src/engine/`, `src/practice/` or `src/ui/practice/`
- [ ] 5.2 Run the `reviewer` (fresh context) and `a11y-checker` roles. Then check by hand:
  - a keyboard-only run through C8
  - a greyscale screenshot
  - the colour-vision emulation check (D25)
  - a touch run of both scenario practice steps and the table at 360 px

  Verify the reports pass or their findings are resolved.

## Workflow follow-up

- Gate G3: read `src/content/modules/structures.ts` in full (every `[beyond ID]` cost, need and scenario), every `[beyond ID]` string in `c8.ts`, and the scenario feedback and hints (proposal item 1).
- When this change is archived, add assumed rows to `.claude/docs/decisions.md` for proposal items 1 to 6 (D18). Note in D15 that C8's check items wait for change 19, which can reuse the scenario records.
- Mark row 17 done in `next-steps.md`.
- The user merges and archives; agents do not.
