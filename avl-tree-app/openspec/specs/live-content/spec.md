# live-content Specification

## Purpose
Loads the app's learning content from `src/live_content/` through one typed loader, in the order the manifest gives, and validates it against the ID's content rules and the engine before any lesson is shown, so bad or missing content is reported clearly instead of reaching a student.

## Requirements

### Requirement: Content is loaded in manifest order
The system SHALL load every file named in `src/live_content/manifest.json`, at build time, in the order of its `files` list, and SHALL order the lessons C1 to C9 by that list. (ID 7.1, ID 12)

#### Scenario: Lesson order
- **WHEN** the content is loaded
- **THEN** the lessons are C1, C2, C3, C4, C5, C6, C7, C8, C9 in that order, each with the title, objectives and screens of its lesson file

#### Scenario: Order follows the manifest
- **GIVEN** a manifest whose `files` list names `lessons/c3.json` before `lessons/c2.json`
- **WHEN** that content is loaded
- **THEN** C3 comes before C2 in the loaded lessons

### Requirement: One loader for all lesson content
The lesson player, its blocks and the module screen SHALL get lesson content only from the loader. No source file outside the loader SHALL import a file under `src/live_content/`, and no lesson text, tree or step list SHALL be written in a source file. (ID 12, user request 13 Nov)

#### Scenario: No other importer
- **WHEN** every source file under `src/` is scanned
- **THEN** only the loader's files import from `src/live_content/`

#### Scenario: No mock lesson content left
- **WHEN** `src/` is scanned after this change
- **THEN** no module content record for C2 to C8 exists outside `src/live_content/`

### Requirement: Missing and unlisted files are errors
A file named in the manifest that does not exist, and a JSON file under `src/live_content/` that the manifest does not name, SHALL each be a content error naming the file. (ID 12.1)

#### Scenario: Missing file
- **GIVEN** a manifest naming `lessons/c5.json` and no such file
- **WHEN** the content is validated
- **THEN** there is a content error naming `lessons/c5.json` as missing

#### Scenario: Unlisted file
- **GIVEN** a file `lessons/c10.json` that the manifest does not name
- **WHEN** the content is validated
- **THEN** there is a content error naming `lessons/c10.json` as not in the manifest

### Requirement: Structure is validated per file
Each file SHALL be checked against its typed structure: required fields present, field types right, enumerated values (screen types, question types, representations, Merrill phases, Bloom levels, confidence and band names) known, and every `id` unique across all files. Each problem SHALL be a content error naming the file, the item id and the field. (ID 12.2)

#### Scenario: Missing field
- **GIVEN** a lesson screen without `merrillPhase`
- **WHEN** the content is validated
- **THEN** there is a content error naming the lesson file, the screen id and `merrillPhase`

#### Scenario: Unknown screen type
- **GIVEN** a lesson screen whose `type` is `carousel`
- **WHEN** the content is validated
- **THEN** there is a content error naming the screen id and the unknown type

#### Scenario: Duplicate id
- **GIVEN** two questions with the id `chk4-01`
- **WHEN** the content is validated
- **THEN** there is a content error naming `chk4-01` and both files

#### Scenario: The shipped content is valid
- **WHEN** the content in `src/live_content/` is validated
- **THEN** there are no content errors

### Requirement: References are validated
Every reference SHALL resolve: a lesson's `checkId` to a check, a check's question, review and challenge ids to questions, a question's `misconceptionId` (on an option or a wrong answer) to a misconception, a question's `subSkill` to a scaffold (C1 prerequisite sub-skills excepted, ID 7.2), a `concept` to a concept in `conventions.json`, and each concept's `screen` to a lesson screen. A dangling reference SHALL be a content error. (ID 12.1, 12.2)

#### Scenario: Dangling misconception
- **GIVEN** an option whose `misconceptionId` is `misc-none`
- **WHEN** the content is validated
- **THEN** there is a content error naming the question, the option and `misc-none`

#### Scenario: Wrong option without a misconception
- **GIVEN** a multiple-choice question with a wrong option that has no `misconceptionId`
- **WHEN** the content is validated
- **THEN** there is a content error naming the question and the option (ID 9.5)

### Requirement: Lesson structure is validated
Every lesson screen SHALL carry a Gagné event (1 to 9, or a list of them) and a Merrill phase that agree with the ID's table (problem: 1 and 2; activation: 3; demonstration: 4 and 5; application: 6 and 7; integration: 8 and 9). Lessons C2 to C8 SHALL each have an objectives screen and a summary screen, and the summary SHALL be the last screen. A disagreement SHALL be a content error. (ID 3.2, ID 12.2)

#### Scenario: Event and phase disagree
- **GIVEN** a screen with Gagné event 4 and Merrill phase `application`
- **WHEN** the content is validated
- **THEN** there is a content error naming the screen

#### Scenario: Summary not last
- **GIVEN** a lesson whose summary screen is followed by another screen
- **WHEN** the content is validated
- **THEN** there is a content error naming the lesson

### Requirement: Objectives and Bloom levels are validated
Every question and practice task SHALL name an objective (LO1 to LO7, or PRE for the prerequisites), criteria numbered within that objective's or its `relatedOutcomes`' criteria counts (ID 5.2), and a Bloom level ID 5.1 allows for the objective (any known level for PRE). A lesson's `outcomeIds` SHALL match ID 7.1. A mismatch SHALL be a content error. (ID 5.1, 5.2, 7.1, 12.2, 12.4)

#### Scenario: Criterion out of range
- **GIVEN** a question with `outcomeId` LO2 and criteria `LO2.3`
- **WHEN** the content is validated
- **THEN** there is a content error, because LO2 has two criteria

#### Scenario: Level does not match the objective
- **GIVEN** a question for LO6 with level `apply`
- **WHEN** the content is validated
- **THEN** there is a content error, because LO6 is at the Evaluate level

#### Scenario: Lesson objective
- **WHEN** the shipped content is validated
- **THEN** C2 has LO1, C3 LO2, C4 LO3, C5 LO4, C6 LO5, C7 LO7 and C8 LO6

### Requirement: Trees are insertion sequences of one key type
Every tree SHALL be an insertion sequence (`insert`, with optional `rebalance`, default true) or, only for a tree no insertion can build (one that is not a BST, or a student's result to judge), an explicit `structure` of `[key, left, right]` lists. Its keys SHALL be all integers or all capital letters, with no repeats. A tree that mixes key types, repeats a key or has neither form SHALL be a content error. (ID 12.2, `conventions.keys`)

#### Scenario: Mixed keys
- **GIVEN** a tree `{ "insert": [10, "A"] }`
- **WHEN** the content is validated
- **THEN** there is a content error naming the item and the tree

#### Scenario: A tree that is not a BST
- **WHEN** `dia-02` (whose tree `{ "structure": [8, [4, [2], [9]], [12, [10], [14]]] }` is not a BST) is validated
- **THEN** there is no content error, and the tree is drawn with 9 as the right child of 4

### Requirement: Typed answers agree with the engine
For every item that stores an answer (`expected` values and nodes, an animation's `steps` and `result`, including its `compareWith`, and a predict screen's `answer` when `answerFrom` is `engine`), the engine SHALL work it out from the item's tree and operation, and a stored value that differs SHALL be a content error naming the item and both values. The app SHALL show the engine's value, never the typed one. (ID 12.2)

#### Scenario: Balance factors agree
- **WHEN** the shipped content is validated
- **THEN** every stored balance factor and height equals the engine's value under h(right) − h(left)

#### Scenario: A wrong typed value is reported
- **GIVEN** a copy of `c3-s11` whose `expected` is `[-4]`
- **WHEN** it is validated
- **THEN** there is a content error naming `c3-s11-task`, the stored value −4 and the engine value 4

#### Scenario: Animation steps agree
- **GIVEN** the screen `c4-s04` (search for 30 in the AVL tree from 10, 20, 30, 40, 50)
- **WHEN** it is validated
- **THEN** the engine's captions are "30 > 20: go right.", "30 < 40: go left." and "30 = 30: found." and its result shape is `20(10, 40(30, 50))`, equal to the stored ones

### Requirement: Content errors are shown on one screen
When validation reports any content error, the app SHALL show a "Content problem" screen instead of a lesson. It SHALL list every error with its file, item id, field and a plain sentence, in a level-1 heading and a list readable by assistive technology. The rest of the shell (top bar, theme, sidebar, and the link back to the current lesson) SHALL keep working. (User request 13 Nov, NFR-02, D159)

#### Scenario: Error screen
- **GIVEN** content with two errors
- **WHEN** a lesson is opened
- **THEN** a "Content problem" heading and a list of two items are shown, each naming its file and item id, and no lesson screen is shown

#### Scenario: Error screen is accessible
- **WHEN** the error screen is rendered
- **THEN** axe reports no violations
