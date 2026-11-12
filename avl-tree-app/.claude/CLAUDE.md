# AVL Primer (COS 750 prototype)

A web app that teaches second-year CS students AVL trees before the lecture, with no assumed knowledge, embedded checks and scaffolding that responds to the checks. React, TypeScript and Vite. No backend.

## Goal of this phase

Build a sound foundation of the prototype and its features now. Some requirements and rules are not known yet (the lecturer's conventions, team votes on the presentation draft). Do not wait for them: assume a sensible default, record it, and keep it in one place so a later answer changes one place (D18).

## Where things live

All project docs are under `.claude/docs/` (paths below are relative to it).

- `decisions.md`: the decision log (D1 to D28), lecturer questions, questions for the draft's author.
- `source/ID-content.pdf`: instructional design content (C1 to C9, LO1 to LO9).
- `source/SE_Document.pdf`: SE document v1.1 (FR-xxx-nn, NFR-nn).
- `source/ID_Presentation.pdf`: the team's presentation design decisions draft (advisory, see below).
- `design/development_plan_(v1.1).md`: phases, gates and the numbered changes 1 to 27.
- `design/INDEX.md`: the design index (start here for UI), `design/source/`: design system and wireframes.
- `next-steps.md`: what to build next.
- Tokens: `src/ui/tokens.css` (in the app, not under `.claude/docs/`).

## Sources of truth, in this order

1. `decisions.md`. If it conflicts with anything else, it wins.
2. `source/ID-content.pdf`. Instructional content comes from here and nowhere else.
3. The SE document: requirement IDs and acceptance criteria.
4. The design: `design/INDEX.md`, `design/source/`, per-screen specs in `design/screens/` once imported, and `src/ui/tokens.css`. Layout, tokens and components come from these only; do not invent styles. Refresh with `/design-import <link>`.
5. `source/ID_Presentation.pdf` (advisory). Its "AGREED" items are one author's proposals. A point from it counts only once a row in `decisions.md` adopts it (D19 to D28 record what was adopted).

## When sources are silent or disagree (D18)

- If `decisions.md` settles it, follow it.
- Otherwise assume a default and keep going. Pick the option that is cheapest to change later, put it in one constant, one config entry or one content record, add an **assumed** row to `decisions.md`, and list it in the proposal under "Assumed, not blocking".
- Write `[OPEN]` and stop only when the assumption cannot be isolated in one place, or when it would put unverified instructional content in front of a student. Never invent teaching content; mechanics and wording defaults may be assumed.

## Conventions (D2, D19)

Height is counted in edges: a leaf is 0 and an empty tree is -1 (settled: the ID's own numbers depend on it). Balance factor is height(left) minus height(right) (working default; the lecturer has not confirmed the sign). Both live in `src/engine/conventions.ts`, together with the case names. Nothing else hard-codes them.

No content string states the balance-factor formula, which way a positive or negative sign leans, or a case name. Content reads these from the conventions module, so a different answer from the lecturer is a one-module change.

## Workflow: OpenSpec, one change at a time

Commands (OpenSpec 1.16): `/opsx:propose`, `/opsx:apply`, `/opsx:archive`, `/opsx:explore`; CLI `openspec list`, `openspec show <name>`, `openspec validate --all`.

Every change follows this loop. Do not skip steps and do not merge two changes.

1. **Propose.** The `spec-writer` drafts the change under `openspec/changes/<name>/` from the decision log, the ID content and the SE requirement IDs. Assumptions are listed first ("Assumed, not blocking"); only real `[OPEN]` items (D18) stop the change.
2. **Human skim.** The user reads the proposal. Anything marked `[OPEN]` goes back to `decisions.md`.
3. **Red tests.** The `test-writer` turns every scenario into a failing test. Commit the red tests.
4. **Build.** `/opsx:apply`, using the `implementer` (code) and the `content-author` (`src/content/` only) until the tests pass.
5. **Review.** The `reviewer` (fresh context) checks the diff against the spec, the LO and the conventions module. The `a11y-checker` also runs on every UI change.
6. **Merge and archive.** The user merges and runs `/opsx:archive`. Agents never do this.

One change in flight per capability. A change with more than about ten tasks gets split.

## Who may write where

| Agent | May write | Must not touch |
| --- | --- | --- |
| spec-writer | `openspec/changes/` | code, tests, content |
| test-writer | `tests/`, `*.test.ts(x)` | `src/` non-test files |
| implementer | `src/` except `src/content/` | tests, content, `openspec/` |
| content-author | `src/content/` | everything else |
| reviewer | nothing (read-only) | everything |
| a11y-checker | nothing (read-only) | everything |

If a test looks wrong, the implementer reports it; it does not edit the test.

Note: `.claude/agents/` does not exist in this repo yet, so these six subagents are not defined. Until they are, the main session plays each role and keeps to the same write limits.

## Guardrails

- Every answer shown to a student is computed by the engine. No answer is typed into content.
- Content goes beyond the ID only when flagged for the user to read. Nothing is invented.
- The app makes no network calls after the first page load and stores nothing outside the storage adapter. localStorage holds progress and settings; the event log is SQLite (sqlite-wasm in the browser), with a JSON fallback (D16).
- Wrong answers never use red, a cross glyph or "fail"/"wrong" wording; the verdict is "Not quite yet" (D27). Colour is never the only signal. Touch targets are at least 44 px. Tree editing works by touch, pointer and keyboard (D3).
- Search and deletion are in scope (D4). LO8 is shown on the readiness summary but never blocks Ready.
- Navigation: guided path by default, nothing hard-locked, back always free, skip only on content and worked-example steps, never on a check (D20).
- Checks: retries are new problems (new seeded variant, multiple choice reshuffles), cap of 3 per question, scaffold ladder hint, worked example, guided (D9). Practice: unlimited retries, 2 hints, then offer review (D21). The numbers are constants in one config.
- Never push, merge or archive. Ask first.

## Commands

- `npm test` (Vitest, includes fast-check property tests)
- `npm run typecheck`, `npm run lint`, `npm run build`
- `openspec validate --all`

## Definition of done for a change

- Every scenario has a passing test named after the FR or LO it serves.
- Tests, type check and lint pass; no new `[OPEN]` markers.
- Every assumption the change made has a row in `decisions.md`.
- UI changes: axe clean, keyboard-only run works, greyscale check passes, colour-vision emulation check passes (D25).
- Reviewer report is a pass or its findings are resolved.
- The change is archived and `decisions.md` is updated if the change settled a decision.
- The commit names the change and the FR or LO.
