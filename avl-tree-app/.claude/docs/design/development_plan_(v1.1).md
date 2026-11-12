# AVL Primer: agentic development plan (v1.1)

Nov 8, 2026 · @Lebogang

Version 1.1 is the first build that covers the full ID content (modules C1 to C9) and the approved design, built in six phases as small OpenSpec changes, with Phase 0 settling 15 conflicts and gaps between the ID content, the SE document and the wireframes before any feature code is written.

## At a glance

&#91;embedded content: roadmap · 6 phases, 6 gates\]

Each phase ends at a gate where you check the output before the next one starts; the dark theme is the only stretch item and never blocks v1.1.

## Decisions settled on 9 November

These answers close conflicts 1 to 4 and add the storage choice. Every other row in the conflicts table below follows its recommended default.

- **D1, modules.** C1 to C9 is the structure and order.
- **D2, conventions.** Follow the ID: a leaf has height 0, an empty tree -1, and balance factor is height(left) minus height(right). The wireframes and design frames are updated to match in Phase 0, before Phase 2 uses them.
- **D3, session and device.** About an hour in nine resumable chunks is fine. Tree editing is built for phones too, for accessibility: touch targets of at least 44 px, tap a node then tap a place as an alternative to dragging, and the text description of the tree stays available beside it.
- **D4, scope.** Search and deletion are both in v1.1. C7 and AVL deletion move out of the stretch list and are built in Phases 1 and 3. LO8 appears on the readiness summary; since the ID calls C7 optional, it does not block Ready unless you say otherwise.
- **D16, storage.** Progress and settings stay in localStorage behind the storage adapter. SQLite is used for the event log only, so pilot data can be queried and exported as a .sqlite file: sqlite-wasm running in the browser, no server, no network calls. Spike S3 confirms it works in the target browsers; the fallback is a JSON export.

What this changes: Phase 1 gate G1 adds deletion examples, Phase 3 includes C7, tree editing on phones becomes committed work in Phase 5 (change 25), and the dark theme is the only stretch item left.

## Conflicts to settle first

The ID content is the newest and the instructional source of truth, so where the sources disagree this plan follows it and flags the change needed to the SE document and the design. Rows 1 to 4 were settled on 9 November (see the decisions above) and the rest follow the recommended default; Phase 0 records all of them in the decision log, and any can still be vetoed before gate G0.

| # | Topic | What conflicts | Recommended v1.1 decision | Confirm with |
| --- | --- | --- | --- | --- |
| 1 | Modules | ID has nine modules C1 to C9, with the AVL property (C3) before rotations (C5) and a search module (C4). SE v0.2 and the wireframes have U0 to U5, rotations before the AVL rule, and no search. | Adopt C1 to C9 as the structure and order. Renumber the progress map and add design frames for C4, C8 and C9 (and C7 if built). | You |
| 2 | Height convention | ID: leaf 0, empty -1 (edges). The wireframes assume leaf 1, empty 0 and use it in worked examples. | Use the ID convention, held in one conventions module that code, labels and tests all read, so a lecturer change is a one-line edit. Fix the wireframe examples. | Lecturer |
| 3 | Session and device | ID: about 1 hour, laptop or phone. SE v0.2: 20 to 30 minutes, desktop and tablet only. | Plan for about 1 hour in nine resumable chunks. Settled: phones get the full module, including tree editing, with large touch targets and tap-to-place instead of dragging. | You |
| 4 | Deletion | ID: optional C7 (LO8) that never blocks. SE v0.2: out of scope. | Settled: deletion (C7) is in scope for v1.1. Its check is shown on the summary but, as in the ID, does not gate readiness. | You |
| 5 | Search | ID: core (C4, LO4, LO5) with loop and recursive versions side by side and a "be the algorithm" activity. SE v0.2 has only a helper; the wireframes have no search screen. | Add a search engine with a step trace, two pseudocode panels and a new frame. Step counts come from the engine, not from typed content. | You |
| 6 | Diagnostic | ID: 5 questions, under 4 of 5 goes to a BST refresher. Wireframes: about 6 questions, status per sub-skill, no total. | Five questions, one per sub-skill, route on fewer than 4 of 5, show the per-skill list and no score. No recap before the check; the refresher comes after it. | You |
| 7 | "Assessment side?" | The ID has an orange flag on the C1 questions reading "Assessment side?" with no answer. | Treat the five questions as items in the assessment layer, with the same question model, tags and storage as every other check. | You |
| 8 | Readiness output | ID: Ready or Revise per objective, with links back. Wireframes: three states (secure, developing, not yet) over five rows. | Store three states for routing and scaffolding; show Ready or Revise for each of LO1 to LO9 on the summary (LO8 only if C7 is built). | You |
| 9 | Retries | ID: keys are random, so retries are new problems. Wireframes: a retry keeps the same question. | Generated items (balance factors, traces) give a new seeded variant per attempt; multiple choice keeps the stem and reshuffles options. The cap of 3 is per question. | You |
| 10 | Gagné's nine events | ID: each module's screens follow hook, goals, recall, content, worked example, practice, feedback, check, summary. Wireframes: three reorderable activities per unit. | Module content is an ordered list of steps typed by Gagné event. Hook, goals, recall and summary are fixed; only content, worked example and practice can be reordered. | You |
| 11 | Sandbox access | The wireframes ask whether it opens from the start or only after the lopsided-BST module. | Always reachable from the hub, and suggested after C2 where the chain idea appears. | You |
| 12 | Pseudocode language | The wireframes ask for generic or Java or Python. The ID uses generic pseudocode. | Keep the generic pseudocode from the ID. | Lecturer |
| 13 | Step-count claim | ID (C2, C4): a search takes at most height + 1 steps, "at most 28" for a million keys. By my arithmetic the standard AVL bound (about 1.44 log2 n, which is 28.7 here) gives a height up to 28, so up to 29 nodes visited. | Verify the bound, correct the wording if needed, and have the engine compute the figure instead of typing it. | You |
| 14 | Last module (C9) | ID: one question per objective plus two combined, missed items return once in a new form, the student writes one lecture question. Wireframes: a summary and a question list only. | Add a recycle step (each missed outcome returns once as a new variant); require one lecture question and allow more; export is print, save or copy only. | You |
| 15 | Checks per module | The ID lists a check for C2, C3 and C6 only. C4, C5 and C8 have an activity or an example but no check, so LO4, LO5, LO6 and LO9 are first assessed in C9. | Add a short check of 2 or 3 items to C4, C5 and C8 (inside changes 14, 15 and 17) so the scaffolding can help before C9, or confirm the ID means them to be assessed only in C9. | You |

## Questions for the lecturer

Three answers change the build, so send them before Phase 1 starts. If nothing comes back by gate G0, build with the default and keep the convention in one place.

1. **Conventions.** Does the course count height in edges (leaf 0, empty -1) and define balance factor as height(left) minus height(right)? Default: yes, as in the ID content. This drives every label, test and misconception message.
2. **Pseudocode.** Is generic pseudocode acceptable, or should the app use Java or Python? Default: generic, as in the ID content.
3. **Deletion.** Which deletion cases does the lecture cover? Default: C7 is built as in the ID and its check never gates readiness.
4. **Height bound (optional).** Does the lecture state the bound of about 1.44 log2 n, and how does it count search steps for a million keys? Default: state the bound and compute the figure.

## How the agents work

Six Claude Code subagents (markdown files in `.claude/agents/`), each limited to one job and one set of files, so no agent grades its own work. You merge and archive; the agents never do.

| Agent | Job | May edit | Hands back |
| --- | --- | --- | --- |
| spec-writer | Turns the ID content, design frames and decision log into OpenSpec proposals, scenarios and tasks. Lists open questions first and stops if any remain. | `openspec/changes/` only | A proposal ready to review |
| test-writer | Turns each spec scenario into a failing test before any code; adds property tests for engine invariants. | `tests/` only | Red tests that match the spec |
| implementer | Applies the tasks until the tests pass. If a test looks wrong it stops and asks. | `src/` except content, never tests or specs | A green diff |
| content-author | Drafts module steps, questions, misconception tags and feedback as data files, from the ID content. | `src/content/` only | Data files, with anything beyond the ID content flagged |
| reviewer | Fresh context. Checks the diff against the spec, the learning objective, the conventions module and the design rules. | Nothing (read-only) | Pass or fail with findings |
| a11y-checker | Runs lint rules, axe, the token contrast check and a keyboard walk-through. | Nothing (read-only) | A report |

**Guardrails**

- Answers are computed by the engine and never typed into content. A worked example's final tree comes from the trace.
- Nothing is invented. Content comes from the ID document, and the content-author flags every sentence that goes beyond it for you to check.
- Height and balance-factor conventions live in one `conventions` module that code, labels and tests all read.
- Specs change only through a proposal, and `openspec/specs/` changes only when a change is archived.
- Any `[OPEN]` marker in a spec blocks the apply step.
- One change in flight per capability, one branch per change, commits that name the change and the LO or FR it serves.
- The app makes no network calls and stores nothing outside the storage adapter.

The slash commands are `/opsx:propose`, `/opsx:apply` and `/opsx:archive` as described in the README I could read. Run `openspec --help` after installing to confirm your version uses the same names.

## Phase 0: decide and set up

Phase 0 builds no features: it closes the 15 decisions, seeds OpenSpec from the ID content, and lays the foundations every later change reads.

**Deliverables**

1. **Decision log** (`docs/decisions.md`): D1 to D16 with the chosen answer for each, signed off by you.
2. **`openspec/project.md` and `CLAUDE.md`**, drafted from the SE document and this plan.
3. **Seeded capability specs**, each requirement tied to an FR ID or an LO, with unresolved ones marked `[OPEN]` and an owner.
4. **Repo scaffold**: Vite, React, TypeScript, Vitest, fast-check, jsx-a11y and axe, with the test and lint scripts running green on an empty project.
5. **Design import**: tokens from the Design System page into `src/styles/tokens.css`, the wireframes into `docs/design/`, and the design brought into line with C1 to C9 (new frames for C4, C8 and the C9 recycle step).
6. **SE document v1.1**, regenerated from the specs so the two cannot drift.

| Group | Capabilities |
| --- | --- |
| Engine | conventions, bst, rotations, avl-insert, search, trace |
| UI core | design-tokens, app-shell, tree-view, replay-controls, pseudocode-panel |
| Learning | module-framework, activities (predict, do it yourself, be the algorithm), sandbox |
| Assessment | question-model, diagnostic, checks, scaffolding, readiness |
| Platform | learner-storage, accessibility-settings, event-log |

**Three time-boxed spikes** retire the technical unknowns. Each runs on a throwaway branch and ends with a written finding.

- **S1, tree layout.** Can a simple layout place 15 nodes without overlap, with keys in in-order position, at 1366 by 768 and on a tablet? The result becomes the layout function for the tree view.
- **S2, trace contract.** Hand-write the trace for inserting 5 into the wireframe tree, with its pseudocode lines. What fields does a step need for replay, line highlighting, the text description and answer marking?
- **S3, browser features.** How do speech synthesis, local storage failures and the reduced-motion setting behave in the target browsers, and what does read-aloud or saving degrade to?

**Gate G0:** the decision log is signed; every spec requirement has a scenario or an `[OPEN]` marker with an owner; the scaffold builds and the empty test run is green; the three spike findings are written.

## Phases 1 and 2: engine, then core UI

The engine comes first because it has no UI, is fully testable, and every screen, question and worked example depends on it. Each row is one OpenSpec change.

**Phase 1: engine (tests first)**

| # | Change | What it covers | LO | Needs |
| --- | --- | --- | --- | --- |
| 1 | `add-conventions-and-bst` | Conventions module, BST insert and search, plain BST without rebalancing, tree height | LO1, LO2 | Phase 0 |
| 2 | `add-rotations` | Left and right rotation; in-order sequence preserved (property test) | LO6 | 1 |
| 3 | `add-avl-insert-trace` | Height update going up, balance factor, finding the lowest unbalanced node, case LL, RR, LR or RL, single or double rotation, step trace | LO7 | 1, 2 |
| 4 | `add-avl-validity-and-generators` | Validity check that names the first violating node; seeded generators for trees and for insert sequences that trigger each case | LO3, LO7 | 3 |
| 5 | `add-search-trace` | Loop and recursive search traces, found and not found, steps counted | LO4, LO5 | 1 |
| 6 | `add-avl-delete` | BST delete, then rebalance up the path, which can need several rotations | LO8 | 3, 4 |

**Gate G1:** you check six hand-worked examples (one per case, one search found, one not found, two deletions with one needing a double rebalance) against the lecturer's notes. Property tests pass: in-order sequence preserved, every balance factor in -1, 0 or +1 after an insert, at most one rebalance per insert, and trace replay reproduces the result.

**Phase 2: core UI**

| # | Change | What it covers | LO | Needs |
| --- | --- | --- | --- | --- |
| 7 | `add-design-tokens-and-shell` | Tokens, AppShell, TopBar, the Aa menu stub, focus ring, light theme first | all | Phase 0 |
| 8 | `add-learner-storage` | Storage adapter, schema version, fallback for corrupt data, resume, reset with confirmation | all | 7 |
| 9 | `add-tree-view` | Layout from spike S1, node roles with text tags, height and balance factor on every node, text description, keyboard navigation | LO2, LO3 | 3, 7 |
| 10 | `add-replay-and-pseudocode` | Step controls and keys, reduced motion, pseudocode panels (insert; loop and recursive search), live step explanation | LO4, LO7 | 3, 5, 9 |
| 11 | `add-predict-and-do-it-yourself` | Predict-first prompt and reveal, Watch or Do it yourself switch, rotation menu, in-order strip, undo and reset, feedback on a wrong rotation | LO6, LO7 | 9, 10 |

**Gate G2:** the core screen from the wireframes works end to end. Insert 5 in watch mode with predict-first, then rebalance it yourself; step back restores the exact tree; everything works by keyboard alone; the screen still reads in greyscale.

## Phases 3 to 5: content, assessment, hardening and pilot

**Phase 3: learning content**

| # | Change | What it covers | LO | Needs |
| --- | --- | --- | --- | --- |
| 12 | `add-module-framework` | Module data schema (steps typed by Gagné event), content validator, unit hub and ProgressMap, guided path, reordering of the middle steps | all | 7, 8 |
| 13 | `add-modules-c2-c3` | C2 lopsided BSTs (the 10 to 50 chain, the million-key question, a preview of the AVL shape); C3 the AVL property (fill in balance factors, spot the problem where the root looks fine) | LO1, LO2, LO3 | 12, 9 |
| 14 | `add-module-c4-search` | C4 search: loop and recursive versions side by side, the "be the algorithm" activity, a step-count demo computed by the engine | LO4, LO5 | 10, 12 |
| 15 | `add-modules-c5-c6` | C5 rotations (single, double, in-order strip); C6 insertion with rebalancing, worked examples that fade from done for you to on your own, with seeded keys | LO6, LO7 | 11, 12 |
| 16 | `add-sandbox` | Insert keys 1 to 99, 15-node cap, rebalancing on or off with replay, tree statistics | LO1 | 3, 9 |
| 17 | `add-module-c8-choosing` | C8: compare a BST, an AVL tree, a sorted array and a hash table; mention Red-Black trees; scenario items | LO5, LO9 | 12 |
| 18 | `add-module-c7-delete` | C7: BST delete recap, rebalancing on the way up, optional check | LO8 | 6, 12 |

**Gate G3:** you read every module end to end and resolve every sentence the content-author flagged; each module follows the Gagné step order; the validator finds no typed answers.

**Phase 4: assessment**

| # | Change | What it covers | LO | Needs |
| --- | --- | --- | --- | --- |
| 19 | `add-question-model-and-bank` | Question types (multiple choice, compute balance factor, identify case, trace an insert, scenario choice), tags for objective, sub-skill, Bloom level and misconception, seeded variants, validator | all | 12, 4 |
| 20 | `add-checks-and-feedback` | QuestionItem, FeedbackPanel (correct, not quite yet), confidence rating, constrained tree editor for trace-an-insert with an edit log | LO3, LO6, LO7 | 19, 11 |
| 21 | `add-scaffold-ladder-and-retry-cap` | Hint, worked example, guided step-through; cap of 3 per question; drafted lecture question | all | 20 |
| 22 | `add-diagnostic-c1-and-routing` | C1 flow: how the app works, conventions card, five questions, route on fewer than 4 of 5, per-skill list, BST refresher | prerequisites | 19, 12 |
| 23 | `add-readiness-c9` | One question per objective plus two combined, each missed outcome returns once, Ready or Revise per objective with links back, lecture questions, print, save or copy | all | 21, 22 |

**Gate G4:** a full journey from first visit to summary runs on desktop and tablet without help; routing is tested for every combination of diagnostic results; no student can get stuck, because every path out of the retry cap works.

**Phase 5: harden and pilot**

| # | Change | What it covers | Needs |
| --- | --- | --- | --- |
| 24 | `add-accessibility-settings-and-audit` | Aa menu (text size, read-aloud voice and speed, reduced motion), axe on every screen, keyboard walk-through, screen reader pass | 23 |
| 25 | `add-responsive-tablet-and-phone` | Tablet layout with the right column under the tree; phone layout with full tree editing per decision D3 | 23 |
| 26 | `add-event-log-and-export` | Anonymous local event log for the pilot (attempts, hints, representation choices) with JSON export | 23 |
| 27 | `release-v1-1` | README, SE document v1.1 regenerated from the specs, static-site deployment, list of known limitations | 24, 25, 26 |

**Gate G5:** accessibility audit clean, the pilot script and survey are ready, and the limitations list is written. Then 3 to 5 students run it with think-aloud.

## The loop every change follows

1. **Propose.** The spec-writer drafts the proposal from the decision log, the ID content and the design frame, with scenarios taken from the acceptance criteria and open questions listed first.
2. **Skim.** You read the proposal (aim for five minutes). Anything marked `[OPEN]` goes back to the decision log, and the change does not proceed.
3. **Red tests.** The test-writer turns every scenario into a failing test, and the red tests are committed.
4. **Build.** The implementer applies the tasks until the tests pass. For content changes the content-author drafts the data files and the engine computes every answer.
5. **Review.** The reviewer, in a fresh context, checks the diff against the spec, the learning objective and the conventions module. The a11y-checker runs on every UI change.
6. **Merge and archive.** You merge and run `/opsx:archive`. Agents never do this.

Split any change with more than about ten tasks, so each diff stays reviewable.

**Definition of done**

- [ ] Every scenario in the change has a passing test named after the FR or LO it serves
- [ ] Tests, type check and lint pass, and no new `[OPEN]` markers were added
- [ ] UI changes: axe is clean, a keyboard-only run works, the greyscale check passes, and token contrast is unchanged
- [ ] The reviewer's report is a pass, or its findings are resolved
- [ ] Every answer shown to a student is computed by the engine
- [ ] The change is archived, the decision log is updated if it settled a decision, and the commit names the change and the LO or FR

## Traceability: learning objectives to modules and changes

Levels are the ones given in the ID content. Change numbers refer to the build sequence above.

| LO | Objective (short) | Module | Level | Changes | Assessed by |
| --- | --- | --- | --- | --- | --- |
| LO1 | Why BST height is search cost; how insertion order makes a lopsided tree | C2 | Understand | 1, 13, 16 | C2 check (heights for different orders, worst case) |
| LO2 | What height, balance factor and the AVL property are | C3 | Remember | 1, 13 | C3 check |
| LO3 | Work out balance factors and say whether a tree is AVL | C3 | Apply | 4, 9, 13 | C3 check (balance factors, AVL or not) |
| LO4 | Trace a search, found and not found | C4 | Apply | 5, 10, 14 | C9 (the C4 activity is not a check) |
| LO5 | Why AVL search is O(log2 n) but a plain BST can be O(n) | C4, C8 | Understand | 5, 14, 17 | C9 |
| LO6 | Do single and double rotations | C5 | Apply | 2, 11, 15 | C9 |
| LO7 | Insert: find the lowest unbalanced node, pick the case, rotate | C6 | Apply or analyse | 3, 4, 15, 20 | C6 check (where balance first breaks, name the case, build the final tree) |
| LO8 | Delete and rebalance (optional check) | C7 | Apply | 6, 18 | Optional check |
| LO9 | Pick a structure for a scenario and say why | C8 | Analyse, light | 17 | C9 |

Prerequisites are checked in C1 (change 22) and every objective is revisited in C9 (change 23).

The ID lists a check for C2, C3 and C6 only, so LO4, LO5, LO6 and LO9 are first assessed in C9. That is decision 15 in the table above.

## Risks to watch

| Risk | Why it matters | What the plan does about it |
| --- | --- | --- |
| The lecturer's conventions differ from the ID | Every label, test and feedback message depends on them | One conventions module, sign-off at G0, tests that read from it |
| Scope: nine modules and about an hour of content is much larger than SE v0.2 | Late phases get squeezed | The first demo works at G2, and the cut order is fixed: dark theme first, then the depth of C8; deletion and phone tree editing are committed |
| Agents drift from the ID content | Plausible but wrong explanations reach students | Content-author flags what goes beyond the ID, answers are computed, the reviewer checks, and you read everything at G3 |
| Generated items are unfair or cannot trigger the intended case | A retry feels broken | Generators guarantee the target case and are property-tested; seeds are stored with attempts |
| Tree layout is harder than expected | It blocks Phase 2 | Spike S1; the fallback is in-order position across and depth down, which always works for 15 nodes |
| Accessibility is retrofitted late | It is the most expensive kind of rework | Tokens and focus ring in change 7, and the a11y-checker on every UI change |
| OpenSpec command names differ from the README I read | The loop stalls on day one | Confirm with `openspec --help` in Phase 0 and record the exact names in `CLAUDE.md` |
| The pilot is small | It cannot show learning gains | Report it as usability and engagement evidence, in line with the SE document |
