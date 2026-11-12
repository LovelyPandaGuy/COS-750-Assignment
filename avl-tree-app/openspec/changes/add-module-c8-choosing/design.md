# Design

## Context

The module framework in `src/modules/` (schema, facts, validator, generators, registry) and the step player in `src/ui/module/` come from `add-modules-c2-c3`; `add-modules-c5-c6` added rotated sources, rebalance facts (`FigureFacts.rebalances`), the `bst` and `same-order` claims and rotation practice. The player keeps a `PracticeState` per step id (`regen`, which feeds the seed, `hintsUsed`, `solved`, `answered`), and the control strip already drives Hint (n) and Review the rule for any step with `practice`. Figures are trees only. Facts are trees and search bounds only. Nothing models an array or a hash table. See proposal.md for why and for the assumptions (items 1 to 9).

## Goals / Non-Goals

**Goals:**
- Comparison content that cannot disagree with itself: costs in one record, step counts from the engine, scenario answers computed from the record.
- A scenario practice step that later becomes a check item type (change 19) without rewriting the scenarios.

**Non-Goals:**
- A hash table model (hash functions, buckets, collisions). The hash table is described from the record only.
- A general table or array component library; both views serve C8 and the sandbox can reuse them later.

## Decisions

### 1. The structure record is content; its types are framework
`src/modules/compare.ts` (implementer) defines the types:
- `StructureId = 'bst' | 'avl' | 'sorted-array' | 'hash-table'`
- `CostClass = 'O(1)' | 'O(log2 n)' | 'O(n)'`
- `NeedId`, a closed union (decision 3)
- `StructureEntry = { name; search: { typical; worst }; insert: { typical; worst }; inOrder: boolean; costs: string[]; meets: Record<NeedId, boolean>; source: Record<field, 'ID' | 'beyond ID'> }`

`src/content/modules/structures.ts` (content-author) holds `STRUCTURES: Record<StructureId, StructureEntry>`, `NEEDS: Record<NeedId, { label; unmet: (name) => string }>` and `SCENARIOS: Record<ScenarioId, Scenario>`. Every entry carries its source mark, and the file header flags it for G3 (proposal item 1).

Because `meets` is a `Record` over the closed `NeedId` union, the type checker rejects a missing cell. Cost classes are a closed union, so the D19 number scan has nothing to check in the table. The `O(1)` text is rendered from the union, never typed into a step.

*Alternative:* hand-write the table as a step's paragraphs. This was rejected because scenarios then could not compute their answers from it, and two copies could drift.

### 2. Sorted array facts from a small model, not the engine
`binarySearchProbes(sorted: Key[], key): { probes: Key[]; found: boolean }` lives in `compare.ts`. It uses the midpoint `lo + floor((hi - lo) / 2)` over a 0-based index range. It is about ten lines and is checked by a property test. It is not an engine change: `avl-engine` is an archived capability, and C8 is its only user. If C4 or the sandbox later needs it, it can move into the engine.

`Step` gains `arrays?: readonly ArraySpec[]`, where `ArraySpec = { id; keys; searchKey; label }`. `computeFacts` adds `facts.arrays[id] = { sorted, searchKey, probes, probeCount, found }`, and the validator's `factNumbers` adds the sorted keys, searchKey and probeCount. The drawing (`ArrayView.tsx`) is an `<ol>` of cells inside a focusable region that scrolls sideways (D17). A probed cell gets a dashed outline token and a visually present "probe n" label, so the marker is not colour alone (design principle 2).

### 3. Needs decide every scenario
`NeedId` (assumed default, flagged; the content-author fills in labels and meets):

| Need | BST | AVL | Sorted array | Hash table |
| --- | --- | --- | --- | --- |
| `in-order`: keys listed in order | yes | yes | yes | no |
| `search-worst-log`: worst-case search O(log2 n) or better | no | yes | yes | no |
| `insert-worst-log`: worst-case insert O(log2 n) or better | no | yes | no | no |
| `insert-typical-log`: typical insert O(log2 n) or better | yes | yes | no | yes |
| `lookup-typical-constant`: typical exact-key lookup O(1) | no | no | no | yes |
| `no-balancing`: no stored height, no rotation work | yes | no | yes | yes |
| `keys-only`: stores only the keys, no links | no | no | yes | no |

`answerOf(scenario)` filters the four structures by `scenario.needs.every(n => meets[n])`. `reasonOf(scenario, s)` returns the first need in `scenario.needs` that `s` does not meet. With this table:
- `[in-order, insert-typical-log, no-balancing]` gives the BST.
- `[search-worst-log, insert-worst-log]` gives the AVL tree.
- `[search-worst-log, keys-only]` gives the sorted array.
- `[lookup-typical-constant]` gives the hash table.

The `meets` column for the AVL tree's `no-balancing` encodes the ID trade-off ("extra height in each node + rotation work").

`StepFacts` gains `scenarios: Record<ScenarioId, { needs; answer; ruledOut: { structure; need }[] }>` for a step with `scenario?: ScenarioId` (the worked example), so the worked step's text is built from facts like every other step.

### 4. Validator: scenario problems
`ProblemKind` gains `'scenario'`. `validateScenarios(SCENARIOS, STRUCTURES)` reports:
- zero or several answers (naming them)
- a need not in `NEEDS`
- text that matches any structure name in the record, or `/red-black/i`, case-insensitive

`validateModule` calls it for each scenario a step references, either a worked `scenario` or the `scenarios` list of a practice step. A record-level test runs it over all scenarios. The existing number and D19 scans also run on the scenario text.

### 5. Scenario practice: a controlled component
`Step` gains `scenarios?: readonly ScenarioId[]`, and `PracticeKind` gains `'scenario'`. `pickScenario(step, seed)` in `generators.ts` chooses `scenarios[rng.int(0, n - 1)]` and a Fisher-Yates order of the four structures from `createRng(seed)`. A regen (New scenario) changes the seed, as for New tree. If it picks the same scenario, it advances to the next in the list, so New scenario always changes the scenario when the list has more than one.

`ScenarioPractice.tsx` is controlled: props `{ scenario, order, choice, checked, onChoose, onCheck, onTryAgain, onNew, onReview, hintsUsed }`. The player's `PracticeState` gains `choice?: StructureId` and `checked?: StructureId`. Keeping that state in the player is what makes Back then Next keep the answer (proposal item 6), and it needs no hidden mount. It uses a native `<fieldset>` with radio inputs, so arrow keys, labels and touch come free; each label row is at least 44 px. After Check, focus moves to the feedback region (`role="status"`, the same `PracticeFeedback` as C3).

Feedback and hints come from `practiceModuleCopy.scenario` in `src/content/modules/practice.ts` (content-author, flagged):
- `why.right(answer, needs)`, `why.notYet(choice, need)` using `NEEDS[need].unmet(name)`
- `hints.nudge(needs)` and `hints.fuller(ruledOut)`

Review (in the feedback and after the hints) opens the step's rule. For practice steps that is the one-sentence-per-structure summary of the record, the same text as the comparison step's rule.

### 6. Comparison table
`Step` gains `table?: 'structures'`. `ComparisonTable.tsx` renders a `<table>` with a `<caption>`, `<th scope="col">` for each column and `<th scope="row">` for each structure name. Cells come from the record, and keys-in-order is shown as the words "yes" or "no", not a glyph. It sits inside the same sideways-scroll region as trees at 360 px. The rule text (`structureSummary(STRUCTURES)`) is built in content from the record.

### 7. C8 content shape (`src/content/modules/c8.ts`)
`RACE_KEYS` is a constant in c8.ts: 10, 20, ... 150 (15 sorted keys, proposal item 4). The steps:
- `c8-hook`: two figures, `bst` and `avl` from `RACE_KEYS`, with searchKey 150, and claims not-avl and avl. The text gives both search step counts and asks "So is an AVL tree always the best choice?"
- `c8-goals`: LO9 and LO5, the ID text.
- `c8-recall`: search cost follows height, and the AVL rule keeps height small, through `w.rangeText`.
- `c8-array`: an array figure from `RACE_KEYS` with searchKey 150, the probe count, and the shifting cost read from the record.
- `c8-hash`: text only, with costs and order read from the record.
- `c8-tradeoff`: the `avl` figure from `RACE_KEYS`, and the rotation count from `rebalances.length`.
- `c8-compare`: `table: 'structures'`, with the rule as the record summary.
- `c8-red-black`: the mention.
- `c8-worked` (example): `scenario` with an AVL answer, text from scenario facts.
- `c8-practice-1` and `c8-practice-2`: each lists three or four scenarios, and together they cover all four answers.
- `c8-check`: the placeholder.
- `c8-summary`.

Every Explore step after recall is a content step, so skip lands in Worked example, as in C3 and C5. Each string beyond the ID carries a `[beyond ID]` comment.

## Risks / Trade-offs

- [Comparison facts beyond the ID could be wrong or framed differently from the lecture.] → One record, every entry source-marked, G3 read before students see it (proposal item 1). A lecturer correction changes one file, and the validator re-checks every scenario's answer.
- [The needs table oversimplifies: a hash table's O(n) worst case and a BST's "typical" case depend on assumptions.] → Needs are worded as typical and worst case explicitly, and the hash table step names the worst case. This is flagged as beyond the ID.
- [Wide comparison table at 360 px.] → It scrolls sideways in a focusable region, like trees (D17). Columns are short cost classes.
- [Scenario wording could hint at the answer indirectly (e.g. "hashing").] → The validator bans structure names. The content-author is asked to avoid synonyms, and G3 reads every scenario.
- [The race keys may give an AVL search count equal to the array probe count, which is fine but less striking.] → Text compares the chain with both, never claims one beats the other unless the facts show it.

## Migration Plan

Additive only. Rollback is reverting the change; C8 then shows its skeleton screens again.
