# Proposal

## Open questions

No `[OPEN]` item blocks the specs (D18). The user settled the source question on 13 Nov: **the two ID documents in `src/live_content/` are final and will not change; wherever they disagree with the app, `decisions.md` or `ID-content.pdf`, the app changes to match them.** Every item below follows from that ruling or is an assumption kept in one place. Please read them before `/opsx:apply`.

1. **Settled (user, 13 Nov): the ID documents replace `ID-content.pdf` as the content source.** `AVL_Tree_App_ID_Document.docx` and `AVL Trees Learning Objectives.docx` (Markdown copies in `docs/`) become source of truth 2, above the SE document. The rows they overturn get superseding rows (D92 onward, see design.md): D1 (titles now come from the lesson files), D2 and D19 (sign and wording), D10 and D34 (screens and activities), D22 and D23 (one lesson player), D25 (tree-node palette), D30 (no insert listing) and D61 to D64 (C7 scope). `openspec/config.yaml` and `.claude/CLAUDE.md` drop the old conventions and source list.
2. **Settled by the ID (7.3, `conventions.json`): balance factor = h(right) − h(left).** The engine, the tree view, every caption and every test that depends on the sign flip together. The conventions are read from `conventions.json` by one module; the D19 rule ("no content string states the formula") retires, because the ID's own lesson text states it.
3. **Assumed, not blocking: content is imported at build time, in manifest order (ID 12).** Every file in `manifest.files` is loaded through one typed loader; a listed file that is missing, or a JSON file that is not listed, is a content error.
4. **Assumed, not blocking: answers typed into the JSON are cross-checks, never shown as typed.** The ID says the engine works out every answer (ID 12.2) and the JSON also stores `expected`, animation `steps` and `result`. The engine computes them; the loader compares; any difference is a content error that names the file, the item and both values. JSON files are never edited by the app or by this change: a mismatch is reported to the user.
5. **Assumed, not blocking: a content error stops the lessons, not the app.** The app shows one "Content problem" screen listing every problem (file, item id, field, what is wrong) instead of a lesson. A test runs the same validation, so `npm test` fails on bad content.
6. **Assumed, not blocking: letter keys.** Some ID trees use capital letters (the COS212 slide examples); `conventions.keys` says they compare alphabetically. The engine accepts number or letter keys; one tree never mixes them (a content error).
7. **Assumed, not blocking: one lesson screen at a time, in the JSON's order.** The ID's Merrill and Gagné order (problem first, then the objective, recall, demonstration, application, integration; ID 3.2) is the screen order. Each lesson keeps the layout the user asked for: lesson title and position at the top, the objectives screen near the start, content screens, then questions, then the summary with an objectives recap. C6 deliberately places a worked example between practice tasks ("hand over control step by step", ID 7.2), so the player labels each screen's phase from its `merrillPhase` instead of forcing fixed blocks.
8. **Assumed, not blocking: balance factors are shown unless a screen says otherwise.** ID 8.3 says every node shows its balance factor; a screen's `show` list, when present, names exactly what is shown (for example only the root's balance factor in C3's opening problem).
9. **Assumed, not blocking: questions arrive in the next change.** The interactive screens (`predict`, `recall`, `task`, `practice`, `check`, a summary's `transfer` question and an animation's `guided` pauses) show a labelled placeholder in this change and become real in `add-live-lesson-questions`, which also brings lesson completion and the "Where next?" panel to the new player. **Archive this change only together with, or after, `add-live-lesson-questions`.** Until then a C2 to C8 lesson cannot be completed, and the old C2 to C8 Check activity (mock questions, "Where next?" panel) is gone (user decision, 14 Nov).
10. **Assumed, not blocking: one route per lesson.** `/module/C2` to `/module/C8` play the lesson; the old `/module/:id/explore`, `/example` and `/check` paths for C2 to C8 redirect to the lesson. C1 and C9 keep their current screens and routes until their own change.
11. **Assumed, not blocking: tree-node look follows ID 11.1.** Balanced, unbalanced, being rotated and newly inserted each have the ID's Okabe–Ito colour and the ID's non-colour backup (the balance factor, a "!" marker and a thick dashed outline, a bold outline and the caption, a "NEW" tag). The ID's "arrow along the move" is left out: the replay redraws from snapshots (D32), and the caption already says what moves. Recorded as an assumption.
12. **Flagged for the user to read: wording beyond the ID.** Only UI labels are new: "Learning objectives", "Objectives recap", the phase names, "Screen n of m", the placeholder line and the error-screen text. They live in one UI copy file. No teaching text is written; every lesson sentence comes from the JSON or from `conventions.json`.

## Why

Every lesson the app shows today is mock content: TypeScript records drafted in `src/content/modules/` from the superseded `ID-content.pdf` (LO1 to LO9, balance factor left − right), marked "[beyond ID]" throughout. The final ID content now exists as JSON in `src/live_content/`, and the ID document is final, so the lessons must come from it, with one clean, consistent layout for all of them.

## What Changes

- **Live content loader (new).** One typed loader reads every file in `src/live_content/manifest.json`, in its order, and validates it: structure per file, unique ids, every cross-reference (check, question, misconception, scaffold, concept, screen), each screen's Gagné event and Merrill phase, each question's objective, criteria and Bloom level against the ID, key types, and engine cross-checks of every typed answer, step list and result. Problems are listed on one clear error screen. The app reads lesson content only through this loader.
- **Conventions from `conventions.json` (BREAKING).** Balance factor becomes h(right) − h(left); case labels ("Case 1 (LL)" …), branch wording, captions and the search pseudocode come from `conventions.json`.
- **Engine.** Letter keys; traces for a sequence of inserts, for a given sequence of rotations and for a leaf deletion with its rebalancing; a shape string in the ID's `20(10, 40(30, 50))` notation for checking results.
- **Lesson player (new).** C2 to C8 play their JSON screens one at a time with the same frame: lesson title, "Lesson n of 9", "Screen n of m" and the screen's phase at the top; one main representation in the centre; the caption under it; supporting text; Show the rule on demand; and the control strip (Back, Next, Replay on one side; Show the rule, Hint on the other) in the same place on every screen. Skip ahead only on explanation screens (ID 8.2).
- **One component per content block (new).** Objectives, rule (including the four-case chart), diagram (including side-by-side comparison), worked example, animation (search, insert, insert sequence, rotations, leaf delete; side-by-side comparison; G/P/C role steps; in-order check; a "What changed?" prompt, ID 8.1; the matching pseudocode line), pseudocode (loop and recursive side by side) and summary (points, then the objectives recap).
- **Tree view.** What each node shows follows the screen's `show` list; node states follow ID 11.1.
- **Removed (BREAKING).** The mock lesson content for C2 to C8, the module framework that played it, its practice widgets and their specs. The insert pseudocode outline (not in the ID).
- Serves LO1 to LO7 as the ID numbers them (ID 5.1), ID sections 3.2, 6, 7.1 to 7.4, 8.1 to 8.3, 11 and 12; FR-LRN-01, FR-LRN-04, FR-VIS-04, FR-VIS-07, FR-VIS-09, FR-ENG-10, NFR-02, NFR-05.

## Out of scope

Each needs a later change; their order is still to be agreed:

- Questions of every type, practice, lesson checks, feedback from `misconceptions.json`, hints, confidence, lesson completion and "Where next?" (`add-live-lesson-questions`).
- C1 and C9 screens and their question sets; LO renumbering in stored data and the readiness report; `outcomes.json`.
- Titles, confetti, certificate, routing bands, challenge and nudge (`rewards.json`).
- Lessons unlocking in order, the progress bar, the concepts-mastered list.
- Narration, the text-size setting, the glossary, the evaluation event log.
- Sandbox changes beyond the sign flip and node look it inherits from the engine and tree view.

## Capabilities

### New Capabilities
- `live-content`: loading `src/live_content/` in manifest order through one typed loader, validating it (structure, references, lesson structure, engine cross-checks) and reporting problems on one screen.
- `lesson-player`: playing a lesson's JSON screens one at a time in one consistent frame, with position, phase, navigation, skip rules, focus and the objectives recap.
- `lesson-blocks`: one reusable component per content screen type and what each shows from its JSON fields.

### Modified Capabilities
- `conventions`: balance factor is right minus left; the conventions are read from `conventions.json`; wording comes from its labels and captions.
- `avl-engine`: letter keys; search line maps from `conventions.json`; traces for insert sequences, given rotations and leaf deletion; shape notation.
- `tree-view`: per-screen `show` list; ID 11.1 node states.
- `step-replay`: captions from `conventions.json`; replays of the five lesson operations.
- `pseudocode-panel`: the two search listings come from `conventions.json`; no insert outline.
- `module-hub`: the module screen of C2 to C8 is the lesson.
- `app-routing`: activity paths only for C1 and C9; old C2 to C8 activity paths redirect to the lesson.
- `module-framework`, `module-c2-lopsided-bsts`, `module-c3-avl-property`, `module-c4-search`, `module-c5-rotations`, `module-c6-insertion`, `module-c7-delete`, `module-c8-choosing`: every requirement removed (replaced by the JSON lessons).
- `module-checks`: every requirement removed, and `route-choice`: the four requirements of the "Where next?" panel removed (the old C2 to C8 Check activity goes with the mock lessons; user decision, 14 Nov, during apply). The C1 diagnostic route stays. The UI scenarios of `scaffold-ladder` ("Calm and accessible") and `retry-cap` ("Capped screen") were tested only through that activity; their logic tests stay, and the questions change reworks both.

## Impact

- New: `src/live/` (loader, types, validation, engine cross-checks), `src/ui/lesson/` (player, frame, block components, error screen), lesson UI copy in `src/content/lesson.ts`.
- Changed: `src/engine/conventions.ts` (reads `conventions.json`), `src/engine/tree.ts` and callers (key type), `src/engine/` traces, `src/ui/tree/TreeView.tsx`, `src/ui/replay/*`, `src/content/pseudocode.ts`, `src/routes.ts`, `src/App.tsx`, `src/pages/Module.tsx`, `src/content/modules.ts` (titles from the loader), `tsconfig.app.json` (JSON imports), `.claude/docs/decisions.md`, `openspec/config.yaml`, `.claude/CLAUDE.md`.
- Removed: `src/content/modules/c2.ts` to `c8.ts` and `player.ts`, `src/modules/` lesson framework files no longer imported, `src/ui/module/ModulePlayer.tsx` and `src/ui/module/practice/*`, and their tests. Files the old C1 diagnostic, C9 readiness or check bank still import stay until their change; tasks.md lists the import check.
- Tests: every engine, tree-view and replay test that depends on the sign is updated to the ID convention by the test-writer in task 1; the C2 to C8 module tests are retired with their specs.
- No new dependencies, no storage schema change, no network calls.

## Gap analysis (approved 13 Nov)

From Phase A (ID document, Learning Objectives document and the JSON compared with the app). "Here" means this change; later changes are named by their topic.

| # | Requirement (source) | Status before | Where it is handled |
|---|---|---|---|
| 1 | Lessons C1 to C9 in order (ID 7.1) | Met (order) | Here: manifest order |
| 2 | New lessons unlock in order (ID 8.2) | Conflict (D20) | Unlocking change |
| 3 | Objectives shown at the start of every lesson (ID 3.2) | Partly | Here: objectives block |
| 4 | Objectives recapped at the end | Missing | Here: summary block |
| 5 | LO1 to LO7 and their lessons (ID 5.1, LO doc) | Missing (app LO1 to LO9) | Here for lesson display; stored data and report in the C1/C9 change |
| 6 | bf = h(right) − h(left) (ID 7.3) | Conflict (D2) | Here |
| 7 | Case names, "rotate C around G", "left branch" (ID 7.3) | Partly | Here: from `conventions.json` |
| 8 | One check question per criterion (ID 9.1) | Partly | Questions change |
| 9 | One re-attempt per check question (ID 9.1) | Conflict (D9) | Questions change |
| 10 | Share of criteria, titles, mastery at A (ID 9.3) | Missing | Rewards change |
| 11 | Routing bands, challenge, nudge (ID 9.3) | Partly | Rewards change |
| 12 | One static hint per question (ID 9.4) | Partly | Questions change |
| 13 | Support ladder through review questions and `scaffolds.json` (ID 9.4) | Partly | Questions change |
| 14 | Confidence rating; confident errors flagged (ID 9.2) | Partly | Questions change |
| 15 | Four-part feedback, "Not quite." (ID 10.1) | Partly | Questions change |
| 16 | Seven question types (ID 9.5) | Partly | Questions change |
| 17 | Fixed trees; engine works out answers (ID 12.2) | Missing | Here (lesson trees and cross-checks); questions change for questions |
| 18 | Attempt record with attempt number (ID 12.2) | Partly | Questions change |
| 19 | C1 diagnostic and refresher (ID 7.2) | Met (logic) | C1/C9 change |
| 20 | C9 Ready or Revise, overall title, listen-for list (ID 7.2) | Partly | C1/C9 and rewards changes |
| 21 | Certificate (ID 10.4, `rewards.json`) | Missing | Rewards change |
| 22 | Confetti and its setting (ID 8.3) | Missing | Rewards change |
| 23 | "Lesson n of 9" and a progress bar (ID 8.2) | Missing | Here: the text; unlocking change: the bar |
| 24 | Concepts-mastered checklist (ID 10.4) | Partly | Unlocking change |
| 25 | JSON validator (ID 12.1, 12.2) | Missing | Here |
| 26 | C7 leaf deletion only (ID 7.2) | Conflict (D61, D62) | Here |
| 27 | C8 scenario cards, Red-Black mention (ID 7.2) | Partly | Here (content screens); questions change (scenario cards) |
| 28 | Okabe–Ito node states (ID 11.1) | Conflict (D25) | Here for tree nodes |
| 29 | Settings: confetti, narration, text size | Partly | Rewards and later UI changes |
| 30 | One main representation per screen (ID 8.1) | Partly | Here |
| A | Event log: route followed, hints opened, time, retries (ID 9.3, 9.4, 13) | Missing | Event-log change |
| B | Practice: one static hint, unlimited retries (ID 9.4, 10.2) | Conflict (D21) | Questions change |
| C | No route that skips the C1 diagnostic (ID 7.2) | Conflict | Unlocking change |
| D | Search pseudocode only (ID 7.4) | Beyond ID | Here: insert outline removed |
| E | Text-size setting | Missing | Later UI change |
| F | "What changed?" after an animation (ID 8.1) | Missing (no JSON text) | Here: the ID's own words |
| G | Glossary in `conventions.json` | No screen | Later UI change |
| H | Old stored progress uses LO1 to LO9 | — | C1/C9 change (storage version) |
