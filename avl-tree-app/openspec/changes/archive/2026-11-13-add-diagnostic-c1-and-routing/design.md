# Design

## Context

C1's three screens (`WarmUpCheck`, `WarmUpResult`, the refresher) are skeletons on fixed routes; `routes.ts` already gives C1 `check` and `refresher`. The assessment layer has the question model, `CHECKS` bank, `instantiate`, `mark`, `subSkillStatus` (mastery) and the scaffold validator; `LearnerState` already has `path` ("guided" or "diagnostic-skipped"). `recommendRoute` and `emitRouteEvent` exist. `ModulePlayer` plays `Step` sequences but titles its h1 from the activity and `validateModule` requires a full module. See proposal.md for motivation.

## Goals / Non-Goals

**Goals:**
- A pure routing function covered for all 32 outcomes (FR-DIA-03).
- Reuse the question model, storage and mastery rule for the diagnostic (D7).
- Reuse the step player and content validator for the refresher.

**Non-Goals:**
- Accessibility settings, readiness, event log (changes 23, 24, 26); any hard lock.

## Decisions

1. **Diagnostic bank apart from CHECKS.** `DIAGNOSTIC` (five items, module C1, outcome `PRE`) sits in `src/content/questions/diagnostic.ts`; `ALL_ITEMS = [...DIAGNOSTIC, ...CHECKS]` is what the validator, mastery and the reducer's item lookup use. `checksFor` stays CHECKS-only so check steps and completion are unchanged. The bank's count rule gets C1: 5.
2. **`PRE` outcome.** `OutcomeTag = LoId | 'PRE'` in `assessment/ids.ts`; `OUTCOMES` gets a `PRE` entry (Bloom levels remember and understand); four prerequisite sub-skills in `SUB_SKILLS` tied to `PRE`.
3. **Kinds.** `tree-terms` (number: leaves of a seeded tree), `is-bst` (yes or no: a seeded tree with or without one ordering violation deeper than a parent-child pair), `insert-parent` (number: key of the node a new key attaches under). Search path reuses `search-visits`, recursive height reuses `node-height` aimed at the root. Six misconceptions (`M-LEAVES-COUNT-ALL`, `M-LEAVES-COUNT-PARENTS`, `M-BST-PARENT-ONLY`, `M-BST-NEEDS-BALANCE`, `M-INSERT-NEAR-VALUE`, `M-INSERT-AT-ROOT`) with catalogue labels, hints and lecture templates, so change 21's validator passes.
4. **Phases from stored attempts.** `diagnosticPhase(attempts, profile)`: no attempts, intro then Q1; some answered, the next unanswered; all five, result. `recheck` when the route was the refresher, C1 is not complete, and any weak sub-skill has no attempt at attempt index 1. Item attempt number = count of that item's stored attempts, so a re-check is attempt 1 (a different variant by the existing rule) and a reload resumes at the right screen. In-progress answers sit in component state until Next stores them.
5. **Routing is pure, in `src/navigation/diagnostic.ts`:** `diagnosticRoute(results: boolean[]): 'c2' | 'refresher'` (≥4 correct → c2) and `skillStatuses(attempts)`: secure when the latest attempt at every item of the skill is right (so a right re-check shows secure), else needs review. The stored mastery status is still updated by the reducer for these items. The re-check outcome never changes the next step (C2).
6. **C1 completion** is a call to `completeModule('C1')` from the screen that finishes the diagnostic with a c2 route, or the re-check. Skip calls `setPath('diagnostic-skipped')`, then navigates to C2 and moves `currentModule` there (new reducer action `path-set` taking the path and, optionally, the current module).
7. **Refresher on the player.** `ModulePlayer` gets an optional `heading` prop; `validateSequence` (in `modules/validate.ts`) checks hook and goals once, at least one recall, plus the existing wording, number, claim and source rules, with no check or summary or activity-completeness rule. The refresher content (`src/content/modules/c1Refresher.ts`) is six steps (hook, goals, recall, content ×3 for terms and ordering, search and insert, height) using engine figures and claims; it plays as the `explore` activity under the heading "BST refresher". Its last step shows the re-check link (diagnostic route) or the C2 link.
8. **Result screen** composes `SkillStatusList` (words plus a symbol) and a links panel with the "Suggested" word, emitting the route events directly; `RouteChoice` is left as it is, because its two targets are fixed to a module's forward and itself.
9. **Wording** for all new screens lives in `src/content/diagnostic.ts`; a test scans it and the refresher for mark, grade, pass, fail, test, score and points.

## Risks / Trade-offs

- **Skip leaves C1 incomplete,** so C2 shows its soft note to skippers. Alternative (complete C1 on skip) would break "only a check completes a module".
- **Three new kinds plus six misconceptions is the bulk of the work;** each needs engine-built answers, wrong options and the scaffold wording, all validated over seeds 0 to 99.
- **`PRE` touches shared types.** It is additive; the validator's LO rule changes in one place.
- **Re-check is derived from stored attempts,** so a student who reloads mid-flow resumes correctly but cannot re-take the first round; that is intended (private practice, no retries).
- **The refresher is new teaching content** with no ID text behind it; every sentence is flagged for G3.
