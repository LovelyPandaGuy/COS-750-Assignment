# Design

## Context

See proposal.md for why. Current state that shapes the approach:

- `src/routes.ts` maps each module to activities (`explore`, `example`, `check`); `App.tsx` routes `/module/:id/:activity` to `pages/Activity.tsx`, which renders `SkeletonScreen`. Both belong to the in-flight `add-routing-and-screen-skeleton`.
- The engine already has everything C2 and C3 need except two small helpers: `insert` (plain BST), `avlInsert`, `searchTrace` (step count = nodes visited), `analyseTree` (balance violations, lowest first), `checkAvl`, `height`, `balanceFactorOf`, `createRng`, `generateTree`. `avl-engine` has a change in flight, so new helpers go in `src/modules/`, not in `src/engine/`.
- `TreeView` always draws `h · bf` and the Unbalanced flag, from `describeTreeParts`; its wording lives in `src/content/treeView.ts`.
- Practice wording and a `FeedbackPanel` exist for rotations (`src/ui/practice/`), tied to `PracticeMessage`. They are not reused here (different message shape); C3 practice gets its own small panel that follows the same live-region and focus pattern.
- No replay or pseudocode UI exists (plan change 10 was never built). C2 and C3 need neither.

## Goals / Non-Goals

**Goals:**
- Every number a student sees in C2 and C3 is computed, and a test proves it.
- The balance-factor sign can flip in one module.

**Non-Goals:**
- Animation between steps (D17 layout snaps; reduced motion is the default behaviour here).

## Decisions

The step schema, facts, validator and step player are specified and designed in `add-module-framework` (decisions 1 to 5 there). This change adds the C2 and C3 pieces on top.

### 1. Conventions wording is one content file fed by two engine exports

`src/engine/conventions.ts` gains `BALANCE_FACTOR_ORDER = ['left', 'right'] as const` and `BALANCE_RANGE = [-1, 0, 1] as const`; `balanceFactor` and `isOutOfBalance` stay as they are, and a test ties them together. `src/content/modules/conventionsWording.ts` exports `conventionsWording(order = BALANCE_FACTOR_ORDER)` returning `formula`, `leanPhrase(bf)` (from `leanOf`), `rangeText`, `heightRule` (from `LEAF_HEIGHT`, `EMPTY_HEIGHT`). This is the only content file allowed to say which side comes first, and it never types the side: it maps `'left' | 'right'` to words.

### 2. Seeded practice trees

- Fill in: `generateTree(seed, { count: 5..7 drawn from the seed, balanced: false })` so some nodes may be out of range (more to think about).
- Spot the problem: `generateRootLooksFine(seed)` in `src/modules/generators.ts` draws plain-BST sequences of 6 to 9 keys from `createRng(seed)`, keeps the first whose `analyseTree` gives exactly one violation that is not the root and whose root is in range, and tries up to 200 sequences, then falls back to the hand-checked tree 50, 30, 70, 20, 80, 10. A property test covers seeds 0 to 199. Seeds come from `Date.now()` at mount; "New tree" draws another.

### 3. Practice components

`BalanceFactorFill` and `SpotTheProblem` in `src/ui/module/practice/`, both using `TreeView` interactive with the new hidden-balance mode. The answer input is a labelled number field with − and + buttons (44 px), Enter checks. Marking calls pure functions in `src/modules/practice.ts` that return a `PracticeResult` (`right | sign-slip | not-yet`, with engine facts); the feedback panel renders it with wording from `src/content/modules/practice.ts`. Nothing is written to the learner state.

### 4. Hidden balance in TreeView

New prop `hideBalance?: { reveal?: Key[] }`. `describeTreeParts` gets a `hidden` flag per node; `nodeName`, the sentence builder and the annotation use new content strings (`metricsHidden: h => 'h' + h + ' · bf ?'`, `bfHidden: 'balance factor hidden'`). The Unbalanced flag and "unbalanced" word are skipped for hidden nodes.

## Risks / Trade-offs

- [`add-module-framework` not archived first] → Archive it first; this change only adds module content and practice on its schema.
- [Generator cannot find a tree within 200 tries for some seed] → Deterministic fallback tree plus a property test over 200 seeds.
- [Wording beyond the ID reaches students] → Every such string is flagged in the content files and read at gate G3.

## Migration Plan

No data migration: no storage schema change. Roll back by reverting the change; C2 and C3 activities return to skeletons.
