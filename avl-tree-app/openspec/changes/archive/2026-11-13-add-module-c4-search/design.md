# Design

## Context

See proposal.md for why. Current state that shapes the approach:

- The framework (`src/modules/`, `ModulePlayer`) plays C2, C3, C5 and C8. `Representation` is `'diagram' | 'text'`, with `'pseudocode'` and `'animation'` reserved (D22). `searchBounds(n)` gives `best` and `worst`; the validator accepts numbers that are facts.
- `ReplayPlayer` (`src/ui/replay/`) is self-contained: give it an `Operation` and a label and it computes the trace, draws the tree, the pseudocode panel (with the loop/recursive choice for search) and the step sentence. No module places it yet (D33).
- `searchTrace(tree, key, form)` returns the trace (`compare`, `descend`, `found`, `not-found` steps, each with `nodes` and `pseudocodeLine`), `found` and `steps` (nodes visited). Both forms visit the same nodes.
- `PseudocodePanel` takes `name`, `listing` and `line` (`null` lights nothing). `pseudocode.searchLoop` and `searchRecursive` hold the ID listings.
- `TreeView` with `interactive`, `selectedKey` and `onSelect` already supports touch, pointer and keyboard selection (`tree-keyboard` tests). It has no "visited" role, and the search replay marks none either.
- `avl-engine` is in flight (`add-avl-insert-trace`), so new helpers go in `src/modules/`. `module-practice-steps` is in flight (`add-modules-c5-c6`), so the new practice is specified under `module-c4-search`.

## Goals / Non-Goals

**Goals:**
- Every step count a student sees in C4, including 28 and 1,000,000, comes from the facts.
- The replay and pseudocode panel are reused unchanged.

**Non-Goals:**
- A "visited" node role in `TreeView` (the path is shown as text, as the replay shows "visited n").
- Insert replays in modules (C6's change).

## Decisions

### 1. Schema additions

```
Representation = 'diagram' | 'text' | 'pseudocode' | 'animation'
Step += replay?: { figure: string }          // plays figure's searchKey with ReplayPlayer
Step += listings?: readonly ('searchLoop' | 'searchRecursive')[]
PracticeKind += 'trace-search'
Step += searchPractice?: 'found' | 'missing' // which key the practice draws
```

A replay step takes its key from the figure's `searchKey`, so the validator already sees the key and its step count as facts. Only search replays are allowed for now (the type says so); insert replays come with C6.

*Alternative:* a separate `operation` record on the step. Rejected: the figure already names the tree and the key.

### 2. AVL worst case as a fact

`maxAvlHeight(n)` in `src/modules/facts.ts`: walk the minimum node counts N(0) = 1, N(1) = 2, N(h) = N(h−1) + N(h−2) + 1 and return the largest h with N(h) ≤ n (−1 for n = 0). `searchBounds(n)` gains `avlWorst = maxAvlHeight(n) + 1`. The validator already accepts every value in `bounds`, so it accepts the new one with no special case. A property test checks it against a brute-force table for n up to 2,000, and a unit test pins 1,000,000 → 28.

*Alternative:* `floor(1.44 log2 n)`. Rejected: it gives 28.7 → 28 height and 29 steps, which is the over-estimate D13 warned about.

### 3. Player renders replay and listings

In `ModulePlayer`, a step with `replay` renders `<ReplayPlayer key={step.id + index} operation={{ kind: 'search', tree, key }} label=… />` in place of the figure; keying on the step makes it start again when shown again. A step with `listings` renders one `PseudocodePanel` per listing with `line={null}` inside `.module-listings` (CSS grid: two columns from a min width, one column below).

### 4. Be the algorithm

- `src/modules/searchPractice.ts`: `drawSearchPractice(seed, which)` returns `{ tree, key }`: `generateTree(seed, { count: SEARCH_PRACTICE_KEYS, balanced: true })` (count 7, keys 1 to 99), then a found key drawn from the tree's keys or a missing key drawn from 1 to 99 not in it. `markPick(tree, key, pathSoFar, pick)` returns `right | not-yet` with the engine's comparison (`smaller | larger`) at the current node; `markNotInTree` returns `right` only when the path has run off the tree. All from `searchTrace`.
- `BeTheAlgorithm` in `src/ui/module/practice/`: `TreeView` interactive with `selectedKey` = current node, the key to find, a `PseudocodePanel` with the loop/recursive choice and `line` from the trace step reached, the visited path as text, a "Not in the tree" button on the missing-key step, and the feedback panel in the same live-region and focus pattern as C3 practice. State (path, hints, done) sits in the player's practice map, so Back and Next keep it (FR-LRN-04).
- Feedback and hints use `PRACTICE_HINTS` and new strings in `src/content/modules/practice.ts`.

### 5. Content

`src/content/modules/c4.ts` (content-author): steps per proposal, million-key text from `bounds` for 1,000,000 (`avlWorst`, `worst`), AVL figure e.g. keys 50, 30, 70, 20, 40, 60, 80 with a search key; worked example figures with one key present and one absent. Every string beyond the ID marked `[beyond ID]`.

## Risks / Trade-offs

- [Replay inside the player duplicates headings or focus] → `ReplayPlayer` has no heading of its own above h3; the step h2 stays the focus target. Axe runs on every C4 step.
- [Two pseudocode panels at 360 px are long] → They stack; each listing is at most seven lines.
- [Generator draws a missing key equal to a tree key] → Drawn from the complement of the tree's keys; property test over 200 seeds.
- [`module-practice-steps` archived later with a different practice shape] → `trace-search` only adds a union member and its own fields; no shared field changes.

## Migration Plan

No data migration. Roll back by reverting; C4 activities return to skeletons.
