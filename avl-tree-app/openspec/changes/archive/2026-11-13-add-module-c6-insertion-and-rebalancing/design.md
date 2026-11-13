# Design

## Context

See proposal.md for why. Current state that shapes the approach:

- The framework plays C2, C3, C4, C5, C7 and C8. A step's `replay` can play an AVL insert with `predict` and `doItYourself` (D65 to D68); `computeFacts` attaches insert facts (`key`, `rebalanced`, `node`, `case`, `rotations`, `heightAfter`) to the replay figure.
- `TreeSource` has `bst`, `avl`, `rotated`, `practice` and `deleted`. `deleted` (C7) is the pattern to follow: build, apply an operation with the engine, record what it did.
- Rotation practice: a `practice` source with generator `single-rotation` or `double-rotation` gives a seeded base tree and a key whose plain insert unbalances it; `RotatePractice` wraps `DoItYourself`. The player keeps a visited rotation step mounted but hidden so Back keeps it (D53).
- `listings` takes `searchLoop` and `searchRecursive`; `pseudocode.insert` holds the ID's five-step outline and `replayCopy.panel.insert` its name.
- `conventionsWording().caseName` is the only source of case names (D19); `caseFor(zLeansLeft, yLeansLeft)` is the engine's rule.
- After this change C1 and C9 are the only modules with skeleton screens.

## Goals / Non-Goals

**Goals:**
- Every tree, case, node and count in C6 comes from the engine, and case names only through the wording.
- The practice reuses the rotation tool unchanged.

**Non-Goals:**
- New replay, prediction or rotation components.
- Seeded examples.

## Decisions

### 1. An `inserted` tree source

```
TreeSource += { kind: 'inserted'; keys: readonly Key[]; key: Key; rebalance: boolean }
```

`buildTree` builds the AVL tree of `keys`, then inserts `key` with `avlInsert` (`rebalance: true`) or plain `insert` (`false`). The figure's `tree` and its facts are those of the tree shown; `keys` in the facts is `[...keys, key]`, so `avlRootKey` is the root after the AVL insert. `insert` facts (`InsertFacts`) are always the engine's AVL insert of `key` into the base tree, so a plain-insert figure still tells the text which node the AVL insert rebalances at, with which case and how many rotations. The code that builds `InsertFacts` for replay figures moves into one function both paths call. A `key` already in `keys` is a source problem.

*Alternative:* a `bst` figure of all the keys. Rejected: an AVL tree is not the same as a BST of the same keys inserted in the same order, so the picture could differ from the engine's.

### 2. Listings and generator names

`ListingName` gains `'insert'`, so `listings: ['insert']` shows the five-step outline with no line lit. `GeneratorName` gains `'insert-rebalance'`; `practiceProblem` maps it to `generateRotationProblem(seed, size)` with `size` single or double drawn from the seed, so the step is one practice kind and mixes both.

### 3. Case practice logic

`src/modules/casePractice.ts`:

```
caseProblem(base, key) -> { tree, answer: RebalanceCase, z, y, zBalance, yBalance }
markCase(problem, picked) -> { kind: 'right' | 'not-yet', picked, answer, z, y, zBalance, yBalance }
```

`tree` is the plain insert; `answer` and `z` come from `avlInsert(base, key).rebalance`; `y` is z's taller child in `tree`; the balance factors are read from `tree`. A test ties `answer` to `caseFor` over the leans of z and y for seeds 0 to 199.

### 4. The practice component and the player

`NameTheCase` in `src/ui/module/practice/`: the tree (balance factors visible), a radio group of the four cases named by `caseName` over `REBALANCE_CASES`, Check, `PracticeFeedback`, `PracticeHints`, New tree. It reports `onSolved`. The player gives the step the practice kind `name-case`, the seed from the step as for other practice, and keeps `solved` and `hintsUsed` in its practice map. The rotation phase is the existing kept rotation block: its filter becomes "a `rotate` step, or a `name-case` step that is solved". The kept list gains a `name-case` step when the learner leaves it solved, as for `rotate`.

### 5. Content

`src/content/modules/c6.ts` (content-author). Explore: hook (an insert tips the tree), goals (LO7 from the ID), recall (rotations, balance factors), the outline (`listings: ['insert']`), then one content step for each of the ID's five steps in its order: BST insert (the plain insert's tree), update heights (the AVL tree and the plain insert side by side), find the lowest unbalanced node (20, 10, 30, 5 plus 1: two nodes out of balance, the AVL insert rebalances at the lower), work out the case (a single and a double example, names through `w.caseName`), rotate (the plain insert and the AVL insert, in-order keys unchanged, rotation count from the facts), and then why one rotation is enough (`bounds: [1_000_000]`). Worked example: done for you (30, 20 plus 10, replay), guided by node (20, 10, 30, 5 plus 1, `predict: 'node'`), guided by case (a double rotation, `predict: 'case'`, `doItYourself`), then the practice. Check and summary as for C5. The keys above are the ones found with the engine; the content file notes them. Practice wording goes in `src/content/modules/practice.ts`.

### 6. Skeleton tests and spec move to C9

The tests that used C6 as a skeleton (`module-player` "activities without content stay skeletons", `module-hub` "moving about" and the skeleton cases) use C9's Check activity. The `screen-skeletons` and `module-framework` deltas carry the same change in the specs.

## Risks / Trade-offs

- [Four-case radio group plus two trees is a lot at 360 px] → The radios wrap in a fieldset with 44 px targets; trees scroll in their own regions (D17); the 360 px touch check is part of the review task.
- [A seeded problem's rotation phase hides when New tree is pressed after solving] → New tree resets to naming; the kept block is keyed on the seed so it remounts.
- [Naming the case reveals nothing about direction] → Feedback on a wrong answer gives the balance factors and, via the wording, which way each leans, never the case name itself until it is right.
- [`inserted` and `deleted` sources are near copies] → Each is a few lines; a shared "apply operations" abstraction would be larger than the two.

## Migration Plan

No data migration. Roll back by reverting; C6 returns to skeleton screens.
