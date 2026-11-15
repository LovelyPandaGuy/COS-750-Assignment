# Design

## Context

See proposal.md for why. Today:
- **The shell.** `AppShell` renders the skip link, a `header` with `TopBar`, and `main.app-main`, which is capped at `--reading-column` and is not sticky. `App.tsx`'s `Screen` passes `status`, the saved or not-saved pill, to every route.
- **The Settings panel.** `AaMenu` shows the text "Aa" with the name "Display and read-aloud settings".
- **Lesson state.** `src/ui/progress/` has `LessonLink`, `LessonMenu` (a disclosure in the page flow), `LessonItem` and the `StateLabels` types, and the hub's `ProgressMap`.
- **The lesson outline.** `LessonPlayer` renders `LessonOutline` in a `.lesson-layout` grid (`lesson.css`, D154), and `outline.ts` derives the outline.
- **The objectives block** renders `objectives` and `points`.
- **The sandbox** switches to two columns at `@media (min-width: 768px)` (D140).

## Goals / Non-Goals

**Goals:**
- One sidebar component that every route gets through `Screen`, built from the existing progress pieces.
- Remove the pill and the outline cleanly, leaving no dead code or styles.

**Non-Goals:**
- Changing `LessonLink` or `LessonMenu` behaviour, or the hub.
- Changing the content of the Settings panel.

## Decisions

### 1. The sidebar is a shell slot (D155)

`AppShell` gains an optional `sidebar` prop. The page becomes a `.app-body` wrapper after the header, holding the sidebar (if given) and then `main`. `Screen` in `App.tsx` builds `<LessonSidebar>` from the learner (`completedModules`, `currentModule`) and the route's module ID for `aria-current`, and passes it on every route. The routes now include Start, which already renders inside `Screen`.

`LessonSidebar` (`src/ui/navigation/LessonSidebar.tsx`) renders two things from the same `LessonItem[]`:

1. `<nav aria-label="Lessons" className="lesson-sidebar">` with an `<ol>` of `LessonLink`s, for the column;
2. `LessonMenu` with the button "Lessons", for a phone.

CSS shows one or the other: `.lesson-sidebar-menu` below 768 px, `.lesson-sidebar-column` from 768 px. Only one is in the accessibility tree at a time, through `display: none`. jsdom has no media queries, so tests check the stylesheet for the rules and the DOM for both parts. The "one navigation named Lessons" scenario holds because the menu's panel landmark is named "Lessons, all lessons" and is hidden until the menu is opened.

*Alternative:* a modal drawer on phones. This was rejected because `LessonMenu` already exists, is in the page flow, and its accessibility is tested (ui-progress "Lesson menu").

### 2. States come from the learner, labels from content

The state is decided in this order:
1. `done` if the lesson is in `completedModules`;
2. `current` if it is `currentModule`;
3. otherwise `upcoming`.

`StateLabels` gets the words "Done", "You are here" and "Not started" from `src/content/shell.ts`. `LessonLink` already pairs each state with a symbol and a border (ui-progress). Every item has an `href`, so nothing is locked (D20). The page being viewed gets `aria-current="page"` through a new optional `current` flag on `LessonItem`, which `LessonLink` passes to its `<a>`.

### 3. Layout and stickiness

From 768 px, `.app-body` is a grid with `grid-template-columns: clamp(16rem, 22vw, 20rem) minmax(0, 1fr)` (widened from 15rem, user 15 Nov) and a gap of `--space-6`. `main` keeps its own `max-width` (the reading column) and `margin-inline: auto` inside its grid cell. The sidebar is `position: sticky; top: 0; max-height: 100vh; overflow-y: auto`. Below 768 px, `.app-body` is a single column with the Lessons button above `main`.

The sandbox's existing `.app-main:has(.sandbox-layout)` width lift still applies inside the cell.

### 4. Removing the pill and the outline

- **Pill.** `TopBarProps.status` and `.topbar-status` are deleted. `startCopy.savedPill` and `notSavedPill` are deleted. `StorageNotice` and the Start screen's not-saved message are unchanged (NFR-06).
- **Outline.** `LessonOutline.tsx`, `outline.ts`, their copy in `src/content/lesson.ts`, the `.lesson-layout` and `.lesson-outline*` rules, and the `.app-main:has(> .lesson-layout)` width rule are deleted. `LessonPlayer` keeps `goTo` for Next, Back and skip. The outline tests are deleted with the capability, and the parts that tested Next and Back stay in `lesson-player` tests.

### 5. Settings (D157)

`shellCopy.aaButtonText` becomes "Settings", and `aaButtonName` becomes "Settings: display and read-aloud". The name starts with the visible word, which meets WCAG 2.5.3 "label in name". The component keeps its file and its behaviour.

### 6. Objectives without points (D158)

The objectives block renders `text` and `objectives` and drops `points`. Only `c1-s02` has points, so no other screen changes.

### 7. Sandbox container query (D156)

`.sandbox` gets `container-type: inline-size`, and the two-column rules move from `@media (min-width: 768px)` to `@container (min-width: 45rem)`. The `.app-main:has(.sandbox-layout)` width rule stays a media rule at 768 px, because it widens `main` itself.

### Decision rows

| ID | Topic | Decision |
| --- | --- | --- |
| D155 | Lessons sidebar | Every screen shows "Lessons": C1 to C9 with Done, You are here or Not started in words, the page being viewed as `aria-current`, every lesson a link (D20). From 768 px it is a sticky column left of `main`, 16rem growing to 20rem with the screen (user, 15 Nov: not squashed); below, a Lessons button opening the list in the page flow. User choice (15 Nov); ID 8.2 lesson list. |
| D156 | Sandbox columns | The sandbox switches to two columns when its own area is at least 45rem (container query), not at a screen width, so it fits beside the sidebar. Amends D140. |
| D157 | Navbar | "Aa" is renamed "Settings" (name "Settings: display and read-aloud"). No status pill in either variant; the Start screen's not-saved message stays (NFR-06). User choice (15 Nov). |
| D158 | Objectives screen | An objectives screen shows its text and objectives, not its `points`. C1's nine-lesson list is shown by the sidebar instead. User choice (15 Nov). D154 (lesson outline) is superseded by D155. |

## Risks / Trade-offs

- [A 16rem to 20rem sidebar narrows every screen at 768 to 1024 px] → `main` keeps the reading column, and lessons are one column, so text still fits (about 30rem at 768). The tree views scroll in their own region. The sandbox stacks by its own width (D156).
- [Tab passes nine links before reaching `main` on every page] → The skip link goes straight to `main`, and the sidebar is one landmark that screen readers can skip.
- [The ID says new lessons unlock in order (ID 8.2), and D20 says nothing is hard-locked] → This is unchanged: the sidebar follows D20, like the hub map. Raising it again is a separate decision.
- [Removing the pill removes a visible cue that progress is kept] → The Start page privacy notice and the not-saved message carry it. The user chose this (D157).

- [Found by the user, 15 Nov: the sandbox's words showed one per line] → In the sidebar grid, `main`'s auto margins made it shrink to fit its content. The sandbox's `container-type: inline-size` then gave its contents no width. Fixed with `.app-body > .app-main { width: 100% }`. A stylesheet test now guards it, because jsdom has no layout. The page was checked by screenshot at 360, 768 and 1366 px.
- [Seen in those screenshots] →
  - the full-width ＋ icon is missing from the app font, so it is now a plain +;
  - "What happened" is numbered counting down (`<ol reversed>`), so the newest line has the highest number;
  - Numbers lists one fact per line;
  - the log box is 10rem tall in one column and 16rem side by side, so on a phone the controls come sooner.

## Migration Plan

No data migration. Rollback is reverting the change. `lesson-outline` comes back from the archive if needed.
