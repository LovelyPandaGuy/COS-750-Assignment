# AVL Primer (COS 750 prototype)

A web app that teaches second-year CS students AVL trees before the lecture, with no assumed knowledge, embedded checks and scaffolding that responds to the checks. React, TypeScript and Vite. No backend.

## Sources of truth, in this order

1. `docs/decisions.md` (D1 to D16). If it conflicts with anything else, it wins.
2. `docs/source/ID-content.pdf`: the instructional design content (modules C1 to C9, LO1 to LO9). Instructional content comes from here and nowhere else.
3. The SE document (Google Doc, v1.1): requirement IDs (FR-xxx-nn, NFR-nn) and acceptance criteria.
4. The design: `docs/design/INDEX.md` (start here), the source files in `docs/design/source/`, the per-screen specs in `docs/design/screens/`, and the tokens in `src/ui/tokens.css`. Layout, tokens and components come from these only; do not invent styles. Refresh with `/design-import <link>`.

If two sources disagree and `docs/decisions.md` does not settle it, write `[OPEN]` with the question and stop that piece of work. Never guess.

## Conventions (decision D2)

Height is counted in edges: a leaf is 0 and an empty tree is -1. Balance factor is height(left) minus height(right). These live in one module, `src/engine/conventions.ts`. Nothing else hard-codes them.

## Workflow: OpenSpec, one change at a time

Commands (OpenSpec 1.16): `/opsx:propose`, `/opsx:apply`, `/opsx:archive`, `/opsx:explore`; CLI `openspec list`, `openspec show <name>`, `openspec validate --all`.

Every change follows this loop. Do not skip steps and do not merge two changes.

1. **Propose.** The `spec-writer` subagent drafts the change under `openspec/changes/<name>/` from the decision log, the ID content and the SE requirement IDs. Open questions are listed first. If any remain, stop.
2. **Human skim.** The user reads the proposal. Anything marked `[OPEN]` goes back to `docs/decisions.md`.
3. **Red tests.** The `test-writer` subagent turns every scenario into a failing test. Commit the red tests.
4. **Build.** `/opsx:apply`, using the `implementer` subagent (code) and the `content-author` subagent (`src/content/` only) until the tests pass.
5. **Review.** The `reviewer` subagent (fresh context) checks the diff against the spec, the LO and the conventions module. The `a11y-checker` subagent also runs on every UI change.
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

## Guardrails

- Every answer shown to a student is computed by the engine. No answer is typed into content.
- Content goes beyond the ID only when flagged for the user to read. Nothing is invented.
- The app makes no network calls after the first page load and stores nothing outside the storage adapter. localStorage holds progress and settings; the event log is SQLite (sqlite-wasm in the browser), with a JSON fallback (D16).
- Wrong answers never use red or "fail" wording. Colour is never the only signal. Touch targets are at least 44 px. Tree editing must work by touch, pointer and keyboard (D3).
- Search and deletion are in scope (D4). LO8 is shown on the readiness summary but never blocks Ready.
- Retries are new problems: generated items get a new seeded variant, multiple choice reshuffles, cap of 3 per question (D9).
- Never push, merge or archive. Ask first.

## Commands

- `npm test` (Vitest, includes fast-check property tests)
- `npm run typecheck`, `npm run lint`, `npm run build`
- `openspec validate --all`

## Definition of done for a change

- Every scenario has a passing test named after the FR or LO it serves.
- Tests, type check and lint pass; no new `[OPEN]` markers.
- UI changes: axe clean, keyboard-only run works, greyscale check passes.
- Reviewer report is a pass or its findings are resolved.
- The change is archived and `docs/decisions.md` is updated if the change settled a decision.
- The commit names the change and the FR or LO.
