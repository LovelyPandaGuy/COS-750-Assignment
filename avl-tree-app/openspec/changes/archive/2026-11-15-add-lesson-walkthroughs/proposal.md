# Proposal

## Open questions

No `[OPEN]` item blocks the specs (D18). Please read these before `/opsx:apply`. This is change 3 of 3 from the user's list of 15 Nov (with `refresh-visual-style` and `revamp-lesson-frame`).

1. **Settled (user, 15 Nov): "How the app works" becomes an animated mini-screen (D170).** C1's `c1-s03` lists seven points about the controls. It becomes a small drawn lesson screen: the sidebar strip, a title, a tiny tree, the control strip (Back, Replay, Show the rule, Hint, Next), an answer row (Sure, Not sure, Check answer) and a title badge.
   - Each step lights up the part a point is about, with the point's own words as the caption: step 1 lights Back, Next and Replay; step 4 lights Sure and Not sure.
   - The student plays it with the same Back, Play and Step controls and speeds as a tree replay.
   - The seven sentences are the content's, unchanged and in order.
2. **Assumed, not blocking: the mapping lives in one content record.** Which part each point lights up is a small table in `src/content/walkthrough.ts`, keyed by the screen ID `c1-s03`: one entry per point, in order. A test keeps it the same length as the screen's points, so a content change cannot silently mismatch it. The lit part has a thick magenta ring (D165) and a "▶ here" label, so it is not colour alone. Under reduced motion it snaps, and Play still steps.
3. **Assumed, not blocking: the list stays available.** For screen readers and for students who prefer reading, "Show all as a list" opens the seven points as a plain list, and the caption is a polite live region. The mini-screen is a labelled image ("A lesson screen with its controls"); its parts are not real buttons.
4. **Settled (user, 15 Nov): search animations show where they are, on both diagrams (D171).** On C2's "Order of insertion matters" (`c2-s06`), the chain and the bushy tree each have Previous step and Next step buttons, but neither shows which node the search is at. Every search animation, including both diagrams of a comparison, now frames the node being compared at each step, with the same rounded frame as a worked-example step. On the last step it frames the node found, or the last node compared when the key is not found. The step counters and captions are unchanged.
5. **Flagged for the user to read:** "Show all as a list", "▶ here", "A lesson screen with its controls", and the mapping of points to parts.

Serves ID 7.2 C1 ("how the app works … any step can be replayed"), ID 8.1 (several representations; animated tree for visual and kinesthetic learners), ID 8.2 (one step at a time, replay, learner control), ID 8.3 (observability), ID 11 and UDL (text equivalent, reduced motion), FR-VIS-03, FR-VIS-07 and LO1 (C2).

## Why

The user asked for "How the app works" to be shown as a step-through animation rather than a list, and for C2's comparison of two searches to show where each search is at every step. Today neither diagram marks the current node.

## What Changes

- **"How the app works" (changed):** an animated mini-screen with step controls, lighting each part as its point is captioned, plus a list on demand.
- **Search animations (changed):** the node being compared is framed at each step, on both diagrams of a comparison and on every search animation.

## Out of scope

- The content's wording and the other C1 screens.
- A tour over the real interface (the user chose the mini-screen).
- Highlighting in insert or delete animations, which already mark their nodes by role.

## Capabilities

### New Capabilities
None.

### Modified Capabilities
- `lesson-blocks`: a new requirement, "How the app works is a walkthrough"; and "Animation comparison" (the framed node on both diagrams).

## Impact

- New: `src/ui/lesson/AppWalkthrough.tsx` and `walkthrough.css`, and `src/content/walkthrough.ts` (the mapping and the new wording).
- Changed: `src/ui/lesson/blocks.tsx` (the info block uses the walkthrough for `c1-s03`), and `src/ui/lesson/LessonAnimation.tsx` (`highlightKey` from the current search step).
- Tests: lesson-blocks, C1, and the C2 comparison.
- Decisions: D170 and D171.
- There are no new dependencies, no storage change and no network calls.
