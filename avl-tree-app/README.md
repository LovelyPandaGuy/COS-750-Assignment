# AVL Primer

A web app that second-year COS212 students use on their own **before the AVL tree lecture**. It teaches AVL trees and the search algorithm from scratch, with checks built into the lessons and support that responds to how the student does on them. It was built as a prototype for COS 750.

The app is static: React, TypeScript and Vite, with **no backend**. It makes no network calls after the page loads, and a learner's progress stays in their own browser.

## What the app does

The content follows the instructional design (ID) document: nine short lessons, about an hour in total, that can be resumed at any point.

| Lesson | Topic | Objective |
| --- | --- | --- |
| C1 | Getting started and readiness check | prerequisites |
| C2 | When BSTs go lopsided | LO1 |
| C3 | The AVL property | LO2 |
| C4 | Search: the algorithm | LO3 |
| C5 | Rotations | LO4 |
| C6 | Insertion with rebalancing | LO5 |
| C7 | Deletion with rebalancing (optional, leaf deletion only) | LO7 |
| C8 | Choosing a structure | LO6 |
| C9 | Am I ready for the lecture? | all |

Features:

- **Readiness check and refresher (C1).** Five prerequisite questions. A student who gets fewer than 4 right is sent to a short BST refresher, which ends by re-checking only the skills they missed.
- **Lesson player (C2 to C8).** Each lesson plays its screens one at a time: a tree, a caption, supporting text and a control bar in the same place on every screen.
- **Embedded checks.** Each check question allows two attempts and counts as right if either attempt is right. The student must choose Sure or Not sure before answering, and each question has one static hint. Practice questions allow unlimited tries.
- **Engine-marked answers.** Every answer, caption and step count the student sees is worked out by the AVL engine. Answers typed into the content files are only cross-checked against the engine when the content loads.
- **Calm feedback.** The verdicts are "That's right.", "Not quite." and "Almost there.", each shown as a word plus an icon. Feedback never uses red, a cross or "wrong" wording.
- **Tree editor.** Students place keys and rotate nodes by touch, pointer or keyboard. The editor has undo and keeps a log of edits, with an in-order strip that shows a rotation keeps the keys in order.
- **Sandbox.** Insert or delete keys (up to 15 keys, values 1 to 99) and turn rebalancing on or off to compare an AVL tree with a plain BST on the same keys. It also offers "Insert 1 to 7 in order", a random key, a "What happened" explanation, search step counts and a replay of the last insert.
- **Search pseudocode panel.** The ID's two search listings (loop and recursive), with the current line highlighted.
- **Readiness report and certificate (C9).** One try per question, and a missed question comes back once. The report gives Ready or Revise per objective, flags answers that were confident but wrong, and builds a list of questions to bring to the lecture (it includes one question the student writes). The certificate is printed with the browser's Print command.
- **Navigation.** A guided path by default, with nothing hard-locked and going back always allowed.
- **Accessibility.** Light and dark themes, a larger-text setting, touch targets of at least 44 px, full keyboard support, colour never used as the only signal, the Okabe–Ito palette for tree node states, and respect for the reduced-motion setting.

## Tech stack

From `package.json`:

- React 19, React Router 7, TypeScript 5.6, Vite 8
- Vitest 5 with jsdom, Testing Library, fast-check (property tests) and vitest-axe (accessibility checks)
- Playwright for the visual screenshot tests
- ESLint and Stylelint, including a rule that only design tokens may be used in CSS
- Node `>=26.13.1` (pinned in `.nvmrc`)

## Install and run

Run these from the `avl-tree-app/` folder, which is the app's folder inside the repository:

```bash
npm install      # install dependencies
npm run dev      # start the dev server (Vite prints the local URL)
npm run build    # type-check and build the static site into dist/
npm run preview  # serve the built dist/ locally
```

## Tests and checks

```bash
npm test             # Vitest: unit, property, UI and axe tests; also validates the lesson content
npm run typecheck    # TypeScript, no output files
npm run lint         # ESLint, then Stylelint on src/**/*.css (tokens-only rule)
npm run test:visual  # Playwright screenshots at 390, 768 and 1366 px (separate from npm test)
```

`npm run test:visual` starts its own Vite server and compares screenshots against the baselines committed in `tests/visual/__screenshots__/`. Playwright's browsers must be installed first (see the limitations below).

## Project map

```
avl-tree-app/
├── src/
│   ├── live_content/   Final ID documents (.docx) and all lesson, question, convention,
│   │                   misconception, scaffold and reward content as JSON
│   ├── live/           The only reader of that JSON: load, validate, cross-check, mark answers
│   ├── engine/         AVL/BST engine: insert, delete, search, rotations, traces, conventions
│   ├── pages/          Start, Hub (path), Module (lesson), Refresher, Sandbox, Readiness
│   ├── ui/             Components and styles; tokens.css holds the design tokens
│   ├── content/        Interface wording (labels, buttons), not teaching content
│   ├── state/          Learner state and the localStorage adapter
│   ├── navigation/     Entry policy for lessons (guided, never locked)
│   ├── sandbox/        Sandbox logic and limits
│   ├── replay/         Step-through replay of insertions
│   └── gallery/        Development-only component gallery used by the visual tests
├── tests/              Vitest tests (engine, live content, state, UI) and tests/visual (Playwright)
├── docs/               Markdown copies of the two ID documents
├── openspec/           specs/ (current specifications) and changes/ (in flight and archive/)
├── tools/              Local Stylelint rule
└── .claude/            Project instructions and docs for Claude Code (see 'How this was built' below)
```

## Where the design documents are

| Document | Location |
| --- | --- |
| ID document (final) | `src/live_content/AVL_Tree_App_ID_Document.docx`, Markdown copy in `docs/AVL_Tree_App_ID_Document.md` |
| Learning objectives (final) | `src/live_content/AVL Trees Learning Objectives.docx`, Markdown copy in `docs/AVL_Trees_Learning_Objectives.md` |
| SE document v1.1 (FR and NFR IDs) | `.claude/docs/source/SE_Document.pdf` |
| Earlier ID content (superseded by the two documents above) | `.claude/docs/source/ID-content.pdf` |
| Team presentation design draft (advisory) | `.claude/docs/source/ID_Presentation.pdf` |
| Decision log | `.claude/docs/decisions.md` |
| Development plan, design index, UI quality bar | `.claude/docs/design/` |

## How this was built

The design came from the team. The instructional design (what to teach, in
what order, how to assess it and how to scaffold) was written by the team
and is documented in the ID document. The software requirements and
architecture were set by the SE team, and every non-obvious choice is
recorded in `.claude/docs/decisions.md`.

Key practices:

- Teaching content is kept apart from code and read only through one module
  (`src/live/`).
- Every decision is logged in `.claude/docs/decisions.md`, with its status
  (settled, assumed or open).
- Every UI change is checked against a ten-point quality bar covering
  accessibility, three screen widths and calm wording
  (`.claude/docs/design/quality-bar.md`).

We used Claude Code, an AI coding assistant, to help implement the app,
working inside a structured process (OpenSpec). For each change, the team
reviewed a written specification before any code was produced; tests were
written first; the result was checked against the quality bar; and a
developer other than the author reviewed and merged it. The AI agents were
restricted in what they could edit, and they never pushed, merged or
archived changes. The rules are in `.claude/CLAUDE.md`.

Generative AI was used for code, content and interface work. The tools and
prompts are acknowledged in the project documents.


## Known limitations

- **Progress is stored in the browser only.** It does not move between
  devices or browsers, and there are no accounts or backend.
- **Narration (text to speech) is not built.** The setting is visible but
  disabled.
- **Deletion is limited.** Only leaf deletion is covered (the optional
  lesson C7).
- **Visual regression tests are macOS-only.** The reference screenshots were
  made on macOS, so `npm run test:visual` reports differences on other
  systems.
- **Some design questions are still open.** Where the design files and the
  instructional design were silent, the team chose a default and recorded
  it in `.claude/docs/decisions.md`.
