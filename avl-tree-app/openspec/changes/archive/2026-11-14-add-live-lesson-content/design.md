# Design

## Context

See proposal.md for why. The state this design starts from:

- Lessons C2 to C8 are TypeScript step records (`src/content/modules/c2.ts` to `c8.ts`) played by `ModulePlayer` across three activity routes (explore, example, check). Their text is built from engine "facts", so no number is typed; their practice trees are seeded.
- The final content is JSON in `src/live_content/` (16 files listed by `manifest.json`). Lesson screens carry authored text and fixed trees as insertion sequences, plus typed answers (`expected`, animation `steps` and `result`) that the ID says the engine works out (ID 12.2).
- `src/engine/conventions.ts` hard-codes balance factor = left − right. The JSON, the ID and every typed answer use right − left. I recomputed all 13 stored balance-factor and violation answers with an independent AVL: all match right − left.
- `Key` is `number`; C2 and C5 use capital letters.
- The engine traces search and AVL insert. It has `avlDelete` and rotations but no trace for a leaf delete or for a given list of rotations.
- The old C1 diagnostic, C9 readiness and check bank still run on the old question model and import parts of `src/content/` and `src/modules/`. They are not touched here.

## Goals / Non-Goals

**Goals:**
- Every C2 to C8 screen comes from the JSON through one loader, in one frame, drawn by one component per screen type.
- Every number a student sees is the engine's. The JSON's typed values are checked against it at load.
- The conventions are read from `conventions.json`, so the ID's wording and the engine cannot disagree.

**Non-Goals:**
- Marking anything. Interactive screens are placeholders (proposal item 9).
- Changing C1 or C9, stored learner data, or the old question model.
- Editing any file in `src/live_content/` or the .docx files.

## Decisions

### 1. Loader at `src/live/`, imported at build time
`src/live/` holds `types.ts` (the JSON shapes as TypeScript types, one per file kind and screen type), `load.ts` and `validate.ts`. `load.ts` reads the JSON with `import.meta.glob('../live_content/**/*.json', { eager: true })` and orders it by `manifest.files`. A missing file is one the manifest lists but the glob lacks; an unlisted file is the reverse. It exports `loadContent(): { content: Content } | { problems: Problem[] }`, memoised.

- *Why at build time:* ID 12 says "the app imports the files at build time". The glob keeps the manifest the single list and needs no fetch, so NFR-05 (no network) holds.
- *Why not `src/engine/`:* the engine is pure tree logic with no content. The loader depends on the engine for cross-checks, not the other way round.
- *Why not `src/content/`:* that folder is the content-author's (CLAUDE.md roles) and will be emptied of mock content.
- *Why not extend `src/assessment/validate.ts`:* it validates the old TypeScript bank, which the old C1, C9 and checks still use. JSON validation is its own module; the old validator retires with the old bank in the questions change.

`tsconfig.app.json` gains `resolveJsonModule`.

### 2. Validation is pure and total
`validate(raw): Problem[]` never throws, and every rule in the `live-content` spec is one checker function. A `Problem` is `{ file, id?, field?, message }`; messages are plain sentences from the lesson UI copy file. Validation runs on every load (it is fast: about 360 KB). A test runs it over the shipped content so `npm test` fails on a content error.

The allowed field set per screen type is the union of fields in the shipped JSON. An unknown field is an error, which keeps the "no field dropped" rule honest.

The objective table (LO1 to LO7, lesson, criteria count, Bloom levels; ID 5.1, 5.2, 7.1) lives in `src/live/outcomes.ts`. It is the one place the ID's numbers are typed in code, because no JSON file holds them (Phase A gap). It is replaced if an `outcomes.json` is added later.

### 3. Engine cross-checks with a caption builder
`src/live/crossCheck.ts` builds each item's tree (`insert` with `rebalance`, default true) and runs its operation through the engine:

- `enter-values`: heights and balance factors.
- `click-node`: all violations, first unbalanced node, parent of the new key.
- `animation` and `compareWith`: the operation's captions and the result shape.
- `predict` with `answerFrom: engine`: the answer.

Each stored value is compared with the engine's. Question types not used by content screens (trace, build-tree, perform-rotation, case-id) are cross-checked in the questions change.

The caption builder (`src/engine/captions.ts`) is engine-side. It walks a trace and emits caption steps from `conventions.captions`:

- compare plus descend → `search.compareLess` or `search.compareGreater`
- compare plus found → `search.found`
- descend to an empty branch at the end of a search → `search.notFound`
- the insert step → `insert.root` or `insert.place`
- each height update up to n, or to the root when nothing is unbalanced → `update`
- imbalance → `imbalance.insert` or `imbalance.delete`
- each rotation → `rotate`
- after a rebalance, or at the end of a delete → `done`

Each caption step records the index of the last trace step it covers, so a lesson replay can show position p as `treeAt(trace, lastIndex(p))`.

- *Why equality with the JSON, not "show the JSON text":* the ID says answers are never typed by hand. Requiring equality proves the typed captions are the engine's, so the screen can show either; it shows the engine's.
- *Alternative rejected:* show the JSON `steps` and only use the engine for the trees. That would let a typo or a sign slip reach students unseen, which is exactly what the cross-check exists to catch.

If a shipped caption differs only in formatting the builder does not produce, that is reported to the user as a content problem. It is never fixed by editing JSON.

### 4. Conventions module reads `conventions.json`
`src/engine/conventions.ts` imports `conventions.json` directly. It is the only engine file to import content, by the D2 single-source rule, and `live-content` allows it. It derives:

- `BALANCE_FACTOR_ORDER` from `balanceFactor` (only `height(right) - height(left)` and `height(left) - height(right)` are accepted)
- `balanceFactor`, `leanOf`, `BALANCE_RANGE` from `validBalanceFactors`
- `EMPTY_HEIGHT` and `LEAF_HEIGHT`, checked to differ by 1
- case labels from `labels.caseName`

The internal case codes stay LL, LR, RL, RR, so `caseFor` is unchanged in meaning. `conventionsWording.ts` (used by the old bank) keeps working, because it is built from these exports. Its formula text flips with them, which is correct.

### 5. Letter keys are encoded at the content boundary
The engine keeps `Key = number`. `src/live/keys.ts` turns a tree whose keys are all capital letters into char codes (A = 65 … Z = 90), which preserves alphabetical order, and gives that tree a `formatKey` that turns codes back into letters. `TreeView`, the caption builder, the in-order strip and the shape notation take an optional `formatKey` (default `String`). Integer trees are untouched.

- *Why:* widening `Key` to `number | string` broke 132 type sites, nearly all in the old question model and practice generators that the questions change removes (found during apply, 14 Nov). Encoding keeps the engine and those modules unchanged and isolates letters in one module.
- *Alternative rejected:* `Key = number | string` everywhere; see above.

### 6. New traces reuse `TraceStep`
- **Rotation sequence trace:** one `rotation` step per listed rotation, with `nodes: [about, child]`, built with `rotateLeft` or `rotateRight` at `replaceAt`.
- **Leaf deletion trace:**
  - a `delete` step
  - `update-height` steps from the parent up to the root, stopping at the first ±2
  - an `imbalance` step
  - one or two `rotation` steps from `conventions.deletionRotation`

  `replay()` gains `delete` support: the `delete` kind was declared for this.
- **Insert sequence trace:** the existing `avlInsertTrace` per key, concatenated with indexes renumbered.

No existing step kind changes, so the sandbox replay is untouched apart from the sign.

### 7. One lesson player, screens in JSON order
`src/ui/lesson/LessonPlayer.tsx` takes a lesson and keeps the screen index in state, as D35 does today; leaving starts again.

`LessonFrame.tsx` renders the fixed regions:

- top: the title as h1; "Lesson n of 9"; "Screen n of m"; the phase word from `merrillPhase`
- the screen title as h2
- main
- caption
- supporting
- `ControlStrip`, the existing component, extended with Replay step and Skip ahead

`blocks/` has one component per screen type, chosen by a single `switch` on `screen.type`, so a new type is a type error until it has a component. Interactive types go to `PendingInteraction.tsx` until the questions change.

The phase words live in `src/content/lesson.ts` (UI copy), mapped from Merrill phases:

| Merrill phase | Word shown |
|---|---|
| problem | Problem |
| activation | Recall |
| demonstration | Learn |
| application | Practise |
| integration | Check and summary |

- *Why not five fixed blocks on one long page:* ID 8.2 asks for one concept per screen, and C6 interleaves examples and practice on purpose. The user's layout (title, objectives, content, questions, summary and recap) is kept by the JSON order itself plus the recap on the summary screen.

### 8. Routing
`/module/:id` renders `LessonPlayer` for C2 to C8 (`isLesson(id)` in `routes.ts`) and the existing module screen for C1 and C9. `ACTIVITIES_BY_MODULE` keeps only C1 and C9. `ActivityRoute` redirects `explore`, `example` and `check` of C2 to C8 to `/module/:id`.

`MODULE_TITLES` is replaced by `lessonTitle(id)` from the loader, so the hub, the resume card and the breadcrumbs follow the lesson files. D1's "titles" now means "lesson-file titles" (D92).

### 9. Tree view
`TreeView` gains `show?: ShowItem[]` (`height`, `balanceFactor`, `balanceFactor:root`). Roles become `new`, `rotating` and `n`; the balanced and unbalanced fill comes from the balance factor.

Four new tokens in `tokens.css` hold the ID 11.1 hexes, with their text colours:

| Token | Fill | Text |
|---|---|---|
| `--node-balanced` | #0072B2 | white |
| `--node-unbalanced` | #E69F00 | near-black |
| `--node-rotating` | #F0E442 | near-black |
| `--node-new` | #56B4E9 | near-black |

They are the same in both themes, because each fill carries its own text colour. The existing contrast test covers the four pairs.

The replay's `rolesAt` maps the trace to the new roles. `hideBalance` for practice stays.

### 10. Removal, with an import check
These go, because only the lesson framework uses them:

- `src/content/modules/c2.ts` to `c8.ts` and `player.ts`
- `src/modules/schema.ts`, `facts.ts`, `render.ts`, `registry.ts`
- `src/ui/module/ModulePlayer.tsx` and `src/ui/module/practice/*`
- the C2 to C8 module tests

Task 9 confirms each with an import search before deleting. The following stay until the questions change, because the old check bank, C1, C9 or the sandbox still import them:

- `src/modules/validate.ts`, which the old bank validator imports
- `compare.ts`, `generators.ts`, `practice.ts` and the other practice generators that `assessment/kinds/*` imports
- `src/content/modules/structures.ts`, `conventionsWording.ts`, `practice.ts`, `compare.ts`
- `src/ui/module/check/*`, `RouteChoice.tsx`, `src/ui/practice/*`

### Decision-log rows this change adds (task 9)

| Row | Topic | Decision |
|---|---|---|
| D92 | Source of truth | The two .docx files in `src/live_content/` are final (user, 13 Nov) and rank above every row below them where they conflict. `ID-content.pdf` is superseded. D1's module titles are the lesson files' titles. |
| D93 | Sign | Balance factor = h(right) − h(left) (ID 7.3). Supersedes D2's sign and retires D19's rule against content stating the formula. `conventions.json` is the single source. |
| D94 | Content import | One loader, build-time glob, manifest order; validation on load; one error screen. |
| D95 | Typed answers | Typed values in the JSON are cross-checks against the engine; a mismatch is a content error and is reported, never edited. |
| D96 | Lesson layout | One player, one frame, JSON screen order, phase word from the Merrill phase, objectives recap on the summary. Supersedes D10, D22, D23 (in part) and D34 for C2 to C8. |
| D97 | Node look | ID 11.1 node states and backups. No arrow along the move (D32 snapshots). Supersedes D25 for tree nodes only; other UI tokens are unchanged. |
| D98 | Show default | With no `show`, nodes show their balance factor (ID 8.3). |
| D99 | Keys | Integers or capital letters, never mixed; letters are encoded as char codes at the content boundary and shown as letters. |
| D100 | Pseudocode | Search listings from `conventions.json`; no insert listing (ID 7.4). Supersedes D12's generic text and D30. |
| D101 | C7 | Leaf deletion only (ID 7.2). Supersedes D61 to D64. |
| D102 | Transitional placeholders | Interactive screens are placeholders until `add-live-lesson-questions`; archive this change with or after it. |

`openspec/config.yaml` `context` and `.claude/CLAUDE.md` "Sources of truth" and "Conventions" are updated to match D92 and D93.

## Risks / Trade-offs

- **[A shipped caption or result differs from the engine]** The lesson is blocked by a content error. → The cross-check test runs first (task 1) to surface any mismatch early. Each mismatch is reported to the user with both values. The JSON is never changed, and a mismatch caused by our builder is a code fix.
- **[The sign flip breaks many existing tests]** → Task 1 has the test-writer update every sign-dependent expectation to the ID convention before any code changes, so the red-to-green signal stays clean. The C2 to C8 module tests retire with their specs.
- **[Letter keys are encoded]** A letter tree's keys are numbers inside the engine. → Every display path takes the tree's `formatKey`; a test renders the C2 and C5 letter trees and their captions and checks the letters.
- **[Between this change and the questions change, C2 to C8 cannot be completed]** → Proposal item 9. Apply both before the user archives either. The old check bank and its routes still work for C1 and C9.
- **[The four node fills are fixed across themes]** On the dark surface, the outline and tag text must still meet contrast. → The contrast test checks the tag text against `--bg-surface` in both themes, and a tag uses `--text` when needed.
- **[Old stored attempts reference old check items]** They stay stored but no longer show in C2 to C8. → No storage change here. The C1/C9 change bumps the storage version (Phase A item H).

## Migration Plan

There is no data migration in this change. Rollback is reverting the change's commits, made manually by the user; JSON and .docx files are never touched.

## Open Questions

None that change the specs or tasks. If the cross-check finds content mismatches during apply, they are listed for the user; they do not change the approach.
