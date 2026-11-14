# Proposal: revamp-progress-and-hub

Owner: Dev B (lane B, D121). Capability: `ui-progress`.

## Open questions

No question blocks the work. Each has a recommendation, the specs follow it, and it is isolated in a prop, one constant or one file (D18). Decision numbers start at D132, because main uses D1 to D124, `revamp-tree-view` proposes D125 to D127 and `revamp-question-and-feedback` proposes D128 to D131.

1. **Folder and the files outside it (proposed D132).** The brief says "Only `src/ui/learn/**`", but these are progress components, not learn components.
   - **Recommendation, assumed:** build them in `src/ui/progress/**`.
   - As in D128, `tests/ui/contracts.test.tsx` fails once a real component has a stubbed name, so the change also has to:
     - edit `src/ui/contracts.ts`: move six names to BUILT, widen their props, and repoint ProgressMap, ResumeCard and ActivityList to `src/ui/progress/`;
     - delete six stubs and their lines in `src/ui/stubs/index.ts`;
     - change the contract-test counts to 25 built and 20 stubbed;
     - add one line to `src/gallery/Gallery.tsx`.
   - These files are not base components (`src/ui/base/`), so no separate change is needed.
   - **Please confirm at the skim.**
2. **Navigation policy and PathModeToggle (D20 against ID 8.2, proposed D133).** Two sources disagree:
   - D20 says nothing is hard-locked and "Choose my own" is available, and wireframe 1e draws that toggle.
   - ID 8.2 (source 0, D92) says "any completed lesson can be revisited; new lessons unlock in order". The team draft says the same: fixed forward, free backward.

   **Recommendation:** follow the ID and the team draft, drop the toggle, and mark D20's "nothing hard-locked" and "Choose my own" as superseded. PathModeToggle stays a stub and is not built here. The components never decide the rule. They draw whatever state each lesson is given, so D20's rule (no lesson locked) and the ID's rule both work by changing the input alone (scenario "Either navigation rule"). The rule itself goes in the policy function in a later logic change.
3. **Does the optional C7 block C8 and C9 (D4, ID 7.2 C7, proposed D134)?** ID 7.2 says C7's check "does not block progress", and D4 says C7 never blocks Ready.
   - **Recommendation:** C7 blocks nothing. C7 and C8 both unlock when C6 is done, and C9 unlocks when C8 is done, whatever C7's state.
   - The rule belongs to the policy change. Here, the menu and the map show the "Optional" word passed in for C7, and a C7 left open while C8 is current is drawn as open, not as a gap.
4. **Where the lesson menu opens on a phone (proposed D135).** **Recommendation, assumed:**
   - A "Lessons" button sits in the TopBar's existing `actions` slot. It opens a panel in the page flow directly under the top bar, full width at 390 px. It is not a modal and not a slide-in drawer.
   - From 768 px the same panel is anchored under the button, at the width of its content.
   - Escape and the button close it, and focus returns to the button.
   - The panel holds only the lesson list: no hints and no settings.
   - TopBar is unchanged, so no base change is needed.
5. **Lesson states (proposed D136).** The brief names locked, current and done. Under the ID rule, a lesson can also be unlocked without being current or done (C7 skipped, or the lesson that opens next).
   - **Recommendation:** four states, `done`, `current`, `open` and `locked`. Their words come from props.
   - **Assumed fixture words:** "Done", "You are here", "Open" and "Not yet open". "Not yet open" matches `add-lesson-outline` question 5 and avoids "locked" (calm wording, D27).
   - A locked item carries its reason as text, for example "Opens when C3 is done". The reason comes from props.
6. **"Module N of 9" or "Lesson N of 9" (ID 8.2, 10.4, D96).** The ID and the lesson player say "Lesson 4 of 9"; the brief says "Module". **Recommendation:** the component takes its label as a prop, and the fixtures and the later wiring use "Lesson n of 9" from the ID.
7. **What the hub's ActivityList lists (D96 supersedes D10, proposed D137).** Lessons no longer have activities. They are JSON screens grouped by phase (D96, `add-lesson-outline`).
   - **Recommendation, assumed:** the hub's ActivityList shows the current lesson's phases in lesson order, each done, next or to do, as given.
   - It cannot be reordered. D10's reordering was superseded by D96, so the wireframe's ↑/↓ and "Reset to default order" are dropped.
8. **Map layout widths (D118).** The brief asks for a horizontal map on desktop and a vertical list at 390 px. Ten items (nine lessons and the summary) do not fit in a row at 768 px with their words.
   - **Recommendation, assumed:** vertical below 1366 px, horizontal from 1366 px. That is one rule in `progress.css`, inside D118's allowed queries.
9. **Mastery under done lessons (design system ProgressMap).** The design system shows a small MasteryBadge under finished units, while completion stays neutral ink.
   - **Recommendation:** each map item takes an optional mastery state and draws the existing `MasteryBadge` beneath it. Mastery is computed elsewhere; until then the badge is simply absent.
10. **Composed views (assumed).** The brief's acceptance checks the composed screens, for example "SandboxCard present in every lesson state" and "ResumeCard absent without saved progress". To test them, the change adds `StartView` and `HubView`, plus `LessonProgress` and `LessonMenu`. None of these four is named in the design's 45 contracts, so they stay out of `contracts.ts`; the count stays 45.
11. **Requirement IDs.** They come from the screen specs (1b, 1e) and existing specs: FR-ONB-01 to 04, NFR-05, FR-LRN-03, FR-LRN-04, FR-LRN-05, FR-MOT-04, FR-VIS-08, FR-VIS-10 and NFR-02. No LO: these screens teach nothing.
    - [OPEN] The FR ID of the lesson progress bar. ID 8.2 and 10.4 ask for it, but no FR in the screen specs names it; it might be FR-LRN-03. Check it in the SE document.
12. **Wiring (assumed).** The pages (`src/pages/Start.tsx`, `Hub.tsx`) keep using `src/components/` until a wiring change. That change will:
    - compute each lesson's state with the policy (question 2);
    - put LessonProgress and LessonMenu in every screen's TopBar;
    - modify `module-hub` and `start-screen`, which today require "Nothing is locked" and the Up next and Later words.

    So for a while two components share each of the names ProgressMap, ResumeCard and ActivityList, as with FeedbackPanel (D129).

## Why

The student needs to see where they are, what comes next and how to get around (ID 8.2, 8.3 "revealed structure", 10.4). Today:
- the Start screen and hub are first-pass page components in `src/components/`, with their wording fixed inside;
- six of the designed components (frames 1b, 1e) are stubs;
- nothing shows "Lesson 4 of 9" with a bar on every screen, or gives a lesson list from every screen.

## What Changes

- **Start (frame 1b).**
  - StartPanel: heading, intro with the D3 session length, start button and optional hero.
  - ResumeCard, rendered only when saved progress is given.
  - PrivacyNotice, always visible: nothing leaves the device.
  - ResetProgressLink, which opens the existing ConfirmDialog naming what will be erased and resets only on confirm.
  - StartView composes them.
- **Hub (frame 1e).**
  - ProgressMap of C1 to C9 plus the summary, with done, current, open and not-yet-open states shown by word, symbol and border, never colour alone. Done is neutral ink, and mastery is an optional separate badge.
  - UnitCard: title, one-line goal, time and state.
  - ActivityList of the current lesson's phases.
  - SandboxCard, present in every state (D11).
  - LectureQuestionsCard: count and link.
  - HubView composes them.
- **Revealed structure.** LessonProgress: "Lesson n of 9" as text plus a bar, for the TopBar's `progress` slot (D117).
- **Navigation.** LessonMenu: a "Lessons" button and panel listing every lesson with its state. It works by keyboard, and a not-yet-open item says why and when it opens, in text.
- **Layout.** The map is vertical below 1366 px and horizontal from it. 44 px targets; no horizontal scroll at 390, 768 and 1366 px.
- **Contracts.** Six stubs become built (25 built and 20 stubbed). ProgressMap, ResumeCard and ActivityList are repointed. PathModeToggle stays a stub.
- Every word comes in as a prop. Fixtures use the D3 wording and the "Lesson n of 9" label. No `src/content/` change.

## Out of scope

- The unlock rule and routing, mastery calculation, storage and the storage adapter, the event log.
- The diagnostic, the readiness summary, and all lesson content and wording.
- PathModeToggle (question 2).
- Wiring into `src/pages/` and every screen's TopBar, and the `module-hub` and `start-screen` spec changes (question 12).

## Capabilities

### New Capabilities

- `ui-progress`: the presentational components that show where the student is, what is next and how to move: Start, hub, lesson progress and lesson menu. They render the states and words they are given.

### Modified Capabilities

None. `module-hub` and `start-screen` describe the pages, which this change does not touch (question 12).

## Impact

- **New:** `src/ui/progress/` with:
  - StartPanel, ResumeCard, PrivacyNotice, ResetProgressLink and StartView;
  - ProgressMap, UnitCard, ActivityList, SandboxCard, LectureQuestionsCard and HubView;
  - LessonProgress and LessonMenu;
  - `progress.css` and ProgressGallery.
- **Changed:** `src/ui/contracts.ts`, `src/ui/stubs/` (six stubs removed), `tests/ui/contracts.test.tsx` counts, and one line in `src/gallery/Gallery.tsx`.
- **Reused unchanged:** `src/components/ConfirmDialog.tsx`, `src/ui/base/MasteryBadge.tsx`, TopBar's `progress` and `actions` slots, and the existing tokens.
- No new dependencies, no storage change, no network calls.
