# Design

## Context

See proposal.md for why. `src/sandbox/sandbox.ts` is a pure reducer:
- it inserts with `avlInsert` or `bst.insert`;
- it deletes with `avlDelete` or `bst.remove`, which delete any node;
- it logs `LogEntry` records, which `sandboxCopy.log` turns into one sentence each.

The engine already has `avlInsertTrace`, `plainInsertTrace` and `leafDeleteTrace` (`src/engine/avl.ts`, `src/engine/lessonTrace.ts`), and `captionsFor(op, trace, key, formatKey)` (`src/engine/captions.ts`), which fills `conventions.json` `captions` from each step's snapshot. The lesson animations and "Replay last insert" use these.

## Goals / Non-Goals

**Goals:**
- Every step sentence in the sandbox is the engine's caption for the same trace, so it cannot drift from the lessons.
- The reducer stays pure and testable.

**Non-Goals:**
- Changing captions or conventions, or the layout.

## Decisions

### 1. Operations run the traces

The reducer runs these traces:

| Action | Rebalancing on | Rebalancing off |
| --- | --- | --- |
| Insert | `avlInsertTrace` | `plainInsertTrace` |
| Delete (a leaf) | `leafDeleteTrace(tree, key)` | `leafDeleteTrace(tree, key, { rebalance: false })` |

It takes the new tree from the trace result, so the drawn tree and the explanation come from one computation. A delete of a node with children is caught before tracing (`subtreeAt` has a child), leaves the state unchanged, and sets the notice `{ kind: 'notLeaf', key }`. Missing and out-of-range keys keep their notices.

`avlDelete` and `bst.remove` are no longer used by the sandbox, and stay in the engine for their own tests. The rebuild on toggle and "Insert 1 to 7 in order" keep using plain and AVL inserts without captions: they log one rebuild or sequence line, as today.

### 2. Log entries carry their captions

`LogEntry` for insert and delete becomes `{ kind, key, rebalancing, steps: string[] }`. `steps` is `captionsFor(op, trace, key).map((c) => c.text)`, with `op` set to `'insert'` or `'delete'`. The reducer holds no wording: `EventLog` adds `sandboxCopy.noRotation` after the steps of an entry made with rebalancing off.

The caption builder already closes an insert with `captions.done` only when the final tree is an AVL tree. It closes a delete with it every time, which is safe in the lessons, where every delete rebalances, but would be false after a plain delete. Design 3 makes delete follow the insert rule. When rebalancing is off, `EventLog` shows `sandboxCopy.noRotation` after the captions.

Checked against the engine (15 Nov):
- **Inserting 30 into 10, 20:** "30 > 10: go right.", "30 > 20: go right.", the placement, the updates of 20 (+1) and 10 (+2), n = 10 with Case 4 (RR), the left rotation about 10, then the closing line.
- **Deleting 10 from 20, 10, 40, 30, 50:** the removal, 20 at +2, "it is unbalanced", the left rotation about 20, then the closing line.

The reducer imports only `captionsFor` from the engine, so it holds no wording, and the property test can compare `steps` with the engine directly.

### 3. Plain leaf deletion in the engine

`leafDeleteTrace(start, key, { rebalance = true } = {})`: with `rebalance: false`, the walk up to the root pushes only `update-height` steps and skips the imbalance and rotation branch. The captions for this trace are "remove" plus one update per node. In `captionsFor`, the closing `done` for a delete is added only when `analyseTree(end).isAvl`, as for an insert. Every lesson delete ends balanced, so no lesson caption changes; the "Every lesson animation" test guards that.

### 4. Rendering

`EventLog` renders `<ol reversed>`, newest first as today (D141 fix). Each item has a `<p className="sandbox-log-heading">` ("Inserted 30") and a `<ul>` of its steps. The rebuild, clear and sequence entries have a heading only. The live region announces additions as before. Assistive technology hears the heading and the steps once, which matches the lesson captions read aloud.

### 5. One "last change" for the log and the replay (D163)

`SandboxState.lastInsert` becomes `lastChange: { kind: 'insert' | 'delete'; before: Tree; key: Key; rebalance: boolean } | null`. It is set by a single insert (Insert, Random key) or a leaf delete, and cleared by the sorted shortcut, a rebuild and Clear. A refused action (a notice that leaves the tree unchanged) keeps it, so the last real change can still be replayed.

The replay `Operation` (`src/replay/replay.ts`) gains `rebalance?: boolean` on insert and a `delete` kind. `traceFor` maps them as follows:
- insert → `avlInsertTrace` or `plainInsertTrace`;
- delete → `leafDeleteTrace(tree, key, { rebalance })`.

The log entry's steps and the replay's captions both come from `captionsFor` on the same trace, so they cannot disagree, and a test compares them. The replay shows a caption for each trace step it reaches; the closing `done` line covers no step, so it appears in the log but not in the replay. `ReplayPlayer` shows the pseudocode panel only for search and insert. The sandbox's button label and tree label follow `lastChange.kind`.

*Alternative:* a separate replay per log entry. This was rejected because one replay of the last change keeps the screen simple (ID 8.2, one main representation). The log already lists every older step in words.

### Decision rows

| ID | Topic | Decision |
| --- | --- | --- |
| D161 | Sandbox explanations | Each sandbox insert and delete is explained by every step, in the lessons' captions (`conventions.json`, filled by the engine's `captionsFor` from the operation's trace): placement or removal, each balance factor update, n and its case, each rotation, and the closing balanced line. With rebalancing off, the plain traces' captions, then "Rebalancing is off, so no rotation is made." User choice (15 Nov). |
| D163 | Sandbox replay | After a single insert (Insert, Random key) or a leaf delete, with rebalancing on or off, "Replay last insert" or "Replay last delete" plays that operation back from the tree before, on the replay player, with the same engine trace and captions as its log entry. It is not offered after the sorted shortcut, a rebuild or Clear. Replaces the insert-with-rebalancing-only replay. User request (15 Nov). |
| D162 | Sandbox deletion | The sandbox deletes a leaf only, as C7 teaches (conventions "leaf nodes only"); for a node with children a calm message says so, and the tree is unchanged. User choice (15 Nov). |

## Risks / Trade-offs

- [Entries are long: a 15-node insert can have about 6 lines] → The log box scrolls (D141), newest first, and the user chose every step (15 Nov).
- [Students can no longer remove an inner node, so building some shapes takes more steps] → "Clear" and inserting in a new order still build any shape. This matches what C7 teaches.
- [The rebuild, sorted and random entries keep a one-line app sentence] → They describe sandbox actions that no lesson explains. The wording is flagged.

- [Seen in the screenshots, 15 Nov] → The step controls' icons ⏮ ⏸ ⏭ are missing from the app font and showed as empty boxes in the replay. They are now ← ▶ ❚❚ →, checked by rendering them in the app font. A test keeps the media-symbol block out of the icons. This is a wording fix in `src/content/replay.ts`, and it also improves the lessons' replays.

## Migration Plan

No data migration (the sandbox saves nothing). Rollback is reverting the change.
