# Design

## Context

See proposal.md for why. After `add-live-lesson-questions`:

- The lesson player, the question controls (`QuestionCard` and one control per type), the marker (`src/live/mark.ts`) and the attempt record (with attempt numbers) exist and run C2 to C8.
- C1 and C9 still run on the old pages:
  - `WarmUpCheck`, `WarmUpResult`, `ReadinessCheck`, `Readiness`
  - over `src/assessment/` (seeded kinds, `instantiate`, `mark`, `session`, `readiness`, `report`, `scaffold`, `mastery`)
  - with `src/content/questions/`, `src/content/modules/*`, `src/modules/*`, `src/practice/*` and `src/navigation/diagnostic.ts`
- The learner state keeps `subSkillStatus` and a `path` that can be `diagnostic-skipped`.
- The sandbox depends only on the engine and its own content.

## Goals / Non-Goals

**Goals:**
- C1 and C9 come only from `lessons/c1.json`, `lessons/c9.json`, `questions/diagnostic.json`, `questions/readiness.json`, `misconceptions.json` and `rewards.json`.
- After this change, nothing in `src/` holds question or lesson content, and the old model is gone.

**Non-Goals:**
- Lesson-check titles, routing bands, the review ladder, the challenge, the nudge and confetti (rewards change).
- Narration.

## Decisions

### 1. Question sets are one component with two policies

`QuestionSet` plays a list of question ids, one at a time, with `QuestionCard`. It has two policies:

- **`diagnostic`:** one answer each, no verdict, confidence. It ends with the result.
- **`readiness`:** one try each, with immediate feedback and confidence. After the first pass it queues each missed question's return form once (`returnIds`), in the order missed.

Its position is derived from stored attempts, so a reload resumes.

The combined search `rdy-09` already names its tree in the JSON. The cross-check on load proves that tree is the engine's result of `rdy-08` (a test asserts it). So no tree is passed between the two questions.

### 2. Pure rules in `src/live/`

- **`diagnostic.ts`:**
  - `diagnosticResult(attempts)` gives per prerequisite Secure or Needs review, the number right and the route (`minCorrect`).
  - `recheckIds(attempts)` gives the return forms of the missed questions.
- **`readiness.ts`:**
  - `readinessReport(attempts, content)` applies the `readyRule`:
    - each LO is Ready when its question is right first time or in its return form;
    - LO5 also needs `rdy-08` and LO3 also needs `rdy-09`;
    - LO7 is optional.
  - It also returns the confident-wrong flags per LO (attempts rated "Sure" and wrong, over C2 to C9), the lecture questions (one `lectureQuestion` per misconception of a wrong attempt with no later right attempt on the same `subSkill`), the "listen for" list, the share of readiness criteria met and the overall title.
  - `titleFor(share)` reads `rewards.json` `titles` by `minShare`, so the rewards change reuses it.

These are pure functions with unit tests, so `/readiness` and the C9 report screen show the same result.

### 3. C1 and C9 are lessons

`isLesson` becomes true for every module, so `/module/C1` and `/module/C9` play their lessons. `regionsFor` gains components for the remaining screen types:

| Screen type | Component |
|---|---|
| `intro`, `info` | text and points |
| `conventions` | tree with its show list, then points |
| `settings` | `SettingsBlock` |
| `question-set` | `QuestionSet` |
| `route` | `RouteResult` |
| `report` | `ReadinessReport` |
| `free-text` | `OwnQuestion` |
| `certificate` | `Certificate` |

The refresher's `question-set` screen starts the re-check. Its practice task becomes a practice question.

Old paths (`/module/C1/check`, `/check/result`, `/module/C9/check`) redirect to the lesson. `ACTIVITIES_BY_MODULE` keeps only `C1: ['refresher']`.

### 4. Certificate

The certificate is a card rendered from `certificateText` with the typed name. The name lives in component state only and is never dispatched or stored; a test checks storage after generating one.

"Print certificate" calls `window.print()`. A print stylesheet hides everything but the certificate card. "Lessons completed" counts completed modules, C9 included.

### 5. Settings

`src/state/storage.ts` already keeps settings (the theme) under its own key. The settings become `{ theme, confetti, narration, textSize }`, validated on load with the defaults from `c1.json`. Larger text sets `data-text-size="large"` on `<html>`, and `tokens.css` raises the root font size for it (by 125%). The type tokens are written in `px` today (`--type-body: 400 16px/24px`), so they move to `rem` (16px = 1rem) in this change; then every type token grows together and nothing else changes at the default size.

The Aa menu shows the same three switches as the settings screen.

### 6. Storage version 2

`SCHEMA_VERSION = 2`. `subSkillStatus` and the `path` value `diagnostic-skipped` are dropped from the model, and attempts require `attempt >= 1`. A version-1 save loads as "reset-corrupt", which already shows the replaced notice.

### 7. Removal order

1. Move `rotateAt` to `src/engine/rotations.ts`, so the tree builder no longer imports `src/practice/`.
2. Build C1 and C9 on the new components.
3. Switch the routes.
4. Delete the old pages and components, then `src/assessment/` (keeping only what the import search shows is still used), then `src/content/questions/`, `src/content/modules/`, `src/content/{diagnostic,readiness,practice,check}.ts`, `src/modules/`, `src/practice/` and `src/navigation/diagnostic.ts`.
5. Delete the tests of the twelve removed capabilities.
6. The reachability script from the previous change must report no dead file in `src/`.

### Decision-log rows (task 8)

| Row | Topic | Decision |
|---|---|---|
| D112 | C1 | C1 is `lessons/c1.json`. No verdict during the five questions; per-skill Secure or Needs review; route at 4 of 5; re-check of the missed skills after the refresher; no skip (ID 7.2). Supersedes D6, D7 and the skip path of D20. |
| D113 | C9 | C9 is `lessons/c9.json`. One try with feedback, misses return once, `readyRule` with the combined questions, LO7 optional, overall title from `rewards.json` (ID 7.2, 10.4). Supersedes D8, D14 and D83 to D91. |
| D114 | Certificate | The name is never stored; printed with the browser's Print; lessons completed include C9. |
| D115 | Settings | Larger text works; the confetti preference is stored (its effect in the rewards change); narration is disabled until built (D26). |
| D116 | Storage | Version 2; a version-1 save is replaced once with the notice; no sub-skill status. |

## Risks / Trade-offs

- **[Removing the old model touches many files]** → Strict order (decision 7), an import search before each deletion, and the reachability check at the end.
- **[Learners lose old progress once]** → Only a prototype pilot uses it, and the existing notice explains it (proposal item 7).
- **[Print styles differ across browsers]** → The certificate is plain text in a bordered card, with no images. The print stylesheet only hides other regions.
- **[A larger root font could break layouts at 360 px]** → The UI test at 360 px runs with larger text on.

## Migration Plan

A version-1 learner save is replaced on first load with the notice. There is no other migration. Rollback is reverting the change, done by the user.
