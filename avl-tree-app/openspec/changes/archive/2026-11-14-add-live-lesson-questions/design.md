# Design

## Context

See proposal.md for why. After `add-live-lesson-content`:

- `src/live/` loads and validates the content and builds every tree and operation through the engine (`buildTree`, `playOperation`).
- `src/ui/lesson/` plays C2 to C8 one screen at a time. `regionsFor` sends every interactive screen to a placeholder.
- The learner state already stores attempts (`questionId`, `answer`, `correct`, `confidence`, `misconceptionId`, `hintsUsed`) through `attempt-recorded`, and completes modules through `module-completed`. Nothing records the JSON questions yet.
- Existing pieces worth reusing:
  - `TreeView`, which has interactive selection and hidden balance factors.
  - `RotationMenu` and `InOrderStrip`.
  - `PseudocodePanel`.
  - `src/practice/rotate.ts`'s rotation state, which `TraceEditor` uses.

  `TraceEditor` itself places keys with a button, not by branch, and stays with the old C9 screen until change 2.

## Goals / Non-Goals

**Goals:**
- Every question in C2 to C8 is asked, marked by the engine and recorded, with one control per question type.
- Lesson checks follow ID 9.1 and finishing one completes the lesson.

**Non-Goals:**
- Titles, routing bands, the review ladder, the challenge and the nudge (the rewards change).
- C1 and C9 (change 2).
- Any change to `src/live_content/`.

## Decisions

### 1. One marker: `src/live/mark.ts`

`markQuestion(q, response, context): Mark` takes the question, the student's response and the attempt context. It returns `{ verdict: 'right' | 'partial' | 'not-yet', reason, misconceptionId?, conceptScreen }`.

The engine's answer comes from `src/live/build.ts`:

| Question | Engine answer |
|---|---|
| `enter-values` | heights and balance factors of the tree after the question's operation |
| `click-node` | the node set, using the same functions as `crossCheck.ts` |
| `trace` | `searchTrace`: path, and found or not found |
| `build-tree`, `perform-rotation` | `playOperation(...).end`, compared with `shapeString` |
| `mcq`, `case-id` | `correctOptionId` |

`crossCheck.ts` and the marker share one `engineAnswer(q)` function, so the value checked on load is the value marked.

- *Why one module:* the reason text and the misconception must be chosen identically for checks and practice, and testable without React.

### 2. Wrong-answer matching

The marker tries these in order:

1. The chosen option.
2. `wrongAnswers` entries that match:
   - `{target, value}`: the value at that target
   - `{node}`: a selected node
   - `{shape}`: the tree's shape
   - `{pattern}`: one of these detectors
3. The question's `feedback.incorrect`.

The detectors are pure functions of the response and the engine's answer:

- `goes-wrong-direction`: some step moves to the child on the wrong side of its parent for the key.
- `visits-extra-nodes`: the path contains a node that is not on the engine's path.
- `rotated-at-root`: the root was rotated when n is lower down.
- `rotated-wrong-direction`: a rotation about n opposite to the engine's.
- `double-wrong-order`: for an inside case, a rotation about n came before the rotation about its child.
- `rotated-again-above-n`: a rotation about an ancestor of n after n was fixed.

The rotation detectors read the builder's action log.

"Almost there." (`verdictIncorrect[1]`) is used when some targets of an `enter-values` question are right, or when a trace's path is right but found or not found is not.

### 3. Question card and controls: `src/ui/lesson/questions/`

`QuestionCard` lays out the parts of every question:

1. stem
2. tree
3. answer control
4. confidence (checks)
5. Check answer
6. feedback

One control per type is chosen by a `switch` on `q.type`:

- `ChoiceControl`: mcq, case-id, predict.
- `ValuesControl`: one labelled field per target ("Node 20: balance factor"); a `NodePicker` for `askUnbalanced`; Yes/No for `askIsAvl`.
- `NodePicker`: `TreeView` in interactive mode; a selected set; a None button by `selectMode`.
- `TracePicker`: picks in order; Found and Not found buttons; Undo last.
- `TreeBuilder`: see decision 4.

Balance factors are hidden (`hideBalance`) on questions that ask for them. Otherwise the question's or screen's `show` applies.

### 4. Tree builder

A reducer holds `{ tree, pending keys, log, history }`. The actions are:

- **place(key, at, side):** puts the next pending key in an empty branch. **Every** empty branch is a target, because offering only the correct one would give the answer away. A placement in the wrong branch is allowed and drawn, and the marker names it (`misc-bst-order-reversed`; D110).
- **rotate(about, dir):** `rotateAt` from `src/practice/rotate.ts`. Rotations that are impossible are greyed out in `RotationMenu`.
- **delete(key):** a leaf removal through `replaceAt`.
- **undo, reset.**

Empty-branch targets are drawn as small labelled buttons beside their parent node, outside the SVG. They form a list of "Put 30 left of 40" buttons under the tree, so keyboard and screen-reader use needs no SVG focus. The drawing marks the targets with dashed outlines (ID 11.1: never colour alone).

- *Alternative rejected:* reusing `TraceEditor`. It inserts keys automatically, which removes the "place the key" step the ID asks for (c2-s01, chk6-01).

### 5. Attempts and checks

- **The attempt record:** `{ questionId, at, answer, correct, confidence?, misconceptionId?, hintsUsed, attempt }`. `attempt` is the count of earlier stored attempts at that `questionId`, plus 1.
- **Check screen:** `CheckRunner` holds the index of the current question. It derives "finished" from stored attempts (any right, or `attemptsPerQuestion` reached), so a reload resumes at the first unfinished question.
- **Completion:** when every question is finished, `module-completed` is dispatched for the lesson's module.
- **Next:** on a check screen, Next is disabled until the current question is finished. `LessonControls` gets a `nextDisabled` flag.
- **Hint:** the hint region and Hint control read the current question's `hint`. Opening it sets `hintsUsed` to 1 for that question's next attempt.

### 6. Guided pauses

`LessonAnimation` gets a `guided` prop. When the next caption step is an `imbalance` step and the pause for it is not yet answered, stepping stops and a small `NodePicker` and `ChoiceControl` (the four case labels from `conventions.json`) appear. Both are marked against the trace step's `nodes[0]` and `rebalanceCase`. They are practice: unlimited tries, nothing blocks after a right answer, attempts are not stored.

### 7. Review link

`conventions.concepts[q.concept].screen` gives a screen id:

- **Same lesson:** the player moves to that index (`LessonPlayer` exposes `goToScreen`).
- **Other lesson:** a link to `/module/Cn`.

The label is `Review: {label}`.

### 8. Copy

Question UI labels go into `src/content/lesson.ts`. The verdicts, "Try again", "Continue", "Sure", "Not sure", "Found", "Not found", "None" and "Review: {concept}" come from `conventions.json`.

### 9. Removal

These go, with their tests:

- `PredictPrompt`, `PredictionReveal`, `ModeSwitch`, `DoItYourself`, `FeedbackPanel`
- the `predict-first` and `do-it-yourself` specs

`src/practice/` stays, because change 2 removes the old model that still imports it.

### Decision-log rows (task 9)

| Row | Topic | Decision |
|---|---|---|
| D106 | Check attempts | Two attempts per check question; right if either is right (ID 9.1). Supersedes D9's cap of 3 and seeded variants. |
| D107 | Hints | One static hint per question; opening it is one hint used (ID 9.4). Supersedes D21 and D80 for lessons. |
| D108 | Verdicts | "That's right." / "Not quite." / "Almost there." from `conventions.json` (ID 10.1). Supersedes D27's wording. |
| D109 | Confidence | Required on check answers, optional in practice (ID 9.2). |
| D110 | Placing keys | Every empty branch is a target; a wrong placement is drawn and marked, not prevented. |
| D111 | Completion | A lesson completes when its check is finished; C7's optional check never blocks (ID 7.1, 9.1). |

## Risks / Trade-offs

- **[A `wrongAnswers` entry never matches]** It is silently unused, and the student gets the general explanation. → A test runs every `wrongAnswers` entry through the marker with a constructed answer that should match it, and fails if the expected entry is not the one chosen.
- **[The builder is the largest UI piece]** → It gets its own reducer with pure tests, and the UI test covers c2-s01, chk5-03 (rotate), chk6-04 (place then rotate) and chk7-03 (delete then rotate).
- **[Stored attempts from the old C2 to C8 checks]** They stay in storage under old ids and are ignored. → Change 2 bumps the storage version when the old model goes.
- **[Lesson completion now depends on check answers]** Old states that already completed C2 to C8 keep their completion. → No migration needed.

## Migration Plan

There is no data migration. Rollback is reverting the change, done by the user.
