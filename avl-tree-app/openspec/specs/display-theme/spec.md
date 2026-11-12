# display-theme Specification

## Purpose
Lets the student switch the whole app between the light and dark themes from the Aa menu, keeps the choice across reloads as a setting, and keeps both themes complete and contrast-checked.

## Requirements

### Requirement: Light by default
With no stored choice, the app SHALL render in the light theme whatever the operating-system setting is. The `<html>` element SHALL always carry `data-theme`, set to `light` or `dark`, so the operating-system dark block in the tokens never applies. (Proposal item 2, NFR-02)

#### Scenario: First visit
- **GIVEN** no stored settings
- **WHEN** the app boots
- **THEN** `<html>` has `data-theme="light"`

#### Scenario: Static default
- **WHEN** `index.html` is read
- **THEN** the `<html>` element has `data-theme="light"`

### Requirement: Dark theme switch
The Aa menu panel SHALL contain a switch named "Dark theme" that is off in the light theme and on in the dark theme. Turning it on or off SHALL change `data-theme` on `<html>` at once, for every screen. It SHALL work by click, by Space and by touch, and have a target of at least 44 by 44 px. (D3, FR-VIS-10, NFR-02)

#### Scenario: Turn dark on and off
- **GIVEN** the light theme and the Aa panel open
- **WHEN** the learner activates the "Dark theme" switch
- **THEN** the switch reports checked, `<html>` has `data-theme="dark"`
- **AND** activating it again reports unchecked and sets `data-theme="light"`

#### Scenario: Keyboard
- **GIVEN** the Aa panel open
- **WHEN** the learner tabs to the switch and presses Space
- **THEN** the theme changes and focus stays on the switch

#### Scenario: Applies across screens
- **GIVEN** the dark theme chosen on the start screen
- **WHEN** the learner navigates to a module screen
- **THEN** `<html>` still has `data-theme="dark"` and the switch, reopened, reports checked

#### Scenario: Accessible in both states
- **WHEN** axe runs with the Aa panel open, once with the switch off and once on
- **THEN** it reports no violations

### Requirement: The choice is kept as a setting
The theme choice SHALL be stored under one app-prefixed settings key through the storage adapter module only, and SHALL be applied before the first render on later visits. A stored value that is missing, unreadable or not a known theme SHALL mean light and SHALL NOT stop the app. When storage is unavailable, the switch SHALL still work for the session. (D16, NFR-05)

#### Scenario: Restored before render
- **GIVEN** the dark theme was chosen and saved
- **WHEN** the app boots again
- **THEN** `<html>` has `data-theme="dark"` before the first React render

#### Scenario: Bad value
- **GIVEN** the settings key holds `{"theme":"purple"}`, or text that is not JSON
- **WHEN** the app boots
- **THEN** `<html>` has `data-theme="light"` and the app renders its start screen

#### Scenario: Storage unavailable
- **GIVEN** a storage backend whose every call throws
- **WHEN** the learner turns the dark theme on
- **THEN** `<html>` has `data-theme="dark"` and no error is shown or thrown

#### Scenario: Only the switch writes
- **WHEN** the Aa menu is opened and closed without using the switch
- **THEN** storage is unchanged

### Requirement: The settings key is inventoried
The stored-data inventory SHALL list the settings key with a plain-language description, and the key SHALL hold only the theme. (NFR-05, FR-ONB-05 groundwork)

#### Scenario: Listed and minimal
- **WHEN** the theme is saved and the backend is read
- **THEN** every key written is in the inventory with a non-empty description, and the settings value parses to an object whose only field is `theme`

### Requirement: Reset returns to light
Resetting stored data SHALL remove the settings key and SHALL switch the app back to the light theme at once. (FR-ONB-04)

#### Scenario: Reset while dark
- **GIVEN** the dark theme chosen and saved
- **WHEN** the learner confirms reset
- **THEN** `<html>` has `data-theme="light"` and the settings key is gone

### Requirement: Dark tokens are complete
Every colour token defined for the light theme SHALL also have a dark value. A dark value the design system does not state SHALL be one of the existing dark token values, set in one block marked as assumed, so a design import replaces it in one place. (Proposal item 3, D18, CLAUDE.md "do not invent styles")

#### Scenario: Parity
- **WHEN** the colour variables of the light `:root` block and of the `[data-theme='dark']` rules are compared
- **THEN** every light colour variable has a dark value

#### Scenario: Assumed values reuse the palette
- **WHEN** the assumed dark block is read
- **THEN** it sets exactly the nine gap tokens, each to a colour value that another dark token already has

### Requirement: Both themes meet contrast
Every dark text, icon, border and focus pair that has a light counterpart SHALL meet the same WCAG 2.2 AA ratio as in light, including the feedback panels, disabled text, pressed buttons and the neutral tree ring. (NFR-02, D25)

#### Scenario: Dark pairs
- **WHEN** the contrast test runs on the dark theme
- **THEN** text on the That's-right and Not-quite-yet panels meets 4.5:1, their icons and borders meet 3:1, disabled text on disabled background meets 4.5:1, surface text on the pressed button meets 4.5:1, and the neutral ring on the surface meets 3:1

#### Scenario: Light unchanged
- **WHEN** the contrast test runs on the light theme
- **THEN** every existing light pair still meets its ratio
