# Design: add-narration

## Context

See `proposal.md` for why. What exists today:

- **Settings.** `Settings.narration` exists in `src/state/storage.ts`, but `parseSettings` always sets it to `false`. `DisplaySettings.tsx` renders the narration switch disabled with `lessonCopy.settings.later`. The settings live in `ThemeContext` (`useTheme().settings`, `setSetting`), mounted in `src/App.tsx`.
- **Lesson screens.** Each screen is one `<section className="lesson-screen">` in `LessonPlayer.tsx`. It holds the `h2`, `lesson-main`, the caption (`aria-live` on animations), the rule and hint panels (`hidden` when closed) and `lesson-support`. The blocks come from `src/ui/lesson/blocks.tsx`, questions from `src/ui/lesson/questions/` and `src/ui/learn/`.
- **Trees.** `TreeView` (`src/ui/tree/TreeView.tsx`) already renders `describeTree(...)` in a `<p class="tree-description">`. That paragraph is `hidden` until the Describe button opens it.
- **The test environment.** jsdom has no `speechSynthesis`, so unless a test injects an engine, every existing test sees narration as unavailable and nothing changes for it.

## Goals / Non-Goals

**Goals:**
- One small speech adapter that tests replace with a fake. No test depends on a real voice.
- Read aloud reads the markup that is on screen, so the spoken words can never drift from the shown words.

**Non-Goals:**
- Live regions or focus changes for screen-reader users (the next change).
- Narration outside `LessonPlayer`.

## Decisions

1. **Speech adapter (`src/ui/narration/engine.ts`).** It has the type `SpeechEngine = { voices(): Voice[]; onVoicesChanged(cb): () => void; speak(parts: string[], voice, onDone): void; pause(); resume(); cancel() }`.
   - `browserEngine()` wraps `window.speechSynthesis` and returns `null` when it is missing.
   - `pickVoice(voices)` keeps the voices with `localService === true`. It prefers `lang` starting with `en`, then any language, and returns `null` when none qualify. This is the only voice rule (D147).
   - Voices often load late (Chrome fires `voiceschanged`), so availability is recomputed on that event.
   - *Alternative:* call `speechSynthesis` directly from the components. Rejected: untestable, and the voice rule would be spread out.
2. **NarrationProvider and `useNarration()`.** Mounted inside `ThemeProvider` in `App.tsx`, taking an optional `engine` prop (tests and the gallery pass a fake).
   - It exposes `{ available, enabled, state: 'idle' | 'speaking' | 'paused', read(root: Element), pause, resume, stop }`.
   - `enabled = settings.narration && available`.
   - It cancels speech when `enabled` turns false and on `visibilitychange` to hidden.
3. **Reading order by markers (D146).** Parts opt in with `data-narrate`.
   - `collectNarration(root)` returns the texts of `root.querySelectorAll('[data-narrate]')` in document order. It skips:
     - a marked element inside another marked element (no double reading);
     - an element that is `hidden`, inside `[hidden]` or `[aria-hidden="true"]`, or not rendered (`checkVisibility()` where supported, otherwise `getClientRects().length`).
   - The text is the element's `data-narrate-text` if set, otherwise its normalised `textContent`.
   - **The tree description:** `TreeView` puts `data-narrate` and `data-narrate-text={describeTree(...)}` on its outer `.tree-view`, so the description is read even while its paragraph is collapsed. These are the same words as the Describe button, with no new text.
   - **Marked by the implementer:** the screen `h2`, the `Text` and points blocks, the caption, the rule and hint panels, the support region, the question stem and each option label, and the feedback panel's message.
   - *Alternative:* a narration script built from the screen JSON. Rejected: every block type would need a second renderer, and its words could differ from what is shown.
4. **One utterance per part.** Each collected text is its own utterance. A part longer than `MAX_UTTERANCE_CHARS` (one constant, 200) is split at sentence ends. Short utterances avoid Chrome's known stop on long utterances (about 15 s) and give natural pauses.
5. **NarrationControls (`src/ui/narration/NarrationControls.tsx`).** It renders nothing unless `enabled`.
   - Idle: a Read aloud button. Speaking: Pause and Stop. Paused: Resume and Stop.
   - It uses the base `Button` (secondary and quiet), so 44 px targets and focus rings come from the design system.
   - It takes `getRoot: () => Element | null`. `LessonPlayer` places it right after the `h2` and passes the section ref.
   - Labels come from `src/content/narration.ts`, through props from the player, so the component imports no content (lane rule as in `src/ui/readiness/`).
   - When the RepresentationSwitcher (frame 1f) is built, it can render the same component.
6. **Stopping on a screen change.** `LessonPlayer` calls `narration.stop()` in an effect keyed on `screen.id` (and on unmount). The new screen's control starts idle.
7. **Settings.**
   - `parseSettings` keeps a boolean `narration` (any other value means the default, from `conventions.json`, Off). Same key, no version change.
   - `DisplaySettings` shows the narration switch enabled when `available`. Otherwise it is disabled with `narrationCopy.unavailable` in place of `lessonCopy.settings.later`.
8. **Content (content-author).** `src/content/narration.ts` holds `readAloud`, `pause`, `resume`, `stop`, `group` (the accessible name of the control group) and `unavailable`, all flagged. `lessonCopy.settings.later` stays for any other later item.
9. **Gallery.** `NarrationGallery.tsx` shows the control idle, speaking, paused and unavailable (a disabled switch with its note), driven by a fake engine. A visual spec checks the three widths, light and dark, and 44 px targets.

## Risks / Trade-offs

- [`localService` is misreported by some browsers] → The rule lives in `pickVoice`, the one place to change. The a11y-checker does a network-tab check on Chrome, Safari and Firefox in task 4.2.
- [Some devices have no on-device English voice] → Any on-device voice is used. With none, the switch explains why it is off. Nothing breaks.
- [A screen-reader user turns narration on] → Speech starts only on a button press, so the two voices clash only if the student chooses it. The next change looks at this.
- [`checkVisibility` is newer] → It has a fallback (`getClientRects`). jsdom has no layout, so tests mark visibility with `hidden` and `aria-hidden`.
- [Markers can be forgotten on a new block type] → A test walks one screen of every block type and checks that each has at least one spoken part.
- [Pause and resume are unreliable on some Android browsers] → Stop always works. Resume falls back to reading the remaining parts again from the current one.

## Migration Plan

No data migration: a stored `narration: false` stays false; a stored `true` now takes effect where a voice exists. To roll back, revert the change; the parser then forces false again.
