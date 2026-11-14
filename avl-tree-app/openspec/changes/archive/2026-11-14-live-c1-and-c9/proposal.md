# Proposal

## Open questions

No `[OPEN]` item blocks the specs (D18). The ID documents are final (D92). Please read these before `/opsx:apply`.

1. **Settled (user, 14 Nov): change 2 of 3.** It builds on `add-live-lesson-questions` (question controls, the marker, the attempt record) and is applied after it. Archive order: `add-live-lesson-content`, `add-live-lesson-questions`, this change, `add-lesson-outline`.
2. **Settled by the ID (7.2 C1):** C1 is the lesson in `lessons/c1.json`:
   - the welcome, route, how-the-app-works, conventions-card and settings screens
   - five readiness questions from `questions/diagnostic.json`
   - the result: each prerequisite skill as Secure or Needs review (`conventions.labels`)
   - the route: 4 or 5 right goes to C2; fewer goes to the BST refresher, then a short re-check, then C2

   Feedback is not shown during the five questions: the result screen is the feedback (ID 9.1 "Per-skill list").
3. **Settled by the ID (7.2 C9, `readiness.json`):** C9 is the lesson in `lessons/c9.json`:
   - nine readiness questions, one per objective, then the two combined questions (the search question uses the tree the build question built)
   - a missed question returns once, in its return form, after the first pass
   - the report: Ready or Revise per LO1 to LO7 by `readyRule` (LO7 optional, never blocking), confident wrong answers flagged, the overall title, links back to the lessons, lecture questions from the misconceptions of wrong answers, the "listen for" list
   - the student's own lecture question
   - the certificate
4. **Settled by the ID (10.4, `rewards.json`): titles and the certificate.**
   - The overall title is the `rewards.json` title for the share of all criteria met across the readiness questions.
   - The certificate shows the typed name, lessons completed (n of 9), the title and the date, with `certificateText`.
   - The name is never stored.
   - The certificate is printed with the browser's Print (also Save as PDF), so no network call is made.
5. **Settled by the ID (7.2): no skipping the readiness check.** The old "skip the diagnostic" path (`diagnostic-skipped`) is removed (Phase A gap C).
6. **Assumed, not blocking: settings.** The settings screen shows the three settings in `c1.json`:
   - **Larger text:** works now, by scaling the root font size.
   - **Confetti:** stored now. Its effect arrives with the rewards change.
   - **Narration:** shown switched off with "Added in a later update". The ID's text-to-speech is a stretch item (D26).
7. **Assumed, not blocking: old progress is replaced once.** Stored attempts use old question ids that no longer exist. The storage version becomes 2; a version-1 save is replaced by a fresh one, and the existing "your earlier progress was replaced" notice is shown (`start-screen`).
8. **Assumed, not blocking: per-skill names for C1.** The ID names the five prerequisites (ID 7.2: tree terms, "is this a BST?", where a new key is inserted, a BST search path, the height of a node). These names go in the objective table in `src/live/outcomes.ts`, since no JSON file holds them.
9. **Removal (BREAKING):** the whole old question model goes:
   - `src/assessment/` (except `shape.ts` if still used)
   - `src/content/questions/`, `src/content/modules/`, `src/content/diagnostic.ts`, `readiness.ts`, `practice.ts`, `check.ts`
   - `src/modules/`, `src/practice/` (its `rotateAt` moves to `src/engine/rotations.ts`)
   - `src/navigation/diagnostic.ts`
   - `src/ui/module/check/`
   - the old C1 and C9 pages, and the sub-skill mastery status

   Twelve capabilities' requirements are removed, with their tests.
10. **Flagged for the user to read:** UI labels only ("Print certificate", "Your name", "Question n of m", "Secure", "Needs review", "Added in a later update"). The teaching text is the JSON's.

## Why

C1 and C9 still run on the mock TypeScript question banks drafted from the superseded `ID-content.pdf`: the warm-up questions, the routing, the readiness questions, the LO1 to LO9 report and the lecture list. The user ran the app and saw this mock content. The ID's C1 and C9 content, rewards and report rules exist in `src/live_content/`, and nothing else uses the old model once C2 to C8 run on the JSON.

## What Changes

- **C1 from the JSON (new).** The lesson player plays C1: the welcome, route, how-the-app-works, conventions-card and settings screens, the five readiness questions, the result and route, the refresher (with its practice task and re-check) and the re-check.
- **C9 from the JSON (new).** The readiness questions with returns, the report (Ready or Revise per objective, the overall title, flags, links, lecture questions, "listen for"), the student's own lecture question and the certificate. `/readiness` shows the report.
- **Settings (new).** Larger text works; the confetti preference is stored; narration is shown as coming later.
- **Storage (changed).** Version 2. A version-1 save is replaced once, with the notice. The sub-skill status is no longer kept.
- **Removed (BREAKING).** The old question model, its content, pages, components and twelve capabilities' requirements. The skip-the-diagnostic path.
- Serves ID 7.2 (C1, C9), 9.1, 9.2, 10.3, 10.4, 12.1, 12.2; FR-DIA-01 to FR-DIA-05, FR-RDY-01 to FR-RDY-03, FR-ONB-03.

## Out of scope

- Titles after each lesson check, routing bands, the review ladder, the challenge, the nudge and the confetti effect (rewards change).
- Narration (later change).
- The lesson outline (change 3).

## Capabilities

### New Capabilities
- `lesson-c1`: C1 from `lessons/c1.json` and `questions/diagnostic.json`: the getting-started screens, the readiness questions, the per-skill result, the route, the refresher and the re-check.
- `lesson-c9`: C9 from `lessons/c9.json` and `questions/readiness.json`: the readiness questions with returns, the report, the student's own question and the certificate.
- `display-settings`: the settings from `lessons/c1.json` (larger text, confetti preference, narration placeholder), kept in settings storage.

### Modified Capabilities
- `route-choice`: the C1 route uses the JSON's route and messages.
- `app-routing`: C1 and C9 are lessons too; only `/module/C1/refresher` keeps an activity path, and the old C1 and C9 activity paths redirect to the lesson.
- `module-hub`: every module screen is its lesson; no module has an activity list.
- `learner-session`: recording an attempt no longer updates a sub-skill status; screens can set a setting.
- `learner-storage`: storage version 2; an old save is replaced once.
- `question-bank`, `question-model`, `readiness-check`, `readiness-report`, `readiness-summary`, `mastery`, `retry-cap`, `scaffold-ladder`, `module-practice-steps`, `structure-comparison`, `diagnostic-c1`, `diagnostic-routing`: every requirement removed.

## Impact

- New: `src/ui/lesson/c1/` (question set, result and route), `src/ui/lesson/c9/` (readiness set, report, own question, certificate), `src/live/readiness.ts` (the ready rule and titles) and `src/live/diagnostic.ts` (the route), settings in `src/state/storage.ts`.
- Changed: `src/pages/Module.tsx`, `Refresher.tsx`, `Readiness.tsx`; `src/App.tsx` and `src/routes.ts` (C1 and C9 play their lessons; `/module/C1/check`, `/module/C1/check/result` and `/module/C9/check` redirect to the lesson); `src/state/learnerState.ts` (version 2, no `subSkillStatus`, no `diagnostic-skipped`); `src/engine/rotations.ts` (`rotateAt`).
- Removed: as in item 9, with their tests.
- No new dependencies, no network calls.
