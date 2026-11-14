# Spec Delta

## Purpose

One set of controls for the tree screens: a control bar that sits in the same place with the same order and keyboard behaviour, control buttons in the design system's style, and keyboard help listing the shortcuts from one registry.

## ADDED Requirements

### Requirement: The control bar
A tree screen's controls SHALL be one `ControlBar` with `role="toolbar"` and an accessible name, placed directly below the tree region. Its buttons SHALL appear in the order: main action, other actions, undo and reset. It SHALL wrap onto more lines rather than cause a horizontal page scroll. (ID 8.3, D136, wireframes 1f, 1h)

#### Scenario: Below the tree
- **WHEN** a screen with a tree and a control bar is rendered
- **THEN** the control bar follows the tree region in the DOM

#### Scenario: Group order
- **WHEN** a control bar with a main action, one other action, Undo and Reset is rendered
- **THEN** its buttons appear in that order

#### Scenario: Wraps on a phone
- **WHEN** the controls stylesheet is read
- **THEN** the control bar uses `flex-wrap: wrap` and sets no fixed width

### Requirement: The control bar is one tab stop
The control bar SHALL have exactly one button in the tab order: the last one focused in the bar, otherwise the first. Left and Right SHALL move focus to the previous and next button, wrapping at the ends, and Home and End to the first and last. Disabled buttons SHALL stay focusable (`aria-disabled`) and SHALL not act. (WAI-ARIA toolbar pattern, ID 11.2, D137)

#### Scenario: One tab stop
- **WHEN** a control bar with four buttons is rendered
- **THEN** exactly one of them has tabindex 0

#### Scenario: Arrow keys
- **GIVEN** focus on the first of four buttons
- **WHEN** Right, Right, Left, End and Home are pressed
- **THEN** focus is on the second, third, second, fourth and first button

#### Scenario: Disabled stays focusable
- **WHEN** focus moves onto a disabled Undo and Enter is pressed
- **THEN** Undo has focus and `aria-disabled="true"`, and nothing is undone

### Requirement: Control buttons follow the design system
Every control in a control bar or rotation menu SHALL be the design-system `Button`: secondary for actions, quiet for undo and reset, never primary. It SHALL show an icon hidden from assistive technology before its label and, when it has a shortcut, a key cap. A toggled control SHALL set `aria-pressed` and show the pressed look, not colour alone. Every control SHALL be at least 44 px. (Design system section 04, D41, D139, NFR-02)

#### Scenario: Base button classes
- **WHEN** the editor's control bar is rendered
- **THEN** every button has the base `btn` class with `btn-secondary` or `btn-quiet`, and none has `btn-primary`, `module-button` or `practice-button`

#### Scenario: Icon and key cap
- **WHEN** "Rotate right at 40" is rendered
- **THEN** its accessible name is "Rotate right at 40", it contains an aria-hidden icon and a `kbd` key cap "R", and it has `aria-keyshortcuts="R"`

#### Scenario: Pressed is not colour alone
- **WHEN** Place is toggled on
- **THEN** it has `aria-pressed="true"`, and its stylesheet rule changes the border style as well as the background

### Requirement: One shortcut registry
Every keyboard shortcut of a tree screen SHALL be defined once, with its keys, its action wording and the screens it belongs to. A control's `aria-keyshortcuts` and `KeyboardHelp`'s list SHALL both come from that registry. (D138, ID 11.2)

#### Scenario: Buttons and help agree
- **WHEN** the editor is rendered with keyboard help open
- **THEN** every `aria-keyshortcuts` value in the editor appears in the help list, with the same action wording as the registry

#### Scenario: Step keys are registered
- **WHEN** the registry is read
- **THEN** it has entries for Space, Left and Right, and the bracket keys for the step-controls screens, as wireframe 1f lists them

### Requirement: Keyboard help
`KeyboardHelp` SHALL be a disclosure button, "Show keyboard shortcuts", closed by default, that shows the heading "Keyboard shortcuts" and a list of key and action pairs for the screen it is on, from the registry. Keys SHALL be written as key caps with a text name. (Wireframes 1h, 1m; ID 11.2; FR-VIS-10)

#### Scenario: Closed by default
- **WHEN** the editor is rendered
- **THEN** "Show keyboard shortcuts" has `aria-expanded="false"` and the list is hidden

#### Scenario: The editor's keys
- **WHEN** it is opened on the editor
- **THEN** it lists the tree's arrow keys and Enter, R, L, Esc and Ctrl+Z with their actions, and no step-control key

### Requirement: Controls are accessible
The control bar, its buttons and keyboard help SHALL have no axe violations, closed and open, at every width, and SHALL be usable by keyboard alone. (NFR-02, ID 11)

#### Scenario: Axe
- **WHEN** the editor is rendered with keyboard help closed, then open, then with a node selected
- **THEN** axe reports no violations in any state
