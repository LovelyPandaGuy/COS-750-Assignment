# Design

## Context

See proposal.md for why. Current state that shapes the approach:

- `TreeSource` has `bst`, `avl`, `rotated` and `practice` kinds; `figureFacts` computes height, nodes, violations, search steps and rebalances when the keys go into an AVL tree. Figures are drawn side by side (0 to 2 per step).
- Engine: `remove(tree, key)` (plain BST; two children take the in-order successor), `avlDelete(tree, key)` returning `rebalances: { case, node }[]` (lowest first), `analyseTree(tree).balanceViolations` (lowest first).
- C3's `SpotTheProblem` marks against a single violation (`markSpot`); `TreeView` has `hideBalance` and interactive selection; `PracticeFeedback` and `PracticeHints` give the four-part feedback.
- The player gives each practice step a seed and keeps `solved` and `hintsUsed` in its practice map.

## Goals / Non-Goals

**Goals:**
- Every delete shown in C7, and every number about it, comes from the engine.
- No case names (lecturer question 4).

**Non-Goals:**
- Delete traces or replays; rotating after a delete.

## Decisions

### 1. A `deleted` tree source

```
TreeSource += { kind: 'deleted'; build: 'bst' | 'avl'; keys: readonly Key[];
                remove: readonly Key[]; rebalance: boolean }
FigureFacts += deletes?: DeleteFacts[]
DeleteFacts = { key; children: 0 | 1 | 2; successor: Key | null; rebalances: { node: Key }[] }
ClaimKind += 'multi-rebalance'   // the figure's last delete has two or more rebalances
```

`buildTree` inserts `keys` with `insert` or `avlInsert` (per `build`), then for each key in `remove` reads the children and successor from the tree before, and deletes with `avlDelete` (rebalance) or `remove` (no rebalance), keeping the engine's rebalances. Deleting a key that is not in the tree is a source problem, reported by the validator like an impossible rotation. The validator's fact numbers gain each delete's key, successor, child count, rebalance nodes and rebalance count.

*Alternative:* a `before` figure and an `after` figure built separately with typed keys. Rejected: the after tree would be typed, not computed.

### 2. Delete practice logic

`src/modules/deletePractice.ts`: `drawDeletePractice(seed)` returns `{ before, key, after }`: for attempt i from 0 to 199, `generateTree(variantSeed(seed, i), { count: 7 + (i % 4), balanced: true })`, then the first key (in a seeded order) whose `remove` leaves `analyseTree(after).balanceViolations` non-empty; fallback `20, 10, 30, 40` without 10. `markAfterDelete(after, picked)` returns `right` when `picked` is the lowest violation, `higher` when it is another violation, `in-balance` otherwise, with the answer and its side of the root for the hint.

### 3. Practice component

`FindAfterDelete` in `src/ui/module/practice/`: the before tree (balance shown, label names it), the deleted key, the after tree interactive with `hideBalance={{}}` until solved, a Check button, `PracticeFeedback` and `PracticeHints`. State lives in the player (`solved`, `hintsUsed`; the selection is local). Practice kind `'after-delete'`; the player draws with `drawDeletePractice(seed)`.

### 4. Content

`src/content/modules/c7.ts` (content-author). Recap tree 50, 30, 70, 20, 40, 60, 80 (plain BST): leaf 20; one child: the same keys without 40, delete 30; two children: delete 50. Rebalance up: 20, 10, 30, 40 into an AVL tree, delete 10, once without rebalancing (figure "after a plain delete") and once with. Multi: 8, 5, 11, 3, 7, 10, 12, 2, 4, 6, 9, 1, delete 12, without and with rebalancing, claim `multi-rebalance` on the second. Worked example: the same tree, delete 11, walking up node by node in the text from the facts. Practice wording in `src/content/modules/practice.ts`.

## Risks / Trade-offs

- [Two 12-key trees side by side are wide at 360 px] → Each tree scrolls in its own region (D17); figures stack below two-column width as they already do.
- [Generator finds no unbalancing delete for a seed] → 200 attempts with growing sizes, then the fallback; property test over 200 seeds.
- [`rebalances` only names nodes here, not cases] → Intentional (lecturer question 4); the case stays in the engine result for later.

## Migration Plan

No data migration. Roll back by reverting; C7 activities return to skeletons.
