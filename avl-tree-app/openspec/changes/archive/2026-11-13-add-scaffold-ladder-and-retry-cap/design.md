# Design: add-scaffold-ladder-and-retry-cap

## Context

See proposal.md for why and scope. What exists:

- `src/assessment/`: `instantiate(item, seed, attempt)` builds an instance whose problem differs from the attempt before it (D9). `mark(inst, response)` returns `correct`, `not-yet` (with a misconception when one is recognised) or `unreadable`. `attemptRecord` builds the learner-storage `Attempt`. `attemptPolicy('check')` already returns `{ retryCap: RETRY_CAP, hints: 'ladder' }`.
- `src/modules/config.ts` holds `RETRY_CAP = 3` and `PRACTICE_HINTS = 2`, and a test checks that the numbers appear nowhere else.
- `src/assessment/validate.ts` (`validateBank`) checks tags, explanations, numbers (`numbersIn`), conventions wording (`statesConvention`) and judging words, and returns `Problem[]` without throwing.
- `src/content/questions/`: the bank (`checks.ts`), the misconception catalogue (25 entries: 18 drafted plus one per need) and 14 sub-skills.
- Learner state has no place for lecture questions. `learnerReducer` has only `reset` and `persistence`.

## Goals / Non-Goals

**Goals:** one pure module that change 20 can drive from a component with `useReducer`, with no React import. Every scaffold is either computed by the engine or flagged wording, and validated with the bank.

**Non-goals:** rendering, focus management and live regions (change 20). Any change to the practice hint flow.

## Decisions

### 1. A reducer, not a class

`src/assessment/scaffold.ts` exports:

```ts
type Rung = 'hint' | 'worked-example' | 'guided'   // order from SCAFFOLD_LADDER in config
interface CheckSession {
  itemId: string; seed: number; attempt: number
  rungs: number                     // count of open rungs, 0..SCAFFOLD_LADDER.length
  lastMisconception?: MisconceptionId
  outcome: 'open' | 'correct' | 'capped'
  lectureQuestion?: LectureQuestion
}
type CheckAction =
  | { type: 'answer'; response: Response; at: string; confidence?: Confidence }
  | { type: 'help' }
startCheck(item, seed): CheckSession
checkStep(item, session, action): { session: CheckSession; mark?: Mark; attempt?: Attempt }
currentInstance(item, session): Instance          // instantiate(item, seed, attempt)
scaffolds(item, session): OpenScaffold[]           // one entry per open rung, in order
```

The session stores only numbers and IDs, not the instance, so it stays serialisable and the instance is recomputed (deterministic). `checkStep` returns the mark and attempt record next to the new session so the caller can save the attempt without the reducer touching storage. Alternative considered: a stateful class. It is harder to test with property tests and to keep in React state.

Rung count rather than a set of rungs: the "prefix that never shrinks" rule then holds by construction.

### 2. Escalation

- `help` on an open session: `rungs = min(rungs + 1, SCAFFOLD_LADDER.length)`.
- `answer` that marks `unreadable`: nothing changes and no attempt record is returned.
- `answer` that marks `correct`: `outcome = 'correct'`, and the attempt record has `hintsUsed = rungs`.
- `answer` that marks `not-yet`: record with `hintsUsed = rungs`, set `lastMisconception` (cleared when the mark has none), then if `attempt + 1 === RETRY_CAP` → `outcome = 'capped'`, `rungs = SCAFFOLD_LADDER.length`, draft the lecture question; else `attempt += 1`, `rungs = min(rungs + 1, max)`.
- Any action on a closed session returns it unchanged.

`SCAFFOLD_LADDER = ['hint', 'worked-example', 'guided'] as const` goes in `src/modules/config.ts`, so the config holds every check-policy constant. The single-place test gets one more assertion. The ladder's length (3) and `RETRY_CAP` (3) are equal only by chance. Nothing relies on that: the cap opens every rung directly.

### 3. Hint selection

`scaffolds` resolves the hint as `HINTS[lastMisconception] ?? GENERAL_HINTS[item.subSkill]`, rendered with `(currentInstance.facts, conventionsWording())`. For a capped session, "current" is the last attempt's instance. A misconception with no hint falls back to the general hint at run time, and the validator reports it as missing.

### 4. Worked example

`workedExample(item, seed)` returns `instantiate(item, s, 0)` for the first `s = variantSeed(seed, WORKED_EXAMPLE_SALT + k)`, k = 0, 1, …, up to a bound, whose `signature` is not among the signatures of attempts 0 to `RETRY_CAP - 1`. The result carries `{ instance, answer, explanation: instance.correctExplanation }`. `WORKED_EXAMPLE_SALT` is a mechanic, not policy, so it lives in `scaffold.ts`, like `RETRY_TRIES` in `instantiate.ts`. If the bound is hit (no kind does this over seeds 0 to 99, and the test proves it), it throws a `RangeError`, which the test would catch.

Alternative considered: an authored worked example per kind. Rejected because it needs new teaching text per kind, while the item's correct explanation already explains the answer with engine values.

### 5. Guided steps

`guidedSteps(item, session): GuidedStep[]`:

- Tree items (`inst.trace` present): one `{ kind: 'trace', step }` per trace step. Change 20 renders these with the existing replay components.
- Every other item: `{ kind: 'text', text }` per sentence of `inst.correctExplanation`, split after `.`, `?` or `!` followed by whitespace. Joining with single spaces gives back the explanation, which the test checks.

This is the weakest default in the change (proposal item 5): it shows the reasoning in order, not a step the student completes. It lives in one function, so a per-kind interactive step-through later replaces only that function.

### 6. Scaffold content

`src/content/questions/scaffolds.ts` (content-author):

```ts
export interface HintEntry { text: Wording; source: SourceMark }   // source: 'beyond ID'
export const HINTS: Record<MisconceptionId, HintEntry>              // one per catalogue entry
export const GENERAL_HINTS: Record<string, HintEntry>               // one per sub-skill
export const lectureQuestionText: (label: string | undefined, stem: string) => string
```

Need misconceptions (one per `NEED_ID`) get their hint from the existing `NEEDS[n].label`, built in a loop the way the catalogue builds them, so no per-need text is written. Hints say where to look ("count the edges on the longest path from node X down"), not what the result is. Formula, sign, lean and case wording come from `ConventionsWording` (D19).

The lecture-question template is a single function. It quotes the stem, and with a label it reads "My answer {label}." The catalogue labels are written in the third person singular, so "My answer counts height in nodes, not edges." reads correctly for every entry. It does not state the cap number.

### 7. Validation

`validateBank` gains a `scaffoldProblems` pass and two new problem kinds, `scaffold` (missing hint) and `answer` (a hint states the answer). For every item and seed, it renders the general hint and the hint of every misconception the item's kind can produce against the instance, then checks:

- numbers ⊆ `inst.numbers` (the existing `numbersIn` check)
- `statesConvention` is false
- no `undefined` or `NaN`
- no judging word
- does not state the answer: choice items, the hint does not contain the correct option's text (when that text is not already in the stem); number items, the answer is not among the hint's numbers unless it is also among the stem's numbers

`BankRecords` gains `hints` and `generalHints` so tests can pass a catalogue with a gap. The lecture-question template is checked over the same items for judging words.

### 8. Lecture questions in learner state

```ts
interface LectureQuestion { questionId: string; module: ModuleId; at: string; text: string; misconceptionId?: string }
LearnerState.lectureQuestions: LectureQuestion[]
```

`freshLearnerState` sets `[]`. `parseLearnerState` treats a missing field as `[]` and anything else that is not an array of valid entries as corrupt. A new `SessionAction` `{ type: 'lecture-question'; question }` appends one entry. `STORAGE_INVENTORY`'s learner description adds "questions you want to ask in the lecture".

Alternative considered: bump the schema to 2. Rejected because D18 favours the cheaper change, and a version bump would reset every pilot student's progress (an unknown version is treated as corrupt).

## Risks / Trade-offs

- [Sentence-split guided steps feel thin] → Isolated in `guidedSteps`. Listed as assumed so the team can ask for interactive steps, which would be a later change touching only that function and change 20's view.
- [25 + 14 new hint texts are unverified teaching wording] → All are `beyond ID` and flagged for G3. Nothing reaches a student until change 20 renders them, and the user reads them before that.
- [The "does not state the answer" check is heuristic] → It covers the text forms answers take here (option text, numbers). The reviewer reads every hint once.
- [The worked-example search could fail for a future kind with very few problems] → It throws instead of looping, and the bank test runs every kind over seeds 0 to 99.

## Migration Plan

No migration. States saved before this change load with an empty `lectureQuestions` list under schema version 1. Rollback: an older build would drop the extra field on its next save, because extra fields are dropped. Nothing else changes.
