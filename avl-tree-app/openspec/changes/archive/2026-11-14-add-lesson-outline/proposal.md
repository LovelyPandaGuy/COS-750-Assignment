# Proposal

## Open questions

No `[OPEN]` item blocks the specs (D18). Please read these before `/opsx:apply`.

1. **Settled (user, 14 Nov): change 3 of 3.** After running the app, the user asked for the layout to fit the lesson content, and chose a lesson outline: the screens of the lesson, shown together, with a way to jump between them. Apply after `live-c1-and-c9`, because then every lesson, C1 to C9, plays on the lesson player.
2. **Settled by the ID (8.2, 8.3): where am I, and no skipping a check.** The outline shows where the student has been, where they are and where they are going (ID 8.3 "controllability"). Going back is always free. Going forward is allowed up to and including the next check or question-set screen that is not finished; nothing beyond it can be jumped to until it is finished (ID 8.2 "Skip ahead … not on checks", D20).
3. **Assumed, not blocking: placement.** At 1366 px and wider (the desktop width, D118), the outline is a panel beside the lesson; the user chose 1366 over 768 on 14 Nov, after the 960 px first draft broke D118, so a tablet keeps the full lesson width. Narrower, it is a disclosure ("Lesson outline") above the screen, closed by default, so the tree keeps the width on a phone (ID 8.3 "Tree area: the largest region"). It uses the existing `(min-width: 1366px)` query; no new breakpoint.
4. **Assumed, not blocking: grouping.** Screens are grouped under the phase words the lesson frame already shows (Problem, Recall, Learn, Practise, Check and summary), in lesson order. A phase that appears twice, as in C6, appears twice.
5. **Flagged for the user to read:** the labels "Lesson outline", "Done", "You are here" and "Not yet open". Screen names are the screens' own titles.

## Why

The user ran the app and found the lesson hard to follow: one screen at a time, with only "Screen n of m", gives no overview of the lesson and no way to return to an earlier screen except pressing Back repeatedly.

## What Changes

- **Lesson outline (new).** Every lesson (C1 to C9, and the C1 refresher) shows its screens grouped by phase. It marks the current screen (and `aria-current`), the screens already seen as Done, and the screens beyond the next unfinished check as not yet open. It moves to any open screen when one is chosen.
- **Layout (changed).** On wide screens the lesson takes a two-column layout (outline, then the lesson frame); on narrow screens the outline is a disclosure above the frame. The frame's regions and controls are unchanged.
- Serves ID 8.2 (lesson list, Back always free, no skip past a check), ID 8.3 (revealed structure, controllability), ID 11.2 (keyboard).

## Out of scope

- Unlocking lessons in order and the progress bar on the path (the progress change).
- Remembering the screen position across visits (D35 stands).

## Capabilities

### New Capabilities
- `lesson-outline`: the outline of a lesson's screens, its marks, the jump rule and its placement.

### Modified Capabilities
None. The lesson frame's requirements stay as they are; the outline sits beside or above the frame.

## Impact

- New: `src/ui/lesson/LessonOutline.tsx`, outline labels in `src/content/lesson.ts`, layout rules in `src/ui/lesson/lesson.css`.
- Changed: `src/ui/lesson/LessonPlayer.tsx` (screens seen, the jump rule, rendering the outline).
- No new dependencies, no storage change, no network calls.
