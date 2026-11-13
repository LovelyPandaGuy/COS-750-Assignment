# Proposal

## Open questions

No `[OPEN]` item blocks the specs (D18). Each item below is an assumption kept in one place. Please read them before `/opsx:apply`.

1. **Assumed, not blocking: the C1 screens keep their routes.** The flow lives at `/module/C1/check` (a short "how the app works" screen, the conventions card, then one question per screen), the result at `/module/C1/check/result`, and the refresher at `/module/C1/refresher`. C1 keeps two activities, Warm-up check and BST refresher, so routing, the hub and the module screen do not change. The ID's "how the app works" and "conventions card" become the first two screens of the warm-up check, each with the Skip control visible (FR-DIA-04).
2. **Assumed, not blocking: five items, four prerequisite sub-skills (FR-DIA-01, FR-DIA-02).** The ID names five questions: tree terms, "is this a BST?", where a key goes, a BST search path, recursive height. FR-DIA-01 names four sub-skills, so terms and "is this a BST?" share `bst-terminology`, and the others are `bst-insert`, `bst-search` and `tree-height`. A sub-skill is shown as secure when the latest attempt at each of its items is right, and as "needs review" otherwise; the stored mastery status is updated as for any check. The result screen shows one line per sub-skill and no total (FR-DIA-02, D6).
3. **Assumed, not blocking: prerequisite items use a new outcome tag, `PRE`.** They belong to no LO1 to LO9. The question model, validator and bank accept `PRE` for C1 items only. Sub-skill status is stored as for any check (D7, D8).
4. **Assumed, not blocking: kinds are reused where they fit.** A search path uses the existing search-visits kind and recursive height the existing node-height kind at the root. Two kinds are new: leaf counting ("tree terms") and "is this a BST?". A third, "where does this key attach", gives the parent's key. Six new misconceptions (for example, counting every node as a leaf, checking only a node's parent for the ordering) join the catalogue, each with a hint and a lecture question (change 21's validator). All are `beyond ID` and flagged for G3.
5. **Assumed, not blocking: no feedback or retries in the diagnostic (FR-DIA-05, D6).** Each question is answered once, with the optional confidence buttons, then the next appears; the student is told it is private practice. No ladder, no cap, no explanation per question. Answers are stored as attempts like any check's.
6. **Assumed, not blocking: the short re-check asks only the sub-skills that needed review, as new variants (FR-DIA-03).** It is shown after the refresher at `/module/C1/check`, the page choosing its phase from stored attempts. Whatever its result, the next step is C2; the updated statuses are shown.
7. **Flagged for you: skipping, and when C1 completes (FR-DIA-04, FR-LRN-05, D20).** Skipping sets the learning path to "diagnostic skipped", moves the current module to C2 and leaves C1 not complete, because only a check completes a module. C2 then shows its soft prerequisite note, and the refresher stays reachable from the hub and the result. C1 completes when the student finishes the diagnostic with 4 or 5 correct, or finishes the re-check.
8. **Assumed, not blocking: the refresher is a short authored sequence (about six steps) on the framework's player, with a heading of its own.** The ID says only "BST refresher". The steps cover tree terms, the BST ordering property, search, insert and height (leaf 0, empty −1, D2). Figures and facts come from the engine, and the content validator applies. All wording is `beyond ID`, flagged for G3.
9. **Assumed, not blocking: route events (D28).** The result recommends C2 or the refresher (as C1 itself), emitting `route_recommended`, and choosing emits `route_chosen`, to the no-op sink.
10. **Out of scope, stated so it is not a surprise:** the accessibility settings the ID lists beside the conventions card wait for change 24; the conventions card only shows the two conventions (D2).

## Why

C1 is still three skeletons. FR-DIA-01 to FR-DIA-05 are Musts, and without the diagnostic the app cannot find a student who lacks BST basics, route them, or set `path`. The assessment layer (change 19), checks and the ladder (20, 21) exist; this change is the first screen of the journey (gate G4).

## What Changes

- **C1 flow:** how the app works, the conventions card, five questions one per screen (with a Skip control and optional confidence), then a per-skill result with no score.
- **Routing:** a pure function sends 4 or 5 correct on to C2 and fewer than 4 to the BST refresher, then a short re-check, then C2. Tested for every combination.
- **BST refresher:** a short framework sequence at `/module/C1/refresher`.
- **Skip:** sets the path to "diagnostic skipped" and goes to C2; the refresher stays reachable.
- **Assessment layer:** five diagnostic items tagged `PRE`, three new kinds, six misconceptions with hints and lecture questions.
- Serves FR-DIA-01 to FR-DIA-05, FR-ASM-02, D6, D7, D8, D19, D20, D28, for the prerequisites.

## Capabilities

### New Capabilities
- `diagnostic-c1`: the C1 screens, the five items, the per-skill result and skipping.
- `diagnostic-routing`: the routing rule, the re-check, C1's completion and route events.
- `bst-refresher`: the refresher sequence and its content rules.

### Modified Capabilities
- `question-bank`: C1 has the five diagnostic items.
- `question-model`: items may carry the `PRE` outcome.
- `module-framework`: a sequence can be shown under its own heading and validated without a check.
- `learner-session`: screens can set the learning path.
- `route-choice`: the diagnostic result emits route events.
- `screen-skeletons`: the warm-up check, its result and the refresher are no longer skeletons.

## Out of scope

- The accessibility settings and read-aloud (change 24), the readiness summary and C9 (change 23), the event log (change 26).
- A hard lock on C2 after a low result: nothing is locked (D20).
- Changes to C2 to C8.
