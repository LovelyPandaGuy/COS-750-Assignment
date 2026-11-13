# Spec Delta

## ADDED Requirements

### Requirement: Hidden balance factors for practice
`TreeView` SHALL accept a hidden-balance mode with an optional list of revealed keys. In that mode, every node not revealed SHALL show its height and "bf ?" instead of its balance factor, and SHALL NOT show the Unbalanced flag. Its text description sentence and its accessible name SHALL say the balance factor is hidden and SHALL NOT say "unbalanced". Revealed nodes SHALL be drawn and described as usual. Wording comes from `src/content/treeView.ts`. (C3 practice, FR-VIS-07)

#### Scenario: Nothing leaks
- **GIVEN** the plain BST from 30, 20, 10 in hidden-balance mode with no revealed keys
- **WHEN** it is rendered and described
- **THEN** no node shows a balance factor number or "Unbalanced", the description contains no balance factor number and not "unbalanced", and each node still shows its height

#### Scenario: Revealed node
- **GIVEN** the same tree with key 30 revealed
- **WHEN** it is rendered
- **THEN** node 30 shows "h2 · bf +2" and "Unbalanced", and nodes 20 and 10 show "bf ?"

#### Scenario: Default unchanged
- **WHEN** a tree is rendered without hidden-balance mode
- **THEN** it is drawn and described exactly as before

#### Scenario: Accessible in hidden mode
- **WHEN** an interactive tree is rendered in hidden-balance mode
- **THEN** axe reports no violations and each treeitem's name gives its key and height and says the balance factor is hidden
