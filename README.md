# AVL for D.U.M.M.I.E.S
## Developing Understanding through Mastery, Mistakes, Interaction, Exploration and Success

AVL for D.U.M.M.I.E.S is a web app that second-year COS212 students use on their own **before the AVL tree lecture**. It teaches AVL trees and the search algorithm from scratch. Checks are built into the lessons, and the support that a student receives depends on how they do on those checks. The app was built as a prototype for COS 750.

The app is static. It uses React, TypeScript and Vite, and it has **no backend**. It makes no network calls after the page loads, and a learner's progress stays in their own browser.

## What the app does

The content follows the instructional design (ID) document. There are nine short lessons that take about an hour in total, and a student can stop and resume at any point.

| Lesson | Topic | Objective |
| --- | --- | --- |
| C1 | Getting started and readiness check | Prerequisites |
| C2 | When BSTs go lopsided | LO1 |
| C3 | The AVL property | LO2 |
| C4 | Search (the algorithm) | LO3 |
| C5 | Rotations | LO4 |
| C6 | Insertion with rebalancing | LO5 |
| C7 | Deletion with rebalancing (optional, leaf deletion only) | LO7 |
| C8 | Choosing a structure | LO6 |
| C9 | Am I ready for the lecture? | All objectives |

### Features

- **Readiness check and refresher (C1).** The readiness check has five prerequisite questions. A student who gets fewer than 4 right is sent to a short BST refresher, which ends by re-checking only the skills that they missed.
- **Lesson player (C2 to C8).** Each lesson plays its screens one at a time. Every screen shows a tree, a caption, supporting text and a control bar, and each of these is always in the same place.
- **Embedded checks.** The student can re-attempt each check question once, and the question counts as right if either attempt is right. The student must choose Sure or Not sure before answering, and each question has one static hint. Practice questions allow unlimited tries.
- **Engine-marked answers.** The AVL engine works out every answer, caption and step count that the student sees. Answers typed into the content files are only cross-checked against the engine when the content loads.
- **Calm feedback.** The verdicts are "That's right.", "Not quite." and "Almost there.", and each one is shown as a word together with an icon. Feedback never uses red, a cross or the word "wrong".
- **Tree editor.** Students place keys and rotate nodes by touch, with a pointer or with the keyboard. The editor has undo and keeps a log of edits. An in-order strip shows that a rotation keeps the keys in order.
- **Sandbox.** Students can insert or delete up to 15 keys, with values from 1 to 99. They can turn rebalancing on or off to compare an AVL tree with a plain BST on the same keys. The sandbox also offers an "Insert 1 to 7 in order" option, a random key, a "What happened" explanation, search step counts and a replay of the last insertion.
- **Search pseudocode panel.** The panel shows the two search listings from the ID document, the loop version and the recursive version, and it highlights the current line.
- **Readiness report and certificate (C9).** Each question has one try, and a missed question comes back once. The report shows Ready or Revise for each objective and flags answers that were wrong although the student chose Sure. It also builds a list of questions to bring to the lecture, including one question that the student writes. The student prints the certificate with the browser's Print command.
- **Navigation.** The app suggests a guided path by default, but no lesson is locked, and the student can always go back.
- **Accessibility.** The app has light and dark themes, a larger-text setting, touch targets of at least 44 px and full keyboard support. Colour is never the only signal, the tree node states use the Okabe–Ito palette, and the app respects the reduced-motion setting.

## Tech stack

These versions come from `package.json`.

- React 19, React Router 7, TypeScript 5.6 and Vite 8
- Vitest 5 with jsdom, Testing Library, fast-check (for property tests) and vitest-axe (for accessibility checks)
- Playwright for the visual screenshot tests
- ESLint and Stylelint, including a rule that allows only design tokens in CSS
- Node `>=26.13.1`, pinned in `.nvmrc`

## Install and run

Run these commands from the `avl-tree-app/` folder, which holds the app inside the repository.

```bash
npm install      # install the dependencies
npm run dev      # start the dev server (Vite prints the local URL)
npm run build    # type-check and build the static site into dist/
npm run preview  # serve the built dist/ locally
```

## Tests and checks

```bash
npm test             # run the Vitest unit, property, UI and axe tests, and validate the lesson content
npm run typecheck    # type-check with TypeScript without writing output files
npm run lint         # run ESLint, and then Stylelint with the tokens-only rule on src/**/*.css
npm run test:visual  # take Playwright screenshots at 390, 768 and 1366 px (this runs separately from npm test)
```

`npm run test:visual` starts its own Vite server and compares the screenshots with the baselines committed in `tests/visual/__screenshots__/`. Playwright's browsers must be installed first. The known limitations below explain why these tests report differences on systems other than macOS.

## Project map

```
avl-tree-app/
├── src/
│   ├── live_content/   The final ID documents (.docx), and all the lesson, question, convention,
│   │                   misconception, scaffold and reward content as JSON
│   ├── live/           Loads, validates and cross-checks that JSON, and marks answers.
│   │                   No other module reads the JSON.
│   ├── engine/         The AVL and BST engine, which handles insertion, deletion, search,
│   │                   rotations, traces and conventions
│   ├── pages/          The Start, Hub (path), Module (lesson), Refresher, Sandbox and Readiness pages
│   ├── ui/             Components and styles. tokens.css holds the design tokens.
│   ├── content/        Interface wording, such as labels and buttons, but not teaching content
│   ├── state/          Learner state and the localStorage adapter
│   ├── navigation/     The entry policy for lessons, which guides students but never locks a lesson
│   ├── sandbox/        Sandbox logic and limits
│   ├── replay/         Step-through replay of insertions
│   └── gallery/        A development-only component gallery that the visual tests use
├── tests/              Vitest tests for the engine, live content, state and UI, and the
│                       Playwright tests in tests/visual
├── docs/               Markdown copies of the two ID documents
├── openspec/           The current specifications in specs/, and changes in changes/
│                       (in flight, and archived in archive/)
├── tools/              A local Stylelint rule
└── .claude/            Project instructions and documents for Claude Code
                        (see "How this was built" below)
```

## Design documents

| Document | Location |
| --- | --- |
| ID document (final) | `src/live_content/AVL_Tree_App_ID_Document.docx`, with a Markdown copy in `docs/AVL_Tree_App_ID_Document.md` |
| Learning objectives (final) | `src/live_content/AVL Trees Learning Objectives.docx`, with a Markdown copy in `docs/AVL_Trees_Learning_Objectives.md` |
| SE document v1.1 (with the FR and NFR IDs) | `.claude/docs/source/SE_Document.pdf` |
| Earlier ID content (replaced by the two documents above) | `.claude/docs/source/ID-content.pdf` |
| Team presentation design draft (for guidance only) | `.claude/docs/source/ID_Presentation.pdf` |
| Decision log | `.claude/docs/decisions.md` |
| Development plan, design index and UI quality bar | `.claude/docs/design/` |

## How this was built

The design came from the team. The team wrote the instructional design,
which sets out what to teach, in what order, how to assess it and how to
support students, and it is documented in the ID document. The SE team set
the software requirements and the architecture, and every decision that is
not obvious is recorded in `.claude/docs/decisions.md`.

The team followed these key practices.

- Teaching content is kept apart from the code, and only one module
  (`src/live/`) reads it.
- Every decision is logged in `.claude/docs/decisions.md`, with its status
  (settled, assumed or open).
- Every change to the interface is checked against a ten-point quality bar
  that covers accessibility, three screen widths and calm wording
  (`.claude/docs/design/quality-bar.md`).

We used Claude Code, an AI coding assistant, to help implement the app
within a structured process called OpenSpec. For each change, the team
reviewed a written specification before any code was produced. The tests
were written first. The result was then checked against the quality bar, and
a developer other than the author reviewed and merged the change. The AI
agents were restricted in what they could edit, and they never pushed,
merged or archived changes. The rules are in `.claude/CLAUDE.md`.

Generative AI was used for code, content and interface work. The tools and
prompts are acknowledged in the project documents.

## Known limitations

- **Progress is stored in the browser only.** It does not move between
  devices or browsers, and there are no accounts and no backend.
- **Narration (text-to-speech) is not built yet.** The setting is visible,
  but it is disabled.
- **Deletion is limited.** Only leaf deletion is covered, in the optional
  lesson C7.
- **The visual regression tests work only on macOS.** The reference
  screenshots were made on macOS, so `npm run test:visual` reports
  differences on other systems.
- **Some design questions are still open.** Where the design files and the
  instructional design gave no answer, the team chose a default and recorded
  it in `.claude/docs/decisions.md`.