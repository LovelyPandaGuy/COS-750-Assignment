# Proposal

## Open questions

No `[OPEN]` item blocks the specs (D18). Please read these before `/opsx:apply`.

1. **Settled (user, 15 Nov): explain every step, in the lessons' words.** Each sandbox action's entry in "What happened" lists every step, in the same captions the lesson animations show (`conventions.json` `captions`, filled by the engine's `captionsFor`). For an insert:
   - where the key goes;
   - each node's balance factor update ("Node 20: bf = 0 − (−1) = +1.");
   - the first unbalanced node n and its case ("Case 4 (RR)");
   - each rotation;
   - "Every node has a balance factor of −1, 0 or +1."

   A delete is described the same way. No sentence is typed by the sandbox except a short heading per action and the one line about rebalancing being off (item 4).
2. **Settled (user, 15 Nov): delete a leaf only.** The lessons teach leaf deletion only (C7; `conventions.json` "deletion": "leaf nodes only"). The sandbox's Delete works on a leaf and uses the engine's leaf-deletion trace. For a node with children, the tree is unchanged and a calm message says why (item 4). Today the sandbox deletes any node, by a method the lessons never show.
3. **Assumed, not blocking: rebalancing off (D161).** With rebalancing off, an insert is the engine's plain insert trace (the C1 refresher's): placement, then each node's update. A delete is the plain leaf deletion: removal, then each update. The balance factors are shown as they are, including +2 or more, so the student sees the imbalance a rotation would fix, and the entry ends with "Rebalancing is off, so no rotation is made." The engine gains a plain leaf-deletion trace (`avl-engine`) for this.
4. **Settled (user, 15 Nov): replay the last insert or delete.** After any single insert or delete, a "Replay last insert" or "Replay last delete" button plays it back step by step on the tree as it was before. This covers the Insert button, Random key and Delete, with rebalancing on or off. The replay uses the existing replay player (step controls, play, pause, speed), the same engine trace, and the same captions as the log entry, so the replay and "What happened" always agree. It is not offered after "Insert 1 to 7 in order", a rebuild or Clear, which are not single operations. A line then says what can be replayed. Today the replay exists only after an insert with rebalancing on (D163).
5. **Flagged for the user to read (new wording):**
   - the entry headings "Inserted {key}" and "Deleted {key}";
   - "Rebalancing is off, so no rotation is made.";
   - the message "{key} is not a leaf. As in C7, only a leaf can be deleted here.";
   - the rebuild line for an empty tree, "Rebalancing {on/off}: the tree is empty." This replaces "rebuilt the same 0 keys";
   - "Replay last delete", the replay label "Tree while deleting {key}", and the line "Replay is available after you insert or delete one key."

   Every step sentence is existing content wording.

Serves LO1, LO5 and LO7 (C2, C6, C7), FR-VIS-08, FR-VIS-07 (text equivalent), ID 7.2 C7, ID 7.3, ID 12.1; CLAUDE.md "every answer shown is computed by the engine" and "no instructional content outside the content files".

## Why

The user asked that the sandbox explain what happens in line with what the lessons teach. Today its log says, for example, "10 was out of balance (Case 4 (RR)), so the tree was rotated there.":
- it never shows a balance factor;
- it doesn't name the first unbalanced node n;
- it doesn't say which rotation;
- it doesn't follow the five steps C6 teaches.

It also deletes nodes with children, which no lesson covers. The engine already produces the lessons' own captions for these operations, and the sandbox does not use them.

## What Changes

- **"What happened" entries (changed):** a heading per action ("Inserted 30") and every step caption from the engine, in lesson order.
- **Delete (changed):** leaf only, with the C7 captions, and a calm message for a node with children.
- **Rebalancing off (changed):** the plain trace's captions, ending with the "no rotation" line.
- **Engine (new):** a plain leaf-deletion trace, with no rotation.
- **Replay (changed):** "Replay last insert" or "Replay last delete" after any single insert or delete, on or off, with the same captions as the log.

## Out of scope

- The layout, controls and statistics of the sandbox (D140, D141, D156).
- Any change to `conventions.json` or the lessons.

## Capabilities

### New Capabilities
None.

### Modified Capabilities
- `sandbox`: "Insert and delete keys" (engine traces; leaf-only delete), "Calm messages for keys that cannot be used" (not a leaf), and "Event log" (every step in the lessons' captions).
- `sandbox`: "Replay the last insert", renamed "Replay the last change" (insert or delete, rebalancing on or off).
- `step-replay`: a new requirement, "Sandbox operations" (the replay player plays a plain insert and a leaf delete as well).
- `avl-engine`: a new requirement, "Plain leaf deletion trace"; and "Step captions", where a delete closes with the balanced line only when it is true.

## Impact

- Changed:
  - `src/sandbox/sandbox.ts` (operations through `avlInsertTrace`, `plainInsertTrace` and `leafDeleteTrace`; log entries carry the captions);
  - `src/content/sandbox.ts` (entry headings, the off line, the not-a-leaf message, the empty rebuild);
  - `src/ui/sandbox/EventLog.tsx` (heading and step list per entry);
  - `src/engine/lessonTrace.ts` (`leafDeleteTrace(start, key, { rebalance: false })`);
  - `src/replay/replay.ts` and `src/ui/replay/ReplayPlayer.tsx` (insert with a `rebalance` flag, and `delete`);
  - `src/pages/Sandbox.tsx` (the replay of the last change).
- Tests: `tests/ui/sandbox.test.tsx`, `tests/sandbox/*`, and the engine trace tests.
- Decisions: D161 to D163.
- There are no new dependencies, no storage change and no network calls.
