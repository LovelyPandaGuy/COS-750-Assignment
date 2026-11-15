# Design

## Context

See proposal.md for why.
- `c1-s03` is an `info` screen whose block renders its `points` as a list.
- `LessonAnimation` renders a read-only `DrawnTree` for each position. A comparison renders two `LessonAnimation`s, each with its own Previous step and Next step buttons.
- `TreeView` already draws a rounded frame for `highlightKey` in read-only mode (used by worked examples).
- The replay's `StepControls` and `replayReducer` give Back, Play or Pause, Step and speeds, with the shared shortcut keys.

## Goals / Non-Goals

**Goals:**
- A walkthrough that reuses the replay controls and the content's own sentences.
- Search positions made visible with an existing visual (the highlight frame).

**Non-Goals:**
- A real-interface tour, or new content.
- Changing captions or counters.

## Decisions

### 1. A mini-screen drawn in HTML (D170)

`AppWalkthrough` renders a fixed small layout of `div`s with `role="img"` and `aria-label` on the frame:
- a narrow sidebar strip;
- a title bar;
- a three-node `TreeView` (read-only, `aria-hidden` inside the image);
- a control strip (Back, Replay, Show the rule, Hint, Next);
- an answer row (Sure, Not sure, Check answer);
- a title badge.

They are pictures of controls, not controls, so they take no focus. Each part has a `data-part` id. The step state uses `replayReducer` with the number of points, so Play, the speed buttons and the keys behave exactly like a tree replay. The lit part gets `data-lit`, styled with a thick `--accent-highlight` border and a "▶ here" tag. It is a border, not an outline, because the one focus ring must stay the only outline. The tiny tree is three CSS circles, not a `TreeView`, because a `TreeView` holds a real button ("Describe") that cannot sit inside a picture. The caption is narrated (`data-narrate`).

`src/content/walkthrough.ts` exports `{ 'c1-s03': [['back', 'next', 'replay'], ['rule'], ['hint'], ['confidence'], ['check'], ['title'], ['lessons']] }`, which reads as "point n lights these parts". The info block uses `AppWalkthrough` when a mapping exists for the screen ID, and otherwise its list as today. A disclosure, "Show all as a list", renders the same points as the plain list.

### 2. Frame the compared node (D171)

`LessonAnimation` computes `highlightKey` for search operations from the shown trace: the node of the last `compare` or `found` step up to the current position, or `null` at position 0. It passes this to `DrawnTree`, and from there to `TreeView`'s `highlightKey`. The second diagram of a comparison is a `LessonAnimation` too, so both diagrams get it.

### Decision rows

| ID | Topic | Decision |
| --- | --- | --- |
| D170 | App walkthrough | C1's "How the app works" is an animated mini-screen stepped with the replay controls; each step captions one content point and lights its part (thick accent ring and "▶ here"), from one mapping record in `src/content/walkthrough.ts`; "Show all as a list" on demand; one labelled image; snaps under reduced motion. User choice (15 Nov). |
| D171 | Search position on diagrams | Every search animation frames the node being compared at each step (the found node at the end), on both diagrams of a comparison. User request (15 Nov, C2 screen 6). |

## Risks / Trade-offs

- [The mapping is keyed by screen ID and point order] → A test fails if the point count changes, so the mapping is updated together with the content.
- [A drawing of controls might be mistaken for real controls] → It sits inside a bordered frame captioned as a picture, its parts are not focusable, and the caption says what each control does.

## Migration Plan

No data migration. Rollback is reverting the change.
