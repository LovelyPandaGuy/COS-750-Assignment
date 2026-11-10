# Design index

What the design is, where each piece lives, and what must change before code is built from it. Read this before writing any UI proposal.

## Sources

| File | What it is |
| --- | --- |
| `source/AVL Primer Design System.dc.html` | Design system v0.1: colour, type, shape, components and states, dark theme, contrast checks |
| `source/AVL Primer Wireframes.dc.html` | Low-fidelity wireframes, 1366×768, grayscale. Frames 1a to 1p. Dark tags are React component names; numbered circles map to the notes under each frame |
| `../../src/ui/tokens.css` | The design system's tokens as CSS variables (light and dark). Components use these only |

Original Claude Design project: `https://claude.ai/design/p/f6bc9423-7d01-49c7-afc5-6ca972add5c6` (exported 2026-11-04). Published copy: `https://claude.ai/artifact/MRc3Z7VWz5iEJR3ESkKNnR`.

## Principles (design system)

1. Low anxiety: wrong answers are information. "Not quite yet", never red.
2. Colour never alone: every colour pairs with a word, icon or shape.
3. Low load: one idea per screen; reading column at most 66ch.
4. Progress, not performance: mastery per skill against the student's own earlier attempt.

## Screens

Frame IDs are the wireframe IDs. A screen spec per frame will live in `screens/<id>.md` once `/design-import` has run.

| Frame | Screen | Main components | States in the frame |
| --- | --- | --- | --- |
| 1a | Screen flow | n/a (diagram) | first visit, returning, needs review, retry |
| 1b | 1 Start | StartPanel, ResumeCard, PrivacyNotice, ResetProgressLink, ConfirmDialog | with and without saved progress |
| 1c | 2 Diagnostic question | DiagnosticStepper, QuestionItem, TreeView (read-only), ConfidenceRating | one question per screen, skip |
| 1d | 2b Diagnostic result | DiagnosticResult, SkillStatusList, RouteRecommendation | needs review, all secure |
| 1e | 3 Unit hub | ProgressMap, UnitCard, ActivityList, PathModeToggle, SandboxCard, LectureQuestionsCard | done, current, upcoming |
| 1f | 4 Explore / worked example (core) | RepresentationSwitcher, TreeView, StepControls, PseudocodePanel, StepExplanation | watch mode |
| 1g | 4 Predict first | TreeView (selectable), PredictPrompt, PredictionReveal | before and after replay |
| 1h | 4 Do it yourself | TreeView (interactive), RotationMenu, InOrderStrip, TaskPrompt, FeedbackPanel, KeyboardHelp | selected node, after action |
| 1i | 5 Check: identify the case | CheckHeader, QuestionItem, TreeView, ConfidenceRating, FeedbackPanel | correct |
| 1j | 5 Check: compute balance factor | QuestionItem, FeedbackPanel, ScaffoldLadder | wrong answer, hint open |
| 1k | 5 Check: guided step-through | GuidedStepThrough, ScaffoldLadder | scaffold level 3 |
| 1l | 5 Check: retry cap | FeedbackPanel, FullAnswer, LectureQuestionDraft | cap of 3 reached |
| 1m | 5 Check: trace an insert | TreeEditorToolbar, TreeView (editable), EditLog, LiveBalanceReadout, KeyboardHelp | student edits the tree |
| 1n | 6 Sandbox | InsertControl, RebalanceSwitch, TreeStats, EventLog, TreeView | rebalancing off, chain |
| 1o | 7 Readiness summary | OutcomeStatusTable, ConfidenceFlags, LectureQuestionsList, ExportActions | per-outcome status |
| 1p | Assumptions and open questions | n/a | n/a |

Design-system components beyond the wireframes: Button (primary, secondary, quiet), OutcomeChip, MasteryBadge, ScaffoldPanel, FeedbackPanel (correct, not quite yet, retry cap), ReadinessSummary. Every component is specified with default, hover, focus, selected, disabled and "not quite yet" states.

## What must change before the first UI proposal

These are conflicts between the design and the decisions in `docs/decisions.md`. Fix them in the design, then re-run `/design-import`. Until then the `spec-writer` marks any affected requirement `[OPEN]`.

1. **Height convention (D2).** The wireframes count a leaf as height 1 and an empty subtree as 0 (frame 1p assumption 1, and every `h` label). The decision is leaf 0, empty -1, balance factor = left minus right.
   - Every `h` label drops by 1. Every `bf` stays the same, because both sides shift together.
   - Frames affected: 1f, 1g, 1h (tree of 7 nodes: root h3, leaf h0), 1i, 1j, 1k, 1m, 1n, 1p.
   - 1j and 1k text: "the right is empty (height 0)" becomes "empty (height -1)"; the sum is still bf = 1 - (-1) = +2.
   - 1n: a chain of 7 has height 6, not 7; "balanced would be 3" becomes 2 (7 nodes), and the label chain runs h6 down to h0. The node cap of 15 gives a perfect tree of height 3.
   - GuidedStepThrough (1k): "Height of 10 (a leaf)? 1" becomes 0.
2. **Module structure (D1).** The wireframes use units U0 to U5 ("U4 Four cases", "U2 Rotations"). The decision is C1 to C9. Map each U to its C module and rename. This needs the ID content, so I have not guessed the mapping.
3. **Search and deletion (D4).** Both are in scope and neither appears. Search appears only as a diagnostic question (1c). Add search and deletion to the Explore, Check and Sandbox screens, and add a deletion step to the flow (1a). Frame 1p open question 3 is now answered.
4. **Phones (D3).** Every frame is 1366×768; 1p mentions only a tablet layout. Tree editing must work by touch on phones. Add phone frames (390 wide) for at least 1f, 1h, 1m and 1n, and a tap-to-select then tap-to-place path alongside dragging.
5. **Short checks in C4, C5 and C8 (D15).** The wireframes assume a check per unit; confirm each of those modules has its 2 to 3 items.
6. **Open questions in 1p.** Questions 1, 3 and 4 are settled (D2, D4, D9). Update or remove them so nobody reopens them.

## Design-system gaps

- Elevation values e1 and e2 are named but not specified (`tokens.css`: `[OPEN]`).
- Dark theme: no values for disabled text and background, the correct-panel colours, the not-quite-yet border and icon, the neutral tree node, or pressed. Listed at the bottom of the dark block in `tokens.css`.
- Fonts: the design uses Atkinson Hyperlegible Next and Mono from Google Fonts. The app makes no network calls after load, so self-host the font files in `src/ui/fonts/` and add `@font-face` rules. Not done yet.

## Rules for agents

- Layout and tokens come from this folder and `src/ui/tokens.css`. Do not invent styles.
- Colour is never the only signal: each role carries a word, icon or outline style (tree roles: ring style plus a text tag).
- Focus is one style everywhere: 2px ring, 2px gap.
- Touch targets are at least 44px. Running text is at least 16px; 14px is for metadata only.
- Selected nodes use a rounded-square frame and are announced ("Node 30 selected"). Keyboard: up parent, left and right children, Enter select.
- Reduced motion: steps snap, no sliding.
