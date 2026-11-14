## MODIFIED Requirements

### Requirement: Controls work by touch and pointer
Every control SHALL be a native button with a text label (a glyph alone is not a label) and a target of at least 44 by 44 px. The current speed SHALL be exposed as pressed. (FR-VIS-03, FR-VIS-10, NFR-02)

#### Scenario: Targets and labels
- **WHEN** the controls are rendered
- **THEN** each button has a text accessible name (Back, Play or Pause, Step, Replay, 0.5×, 1×, 2×) and is at least 44 px high and wide, the selected speed has `aria-pressed="true"`, and the player has no axe violations

### Requirement: Controls work by keyboard
While focus is inside the player, Space SHALL toggle Play and Pause, "[" SHALL choose the next slower speed and "]" the next faster one. Left Arrow SHALL step back and Right Arrow SHALL step forward, except while focus is inside the tree's scroll box (`.tree-scroll`), where the arrows SHALL keep their default behaviour (scrolling a wide tree, D17) and SHALL NOT step. These keys SHALL do nothing when focus is outside the player or when Ctrl, Alt or Meta is held. (FR-VIS-03, NFR-02, WCAG 2.1.4, review C5)

#### Scenario: Keyboard only
- **GIVEN** focus is on a control inside the player at position 0
- **WHEN** the student presses Right Arrow twice, Left Arrow once and "]"
- **THEN** the position is 1 and 2× is selected
- **AND WHEN** Space is pressed **THEN** playback starts, and Space again pauses it, with one toggle per key press

#### Scenario: Keys are scoped
- **GIVEN** focus is outside the player
- **WHEN** Right Arrow or Space is pressed
- **THEN** the position and playback do not change

#### Scenario: Arrows scroll the tree box (review C5)
- **GIVEN** focus is on the tree's scroll box at position 0
- **WHEN** the student presses Right Arrow and Left Arrow
- **THEN** the position stays 0 and neither key event is default-prevented
- **AND WHEN** Space is pressed there **THEN** playback starts

### Requirement: A sentence for each step
The player SHALL show one sentence for the current position in the caption under the tree. The caption is the player's only polite live region that holds text, and it SHALL update on every position change. Position 0 SHALL say which operation and key are about to run. Each other position SHALL describe step p from its kind and keys. Imbalance and rotation sentences SHALL name the case, using the conventions wording. (FR-VIS-07, D19, D23, wireframe 1f note 4)

#### Scenario: Imbalance sentence uses the engine's numbers
- **GIVEN** the 9-step insert of 10 into 30 with left child 20
- **WHEN** the replay is at position 8
- **THEN** the caption names node 30, balance factor +2, the taller child 20 and the case name `conventionsWording().caseName('LL')`

#### Scenario: Live region updates
- **WHEN** the student steps forward
- **THEN** the caption, which is the only element in the player with `aria-live="polite"`, holds the sentence for the new position

### Requirement: Player layout and phones
The player SHALL place its parts in this reading order:
1. the representation switcher, when the player hosts it;
2. the tree;
3. the caption;
4. the step controls;
5. the pseudocode panel, when shown;
6. the whole-tree text, when shown.

The player SHALL fit the Watch slot of the mode switch, and SHALL work at 360 px wide without the page scrolling sideways (the tree keeps its own scroll region). Its stylesheet SHALL use `tokens.css` variables only and SHALL NOT override the focus style. (FR-VIS-10, NFR-02, D3, D17, D23)

#### Scenario: Reading order
- **WHEN** the player is rendered with representations and every box ticked
- **THEN** in DOM order the switcher comes before the tree region, the tree before the caption, the caption before the controls, the controls before the pseudocode panel, and the panel before the whole-tree text

#### Scenario: Tokens only
- **WHEN** the replay stylesheet is scanned
- **THEN** every colour, size and radius is a `var(--…)` from `tokens.css` and no rule sets `outline` on `:focus` or `:focus-visible`

#### Scenario: In the Watch slot
- **GIVEN** the mode switch with the player as its Watch content
- **WHEN** Watch is selected
- **THEN** the player's controls are shown, and the page has no axe violations
