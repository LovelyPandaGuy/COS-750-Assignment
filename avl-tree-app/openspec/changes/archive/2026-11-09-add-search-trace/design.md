# Design

## Context

`src/engine/` has immutable trees, `search` (returns `{ found }`), `avlInsert`, `analyseTree`, seeded generators and the conventions module. SE §6.3 gives `TraceStep`; §6.4 describes search ("records each visit and comparison as a trace step and counts the steps"). The ID's C4 pseudocode (loop and recursive) fixes the line meanings. Motivation: proposal.md.

## Goals / Non-Goals

**Goals:**
- A pure `searchTrace` whose trace fully determines what the UI shows: node, comparison, pseudocode line.
- A trace type that insert and delete can extend without changing it.

**Non-Goals:**
- Insert, delete and rotation traces; replay machinery; pseudocode text.

## Decisions

- **`trace.ts` holds the SE §6.3 types:** `TraceStep` (index, kind, `rebalanceCase?`, nodes, before, after, pseudocodeLine) with all nine kinds declared. Declaring unused kinds now means `add-operation-trace` adds producers, not type changes. `OperationResult` is not touched here: its `tree` and `inserted` shape already differs per operation in the current code (see `avlInsert`), and unifying it belongs to the trace change.
- **`searchTrace(tree, key, form)` returns `{ found, steps, trace }`.** `steps` is the count of visited nodes, computed from the walk and also equal to the number of compare steps. Loop form is an iteration; recursive form is a recursion that appends to the same list, so the two forms are really different code paths, not one path with two line tables. A test asserts they agree on kinds, keys and indexes.
- **Step grammar per visited node:** `compare [node]`, then `found [node]` or `descend [node, child?]`. After a descend to an empty child, `not-found [node]`. For an empty tree, only `not-found []`. The first `compare` stands for the pseudocode's equality test; which test decided is readable from the step after it (found, descend left or right).
- **Line maps** are two small constant objects, `LOOP_LINES` and `RECURSIVE_LINES`, keyed by step purpose (`compare`, `found`, `descendLeft`, `descendRight`, `notFound`), in `search.ts`. Loop: header 1, `v = root` 2, `while` 3, equality and return 4, go left 5, go right 6, `return null` 7. Recursive: header 1, `if v == null` 2, equality and return 3, go left 4, go right 5. Compare and found share a line (the ID writes `if k == v.key: return v` on one line). Alternative of reading lines from the content layer rejected: the engine is the source of truth for sync (SE §6.4) and content depends on it, not the reverse.
- **Direction is not stored:** a descend step lists `[from, to]`; the line says left or right. Adding a direction field to the SE's type was rejected as a deviation with no consumer.
- **Existing `search` untouched.** A test ties `searchTrace().found` to it, so the two cannot drift.
- **Tests:** `tests/engine/search.test.ts`, names prefixed `FR-ENG-09`; hand-worked cases on the tree from 20, 10, 30, 5, 15; a fast-check property comparing `steps` with the path length and `found` with plain search over random trees and keys.

## Risks / Trade-offs

- [Line layout may not match the PDF] → two constant maps; fixing is a one-file edit, tests reference the maps by purpose, not by number except in one pinned scenario.
- [Trace type may be tweaked by S2 and add-operation-trace] → only search produces it today, so a rename affects one producer.
- [Recursive trace on very deep trees] → trees here are small (at most about 15 nodes in the UI); no limit needed.
