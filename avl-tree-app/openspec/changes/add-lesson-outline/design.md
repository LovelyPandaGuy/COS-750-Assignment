# Design

## Context

See proposal.md for why. After `live-c1-and-c9`, every lesson (C1 to C9 and the C1 refresher) plays on `LessonPlayer`. The player keeps the screen index in state, and the check and question-set screens know from stored attempts whether they are finished (`CheckRunner`, `QuestionSet`). The frame is one column, `max-width: var(--reading-column)`.

## Goals / Non-Goals

**Goals:**
- An outline of the lesson's screens that moves to any open screen, never past an unfinished check.
- A layout that gives the tree the width on phones.

**Non-Goals:**
- Persisting the screen position (D35).
- Unlocking lessons on the path.

## Decisions

### 1. The outline is derived, not stored

`outlineOf(screens, phaseWord)` groups consecutive screens with the same `merrillPhase`. Each entry's state comes from:

- `seen`: a set of screen indexes in player state, added on every move
- the current index
- `firstBlockingIndex`: the first `check` or `question-set` screen whose questions are not all finished

The finished state reuses the functions that `CheckRunner` and `QuestionSet` already use, so the outline and the screens cannot disagree. An entry is open when its index is at most the current index, or at most `firstBlockingIndex`.

### 2. One move function

`LessonPlayer` gets `goTo(index)`, used by Next, Back, Skip ahead, the review link and the outline. It updates `seen`, resets the toggles and moves focus to the screen heading. This replaces the separate `go` calls, so every way of moving behaves the same.

### 3. Layout

`.lesson-layout` is a grid:

| Viewport | Layout |
|---|---|
| 960 px and wider | `grid-template-columns: minmax(12rem, 16rem) minmax(0, 1fr)`; the outline column is sticky to the top |
| narrower | one column; the outline is a `<details>` disclosure above the frame |

The frame keeps its own `max-width`, so the reading width stays.

- *Why `<details>`:* it is native, keyboard-accessible and closed by default, and needs no state. The wide layout renders the same list without the disclosure.
- *Alternative rejected:* a slide-in drawer. It needs focus trapping and adds no value over `<details>` here.

### 4. Entries

- Each open entry is a `<button>` in a list item, with the screen title and its mark word.
- A closed entry is a disabled button whose name includes "Not yet open".
- The current entry has `aria-current="step"`.
- The marks are words plus an icon with a text alternative; never colour alone (ID 11.1).

### Decision-log row (task 3)

| Row | Topic | Decision |
|---|---|---|
| D117 | Lesson outline | Every lesson shows its screens grouped by phase; back to any screen; forward up to the next unfinished check; a side panel from 960 px, a disclosure below that (user choice, 14 Nov). |

## Risks / Trade-offs

- **[An outline next to a wide tree on a 1024 px laptop]** → The outline column is at most 16rem, and the tree region already scrolls on its own (D17).
- **[Skipping practice screens by the outline]** Practice is never a check, so the ID allows it (ID 8.2). The outline only stops at checks.

## Migration Plan

There is nothing to migrate. Rollback is reverting the change, done by the user.
