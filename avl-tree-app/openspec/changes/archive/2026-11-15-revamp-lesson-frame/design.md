# Design

## Context

See proposal.md for why.
- `LessonPlayer` renders `.lesson-top` with the `h1`, then `p.lesson-position` holding "Lesson n of 9", "Screen n of m" and the phase word.
- The objectives block renders `h3` "Learning objectives" inside a screen whose `h2` is the content title.
- Lessons become completed in three places: `CheckRunner` for C2 to C8, `c1c9.tsx` for C1 and C9, and each calls `completeModule`.
- The Confetti setting exists (`settings.confetti`, D115), and `rewards.json` has `confetti` and `titles`. `titleFor(share)` exists in `src/live/readiness.ts`.

## Goals / Non-Goals

**Goals:**
- Remove the position line and the double heading.
- One celebration component that reacts to any lesson becoming completed.

**Non-Goals:**
- A progress bar elsewhere (the user chose removal).
- Sound or haptics.

## Decisions

### 1. Top region and objectives heading (D167, D168)

`.lesson-top` keeps only the `h1`. The `lesson-position` paragraph, its CSS and its wording (`progress`, `screenOf`, `phase`, `positionLabel` in `src/content/lesson.ts`) are removed once unused. The screen heading is chosen by `LessonPlayer`: for `type: 'objectives'` it is `lessonCopy.objectivesHeading` ("Learning objectives") instead of `screen.title`, and the objectives block drops its own `h3`. Narration reads the heading shown.

### 2. Celebration on completion (D169)

`Celebration` is mounted once in `App` (inside the learner and theme providers). It keeps the previous `completedModules` in a ref, and when a module is added, which is a real completion, it shows `Confetti` for `rewards.confetti.durationMs`. The first render only records the list, so lessons completed in earlier sessions never celebrate.

`Confetti` is about 40 absolutely positioned spans:
- `aria-hidden`, `pointer-events: none`, `position: fixed`;
- coloured with `--action-primary`, `--accent-highlight` and the four node colours;
- a CSS keyframe fall-and-spin, wrapped in `@media (prefers-reduced-motion: no-preference)`.

It is not rendered at all when `settings.confetti` is false or `matchMedia('(prefers-reduced-motion: reduce)')` matches.

### 3. The lesson's title (D169)

`src/live/lessonTitle.ts` provides `lessonTitle(checkId, attempts, content)`. It returns `null` until every check question is finished (the same rule as completion, D111). After that it returns `titleFor(share)`, where `share` is the met criteria over all criteria of the check's questions, counting a question as met if either attempt was right (D106). The summary block renders the panel when it is not null: a quiet card with the heading "Your title for this lesson", the title in bold and the message.

### Decision rows

| ID | Topic | Decision |
| --- | --- | --- |
| D167 | No position line | The lesson top region shows only the title: no "Lesson n of 9", "Screen n of m" or phase word. User decision (15 Nov) overriding ID 8.2's progress indicator; the sidebar shows the current lesson. |
| D168 | Objectives heading | Every objectives screen has one heading, "Learning objectives", in place of its content title ("Goal", "Your route"); the content is unchanged. User request (15 Nov). |
| D169 | Lesson celebration | When a lesson is first completed, a 1.5 s confetti burst (rewards.json), not with the setting off or under reduced motion; C2 to C8 summaries show "Your title for this lesson" from rewards.json titles for the share of check criteria met. ID 10.4; user request (15 Nov). |

## Risks / Trade-offs

- [Removing the indicator departs from the ID (8.2)] → It is recorded as a user decision. If the lecturer's review asks for it back, it can return as a slim bar (one block of markup).
- [Confetti during a screen-reader session] → It is `aria-hidden` and silent, and nothing receives focus.
- [The completion moment is on the check screen, while the title is on the summary] → The burst plays where completion happens, and the title waits one screen, on the summary the student reaches next.

## Migration Plan

No data migration. Rollback is reverting the change.
