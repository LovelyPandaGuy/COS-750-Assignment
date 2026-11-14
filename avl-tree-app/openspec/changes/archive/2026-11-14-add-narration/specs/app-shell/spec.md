# app-shell (delta)

## MODIFIED Requirements

### Requirement: Aa menu stub
The TopBar SHALL contain an Aa button that opens and closes a small panel of display settings. The panel SHALL hold the "Dark theme" switch (capability `display-theme`) and the display settings (capability `display-settings`), including the narration switch. It SHALL NOT show a placeholder line saying read-aloud comes later, because narration is built (add-narration, D145). The button SHALL have a 44 px target, an accessible name that is more than "Aa", and `aria-expanded` and `aria-controls`. (Wireframes 1b to 1o; NFR-02, FR-VIS-10, D26)

#### Scenario: Button name and state
- **WHEN** `App` renders
- **THEN** a button named "Display and read-aloud settings" exists, its visible text is "Aa", `aria-expanded` is `false`, and the panel is not in the accessibility tree

#### Scenario: Open by pointer or keyboard
- **WHEN** the button is activated by click, then separately by Enter and by Space
- **THEN** `aria-expanded` becomes `true` and the panel is visible with the "Dark theme" switch and the display settings, and no "later update" line

#### Scenario: Close with Escape
- **GIVEN** the panel is open and focus is inside it or on the button
- **WHEN** Escape is pressed
- **THEN** the panel closes and focus is on the Aa button

#### Scenario: Close by activating again or clicking outside
- **GIVEN** the panel is open
- **WHEN** the button is activated again, or a click lands outside the panel
- **THEN** the panel closes

#### Scenario: Nothing is stored or fetched
- **WHEN** the menu is opened and closed without using the switch
- **THEN** `localStorage` is unchanged and no network request is made (NFR-05, CLAUDE.md guardrails)

#### Scenario: Stub copy is content
- **WHEN** the component source is read
- **THEN** the button name and the switch labels come from `src/content/`, not from the component

#### Scenario: Accessible when open
- **WHEN** the panel is open
- **THEN** axe reports no violations
