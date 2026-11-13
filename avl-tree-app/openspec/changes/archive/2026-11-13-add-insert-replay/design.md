# Design

## Context

See proposal.md for why. Current state that shapes the approach:

- `Step.replay = { figure }` plays the figure's `searchKey` with `ReplayPlayer` (`add-module-c4-search`); the player keys it on the step so it restarts.
- `ReplayPlayer({ operation, label, held, showStep })` already plays `{ kind: 'insert', tree, key }` with the insert outline; `held` disables play and step; `showStep: { index, nonce }` jumps to a trace step.
- `PredictPrompt({ tree, keyToInsert, kind, onProceed })` reports `{ kind, choice, answer, skipped }`; `PredictionReveal({ tree, keyToInsert, kind, choice, onReplayStep })` compares and offers "Replay that step" with the engine's `stepIndex`; `predictionFor(tree, key, kind)` computes the answer. Kinds: `node`, `case`, `root`.
- `ModeSwitch({ watch, base, keyToInsert })` shows the Watch content or `DoItYourself` for the same insert.
- `figureFacts` already folds a figure's keys into an AVL tree and records rebalances; `rotationsFor(case)` gives 1 or 2.

## Goals / Non-Goals

**Goals:**
- One composite component that C6 (and any later module) uses for every insert step.
- The existing components are used unchanged.

**Non-Goals:**
- Fading logic (C6 picks a mode per step).

## Decisions

### 1. Schema

```
Step.replay = { figure: string; insert?: Key; predict?: PredictionKind; doItYourself?: boolean }
FigureFacts += insert?: { key; rebalanced: boolean; node: Key | null; case: RebalanceCase | null;
                          rotations: 0 | 1 | 2; heightAfter: number }
```

`insert` present means an insert replay; otherwise the figure's `searchKey` is searched as now. `computeFacts` adds `insert` facts to the replay figure with `avlInsert` on its tree; a key already in the tree becomes a source problem (as an impossible rotation does). The validator's fact numbers gain the key, node, rotations and height after. `predict` and `doItYourself` need `insert`; the validator reports them on a search replay as a source problem.

*Alternative:* a separate `insertReplay` field. Rejected: one replay field keeps "one primary representation per step" (D22) obvious.

### 2. `InsertReplay` composite

`src/ui/module/InsertReplay.tsx`, props `{ tree, keyToInsert, label, predict?, doItYourself? }`:

- State: `report: PredictionReport | null`, `jump: { index, nonce } | undefined`, `atEnd: boolean`.
- Watch content: if `predict` and no `report`, `PredictPrompt` above a held `ReplayPlayer`; after proceed, the replay is unheld; when not skipped and the replay has reached its end, `PredictionReveal` with `onReplayStep` setting `jump`.
- Knowing the end: `ReplayPlayer` gains one optional prop, `onPosition(position, length)`, called when its position changes. The composite sets `atEnd` when `position === length` and only then shows the reveal. The prop is internal; the replay's visible behaviour and the `step-replay` spec are unchanged.
- If `doItYourself`, the Watch content goes inside `ModeSwitch` with `base = tree`, `keyToInsert`.

The player renders `<InsertReplay key={step.id} …>` for insert replays, so Back and Next start it fresh.

*Alternative:* a "Show the result" button under the replay. Rejected: the predict-first spec shows the reveal after the replay, with no extra step for the student.

### 3. Tests with a fixture module

No module content uses insert replays yet, so UI tests render `ModulePlayer` with a fixture `ModuleContent` in a memory router, plus the composite on its own.

## Risks / Trade-offs

- [A callback prop on `ReplayPlayer` is used by only one parent] → Optional and additive; existing replay tests keep passing without it.
- [Two trees on screen in Do it yourself and the prompt] → Same layout as the existing components; axe and the 360 px check cover it.
- [Predictions on a key that causes no rebalance] → `predictionFor` already handles "no node becomes unbalanced"; C6 picks keys.

## Migration Plan

No data migration. Roll back by reverting; no module uses insert replays yet.
