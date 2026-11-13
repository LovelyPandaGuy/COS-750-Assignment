# Design index

What the design is, where each piece lives, and what must change before code is built from it. Read this before writing any UI proposal.

## Sources

| File | What it is |
| --- | --- |
| `source/AVL Primer Design System.dc.html` | Design system v0.1: colour, type, shape, components and states, dark theme, contrast checks |
| `source/AVL Primer Wireframes.dc.html` | Low-fidelity wireframes, 1366×768, grayscale. Frames 1a to 1p. Dark tags are React component names; numbered circles map to the notes under each frame |
| `src/ui/tokens.css` (app root) | The design system's tokens as CSS variables (light and dark). Components use these only |
| `development_plan_(v1.1).md` | Phases, gates and the numbered changes 1 to 27 |

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

These are conflicts between the design and the decisions in `.claude/docs/decisions.md`. Fix them in the design, then re-run `/design-import`. Until then the decision log wins: the `spec-writer` builds to the decision and lists the frame difference under "Assumed, not blocking" (D18), not as `[OPEN]`.

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
7. **Start copy (1b, D24).** "A 20–30 minute warm-up", "6 short units" and "Start with a 3-minute warm-up check" become about an hour, nine short modules you can pause, and the C1 readiness check. The copy comes from content.
8. **Retries (1j, D9).** Note 2 "Retry keeps the same question" becomes "a retry is a new variant of the same question (new seeded tree; options reshuffled)".
9. **Feedback glyph and wording (1j, 1k, D27).** Drop the ✗ in the FeedbackPanel verdict and the CheckHeader attempt markers; use a neutral icon plus "Not quite yet". The FeedbackPanel holds four parts: verdict, why, review link, next step.
10. **Sign and case wording (1f, 1j, 1l, D19).** The formula line, "a positive bf means leans left" and the drafted lecture question in 1l state the sign. In the build these come from the conventions module; the frames stay as illustrations.
11. **Representations (1f, D22).** The RepresentationSwitcher's ticked boxes are per-step defaults from the module data, not all on at once. One primary representation per step.
12. **Navigation (1e, D20).** Keep Guided path and Choose my own, never locked. Add "I know this, skip" on content and worked-example steps (not on checks) and a recommend-and-choose panel after a check.
13. **Control strip (1f, D23).** Navigation on one side, learning aids (Show rule, Hint with remaining count) on the other, in the same place on every screen.
14. **Read-aloud (1f, 1p, D26).** Stretch only; the toggle may stay hidden until change 24 builds it.

## Design-system gaps

- Elevation values e1 and e2 are named but not specified (`tokens.css`: `[OPEN]`).
- Dark theme: no values for disabled text and background, the correct-panel colours, the not-quite-yet border and icon, the neutral tree node, or pressed. Listed at the bottom of the dark block in `tokens.css`.
- Fonts: done (add-ui-foundation, D98): Atkinson Hyperlegible Next and Mono are self-hosted in `src/ui/fonts/` with `@font-face` rules.
- Breakpoints: none stated; 390, 768 and 1366 assumed (D93).
- Pressed for secondary and quiet buttons, chip hover: not stated; assumed (D94).
- Bloom level analyse (LO7, LO9): no colour or glyph; OutcomeChip does not show it yet (D95).
- TopBar progress area ("revealed structure"): not drawn; an empty slot for now (D92).

## Rules for agents

- Layout and tokens come from this folder and `src/ui/tokens.css`. Do not invent styles.
- Colour is never the only signal: each role carries a word, icon or outline style (tree roles: ring style plus a text tag).
- Focus is one style everywhere: 2px ring, 2px gap.
- Touch targets are at least 44px. Running text is at least 16px; 14px is for metadata only.
- Selected nodes use a rounded-square frame and are announced ("Node 30 selected"). Keyboard: up parent, left and right children, Enter select.
- Reduced motion: steps snap, no sliding.
- Colour-vision check (D25): in Chrome DevTools, Rendering, Emulate vision deficiencies, try protanopia, deuteranopia, tritanopia and achromatopsia; every node role and feedback state must still read from its label, number or shape.
