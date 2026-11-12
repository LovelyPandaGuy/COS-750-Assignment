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
- A data model for modules that later modules (C4 to C9) and change 12 extend without reshaping.
- Every number a student sees in C2 and C3 is computed, and a test proves it.
- The balance-factor sign can flip in one module.

**Non-Goals:**
- A general content-authoring language. Steps are TypeScript records with text functions.
- Animation between steps (D17 layout snaps; reduced motion is the default behaviour here).

## Decisions

### 1. Module content is typed data with text functions

```
ModuleContent = { id: ModuleId, steps: Step[], allowances?: ... }
Step = {
  id, event: GagneEvent, heading: string,
  primary: 'diagram' | 'text',          // D22; 'pseudocode' and 'animation' reserved
  figures?: FigureSpec[]                 // 0 to 2 trees, drawn side by side
  bounds?: number[]                      // sizes for best/worst search bounds
  text: (f: StepFacts) => string[]       // paragraphs
  rule?: (w: ConventionsWording, f: StepFacts) => string   // supporting, on demand
  claims?: Claim[]                       // checked by the validator
  allow?: { value: number, reason: string }[]
  practice?: 'fill-in-bf' | 'spot-the-problem'
}
FigureSpec = { id, source: { kind: 'bst' | 'avl', keys } | { kind: 'generated', generator, seed }, searchKey?, label }
```

The activity is not stored on the step: it is derived from the event through one table, `EVENT_ACTIVITY` (proposal item 2), so content cannot put a step in the wrong place and the validator checks order only.

*Alternative:* Markdown files with placeholders. Rejected: typed functions give the compiler a check on every fact name and need no parser.

### 2. Facts are computed once per step, outside content

`computeFacts(step, seed)` in `src/modules/facts.ts` builds each figure's tree with `insert` or `avlInsert` (or a generator), then returns per figure: `tree, keys, height, nodeCount, rootKey, searchSteps?, isAvl, isPerfect, violations`, and per bound size: `best = floor(log2 n) + 1`, `worst = n`. Content receives `StepFacts` and only formats. `isPerfect` (every leaf at the same depth and every internal node with two children) and `searchBounds` live in `src/modules/facts.ts` because `avl-engine` is in flight; they move into the engine when convenient.

### 3. The validator is a pure function plus one test that runs it on all module content

`validateModule(content) -> Problem[]` in `src/modules/validate.ts`, with problem kinds `order`, `activity`, `claim`, `number`, `wording`. A Vitest test runs it over every registered module and expects an empty list (this is `npm run validate:content` in effect). Numbers: render `text` and `rule` with the computed facts, drop `log2`, match `-?\d[\d,]*(\.\d+)?` and `−\d` (the minus sign used in display), normalise, and accept facts, keys, search keys, conventions values (`LEAF_HEIGHT`, `EMPTY_HEIGHT`, the range) and the step's `allow` list. Wording: the D19 patterns from the spec, case-insensitive, on rendered text excluding the conventions wording itself (the `rule` output of a step that returns exactly the wording is exempt by identity).

*Alternative:* lint rule on source files. Rejected: numbers only exist after rendering with facts.

### 4. Conventions wording is one content file fed by two engine exports

`src/engine/conventions.ts` gains `BALANCE_FACTOR_ORDER = ['left', 'right'] as const` and `BALANCE_RANGE = [-1, 0, 1] as const`; `balanceFactor` and `isOutOfBalance` stay as they are, and a test ties them together. `src/content/modules/conventionsWording.ts` exports `conventionsWording(order = BALANCE_FACTOR_ORDER)` returning `formula`, `leanPhrase(bf)` (from `leanOf`), `rangeText`, `heightRule` (from `LEAF_HEIGHT`, `EMPTY_HEIGHT`). This is the only content file allowed to say which side comes first, and it never types the side: it maps `'left' | 'right'` to words.

### 5. Seeded practice trees

- Fill in: `generateTree(seed, { count: 5..7 drawn from the seed, balanced: false })` so some nodes may be out of range (more to think about).
- Spot the problem: `generateRootLooksFine(seed)` in `src/modules/generators.ts` draws plain-BST sequences of 6 to 9 keys from `createRng(seed)`, keeps the first whose `analyseTree` gives exactly one violation that is not the root and whose root is in range, and tries up to 200 sequences, then falls back to the hand-checked tree 50, 30, 70, 20, 80, 10. A property test covers seeds 0 to 199. Seeds come from `Date.now()` at mount; "New tree" draws another.

### 6. Step player owns position, not routes

`ModulePlayer({ module, activity })` in `src/ui/module/` filters the module's steps by activity and keeps `index` in state; `Activity.tsx` renders it when `MODULE_CONTENT[module]` exists, with `key={module + activity}` so state resets between activities. Next on the last step navigates with `paths.activity(module, nextActivity)` or `paths.hub()`; Back on the first step navigates to `paths.module(module)`. Practice answers are kept in a per-activity map in the player, so Back and Next within the activity keep them (FR-LRN-04). Focus goes to the step `h2` after each index change (not on first mount, so the routing focus rule for `h1` still holds).

*Alternative:* a step segment in the URL. Rejected for now (proposal item 6): the routes belong to the in-flight routing change.

### 7. Control strip and aids

One `ControlStrip` component: left group Back, Next and, on content or example steps, "I know this, skip"; right group "Show the rule" (`aria-expanded`, when the step has `rule`) and, on practice steps, "Hint (n)". Practice state (hints used, answers) sits in the player so the strip can show the count. `PRACTICE_HINTS` is in `src/modules/config.ts`.

### 8. Practice components

`BalanceFactorFill` and `SpotTheProblem` in `src/ui/module/practice/`, both using `TreeView` interactive with the new hidden-balance mode. The answer input is a labelled number field with − and + buttons (44 px), Enter checks. Marking calls pure functions in `src/modules/practice.ts` that return a `PracticeResult` (`right | sign-slip | not-yet`, with engine facts); the feedback panel renders it with wording from `src/content/modules/practice.ts`. Nothing is written to the learner state.

### 9. Hidden balance in TreeView

New prop `hideBalance?: { reveal?: Key[] }`. `describeTreeParts` gets a `hidden` flag per node; `nodeName`, the sentence builder and the annotation use new content strings (`metricsHidden: h => 'h' + h + ' · bf ?'`, `bfHidden: 'balance factor hidden'`). The Unbalanced flag and "unbalanced" word are skipped for hidden nodes.

## Risks / Trade-offs

- [Change 12 reshapes the schema] → The schema is small and keyed by Gagné event already; change 12 adds fields (reorderable flag, entry policy) rather than replacing these.
- [Number validator false positives, e.g. "C3", "LO1", "1,000,000"] → Strip module and objective IDs before matching; normalise thousands separators; allowances need a reason, so each exception is visible in review.
- [Generator cannot find a tree within 200 tries for some seed] → Deterministic fallback tree plus a property test over 200 seeds.
- [Text functions could still compute a number in content, e.g. `f.height + 1`] → The validator only sees rendered output, so `height + 1` passes if it equals a fact. Search step counts and bounds are facts, so content has no reason to add; the reviewer checks text functions do no arithmetic.
- [Routing change not archived first] → Apply after it is archived; the only touch point is `Activity.tsx`.
- [Wording beyond the ID reaches students] → Every such string is flagged in the content files and read at gate G3.

## Migration Plan

No data migration: no storage schema change. Roll back by reverting the change; Activity routes return to skeletons.
