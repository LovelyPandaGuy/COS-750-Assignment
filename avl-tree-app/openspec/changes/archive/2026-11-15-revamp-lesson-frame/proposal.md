# Proposal

## Open questions

No `[OPEN]` item blocks the specs (D18). Please read these before `/opsx:apply`. This is change 2 of 3 from the user's list of 15 Nov (with `refresh-visual-style` and `add-lesson-walkthroughs`).

1. **Settled (user, 15 Nov): remove the position line, overriding ID 8.2 (D167).** The line under every lesson title, "Lesson 3 of 9 · Screen 1 of 13 · Problem", is removed completely, including the phase word. ID 8.2 asks for "a progress indicator showing 'Lesson 4 of 9' and a simple bar", and the ID is otherwise final (D92). The user chose to remove it anyway, so this is recorded as a user decision that overrides the ID. The Lessons sidebar still shows the current lesson in words (D155).
2. **Settled (user, 15 Nov): objectives screens show only "Learning objectives" (D168).** The first screens of C2 to C8 show the content title "Goal" (or "Goal for this lesson") and then a second heading, "Learning objectives". Each objectives screen now has one heading, "Learning objectives", followed by its text and objectives. C1's objectives screen ("Your route") follows the same rule. The JSON content is unchanged.
3. **Settled (user, 15 Nov): confetti and the lesson's title when a lesson is completed (D169).** This is backed by ID 10.4 ("a short burst of confetti marks the completion of each lesson … once it is off it stays off"), `rewards.json` (`confetti`: on by default, can be turned off, 1500 ms, on lesson completion) and C1's "How the app works" ("After each check you get a title, from Structural Savant to Complexity Cadet"). None of it was built.
   - When a lesson becomes completed, a 1.5 s confetti burst plays, unless the Confetti setting is off or the system asks for reduced motion.
   - Each lesson with a check (C2 to C8) shows its title from `rewards.json` `titles` (for example "AVL Ace" and its message) on its summary screen, from the share of the lesson's check criteria met.
4. **Assumed, not blocking: reduced motion and repeats.** With reduced motion there is no moving confetti: the summary's title panel shows as normal (quality bar 9). Confetti plays once, when the lesson is first completed, not on every later visit.
5. **Flagged for the user to read:** "Your title for this lesson" and the confetti's look (small coloured shapes in the palette and tree colours, falling from the top, decorative and hidden from assistive technology). The titles and messages are content (`rewards.json`).

Serves ID 10.4 (titles, confetti, "once it is off it stays off"), ID 9.3 (mastery per lesson), ID 3.2 (Gagné 2 and 9), FR-MOT-01 and FR-MOT-04 (no points or scores; titles are encouragement); NFR-02 and quality bar 9 (reduced motion).

## Why

The user asked for a cleaner lesson frame: no position line under the title, and no "Goal" heading on top of "Learning objectives". They also asked for confetti at the end of a lesson for motivation, which the ID and the content already specify but the app never built.

## What Changes

- **Lesson frame (changed):** no "Lesson n of 9 · Screen n of m · phase" line. The title is followed directly by the screen heading.
- **Phase word (removed):** the requirement that the phase is shown in words is removed (user decision).
- **Objectives screens (changed):** one heading, "Learning objectives".
- **Lesson completion (new):** a confetti burst and, for C2 to C8, the lesson's title on its summary screen.

## Out of scope

- Lecture questions at the end of a lesson (the user, 15 Nov: "nothing more").
- The certificate and C9's overall title, which are unchanged.
- Text and layout of content (the user, 15 Nov).

## Capabilities

### New Capabilities
- `lesson-celebration`: confetti on completing a lesson, and the lesson's title on its summary.

### Modified Capabilities
- `lesson-player`: "The lesson frame" (no position line); "The screen's phase is shown in words" is removed.
- `lesson-blocks`: "Objectives block" (one "Learning objectives" heading).
- `lesson-c1`: "C1 plays its lesson file" (the objectives screen's heading).

## Impact

- Changed: `src/ui/lesson/LessonPlayer.tsx` (top region), `src/ui/lesson/blocks.tsx` (objectives heading, the summary's title panel), and `src/content/lesson.ts` (new wording; the position wording is removed).
- New: `src/ui/lesson/Confetti.tsx` and `src/live/lessonTitle.ts` (a lesson's share and title).
- Tests: lesson-player, lesson-blocks, C1, the sidebar's C1 test, and new celebration tests.
- Decisions: D167 to D169. ID 8.2's progress indicator is overridden by the user.
- There are no new dependencies (the confetti is CSS), no storage change (the Confetti setting already exists) and no network calls.
