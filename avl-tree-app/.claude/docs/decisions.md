# Decision log

Status: **settled** = decided by the user; **default** = the recommended default from the development plan, open to veto; **assumed** = a working assumption under D18, built so that a different answer changes one place; **verify** = needs a check before use.

| # | Topic | Decision | Status |
| --- | --- | --- | --- |
| D1 | Modules | Adopt the ID structure and order: C1 Getting started and readiness check, C2 When BSTs go lopsided, C3 The AVL property, C4 Search, C5 Rotations, C6 Insertion with rebalancing, C7 Deletion, C8 Choosing a structure, C9 Am I ready. The presentation draft's four micro-lessons (A to D) are an example only, not a structure. | settled (9 Nov) |
| D2 | Height convention | Height in edges: leaf 0, empty tree -1. Balance factor = height(left) - height(right). One conventions module. Wireframes are updated to match. Height in edges is settled by the ID's own numbers: "the same keys in an AVL tree give height 2" (C2), "at most height + 1 steps" (C4) and "finding 50 takes 5 steps" in a 5-node chain only hold with edges. The sign is stated in the ID but has no worked example and is not confirmed. The presentation draft's height(right) - height(left) is not adopted (it is unsourced and marked both AGREED and OPEN in the draft). Under either height count the balance factor is the same; only the sign changes it. | height: settled (12 Nov); sign: assumed, lecturer to confirm |
| D3 | Session and device | About one hour in nine resumable chunks. Phones get the full experience, including tree editing, with 44 px targets and tap-to-select then tap-to-place as an alternative to dragging. | settled (9 Nov) |
| D4 | Scope | Search (C4) and deletion (C7, LO8) are both built in v1.1. LO8 is shown on the readiness summary but never blocks Ready (the ID calls C7 optional). | settled (9 Nov); LO8 gating is a default |
| D5 | Search | New engine function with a trace, step counter, pseudocode panel (loop and recursive) and a "be the algorithm" mode. | default |
| D6 | Diagnostic | Five prerequisite questions in C1. Fewer than 4 of 5 correct routes to the BST refresher, followed by a short re-check, then C2. The student sees a per-skill list, not a score. | default |
| D7 | Where the diagnostic items live | In the assessment layer with the same question model, tags and storage as every other check. | default |
| D8 | Readiness output | Store three states (secure, developing, not yet) for routing and scaffolding. Show Ready or Revise per LO1 to LO9 on the summary. The draft's low, middle and high check bands map onto not yet, developing and secure. | default |
| D9 | Retries in checks | Generated items give a new seeded variant on retry; multiple choice reshuffles; cap of 3 per question, then a lecture question is recorded and the student continues. Wireframe 1j note 2 ("retry keeps the same question") is superseded. | default |
| D10 | Gagné events | Hook, goals, recall and summary are fixed. Only content, worked example and practice may be reordered. | default |
| D11 | Sandbox | Always reachable from the progress map; suggested after C2. Insert and delete, rebalancing on or off. | default |
| D12 | Pseudocode | Generic pseudocode as in the ID. Ask the lecturer whether Java or Python is preferred. | default |
| D13 | Step-count claim | The ID says "at most 28 steps" for a million keys. Height of an AVL tree with n keys is at most about 1.44 log2 n, which is about 28.7, so height is at most 28 and a search can visit up to 29 nodes. Compute the figure in code and state it carefully. | verify |
| D14 | C9 mechanics | Missed outcomes return once. The student must write one question for the lecture. The summary can be printed, saved or copied. | default |
| D15 | Checks per module | The ID lists checks only for C2, C3 and C6. Add short checks (2 or 3 items) to C4, C5 and C8 so scaffolding can help before C9. | default |
| D16 | Storage | localStorage behind a StorageAdapter for progress and settings. SQLite (sqlite-wasm, in the browser, no server) for the event log only, exportable as a .sqlite file. JSON export is the fallback if the browser cannot run it. Spike S3 confirms browser support. | settled (9 Nov) |
| D17 | Tree layout (spike S1 not run) | In-order layout: x by in-order position, y by depth. Nodes 44 units across (the 44 px target), slot spacing 56, level spacing 96 (room for the h, bf and Unbalanced lines under a node). Trees keep their natural size and scroll sideways in a focusable region; no shrinking, so text and targets stay readable at 360 px. Node keys use `--type-body` bold (16 px) until the design adds a 17 px token. Revisit if a compact layout is wanted. | default (10 Nov, add-tree-view) |
| D18 | Working with unknowns | When the sources are silent or a confirmation is pending, use the default in this log or add an assumed row, keep the assumption in one constant, config entry or content record, and list it in the proposal as "Assumed, not blocking". `[OPEN]` only when the assumption cannot be isolated in one place or would put unverified instructional content in front of a student. Replaces "never guess, stop". | settled (12 Nov) |
| D19 | Sign and case wording | No content string states the balance-factor formula, which way a sign leans, or a case name (LL, RR, LR, RL; the draft's "outside" and "inside"). Content reads all of these from `src/engine/conventions.ts`, so a lecturer answer on D2 is a one-module change. | settled (12 Nov) |
| D20 | Navigation | Guided path (the recommended C1 to C9 order) is the default; "Choose my own" is available. Nothing is hard-locked: entering a module early shows a soft note naming the prerequisite. Back is always free and never discards answers (FR-LRN-04). "I know this, skip" is offered on content and worked-example steps only, never on a check. A module completes only through its check (FR-LRN-05, FR-SCA-05). After a check the app recommends a route and the student chooses. One policy function decides entry, so locking later is a one-place change. | assumed (12 Nov) |
| D21 | Practice vs check support | Practice: unlimited retries, 2 hints (a nudge, then a fuller hint), then the review route is offered. Checks: D9 and FR-SCA-02 apply (ladder hint, worked example, guided step-through, opened by a wrong attempt or on request; cap 3; new variant). The draft's "no hints in checks" is not adopted (FR-SCA-02 is a Must). Hints used are recorded. `PRACTICE_HINTS = 2` and `RETRY_CAP = 3` live in one config. | assumed (12 Nov) |
| D22 | Representations | Each step's data names one primary representation (diagram, text, pseudocode, animation) and the supporting ones shown by default; the rest are on-demand toggles (wireframe 1f's RepresentationSwitcher). The tree plus a one-line caption satisfies FR-LRN-02. Balance factors stay visible on every node. No learning-style questionnaire. | assumed (12 Nov) |
| D23 | Screen layout | Position line at the top, tree in the centre as the largest region, a one or two line caption under it, then a control strip in the same place on every screen: navigation (Back, Next, Replay) on one side, learning aids (Show rule, Hint with remaining count) on the other. Consistent with wireframe 1f. | assumed (12 Nov) |
| D24 | Session length | D3 stands: about one hour. Budget about 5 to 7 minutes per module (the draft's per-lesson figure), which gives roughly an hour over nine modules. Wireframe 1b copy ("20–30 minute", "6 short units", "3-minute warm-up") is superseded; the Start copy comes from content. | assumed (12 Nov) |
| D25 | Palette | `src/ui/tokens.css` (contrast-checked design system) is the palette. The draft's Okabe-Ito set is not adopted; its non-colour backups are already design principle 2. Its test procedure (Chrome DevTools, Emulate vision deficiencies: protanopia, deuteranopia, tritanopia, achromatopsia) joins the a11y check for UI changes. | assumed (12 Nov) |
| D26 | Audio | No recorded audio. Read-aloud (browser speech) is a stretch item; the cut order is dark theme first, then read-aloud. The Aa menu keeps its slot. | assumed (12 Nov); team to confirm |
| D27 | Feedback wording | Verdict "Not quite yet" (design system) or "That's right"; no cross glyph, red or "wrong"/"fail" wording, including attempt markers in CheckHeader (wireframes 1j, 1k use ✗). Each message has four parts: verdict, why (names the misconception where possible), a review link to the concept, and the next step. Correct answers get a brief why too. | assumed (12 Nov) |
| D28 | Route logging | Log `route_recommended` and `route_chosen` whenever the app recommends a route (after a check, after the diagnostic), so the pilot can see whether students follow it. Changes 12 and 22 emit to a no-op sink until change 26 adds the event log. | assumed (12 Nov) |

## Open questions for the lecturer

1. Does the course define balance factor as height(left) - height(right), or height(right) - height(left)? A worked example with numbers settles it. Does it count height in edges (leaf 0, empty -1)?
2. Which names does the course use for the four cases (LL, RR, LR, RL, or left-left, or outside and inside) and for the rotations ("rotate left at x", "single right rotation")?
3. Is generic pseudocode acceptable, or should the app use Java or Python?
4. Which AVL deletion cases does the lecture cover?
5. Does the lecture state the bound of about 1.44 log2 n, and how does it count search steps for a million keys?

## Questions for the presentation draft's author

1. Which slides define the balance factor: course (COS212 or COS 750), lecture number and slide numbers, ideally with a screenshot?
2. Does that slide, or one near it, show numbers: the height of a single leaf and of an empty subtree, or a worked example with heights and a signed balance factor?
3. Which names do those slides use for the four cases and the rotations?
4. Did "balance factor = right minus left" come from the slides or from the AI summary?
5. Can section 2.5 #6 be marked OPEN until the lecturer confirms, to match the at-a-glance table and section 4.4?

## Open for the team (presentation draft)

- Read-aloud as stretch (D26).
- Cut-off scores for the routing bands once the number of questions per check is known (D8).
- Badges: the draft proposes completion ticks only, which matches FR-MOT-03 and FR-MOT-04.
