# Design

## Context

See proposal.md for why. Current state that shapes the approach:

- `/sandbox` renders `SkeletonScreen` with `arrowBack` ("← Back to path"); the route and its top bar ("Lecture questions" only) exist.
- Engine: `insert` / `remove` (plain BST), `avlInsert` (returns `rebalance: { case, node } | null`), `avlDelete` (returns `rebalances[]`), `avlInsertTrace` (step trace), `searchTrace`, `analyseTree`, `height`, `createRng`. `avl-engine` is in flight, so nothing is added there.
- `ReplayPlayer` takes `{ kind: 'insert', tree, key }` and draws its own tree, controls and insert pseudocode.
- `TreeView` already draws `h · bf` and the Unbalanced flag on every node and supports `interactive`, `selectedKey`, `onSelect` by touch, pointer and keyboard.
- `conventionsWording().caseName` is the only source of case names (D19).

## Goals / Non-Goals

**Goals:**
- All sandbox behaviour in one pure reducer, tested without React, with a property test over random operation sequences.
- Every number and shape on screen comes from the engine.

**Non-Goals:**
- Step traces for plain BST insert or for deletes.
- Persisting the sandbox.

## Decisions

### 1. Pure state and reducer

`src/sandbox/sandbox.ts`:

```
SandboxState = {
  order: Key[]               // keys in the tree, in insert order (rebuild source)
  tree: Tree
  rebalancing: boolean       // starts true
  log: LogEntry[]            // newest first
  lastInsert: { before: Tree; key: Key } | null   // only after an insert with rebalancing on
  notice: Notice | null      // range | duplicate | missing | full
}
SandboxAction = insert k | delete k | toggle | clear | sorted | random (value in [0,1))
LogEntry =
  | { kind: 'insert'; key; parent: Key | null; side: 'left' | 'right' | null; rebalances: Rebalance[]; rebalancing }
  | { kind: 'delete'; key; rebalances: Rebalance[]; rebalancing }
  | { kind: 'rebuild'; rebalancing; count }
  | { kind: 'clear' }
sandboxStats(tree) -> { nodes, max, height, shortest, unbalanced, deepest: { key, visits } | null }
```

The parent and side of an insert come from `searchTrace` on the tree before the insert: the last node compared and which way it would go. That is where a BST insert places the key, before any rotation. `shortest` is `floor(log2 n)` (−1 for empty), the height of the shortest tree with n keys. `deepest` is the lowest node, leftmost first, and `visits` its `searchTrace` steps. `random` takes a value from the page's seeded `createRng`, so the reducer stays pure; it picks among keys 1 to 99 not in the tree.

*Alternative:* React state per control. Rejected: the rebuild, cap and log rules interact; one reducer keeps them testable.

### 2. Config

`src/sandbox/config.ts`: `SANDBOX_MAX_NODES = 15`, `SANDBOX_KEY_MIN = 1`, `SANDBOX_KEY_MAX = 99`, `SORTED_DEMO = [1, 2, 3, 4, 5, 6, 7]`.

### 3. Components

`src/ui/sandbox/`: `InsertControl` (labelled number field, Insert, Delete, shortcut buttons, inline notice in a polite status), `RebalanceSwitch` (`<button role="switch" aria-checked>` whose text is "Rebalancing: ON/OFF"), `TreeStats` (a description list), `EventLog` (an `<ol>` inside a polite live region, newest first). The page composes them with `TreeView` (interactive; selecting a node fills the field) and, when opened, `ReplayPlayer` for `lastInsert`. "Replay last insert" is a button with `aria-expanded`. Styles in `sandbox.css`, tokens only, 44 px targets; controls wrap at 360 px.

### 4. Wording

`src/content/sandbox.ts` (content-author) turns notices, log entries and stats into sentences; case names through `conventionsWording().caseName`. The hub suggestion line goes in `src/content/screens.ts`.

### 5. Hub suggestion

`Hub.tsx` reads `learner.completedModules.includes('C2')` and adds the line to the Sandbox card. No new policy function: one condition, one place.

## Risks / Trade-offs

- [Rebuild after deletes differs from the history the student saw] → The log says the tree was rebuilt from the remaining keys in insert order; proposal item 3 records it.
- [A 15-node chain is wide at 360 px] → D17: the tree scrolls sideways in its focusable region.
- [Replay of an insert into a tree with rebalancing on is always valid] → `lastInsert` is only set when the tree before was built with AVL inserts and deletes, so it is an AVL tree.
- [Live region chatter] → Only the newest entry is announced (the log is `aria-live="polite"` with `aria-relevant="additions"`; entries are prepended).

## Migration Plan

No data migration. Roll back by reverting; `/sandbox` returns to the skeleton.
