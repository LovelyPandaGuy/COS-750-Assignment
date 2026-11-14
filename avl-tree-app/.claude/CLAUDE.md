# AVL Primer (COS 750 prototype)

A web app that teaches second-year CS students AVL trees before the lecture, with no assumed knowledge, embedded checks and scaffolding that responds to the checks. React, TypeScript and Vite. No backend.

## Goal of this phase

Build a sound foundation of the prototype and its features now. Some requirements and rules are not known yet (the lecturer's conventions, team votes on the presentation draft). Do not wait for them: assume a sensible default, record it, and keep it in one place so a later answer changes one place (D18).

## Where things live

All project docs are under `.claude/docs/` (paths below are relative to it).

- `decisions.md`: the decision log (D1 to D28), lecturer questions, questions for the draft's author.
- `source/ID-content.pdf`: the earlier instructional design content (LO1 to LO9). **Superseded** by the two ID documents in `src/live_content/` (D92).
- `source/SE_Document.pdf`: SE document v1.1 (FR-xxx-nn, NFR-nn).
- `source/ID_Presentation.pdf`: the team's presentation design decisions draft (advisory, see below).
- `design/development_plan_(v1.1).md`: phases, gates and the numbered changes 1 to 27.
- `design/INDEX.md`: the design index (start here for UI), `design/source/`: design system and wireframes.
- `next-steps.md`: what to build next.
- Tokens: `src/ui/tokens.css` (in the app, not under `.claude/docs/`).

## Sources of truth, in this order

0. The two ID documents in `src/live_content/` (`AVL_Tree_App_ID_Document.docx`, `AVL Trees Learning Objectives.docx`; Markdown copies in `docs/`). They are final: where anything disagrees with them, the app changes (D92).
1. `decisions.md`. If it conflicts with anything below it, it wins.
2. The JSON content in `src/live_content/` (lessons, questions, conventions, misconceptions, scaffolds, rewards), read only through `src/live/`. Instructional content comes from here and nowhere else; it is never edited by the app or an agent.
3. The SE document: requirement IDs and acceptance criteria.
4. The design: `design/INDEX.md`, `design/source/`, per-screen specs in `design/screens/` once imported, and `src/ui/tokens.css`. Layout, tokens and components come from these only; do not invent styles. Refresh with `/design-import <link>`.
5. `source/ID_Presentation.pdf` (advisory). Its "AGREED" items are one author's proposals. A point from it counts only once a row in `decisions.md` adopts it (D19 to D28 record what was adopted).

## When sources are silent or disagree (D18)

- If `decisions.md` settles it, follow it.
- Otherwise assume a default and keep going. Pick the option that is cheapest to change later, put it in one constant, one config entry or one content record, add an **assumed** row to `decisions.md`, and list it in the proposal under "Assumed, not blocking".
- Write `[OPEN]` and stop only when the assumption cannot be isolated in one place, or when it would put unverified instructional content in front of a student. Never invent teaching content; mechanics and wording defaults may be assumed.

## Conventions (D2, D93)

Height is counted in edges: a leaf is 0 and an empty tree is -1. Balance factor is height(right) minus height(left) (ID 7.3; negative means the left branch is taller). Case names are "Case 1 (LL)" to "Case 4 (RR)". All of these, with the labels, captions and pseudocode, come from `src/live_content/conventions.json`, read by `src/engine/conventions.ts`. Nothing else hard-codes them. Every answer, caption and result typed in the JSON is cross-checked against the engine on load (D95).

## Workflow: OpenSpec, one change at a time

Commands (OpenSpec 1.16): `/opsx:propose`, `/opsx:apply`, `/opsx:archive`, `/opsx:explore`; CLI `openspec list`, `openspec show <name>`, `openspec validate --all`.

Every change follows this loop. Do not skip steps and do not merge two changes.

1. **Propose.** The `spec-writer` subagent drafts the change under `openspec/changes/<name>/` from the decision log, the ID content and the SE requirement IDs. Open questions are listed first. If any remain, stop.
2. **Human skim.** The user reads the proposal. Anything marked `[OPEN]` goes back to `.claude/docs/decisions.md`.
3. **Red tests.** The `test-writer` subagent turns every scenario into a failing test. Commit the red tests.
4. **Build.** `/opsx:apply`, using the `implementer` subagent (code) and the `content-author` subagent (`src/content/` only) until the tests pass.
5. **Polish (UI changes only).** The `ui-polisher` subagent refines the look inside the design system, using the `frontend-design` skill, until `.claude/docs/design/quality-bar.md` passes. It edits styling only.
6. **Review.** The `reviewer` subagent (fresh context) checks the diff against the spec, the LO, the conventions module and the quality bar. The `a11y-checker` subagent also runs on every UI change.
7. **Merge and archive.** A human merges (with two developers, the one who did not write the change) and runs `/opsx:archive`, one at a time on main. Agents never do this.

One change in flight per capability. A change with more than about ten tasks gets split.

## Who may write where

| Agent | May write | Must not touch |
| --- | --- | --- |
| spec-writer | `openspec/changes/` | code, tests, content |
| test-writer | `tests/`, `*.test.ts(x)` | `src/` non-test files |
| implementer | `src/` except `src/content/` | tests, content, `openspec/` |
| content-author | `src/content/` | everything else |
| ui-polisher | CSS and layout markup in `src/ui/` | tokens, logic, tests, content, `openspec/` |
| reviewer | nothing (read-only) | everything |
| a11y-checker | nothing (read-only) | everything |

If a test looks wrong, the implementer reports it; it does not edit the test.

## Guardrails

- Every answer shown to a student is computed by the engine. No answer is typed into content.
- Content goes beyond the ID only when flagged for the user to read. Nothing is invented.
- The app makes no network calls after the first page load and stores nothing outside the storage adapter. localStorage holds progress and settings; the event log is SQLite (sqlite-wasm in the browser), with a JSON fallback (D16).
- Wrong answers never use red, a cross glyph or "fail"/"wrong" wording; the verdicts come from `conventions.json` ("That's right.", "Not quite.", "Almost there."; ID 10.1, superseding D27's wording once the questions change lands). Colour is never the only signal. Touch targets are at least 44 px. Tree editing works by touch, pointer and keyboard (D3).
- Search and deletion are in scope (D4). The objectives are LO1 to LO7 (ID 5.1); LO7 (leaf deletion, C7) is shown on the C9 report but never blocks Ready.
- Navigation: guided path by default, nothing hard-locked, back always free, skip only on content and worked-example steps, never on a check (D20).
- Lesson checks (C2 to C8): one question per criterion from `questions/checks.json`, two attempts each, right if either is right, Sure or Not sure required, one static hint (ID 9.1, 9.2, 9.4; D106, D107, D109). Practice: unlimited tries and the same static hint (ID 10.2). Every answer is marked by the engine (`src/live/mark.ts`). C1 (readiness questions, route, refresher re-check) and C9 (readiness questions with returns, report, certificate) run on the same JSON questions (D112, D113). There is no question or lesson content in `src/` outside `src/live_content/`.
- Never push, merge or archive. Ask first.

## Commands

- `npm test` (Vitest, includes fast-check property tests)
- `npm run typecheck`, `npm run lint` (ESLint and the CSS token rule), `npm run build`
- `openspec validate --all`

## Definition of done for a change

- Every scenario has a passing test named after the FR or LO it serves.
- Tests, type check and lint pass; no new `[OPEN]` markers.
- UI changes: every line of `.claude/docs/design/quality-bar.md` passes (axe clean, keyboard-only run works, greyscale and colour-vision checks, three widths, tokens only).
- Reviewer report is a pass or its findings are resolved.
- The change is archived and `.claude/docs/decisions.md` is updated if the change settled a decision.
- The commit names the change and the FR or LO.
