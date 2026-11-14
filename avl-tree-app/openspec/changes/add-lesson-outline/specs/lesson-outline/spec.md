# Spec Delta

## Purpose

Shows every lesson's screens together, grouped by phase, so students see where they have been, where they are and where they are going, and can move to an open screen directly without passing an unfinished check.

## ADDED Requirements

### Requirement: The outline lists the lesson's screens
Every lesson on the lesson player SHALL show an outline: a navigation landmark labelled "Lesson outline" listing the lesson's screens by title, in lesson order, under the phase word of each run of screens with the same Merrill phase. (ID 8.3 "revealed structure")

#### Scenario: C3 outline
- **WHEN** C3 is opened
- **THEN** the outline lists its 13 screen titles in order, under the headings Problem, Recall, Learn, Practise and Check and summary

#### Scenario: A phase twice
- **WHEN** C6 is opened
- **THEN** "Learn" appears twice in the outline, because C6 returns to an example after its practice

### Requirement: The outline marks where the student is
The current screen SHALL be marked "You are here" with `aria-current="step"`, screens already seen SHALL be marked "Done", and screens that cannot be opened yet SHALL be marked "Not yet open". The marks SHALL be words, never colour alone. (ID 8.3 "where have I been, where am I, where am I going", ID 11.1)

#### Scenario: Marks after two screens
- **WHEN** C3 is moved to its third screen
- **THEN** the first two read Done, the third reads You are here and has `aria-current="step"`

### Requirement: Moving with the outline
Choosing an open screen in the outline SHALL show it, with focus on its heading, as Next and Back do. Every screen before the current one SHALL be open. Screens after it SHALL be open up to and including the first check or question-set screen that is not finished; screens beyond that SHALL NOT be open until it is finished. (ID 8.2, D20)

#### Scenario: Back to any screen
- **GIVEN** C3 at its eighth screen
- **WHEN** "Height" is chosen in the outline
- **THEN** screen 4, "Height", is shown and its heading has focus

#### Scenario: Not past an unfinished check
- **GIVEN** C3 at its first screen with its check unfinished
- **WHEN** the outline is read
- **THEN** "Lesson check" can be opened and "Summary" reads Not yet open and cannot be chosen

#### Scenario: Open after the check
- **GIVEN** C3's check finished
- **WHEN** the outline is read
- **THEN** "Summary" can be opened

### Requirement: Outline placement
At a viewport of 960 px or wider the outline SHALL sit beside the lesson frame; narrower, it SHALL be a disclosure above the frame, closed by default, labelled "Lesson outline" with the screen count. The page SHALL have no horizontal scroll at 360 px. (ID 8.3, D3)

#### Scenario: Narrow
- **WHEN** a lesson is shown at 360 px
- **THEN** the outline is a closed disclosure above the frame and the page has no horizontal scroll

#### Scenario: Wide
- **WHEN** a lesson is shown at 1280 px
- **THEN** the outline and the frame sit side by side

### Requirement: The outline is accessible
The outline SHALL be reachable and usable by keyboard alone, every entry SHALL be at least 44 px high, and axe SHALL report no violations with the outline open or closed. (NFR-02)

#### Scenario: Axe and keyboard
- **WHEN** the outline is opened and an entry is chosen with Enter
- **THEN** that screen is shown, and axe reports no violations before and after
