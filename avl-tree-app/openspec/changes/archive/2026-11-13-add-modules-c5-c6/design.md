# Design

## Context

`add-modules-c2-c3` built the module framework in `src/modules/` (schema, facts, validator, generators, registry), the step player and control strip in `src/ui/module/`, and the conventions wording in `src/content/modules/conventionsWording.ts`. `add-predict-and-do-it-yourself` built `DoItYourself` (`src/ui/practice/`, props `base`, `keyToInsert`) with its reducer in `src/practice/rotate.ts` (`startTree`, `rotationsNeeded`, `rotateAt`). The engine has `rotateLeft`, `rotateRight`, `avlInsert`, `avlInsertTrace` (rotation steps `[at, pivot]`, pivot smaller means a right rotation) and `generateCaseSequence(seed, case, options)`. All five capabilities are in flight in other changes (proposal item 2), so this change extends their code where needed but adds requirements only to its two new capabilities.

## Goals / Non-Goals

**Goals:**
- Before-and-after rotation figures and C5's case example built entirely from engine facts.
- Rotation practice inside the step player with D21 support, without changing `DoItYourself`.
- Additions that C6 (`add-module-c6-insertion`) can reuse: rebalance facts and the case-name wording.

**Non-Goals:**
- Any insert replay or step controls (next change).
- A general "keep every step mounted" player; only rotation practice is kept.

## Decisions

### 1. A `rotated` tree source, not a "rotation-of" claim
`TreeSource` gains `{ kind: 'rotated'; keys; rotations: readonly { dir: 'left' | 'right'; at: Key }[] }`. `buildTree` inserts the keys into a plain BST, then applies each rotation with `replaceAt(tree, at, rotateLeft | rotateRight)`. Because the engine produces the after picture, it cannot disagree with the before picture.
*Alternative:* two plain figures plus a claim "B is A rotated left at 10". This was rejected because content could then type a wrong tree and only the validator would catch it. With the source, the wrong tree cannot be written at all.
The engine's rotations return the tree unchanged when the needed child is missing, so the facts builder records a `sourceProblems` entry (key missing, or no child on that side). The validator turns it into a `source` problem. `buildTree` itself never throws, so the player still renders.

### 2. Rebalance facts come from replaying `avlInsert`
For every figure with `keys` (`bst`, `avl` or `rotated`), `figureFacts` folds `avlInsert` over the keys and keeps each non-null `rebalance` as `{ key, node, case, rotations }`, where `rotations` is 1 when `case[0] === case[1]` and 2 otherwise. This matches `rotationsNeeded` in `src/practice/rotate.ts`; the shared rule moves into a small helper in `src/modules/facts.ts`, and practice keeps its own copy because `do-it-yourself` is not changed.
Rebalance `key` and `node` values join the validator's fact numbers. `rotations` (1 or 2) also joins them, so "two rotations" written as a number passes. Content still prefers words, through a `count` wording.
`inOrder` is added to `FigureFacts` from an in-order walk, and so is `avlRootKey`, the root after the same fold. This lets a plain-BST figure (the unbalanced shape a student should see) also report where the AVL tree ends up. `rootKey` already exists.

### 3. Case names through `conventionsWording`
`ConventionsWording` gains `caseName(c: RebalanceCase): string`, which returns the conventions module's name. Today that is an identity over `REBALANCE_CASES`. It is a function so that a lecturer answer such as "left-left" changes one place. Content writes `w.caseName(f.rebalances[0].case)`. The validator's existing D19 scan runs on the content source with the wording stripped (as for the formula), so typed names in `c5.ts` are still rejected. A source-text test also greps `src/content/modules/c5.ts` for the four names.

### 4. New claims: `bst` and `same-order`
`Claim` becomes `{ figure; is: ClaimKind } | { figure; is: 'same-order'; as: string }`, and `ClaimKind` gains `'bst'`. `bst` uses `analyseTree(tree).orderViolations.length === 0`, and `same-order` compares the `inOrder` arrays. Both live in `validate.ts` next to the existing claims.

### 5. Rotation practice problems
`generators.ts` gains `generateRotationProblem(seed, size: 'single' | 'double')`. It picks a case by seed (LL or RR for single, LR or RL for double), calls `generateCaseSequence(seed, case, { count: ROTATION_PRACTICE_KEYS + 1, min: 1, max: 99 })` and returns `{ base, key }`, where `base` is the AVL tree of all but the last key. `ROTATION_PRACTICE_KEYS = 5` is in `config.ts` (proposal item 7). `TreeSource`'s practice generator names gain `'single-rotation' | 'double-rotation'`, and `PracticeKind` gains `'rotate'`. For a practice figure, `buildTree` returns the start tree (after the plain insert), so the figure facts describe what the student sees. A new `practiceProblem(step, seed)` returns `{ base, key }` for the component.

### 6. `RotatePractice` wraps `DoItYourself`
`src/ui/module/practice/RotatePractice.tsx` renders `<DoItYourself base key>`, the hints list and New tree. These are the same `PracticeHints` and button as C3. Hint facts come from `avlInsertTrace(base, key)`: z and y from the `imbalance` step, and each rotation `[at, pivot]` from the `rotation` steps (direction from pivot < at). The hint text comes from `practiceModuleCopy.rotate.hints`. The control strip's Hint (n) and Review the rule are unchanged, because the player already drives them by `PRACTICE_HINTS` for any step with `practice`.

### 7. Keeping rotation practice when going back
`DoItYourself` keeps its state inside, and changing it is out of scope. So `ModulePlayer` renders every visited `rotate` practice step of the current activity, and gives the non-current ones `hidden` (removed from the accessibility tree and the tab order). It keys each one by `step.id + seed`, so New tree (a new seed) remounts it. Other step kinds render as before. The activity is short (two practice steps), so the cost is two small trees.
*Alternative:* lift `DoItYourself`'s reducer state into the player through new props. This was rejected for now because it changes the in-flight `do-it-yourself` capability. A later change can do it once that capability is archived.

### 8. C5 content shape
`src/content/modules/c5.ts` has these steps:
- `c5-hook`: bst 10, 20, 30, claim not-avl, node 10's balance factor through `w.num`.
- `c5-goals`: LO6.
- `c5-recall`: the AVL rule through `w.rangeText`, and BST order.
- `c5-single`: four figures. bst [10,20,30] and rotated left at 10; bst [30,20,10] and rotated right at 30.
- `c5-double`: three figures, from bst [30,10,20].
- `c5-order`: two figures, with claims bst and same-order.
- `c5-cases`: an example step with four `bst` figures, keys in the four orders. Drawing the unbalanced shapes shows four different problems; four identical AVL results would show nothing. The rebalance facts give each case and rotation count, and `avlRootKey` gives 20.
- `c5-practice-single` and `c5-practice-double`.
- `c5-check`: the placeholder.
- `c5-summary`.

Every Explore step after recall is a content step, so "I know this, skip" lands in Worked example, as in C3. Each string beyond the ID carries a `[beyond ID]` comment.

## Risks / Trade-offs

- [Hidden mounted practice could leak focus or duplicate IDs.] → `hidden` removes it from focus order. Tree IDs come from `useId`, so they stay unique. The axe test runs on every step with the hidden one present.
- [`generateCaseSequence` may throw for some seed and case at 6 keys.] → The property test over seeds 0 to 199 catches it. If needed, the generator retries with `variantSeed` and falls back to a fixed problem (as `ROOT_LOOKS_FINE_FALLBACK` does in C3).
- [Rebalance facts duplicate `rotationsNeeded` logic.] → Both come from the engine's case. A test asserts they agree on the generated problems.
- [The four-cases step draws four trees, which is wide on phones.] → Trees keep their natural size and scroll sideways (D17). Each is 3 nodes, and they wrap in `.module-figures`.

## Migration Plan

Additive only. Rollback is reverting the change; C5 then shows the skeleton again.
