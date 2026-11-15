# Proposal

## Open questions

No `[OPEN]` item blocks the specs (D18). Please read these before `/opsx:apply`.

1. **Settled (user, 15 Nov): the navbar.** The "Aa" button becomes **Settings**: visible text "Settings", and an accessible name that starts with it. The panel's contents are unchanged (dark theme, larger text, confetti, narration). The status pill is removed in **both** variants, "Saved on this device" and "Not being saved". When storage is blocked, the Start screen's polite message that progress will not be kept still shows (NFR-06), so nothing is hidden from the student. Only the pill goes.
2. **Settled (user, 15 Nov): a stable lessons sidebar on every page.** "Lessons" lists C1 to C9, and those are its only headings, with no screens beneath them. It appears on every screen, including Start and C1. Each lesson shows its state in words and a symbol (Done, You are here, Not started), and the page being viewed carries `aria-current="page"`. Every lesson is a link, because nothing is hard-locked (D20; the hub's map links every lesson too). This is the ID's "lesson list" (ID 8.2) and the list C1 points to ("Any lesson you have completed can be opened again from the lesson list").
3. **Settled (user, 15 Nov): the per-screen lesson outline is removed.** The outline from `add-lesson-outline` (D154) is the sidebar the user found confusing on C1, and it is removed from every lesson. Its capability `lesson-outline` is retired. Back and Next still move one screen at a time, and skip ahead stays as it is.
4. **Settled (user, 15 Nov): C1's "Your route" shows the objectives only.** An objectives screen shows its intro and its learning objectives, and no longer its `points`. C1's `c1-s02` is the only objectives screen with points, the list of nine lessons, which the sidebar now shows. The JSON content is unchanged.
5. **Assumed, not blocking: sidebar placement (D155).** From 768 px (`BREAKPOINTS.tablet`) the sidebar is a column on the left of `main`, 16rem growing to 20rem wide. It stays in view while the page scrolls (sticky), scrolls by itself if it is taller than the window, and sits in the same place on every screen. Below 768 px it collapses into a **Lessons** button at the top of the page that opens the same list in the page flow (the existing `LessonMenu`), so a phone keeps its width for the content. In the DOM it comes after the banner and before `main`, and the skip link still jumps straight to `main`.
6. **Assumed, not blocking: the sandbox switches by its own width (D156).** With a sidebar beside it, a 768 px screen leaves the sandbox about 460 px, too narrow for its two columns (D140). The sandbox therefore switches to two columns when **its own area** is at least 45rem wide (a CSS container query), not when the screen is 768 px. On most laptops it is two columns, and on a tablet it is one.
7. **Flagged for the user to read:** "Settings", "Lessons", "Done", "You are here", "Not started", and the sidebar's accessible name "Lessons".

Serves ID 8.2 (lesson list, Next and Back in the same place), ID 8.3 (controllability, revealed structure), ID 11.2, FR-LRN-03, FR-LRN-04, FR-VIS-10, NFR-02, NFR-04, NFR-06; D3, D20.

## Why

The user ran the prototype and asked for a cleaner look:
- The "Aa" button does not say what it is for.
- "Saved on this device" is noise on every screen.
- There is no stable way to see and move between the nine lessons.
- The outline of screens on C1 is confusing.
- C1's route screen repeats the lesson list next to the objectives.

## What Changes

- **Settings button (changed):** "Aa" is renamed to "Settings".
- **Status pill (removed):** both variants. The Start screen's not-saved message stays.
- **Lessons sidebar (new):** C1 to C9 with their states, on every screen, sticky from 768 px and a Lessons button below.
- **Lesson outline (removed):** the per-screen outline and its two-column lesson layout. `lesson-outline` is retired.
- **Objectives screen (changed):** the `points` list is no longer shown.
- **Sandbox (changed):** two columns by container width instead of screen width.

## Out of scope

- The hub's progress map and the lesson menu inside it, which stay as they are.
- Locking lessons (D20 stands: nothing is hard-locked).
- The content of the Settings panel.
- Any JSON content change.

## Capabilities

### New Capabilities
- `lesson-sidebar`: the stable list of the nine lessons on every screen, its states, its placement and its phone form.

### Modified Capabilities
- `app-shell`: "AppShell landmarks and reading column" (the sidebar slot), "TopBar content comes from its props" (no status pill), and "Aa menu stub", renamed "Settings menu".
- `app-routing`: "Every route is in the shell" (sidebar, no pill).
- `start-screen`: "Message when progress is not saved" (message only, no pill) and "Copy comes from content" (no pill).
- `lesson-blocks`: "Objectives block" (no points list).
- `lesson-c1`: "C1 plays its lesson file" (the route screen shows the objectives).
- `sandbox`: "Two-column layout" (container width).
- `lesson-outline`: all requirements removed. The capability is retired.

## Impact

- New: `src/ui/navigation/LessonSidebar.tsx` and `sidebar.css`, and sidebar wording in `src/content/shell.ts`.
- Changed:
  - `src/ui/AppShell.tsx` (sidebar slot and body grid), `src/ui/TopBar.tsx` (the `status` prop is removed);
  - `src/App.tsx` (the sidebar on every screen, no pill), `src/ui/AaMenu.tsx` (wording only);
  - `src/ui/lesson/LessonPlayer.tsx`, `lesson.css` and `outline.ts` (outline removed), and the objectives block;
  - `src/ui/sandbox/sandbox.css` (container query);
  - `src/content/start.ts` (pill wording removed).
- Tests: shell, routing, start screen, lesson player and outline, C1, sandbox layout; new `tests/ui/lesson-sidebar.test.tsx`.
- Decisions: D155 to D158. D154 is superseded.
- There are no new dependencies, no storage change and no network calls.
