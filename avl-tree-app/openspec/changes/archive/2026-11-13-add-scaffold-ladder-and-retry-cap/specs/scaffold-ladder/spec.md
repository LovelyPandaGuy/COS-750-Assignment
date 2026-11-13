# Spec Delta

## Purpose

Support for a student working on a module check question: a ladder of help matched to their mistakes (hint, then worked example, then guided step-through), opened in that order, computed by the engine or drafted as flagged wording, with a cap on retries and a drafted lecture question so they can always move on.

## ADDED Requirements

### Requirement: A check question is a session
Starting a check question from a bank item and a seed SHALL give an open session at attempt 0 with no rungs open. Each readable answer SHALL be marked by the question model against the current attempt's instance. A correct answer SHALL close the session as correct. A wrong answer below the cap SHALL move the session to the next attempt, whose problem is the question model's next variant. (FR-ASM-07, D9)

#### Scenario: Fresh session
- **WHEN** a session is started for any bank item and seed
- **THEN** it is open, at attempt 0, with no rungs open and no lecture question

#### Scenario: Correct answer closes the session
- **GIVEN** an open session at attempt 0
- **WHEN** it is answered with the instance's correct answer
- **THEN** the session is closed as correct and its attempt number does not change

#### Scenario: Wrong answer gives a new problem
- **GIVEN** an open session at attempt 0 for any bank item and any seed from 0 to 99
- **WHEN** it is answered with a wrong answer
- **THEN** the session is at attempt 1 and its current instance equals the question model's attempt 1 instance for that item and seed, whose problem differs from attempt 0

#### Scenario: Unreadable input counts for nothing
- **GIVEN** an open session on a number item
- **WHEN** it is answered with `two`
- **THEN** the attempt number, the open rungs and the outcome are unchanged

### Requirement: Rungs escalate in a fixed order
The ladder SHALL have three rungs in this order: hint, worked example, guided step-through. A wrong readable answer or a request for help SHALL open the next rung. A rung SHALL NOT be skipped, and an open rung SHALL NOT close while the session is open. A request when every rung is open SHALL change nothing. The order SHALL be read from the one config that holds `RETRY_CAP`. (FR-SCA-02, D9, D21)

#### Scenario: Escalation order is enforced
- **WHEN** any sequence of wrong answers and help requests is applied to an open session (property test)
- **THEN** after each action the open rungs are a prefix of hint, worked example, guided step-through, and that prefix never shrinks

#### Scenario: Wrong attempts escalate
- **WHEN** a question is answered wrongly three times
- **THEN** the hint is shown after the first, the worked example after the second, and the guided step-through after the third

#### Scenario: Order is enforced
- **WHEN** a question is shown before any answer
- **THEN** the worked example and step-through controls are not available until the hint has been opened

#### Scenario: Help on request before any answer
- **GIVEN** a fresh session
- **WHEN** help is requested
- **THEN** only the hint rung is open and the attempt number is still 0
- **AND** the next attempt record has `hintsUsed: 1`

#### Scenario: A wrong answer opens the next rung
- **GIVEN** an open session with the hint rung open from a request
- **WHEN** it is answered wrongly
- **THEN** the hint and worked-example rungs are open

#### Scenario: Nothing beyond the top rung
- **GIVEN** an open session with all three rungs open
- **WHEN** help is requested
- **THEN** the session is unchanged

#### Scenario: One place
- **WHEN** the source is scanned
- **THEN** the rung order is defined only in the config module

### Requirement: Hints used are recorded
Each readable answer SHALL produce an attempt record from the question model whose hints used equals the number of rungs open when the answer was given. (FR-ASM-05 groundwork, D21)

#### Scenario: Hints counted at answer time
- **GIVEN** a session where help was requested twice
- **WHEN** it is answered wrongly
- **THEN** the attempt record has `hintsUsed: 2` and passes the learner-state validator

#### Scenario: No help used
- **WHEN** a fresh session is answered correctly
- **THEN** the attempt record has `hintsUsed: 0` and `correct: true`

### Requirement: The hint matches the misconception
The hint rung SHALL show the hint for the misconception of the session's latest wrong answer. When there is none (help requested before any wrong answer, or a wrong answer with no misconception), it SHALL show the general hint for the item's sub-skill. Hint text SHALL be computed for the session's current instance. (FR-SCA-02) A hint SHALL point at what to look at next and SHALL NOT give the answer (checked under "Hint wording follows the content rules").

#### Scenario: Misconception hint
- **GIVEN** a wrong option tagged with a misconception
- **WHEN** the hint opens
- **THEN** it is that misconception's hint, built with the instance's engine values

#### Scenario: Matched hint
- **GIVEN** a balance-factor session answered with the negated answer
- **WHEN** the hint rung is read
- **THEN** it is the hint for the subtraction-order misconception, rendered for the attempt 1 instance

#### Scenario: General hint before any answer
- **GIVEN** a fresh session on any bank item
- **WHEN** help is requested and the hint rung is read
- **THEN** it is the general hint for the item's sub-skill

#### Scenario: General hint for an unrecognised wrong number
- **GIVEN** a number session answered with a wrong number that no misconception produces
- **WHEN** the hint rung is read
- **THEN** it is the general hint for the item's sub-skill

### Requirement: The worked example is a solved sibling problem
The worked-example rung SHALL show another instance of the same item: its problem, its figure if any, its correct answer computed by the engine, and the item's correct explanation for that instance. Its problem SHALL differ from the problem of every attempt the session can reach. (FR-SCA-02, D9, CLAUDE.md guardrail)

#### Scenario: Sibling differs from every attempt
- **GIVEN** any bank item and any seed from 0 to 99
- **WHEN** the worked example is built
- **THEN** its problem differs from the problems of attempts 0 to `RETRY_CAP` minus 1

#### Scenario: Answer from the engine
- **GIVEN** any bank item and any seed from 0 to 99
- **WHEN** the worked example is built
- **THEN** its answer equals the engine's answer for its problem and its explanation equals the item's correct explanation for that instance

#### Scenario: Deterministic
- **WHEN** the worked example is built twice for the same item and seed
- **THEN** the two are equal

### Requirement: The guided step-through walks the student's problem
The guided rung SHALL break the session's current problem (the last problem when the session is capped) into ordered steps. For a tree item the steps SHALL be the engine's insert trace for that problem. For any other item they SHALL be the sentences of the item's correct explanation for that problem, in order. (FR-SCA-02, D21) The steps SHALL be shown one at a time, with a control to show the next step. (FR-SCA-02, D21)

#### Scenario: Tree items follow the trace
- **GIVEN** an insert-final-tree session at any seed from 0 to 99
- **WHEN** the guided steps are built
- **THEN** there is one step per step of the instance's trace, in the same order

#### Scenario: Other items follow the explanation
- **GIVEN** any non-tree bank item and any seed from 0 to 99
- **WHEN** the guided steps are built
- **THEN** there is at least one step, no step is empty, and the steps joined with single spaces equal the correct explanation

#### Scenario: One step at a time
- **WHEN** the step-through opens
- **THEN** only the first step shows, and each press of "Show next step" adds one, until the answer shows and the control is gone
### Requirement: Retries are capped
After `RETRY_CAP` (3) wrong readable answers the session SHALL close as capped. A capped session SHALL have every rung open, SHALL hold a drafted lecture question, and SHALL let the student continue. A closed session SHALL ignore further answers and requests. (FR-SCA-03, D9)

#### Scenario: Cap reached
- **GIVEN** any bank item and any seed from 0 to 99
- **WHEN** a session is answered wrongly 3 times
- **THEN** it is capped at attempt 2, all three rungs are open, it holds a lecture question, and continuing is offered

#### Scenario: No loop without an exit
- **WHEN** any sequence of answers and help requests (property test) is applied to a session
- **THEN** after at most `RETRY_CAP` readable answers the session is closed as correct or capped, and no fourth readable answer is marked

#### Scenario: Correct on the last try
- **GIVEN** a session after 2 wrong answers
- **WHEN** it is answered correctly
- **THEN** it is closed as correct and holds no lecture question

### Requirement: The lecture question is drafted
At the cap the session SHALL draft a lecture question holding the item ID, the module, the time, the last misconception if any, and a text built from that misconception's catalogue label and the stem of the last problem (only the stem when there is no misconception). The draft SHALL be in the shape the learner state stores. (FR-SCA-03, C9)

#### Scenario: Draft names the misconception and the problem
- **GIVEN** a balance-factor session whose third wrong answer is the negated answer
- **WHEN** the draft is read
- **THEN** its text contains the subtraction-order misconception's label and the attempt 2 stem, it carries that misconception, and adding it to a learner state passes the learner-state validator

#### Scenario: Draft without a misconception
- **GIVEN** a number session whose third wrong answer no misconception produces
- **WHEN** the draft is read
- **THEN** its text contains the attempt 2 stem and it has no misconception

### Requirement: Every misconception and sub-skill has a scaffold
Every misconception in the catalogue SHALL have a hint, and every sub-skill SHALL have a general hint. Each hint SHALL be marked `beyond ID`. The bank validator SHALL report any missing hint. (FR-SCA-02, SE 7.1 content validation)

#### Scenario: Full coverage
- **WHEN** the validator runs over the bank and scaffolds
- **THEN** it reports no missing hint, and every hint is marked `beyond ID`

#### Scenario: Missing hint is caught
- **GIVEN** a catalogue with a misconception that has no hint
- **WHEN** the validator runs
- **THEN** it reports a scaffold problem naming that misconception

### Requirement: Hint wording follows the content rules
For every bank item and seed from 0 to 99, each hint that can be shown for that item SHALL show only numbers from the instance, SHALL state no formula, sign, lean or case name except through the conventions module, SHALL contain no placeholder such as `undefined` or `NaN`, and SHALL NOT state the answer. (D19, D27, CLAUDE.md guardrail)

#### Scenario: Hints are clean over the bank
- **WHEN** the validator renders every reachable hint for every bank item over seeds 0 to 99
- **THEN** it reports no wording, number, placeholder or answer problem

#### Scenario: A hint that gives the answer is caught
- **GIVEN** a hint that includes the correct option's text of a choice item
- **WHEN** the validator runs
- **THEN** it reports an answer problem naming the hint

#### Scenario: Reversed conventions
- **GIVEN** the conventions module with the balance-factor sign reversed
- **WHEN** every hint is rendered for the balance-factor item
- **THEN** each hint's formula and lean wording follows the reversed convention

#### Scenario: Calm wording
- **WHEN** every hint and the lecture-question template are rendered over the bank
- **THEN** none contains "wrong", "fail" or "incorrect" (D27)

### Requirement: Calm and accessible
The ladder SHALL be wrapped in a labelled region, SHALL announce each level opened in a polite live region, SHALL use no red, cross or "wrong"/"fail" wording, and its controls SHALL be at least 44 by 44 px. (D27, NFR accessibility)

#### Scenario: Axe and targets
- **WHEN** a question with each level open is rendered
- **THEN** axe reports no violations and each control is at least 44 by 44 px

#### Scenario: Wording scan
- **WHEN** the ladder wording is scanned
- **THEN** it contains none of a cross glyph, "wrong", "incorrect", "fail" or "red"
