# Review: add-narration

## Role crossings (flagged)

`.claude/agents/` defines only `ui-polisher`, so the main agent played the spec-writer, test-writer, implementer and content-author roles.

- **Red tests not committed.** For the last change the user chose "don't commit, keep building", and the same was done here. Nothing is committed.
- **Test-writer edited an existing test.** In `tests/ui/lesson-c1-c9.test.tsx`, "narration comes later" was replaced by the display-settings delta scenarios: no voice (disabled, with the note), turned on and kept, and a damaged value. `renderApp` takes an optional speech engine.
- **Test-writer fixed two of this change's own red tests during the build.** Neither weakens a requirement:
  - **`lesson.test.tsx` (answered question):** the expected feedback text is now trimmed. The markup ends the span with a space, and the spoken text normalises whitespace.
  - **`tests/visual/narration.spec.ts`:** the "unavailable switch" cell was dropped from the gallery. SettingSwitch's styles live in `shell.css`, which only the app shell loads, so in the gallery the switch is unstyled and 21 px tall. The switch's unavailable state is covered by the display-settings unit tests, and its look in the real Aa menu by the critique.
- **Content-author** wrote `src/content/narration.ts` (flagged header).
- **Implementer outside `src/ui/narration/`.** The markers (`data-narrate`) were added in:
  - `LessonPlayer.tsx` (heading, caption, rule and hint panels, the control, and stopping on a screen change);
  - `parts.tsx` (Text, Points);
  - `QuestionCard.tsx` (stem, feedback);
  - `GuidedPause.tsx` (legend);
  - `Controls.tsx` (`ChoiceControl` options; a `narrate` prop, false for Sure and Not sure);
  - `TreeView.tsx` (`data-narrate-text` from `describeTree`).

  `App.tsx` takes an optional `speech` engine. `storage.ts` keeps `narration`. `DisplaySettings.tsx` enables the switch where a voice exists.

## Design refinements during the build

- **Turning narration off:** the state resets during render, and the engine is cancelled in an effect (the React hooks lint rule). The behaviour is as specified.
- **The voice:** `browserEngine().speak` never falls back to the browser default voice. If the chosen on-device voice has gone, it ends at once instead of speaking with a possibly remote voice (D147).
- **The collector:** text inside `button`, `[hidden]` and `[aria-hidden="true"]` is left out even within a marked part. So the feedback panel's icon and buttons are not spoken.

## Baselines

- **New:** `narration-{light,dark}-{phone,tablet,desktop}`.
- **Regenerated, with the gallery grown by the narration section:** the seven `gallery-*` baselines.
  - Tablet and desktop: the old region is pixel-identical (0 diff).
  - Phone (light and dark): about 800 px differ inside the readiness section. That is revamp-readiness's "optional" space fix ("phone Example optional"), which main's phone baselines never picked up because the change stayed under the 0.1% tolerance. It was checked by eye; nothing else changed.

## Checks so far

`npm test` (1135 passed), `npm run typecheck`, `npm run lint` and `npm run test:visual` (58 passed): all pass.

## Critique (3.1)

**Who did it.** The `ui-polisher` subagent (`.claude/agents/ui-polisher.md`) was added after this session started and could not be started ("Agent type 'ui-polisher' not found"). The main agent did the critique instead (flagged).

**How.** The real app at `/#/module/C2` with speech stubbed to one on-device voice, at 390, 768 and 1366 px, in light and dark, and in greyscale at 1366. States checked: idle, keyboard focus, speaking and paused. The Aa menu was also checked with no voice, at 390 light and 1366 dark.

| # | Finding | Quality bar | Result |
|---|---|---|---|
| 1 | The Aa menu still said "Read-aloud is coming in a later update." under a working narration switch | 3 (wording true to state) | **Fixed.** The line is removed from `AaMenu.tsx` and `shellCopy`. This needed an `app-shell` delta (spec-writer, flagged) and two test edits (`theme-switch.test.tsx`; `aa-menu.test.tsx` now mounts the theme provider, as the app does) |
| 2 | The control sits directly under the screen heading, left-aligned with the content, at every width; no sideways scroll | 2 | Pass |
| 3 | The buttons are 96×44 and 70×44 px (Resume, Stop) and 44 px tall in every state; the focus ring is visible in light and dark | 5, 6 | Pass |
| 4 | The states differ by word (Read aloud → Pause → Resume), not colour; still clear in greyscale | 7 | Pass |
| 5 | The unavailable note under the disabled switch is readable at 390 px | 3 | Pass |
| 6 | Speaking looks the same as paused apart from the label: there is no "speaking" indicator | 7 | **Human decision.** A visual cue (a design item) is optional; the label already says what will happen |
| 7 | Frame 1f places Read aloud inside the RepresentationSwitcher (a stub) | n/a | Accepted as proposal question 5: it moves when that component is built |

No CSS changed in the polish: the control uses the base `Button` and one flex rule.

## Full check (3.2, partial)

**Pass:** `npm test` (1135 passed), `npm run typecheck`, `npm run lint`, `npm run build`, `npm run test:visual` (58 passed) and `openspec validate add-narration --strict`.

**Still open:** a fresh-context `reviewer` and the `a11y-checker`. That includes a real-browser listen in Chrome, Safari and Firefox, the network tab while reading, a keyboard-only run, and the switch's unavailable state on a device without on-device voices. These need a fresh agent and a human with real voices; the main agent cannot do them.

## Archived with open tasks (14 Nov)

The user asked for this change to be archived on `chore/ui-sweep` as the gate of `ui-quality-sweep` (task 1.1). Tasks still open: 3.2 . They were not done and are not ticked. The independent reviewer and a11y-checker passes, and any open polish, are covered by `ui-quality-sweep`'s audit (groups 2 and 3) instead.
