# Design

## Context

Module content is already data. `src/modules/schema.ts` types steps, and `src/modules/validate.ts` checks them. That check covers Gagné order, claims, numbers that must be engine facts, and the D19 wording scan (the `BANNED` patterns plus a case-name marker). The engine offers the following:
- seeded generators: `generateTree`, `generateInsertSequence`, `generateCaseSequence` and `variantSeed`
- `avlInsertTrace`, `avlDelete`, `rotateLeft`/`rotateRight`, `searchTrace` and `analyseTree`
- `caseFor`, `leanOf` and the constants in `conventions.ts`

The practice code in `src/modules/practice.ts` and `generators.ts` already marks a balance factor (with a sign slip), spots a broken node and generates rotation problems. C8 has the comparison record, `answersOf`/`reasonOf` and the `NEEDS` wording.

Learner storage already defines `Attempt` (`questionId`, `at`, `answer`, `correct`, `confidence?`, `misconceptionId?`, `hintsUsed`) and validates it on load. No module has a check yet: each check step shows `screenCopy.coming`.

## Goals / Non-Goals

**Goals:**
- One item model for checks now and for the diagnostic and readiness later (D7).
- No answer typed anywhere. Each kind computes the answer and the wrong options from the engine.
- Every wrong option is tagged and explained. The validator proves this over 100 seeds.
- Wording stays in `src/content/`, and mechanics stay in `src/assessment/`, so the content-author and implementer write separate files.

**Non-Goals:**
- Any UI, storage write or event (changes 20, 21 and 26).
- Moving the existing practice activities onto the model.
- Scaffolds per misconception (change 21).

## Decisions

### 1. Layout

| Path | Holds | Written by |
| --- | --- | --- |
| `src/assessment/types.ts` | `BloomLevel`, `AnswerType`, `BankItem`, `Instance`, `Option`, `Response`, `Mark` | implementer |
| `src/assessment/kinds/*.ts` + `kinds/index.ts` | the 14 kinds and the `KINDS` registry | implementer |
| `src/assessment/instantiate.ts` | seeds, variants, option order | implementer |
| `src/assessment/mark.ts` | choice, number and tree marking | implementer |
| `src/assessment/attempt.ts` | `attemptPolicy`, `attemptRecord` | implementer |
| `src/assessment/validate.ts` | `validateBank` | implementer |
| `src/content/questions/outcomes.ts` | LO1 to LO9 with the ID's Bloom levels (source: ID) | content-author |
| `src/content/questions/subSkills.ts` | 14 sub-skills, each with its LO | content-author |
| `src/content/questions/misconceptions.ts` | the catalogue (18 entries, `beyond ID`) and the 7 need tags | content-author |
| `src/content/questions/checks.ts` | the 16 items: tags, kind, params, stem, option labels, explanations | content-author |

Content imports only types from `src/assessment/`. The assessment layer reads the content records through default parameters, as `compare.ts` already does, so there is no import cycle.

### 2. The item and the kind
```ts
interface BankItem {
  id: string; module: ModuleId; kind: KindName; params?: KindParams
  outcome: LoId; subSkill: SubSkillId; level: BloomLevel; optional?: boolean
  stem: (f: KindFacts, w: ConventionsWording) => string
  /** Choice items whose options are not keys or numbers (yes or no, structures, cases). */
  optionText?: (value: OptionValue, f: KindFacts, w: ConventionsWording) => string
  /** 'correct', 'other' (number items) and one entry per misconception the kind can produce. */
  why: Partial<Record<'correct' | 'other' | MisconceptionId, (f: KindFacts, w: ConventionsWording) => string>>
}
interface Kind {
  type: AnswerType
  /** Every misconception this kind can produce; the validator demands a `why` for each. */
  misconceptions: readonly MisconceptionId[]
  build(seed: number, params?: KindParams): Built
}
interface Built {
  facts: KindFacts        // tree, keys, marked node, scenario, values the text may show
  numbers: number[]       // every number the text may show
  signature: string       // identity of the problem, to make retries differ
  answer: OptionValue | number | Tree
  wrong: { value: OptionValue | number | Tree; misconception: MisconceptionId }[]
}
```
For number items, `wrong` lists the values to recognise. For tree items, it lists the trees. For choice items, it lists the distractor options. Duplicates of the answer, or of each other, are dropped, keeping the first misconception.

### 3. Instantiation, variants and option order
`instantiate(item, seed, attempt)`:
- Attempt 0 uses `seed`.
- Attempt `n` uses `variantSeed(seed, n)`. If the built signature equals attempt `n − 1`'s, it tries `variantSeed(seed, n + 1000·k)` for k = 1 to 10. A kind whose generator can return the same problem (for example a fallback tree) gets a second variant path this way.
- Options are shuffled with Fisher–Yates over `createRng(variant)`.
- Option IDs are `opt-` plus a stable value key, so marking ignores the order.
- Explanations are rendered at instantiation with `conventionsWording()`. The instance carries plain strings, ready for change 20.

### 4. Marking
`mark(instance, response): Mark`, where a `Mark` is `{ status: 'correct' | 'not-yet' | 'unreadable', misconceptionId?, explanation, divergedAt? }`. "Not-yet" follows D27's wording.
- **Choice:** by option ID.
- **Number:** parse with the existing `parseWhole`. A null result is `unreadable`. A match against a `wrong` value gives that misconception; any other wrong number gets `why.other`.
- **Tree:** compare keys and shape recursively, ignoring stored heights.
  - Known wrong trees match a misconception.
  - `divergedAt` is the index of the first trace step (insert or rotation) the student does not reach:
    - The student's tree equals a snapshot after step i: the divergence is step i + 1 (stopped early).
    - The keys differ: the insert step.
    - Otherwise: the first rotation step.

### 5. The bank (16 items, 14 kinds)

| Item | Module | Kind | Type | LO | Sub-skill | Level | Answer (engine) | Wrong options and tags |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| chk2-height | C2 | bst-height | choice | LO1 | bst-shape | understand | height of the plain BST of 5–7 seeded keys | height + 1 (M-HEIGHT-NODES); AVL height of the same keys (M-ORDER-IRRELEVANT) |
| chk2-worst | C2 | sorted-search | choice | LO1 | search-cost | understand | nodes visited finding the largest of n sorted keys (n = 5–9) | best-case count from `searchBounds` (M-ASSUMES-BALANCED); n − 1 (M-COUNTS-EDGES) |
| chk3-height | C3 | node-height | number | LO2 | node-height | remember | height of a marked inner node | height + 1 (M-HEIGHT-NODES); its depth (M-HEIGHT-IS-DEPTH) |
| chk3-bf | C3 | balance-factor | number | LO3 | compute-balance-factor | apply | balance factor of a marked node, not 0 | the negation (M-BF-SIGN); the value with an empty subtree taken as 0 (M-EMPTY-HEIGHT) |
| chk3-avl | C3 | is-avl | choice | LO3 | avl-property | apply | even variant: root-looks-fine tree, so not AVL; odd: an AVL tree that is not perfect | "is AVL" (M-ROOT-ONLY); "is not AVL" (M-PERFECT-ONLY) |
| chk4-found | C4 | search-visits (found) | choice | LO4 | trace-search | apply | nodes `searchTrace` visits for a present key in a 7-key AVL tree | count − 1 (M-COUNTS-EDGES); all n nodes (M-SEARCH-VISITS-ALL) |
| chk4-missing | C4 | search-visits (missing) | choice | LO4 | trace-search | apply | the same, for an absent key between two present ones | the same two |
| chk5-rotate | C5 | rotation-result | choice | LO6 | rotate | apply | new subtree root after rotating left or right at a node with two children | the other direction's root (M-ROTATION-DIRECTION); the node itself (M-ROOT-STAYS) |
| chk5-count | C5 | rotations-needed | choice | LO6 | rotation-count | apply | single rotations the insert needs (1 or 2) | 1 for a bent shape (M-SINGLE-FOR-BENT); 2 for a straight one (M-ALWAYS-DOUBLE) |
| chk6-node | C6 | lowest-unbalanced | choice | LO7 | find-unbalanced-node | analyse | z, the lowest unbalanced node after the BST insert | another path node: out of range (M-HIGHEST-UNBALANCED) or in range (M-IN-RANGE-PICKED); up to 4 options |
| chk6-case | C6 | rebalance-case | choice | LO7 | identify-rebalance-case | analyse | the engine's case, named through `w.caseName` | the mirror case `caseFor(!zl, !yl)` (M-BF-SIGN); bent → `caseFor(zl, zl)` (M-SINGLE-FOR-BENT), straight → `caseFor(zl, !zl)` (M-ALWAYS-DOUBLE) |
| chk6-tree | C6 | insert-final-tree | tree | LO7 | rebalance-insert | apply | `avlInsert` result | plain insert (M-FORGETS-REBALANCE); the second single rotation alone (M-SINGLE-FOR-BENT); the mirror rotation at z (M-ROTATION-DIRECTION); a rotation at a higher unbalanced node (M-HIGHEST-UNBALANCED) |
| chk7-count | C7 | delete-rebalances | choice | LO8 | delete-rebalance | apply | rebalances `avlDelete` reports (even variants seek 2) | 0 (M-FORGETS-REBALANCE); 1 when the answer is 2 (M-DELETE-ONE-ROTATION) |
| chk7-root | C7 | delete-root | choice | LO8 | delete-rebalance | apply | root key after `avlDelete`, for a delete that rebalances at the root | root after the plain `remove` (M-FORGETS-REBALANCE) |
| chk8-pick-a | C8 | scenario-choice | choice | LO9 | choose-structure | analyse | `answersOf` for a scenario from list A | each other structure: `M-NEED-<need>` from `reasonOf`; explanation `NEEDS[need].unmet(name)` |
| chk8-pick-b | C8 | scenario-choice | choice | LO9 | choose-structure | analyse | the same, list B | the same |

All C7 items are `optional: true`. Sub-skill `search-complexity` (LO5) is reserved for the readiness bank (change 23). The 1 or 2 rotations come from `rotationsFor`, and the case from `caseFor`, so no case name is spelled outside `conventions.ts`.

**Generators**
- Kinds that need a rotation problem reuse `generateRotationProblem` (single for even variants, double for odd).
- Kinds that search for a property (`delete-rebalances` wanting 2, `delete-root`) try up to 200 seeded trees. Each then falls back to a hand-checked key list, which a test pins (the same pattern as `ROOT_LOOKS_FINE_FALLBACK`).

### 6. Misconception catalogue (`beyond ID`, read at G3)
| ID | Label |
| --- | --- |
| M-HEIGHT-NODES | counts height in nodes, not edges |
| M-HEIGHT-IS-DEPTH | measures a node's height from the root down |
| M-ORDER-IRRELEVANT | expects the same keys to give the same shape in any order |
| M-ASSUMES-BALANCED | expects every BST search to be short |
| M-COUNTS-EDGES | counts the moves between nodes, not the nodes visited |
| M-SEARCH-VISITS-ALL | expects a search to look at every node |
| M-BF-SIGN | subtracts the subtree heights in the other order |
| M-EMPTY-HEIGHT | gives an empty subtree the same height as a leaf |
| M-ROOT-ONLY | checks the balance rule only at the root |
| M-PERFECT-ONLY | expects an AVL tree to be perfectly balanced |
| M-ROTATION-DIRECTION | rotates the other way |
| M-ROOT-STAYS | keeps the rotated node on top |
| M-SINGLE-FOR-BENT | uses one rotation where the shape bends |
| M-ALWAYS-DOUBLE | uses two rotations where the shape is straight |
| M-HIGHEST-UNBALANCED | fixes a higher unbalanced node, not the lowest |
| M-IN-RANGE-PICKED | picks a node whose balance factor is still in range |
| M-FORGETS-REBALANCE | stops after the BST insert or delete |
| M-DELETE-ONE-ROTATION | expects a delete, like an insert, to need at most one rebalance |
| M-NEED-`<need>` (7) | label taken from `NEEDS[need].label`, one per `NEED_IDS` entry |

None of the labels states a formula, a lean or a case name. The explanations that do need them call `w.formula`, `w.leanPhrase`, `w.heightRule` or `w.caseName`.

### 7. Attempt policy and record
`config.ts` gains `RETRY_CAP = 3`.
- `attemptPolicy('check')` returns `{ retryCap: RETRY_CAP, hints: 'ladder' }`.
- `attemptPolicy('practice')` returns `{ retryCap: null, hints: PRACTICE_HINTS, afterHints: 'offer-review' }`.

`attemptRecord(instance, response, mark, { hintsUsed, confidence?, at })` returns an `Attempt`. A test runs it through the learner-state validator. An `unreadable` mark gives no record.

### 8. Validator reuse
`src/modules/validate.ts` gains two exports, with its behaviour unchanged:
- `statesConvention(text): boolean`, the existing `BANNED` scan after `stripWording`
- the existing `numbersIn`

`validateBank(items, { seeds = 0..99 })` does the following:
- Renders every item with the case-marker wording, as the module validator does.
- Checks each number against `Built.numbers`, the conventions constants and the option values.
- Scans for `wrong|fail|incorrect`.
- Checks the tags against the content records, the per-module counts, and that every catalogue entry is produced.

It returns `Problem[]`, using the existing `Problem` shape with new kinds: `tag`, `bank`, `option` and `misconception`.

## Risks / Trade-offs

- [The catalogue's wording is new teaching content.] → Every entry is marked `beyond ID`, the proposal flags it for G3, and the validator keeps it neutral and free of convention wording.
- [Some kinds produce a misconception only on some seeds (for example M-EMPTY-HEIGHT needs an empty subtree).] → The coverage test runs 100 seeds per item. If a tag still never appears, the kind's generator prefers such problems on even variants.
- [Delete searches may be slow or find nothing.] → They are bounded to 200 tries, with a pinned, hand-checked fallback.
- [Sixteen items over 14 kinds make a large change.] → The tasks group the kinds into four tasks by module, which stays at about ten tasks. If the apply runs long, split the kinds for C6 to C8 into a follow-up change.
- [Item text is rendered at instantiation, so a wording change needs a new instance.] → Instances are cheap and never stored. Only the attempt record is stored, and it holds no text.
