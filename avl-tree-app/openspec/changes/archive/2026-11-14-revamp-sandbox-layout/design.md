# Design

## Context

See proposal.md for why. `src/pages/Sandbox.tsx` renders one `.screen-stack` column, in this order: heading, intro, `InsertControl` (form row with field, Insert and Delete; a row of Sorted, Random and Clear; the notice), `RebalanceSwitch`, `TreeStats`, the `TreeView` (or the empty line), the replay toggle and player, `EventLog`, and the back link. The buttons are `module-button`s.

The shared controls from `revamp-tree-controls` (`ControlBar`, `ControlButton`, `KeyboardHelp`, `shortcuts.ts`) and `BREAKPOINTS` in `src/ui/breakpoints.ts` already exist. The sandbox reducer, statistics and log are unchanged.

## Goals / Non-Goals

**Goals:**
- Rearrange the existing parts into two columns and named sections, and move the buttons onto the control bar.

**Non-Goals:**
- Changing the reducer, the content of messages or the statistics.
- Adding a primary button.

## Decisions

### 1. One grid, tree first in the DOM (D140)

`Sandbox.tsx` wraps the content in `.sandbox-layout`, with two children:
- `.sandbox-tree-col`: the tree or the empty line, the "What happened" section, then the replay;
- `.sandbox-control-col`: three sections, then keyboard help.

"What happened" sits under the tree so each result appears beside the change it describes (user, 14 Nov). Its log scrolls in its own box (`max-height: 16rem`, `overflow-y: auto`, `tabindex="0"`), so on a phone a long log does not push the controls far down. From 768 px the columns are `--space-8` apart, which gives the tree box room on its left.

Below 768 px `.sandbox-layout` is a flex column. From `BREAKPOINTS.tablet` it is a grid with `grid-template-columns: minmax(18rem, 2fr) minmax(0, 3fr)`: balanced two to three, so the controls do not look squashed (user, 14 Nov). `.sandbox-control-col` is placed with `grid-column: 1; grid-row: 1`, and `.sandbox-tree-col` with `grid-column: 2; grid-row: 1`. The 768 value is written in `sandbox.css` and checked against `BREAKPOINTS.tablet` by a test, the same way the editor's menu rule is checked.

The app shell caps `.app-main` at the reading column (66ch), which leaves the tree about 300 px beside a 330 px column. From 768 px `sandbox.css` widens it for this page only, with `.app-main:has(.sandbox-layout) { max-width: min(100%, 75rem) }`, so both columns have room and neither stretches on a very wide screen. Other screens keep the reading column.

*Alternative:* control column first in the DOM. This was rejected because it breaks D136 and puts six controls before the tree on a phone.

### 2. Sections are small wrappers with headings (D141)

`SandboxSection` (`src/ui/sandbox/SandboxSection.tsx`) is a `<section aria-labelledby>` with an `<h2>`. `TreeStats` and `EventLog` drop their own outer `section` and their `aria-label`, and render inside a section instead. `EventLog` keeps `role="log"` on its list container, so the live region is unchanged. `RebalanceSwitch` goes in "Rebalancing". The `InsertControl` form and its notice go in "Change the tree".

### 3. `InsertControl` on the control bar

`InsertControl` keeps its props. The field row stays a `<form>` (label and input) so Enter submits. Below the row is a `ControlBar` with five `ControlButton`s:
- Insert calls `submit` directly, because the button is no longer the form's submit;
- Delete;
- "Insert 1 to 7 in order";
- Random key;
- Clear, which is quiet.

Unavailable at the cap means `disabled` on `ControlButton`, which renders `aria-disabled` (D137). The icons come from `controlsCopy.icons` (＋ insert, − delete), and the rest have no icon.

### 4. Registry entries for the sandbox

`treeMove`, `treeSelect` and `barMove` add `'sandbox'` to their screens. A new `fieldInsert` entry has `aria: 'Enter'`, caps "Enter (in the key field)" and the action "Insert the key in the field". Its `match` is empty, because the form handles Enter itself. `KeyboardHelp` is given `shortcutsFor('sandbox')`.

### Decision rows

| ID | Topic | Decision |
| --- | --- | --- |
| D140 | Sandbox layout | Two columns from 768 px (`BREAKPOINTS.tablet`): controls left and tree right, two to three, controls at least 18rem, page at most 75rem; one column below, tree first. The tree column comes first in the DOM, keeping D136. The sandbox widens the reading column to 75rem from 768 px. User choice (14 Nov), wireframe 1n. |
| D141 | Sandbox sections | The control column has named sections with h2 headings: "Change the tree", "Rebalancing", "Numbers", then keyboard help. The tree column holds the tree, "Describe tree", "What happened" (in its own scrolling box) and "Replay last insert". |

## Risks / Trade-offs

- [On a wide screen, Tab reaches the tree before the controls on its left (visual and DOM order differ)] → The order is still meaningful (main representation, then its controls), the headings let screen-reader users jump, and the a11y-checker reviews it in task 3.3. Swapping the two children in the DOM is the fallback.
- [The control column can be taller than the tree] → The column scrolls with the page, and the tree column is `align-self: start`, so a short tree is not stretched.
- [Tests use the old `toBeDisabled()` and section labels] → Updated in the red-test task, following the modified scenarios.

## Migration Plan

No data migration. Rollback is reverting the change.
