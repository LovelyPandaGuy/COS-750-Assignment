# Design: add-readiness-c9

## Context

See proposal.md for why and scope. What exists and is reused:

- The question model (`src/assessment/`): `instantiate(item, seed, attempt)` gives a new problem per attempt, `mark`, `attemptRecord`, the `Kind` interface, and `validateItems` (tags, explanations, options, numbers, D19 wording, calm wording, and hints for every misconception a kind produces).
- Kinds that fit C9 already: `bst-height`, `node-height`, `balance-factor`, `search-visits` (`found: false`), `rotation-result`, `rebalance-case`, `delete-root`, `scenario-choice`.
- `searchBounds(n)` and `maxAvlHeight` in `src/modules/facts.ts` (D13), `avl` and `plain` in `kinds/shared.ts`, `avlInsertTrace` in the engine, and `generateInsertSequence` plus `variantSeed` in `engine/generate.ts`.
- The learner state stores `attempts` (with `confidence`, `misconceptionId`, `hintsUsed`) and `lectureQuestions` (D82).
- `validateBank` enforces 2 or 3 items per module from C2 to C8 and none for C9. So the C9 items go in a separate bank, not in `CHECKS`.

## Goals / Non-Goals

**Goals:** a pure session and pure report functions that the later screens drive, with every number from the engine and every verdict from stored attempts.

**Non-goals:** screens, print layout, writing `subSkillStatus`, the event log.

## Decisions

### 1. The readiness bank

`src/content/questions/readiness.ts` (content-author) exports `READINESS: readonly BankItem[]` in this order: `rdy-lo1` to `rdy-lo9`, then `rdy-build` and `rdy-search` (combined, last, as the ID lists them).

| ID | Kind | Outcome | Sub-skill | Level |
| --- | --- | --- | --- | --- |
| rdy-lo1 | bst-height | LO1 | bst-shape | understand |
| rdy-lo2 | node-height | LO2 | node-height | remember |
| rdy-lo3 | balance-factor | LO3 | compute-balance-factor | apply |
| rdy-lo4 | search-visits (`found: false`) | LO4 | trace-search | apply |
| rdy-lo5 | worst-search (new) | LO5 | search-complexity | understand |
| rdy-lo6 | rotation-result | LO6 | rotate | apply |
| rdy-lo7 | rebalance-case | LO7 | identify-rebalance-case | apply |
| rdy-lo8 | delete-root (optional) | LO8 | delete-rebalance | apply |
| rdy-lo9 | scenario-choice (every scenario) | LO9 | choose-structure | analyse |
| rdy-build | build-avl (new, combined) | LO7 | rebalance-insert | apply |
| rdy-search | search-built (new, combined) | LO4 | trace-search | apply |

`BankItem` gains `combined?: boolean`. Stems and explanations are new wording flagged `beyond ID` at the top of the file, as in `checks.ts`. Shared builders (`h`, `edges`, `list`) may be exported from `checks.ts` rather than copied. The file also exports `lectureListText(label)`, the lecture-list template (decision 6).

`OUTCOMES` gains `modules: readonly ModuleId[]` per outcome, from the ID's learning-objective list (source `ID`).

Alternative considered: put C9 items into `CHECKS` with `module: 'C9'`. Rejected because it breaks the "C9 has none in this bank" scenario and the per-module counts that the question-bank spec owns.

### 2. New kinds (`src/assessment/kinds/readiness.ts`)

- **`worst-search`** (choice). `n = rng.int(WORST_SEARCH_MIN, WORST_SEARCH_MAX)` (mechanics constants in the kind file: 16 and 4096). `b = searchBounds(n)`. Option values are tokens: `'plain-n-avl-log'` (answer), `'both-log'` (`M-ASSUMES-BALANCED`) and `'both-n'` (`M-SEARCH-VISITS-ALL`). `facts.values = { n, plainWorst: b.worst, avlWorst: b.avlWorst }`. The option texts are written by the content item from these values. The signature is `n`.
- **`build-avl`** (tree). `buildSequence(seed)`: try `variantSeed(seed, k)` for k = 0, 1, … until `generateInsertSequence(s, { count: READINESS_BUILD_KEYS })` gives an AVL build with at least one rotation (bounded by `TRIES`; a fallback sequence known to rotate is pinned by a test, as `DELETE_FALLBACK` is). The answer is `avl(keys)`. The wrong value is `plain(keys)` (`M-FORGETS-REBALANCE`). The trace concatenates `avlInsertTrace` for each key, with `index` renumbered, so `mark`'s divergence naming and `guidedSteps` work unchanged. `facts.tree = null`, `facts.keys = keys`.
- **`search-built`** (number). Same `buildSequence(seed)`. `tree = avl(keys)`, and the target is a key of the tree picked by seed (salted). Values and known wrong numbers are the same as `search-visits` (`steps`, `edges` → `M-COUNTS-EDGES`, `count` → `M-SEARCH-VISITS-ALL`), so they share the builder in `trees.ts`, exported.

`KindName` gains the three names, and `tests/assessment/helpers.ts`' `engineAnswer` gains three cases (test-writer). No new misconception enters the catalogue, so `validateBank(CHECKS)` stays clean (it requires every catalogue entry to be produced by `CHECKS`).

### 3. Validation

`validateReadinessBank(items, options)` in `src/assessment/validate.ts`: `validateItems(items, options)`, then structure checks. For each LO, exactly one item with `combined !== true`. Exactly two combined items, with outcomes LO7 and LO4. Every module is `C9`. `optional` holds only on the LO8 item. Problems use kind `bank` with `value` set to the LO or item ID.

### 4. The C9 session (`src/assessment/readiness.ts`)

```ts
interface ReadinessSession {
  seed: number
  queue: { itemId: string; attempt: number }[]   // what is still to come; head is current
  missed: string[]                                // first-pass misses, in order (for returns)
  phase: 'first' | 'returns' | 'done'
}
type ReadinessAction = { type: 'answer'; response; at; confidence? } | { type: 'skip' }
startReadiness(seed, items = READINESS): ReadinessSession
readinessStep(session, action, items = READINESS): { session; mark?; attempt? }
readinessInstance(session, items = READINESS): Instance | null
itemSeed(seed, item, index): number   // combined items: variantSeed(seed, COMBINED_SLOT); else variantSeed(seed, index)
```

When the first-pass queue empties, the session builds the returns queue from `missed` as `{ itemId, attempt: 1 }` (more generally `attempt: n` for n ≤ `READINESS_RETURNS`). A wrong answer in the returns phase is recorded, and the item is re-queued only while its attempt is below `READINESS_RETURNS`. `skip` works only when the current item is `optional`: it drops the item and never queues it again. Attempt records use `attemptRecord` with `hintsUsed: 0`. `READINESS_RETURNS = 1` lives in `src/modules/config.ts`. `COMBINED_SLOT` is a mechanic constant in this file.

Alternative considered: reuse the check session from change 21 (`checkStep`) per item. Rejected because C9 has no ladder and no cap of 3 (proposal item 5). Its "return at the end" spans items, which a per-question session cannot express.

### 5. The report (`src/assessment/report.ts`)

```ts
type ItemState = 'secure' | 'developing' | 'not-yet' | 'unassessed'
interface OutcomeReport { outcome: LoId; verdict: 'ready' | 'revise'; state: ItemState; items: { itemId; state }[];
                          confidentErrors: number; links: { module: ModuleId; activity: 'example' }[]; blocksReady: boolean }
interface ReadinessReport { outcomes: OutcomeReport[]; overall: 'ready' | 'revise' }
readinessReport(attempts: Attempt[], banks = { readiness: READINESS, checks: CHECKS }): ReadinessReport
```

- Attempts are grouped by `questionId` and sorted by `at`, with the stored order breaking ties. `itemState` follows the spec's four rules.
- Outcome state = the lowest assessed state (not yet < developing < secure), else unassessed. Verdict = ready iff state ∈ {secure, developing}.
- `blocksReady = outcome !== 'LO8'`. `LO8` is read from the readiness bank's optional item rather than typed, so a change to D4 is a content change. `overall = every blocking outcome is ready`.
- `confidentErrors`: attempts whose `questionId` is in either bank, `correct === false`, `confidence === 'sure'`, counted by the item's outcome.
- `links`: `OUTCOMES[lo].modules.map(m => ({ module: m, activity: 'example' }))`. The screens turn these into paths with `paths.activity`.

### 6. The lecture list (`src/assessment/report.ts`)

```ts
interface LectureList { generated: { misconceptionId; text }[]; drafted: LectureQuestion[]; own: LectureQuestion[]; needsOwn: boolean }
lectureList(attempts: Attempt[], lectureQuestions: LectureQuestion[], banks?): LectureList
```

Walk the attempts in time order, keeping for each misconception the time it first appeared. A misconception is resolved if, after its latest wrong attempt, some attempt on an item with the same sub-skill (looked up in either bank) is correct. `generated` lists the unresolved ones in order of first appearance, with text from `lectureListText(MISCONCEPTIONS[m].label)`. `drafted` holds the stored questions whose `questionId !== OWN_LECTURE_QUESTION`, and `own` the rest. `needsOwn = own.length === 0`.

"After its latest wrong attempt" (rather than after any wrong attempt) means a student who slips again after fixing it has the question listed again. Template: "Could we go over why it does not work when an answer {label}?" This is wording, written by the content-author and checked for calm wording.

## Risks / Trade-offs

- [Students can redo C9, and stored attempts have no run ID] → The latest attempts decide (decision 5). A redo naturally overrides an old run. A per-run report would need a run ID in the attempt shape, which is a storage change for later.
- [Build sequences with no rotation would make LO7's combined item trivial] → A bounded search plus a pinned fallback, and a property test over seeds 0 to 99.
- [LO5's numbers are large (up to 4096 keys)] → `numbersIn` already handles them. The AVL worst case comes from `maxAvlHeight`, which D13 already uses.
- [No ladder in C9 may feel harsh] → The single return and the links back are the support. The number of returns is one config entry. Adding the ladder later means calling change 21's `scaffolds` for the current instance, with no change to the session's shape.

## Migration Plan

None. Nothing stored changes shape; own questions use the existing lecture-question record.
