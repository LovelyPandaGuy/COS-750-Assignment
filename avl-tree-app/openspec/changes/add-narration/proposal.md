# Proposal: add-narration

Capability: `narration` (new); `display-settings` (modified).

The user asked for "screen-reader functionality" and chose two changes (14 Nov):
1. **This one:** narration, the app reading a screen aloud with the browser's own speech.
2. **Next:** better support for the student's own screen reader (VoiceOver, NVDA): announcing tree changes and steps, the reading order and focus order. It is listed under "Workflow follow-up" in `tasks.md`, not built here.

## Open questions

No question blocks the work. Each one has a recommendation, and the specs follow it. Each assumption lives in one constant, one content entry or one component (D18). Decision numbers start at D145, because D125 to D144 are proposed by the revamp changes and not yet recorded.

1. **Starting it (proposed D145, assumed).** D26 calls read-aloud a stretch item. D115 shows the switch, off and disabled. The ID says only "Audio narration is text-to-speech in the prototype" (ID 8.1).
   - **Recommendation:** the Narration setting (the existing switch, "Read text aloud (text-to-speech)") turns on a **Read aloud** control on every lesson screen.
   - Nothing speaks until the student presses it. There is no automatic reading on a screen change, because an automatic voice would talk over a student's own screen reader (the next change) and would surprise a student who turned the switch on by accident.
   - Automatic reading could be added later behind one constant.
2. **What is read (proposed D146, assumed).** The visible screen, in reading order:
   - the screen heading;
   - the main text and points;
   - the tree's existing text description (`describeTree`, the same words as the "Describe" button);
   - the step caption;
   - the rule or hint, if open;
   - the support text;
   - a question's stem and options;
   - the feedback once shown.

   Elements opt in with a marker attribute, so the voice reads exactly the words on screen. **No new teaching text is written** (guardrail). Buttons, the position line and the top bar are not read.
3. **Offline voices only (proposed D147, NFR-05).** Some browsers' default voices are online voices: Chrome's "Google" voices send the text to a server. That would be a network call after first load.
   - **Recommendation:** use only voices the browser marks as on the device (`localService`), preferring English.
   - If there is no such voice, or no speech support at all, the switch stays disabled with a note that the device cannot read aloud. The student is never asked to pick a voice.
   - The note is new wording (content-author, flagged).
4. **Controls (proposed D148, assumed).**
   - Read aloud starts. While speaking, the control becomes **Pause**, plus a **Stop**. While paused, it becomes **Resume** and **Stop**.
   - Speech stops when the screen changes, when the setting is turned off, and when the page is hidden.
   - The speaking rate is the browser default: one constant, with no rate control.
   - Each control states its state in words and has a 44 px target.
   - No live-region announcements: the button label carries the state, so a screen reader is not spoken over twice.
5. **Where the control sits (design 1f, assumed).** Frame 1f draws "Read aloud 🔈" as a toggle inside the RepresentationSwitcher, which is still a stub.
   - **Recommendation:** a small NarrationControls component in `src/ui/narration/`, placed directly under each lesson screen's heading.
   - When the RepresentationSwitcher is built, it can host the same component. Only the placement changes.
6. **The settings parser and the old "later" requirement.** `parseSettings` always forces `narration: false`, and `display-settings` requires the switch to be "disabled … until text-to-speech is built".
   - This change removes that requirement and stores the narration choice like the others (same key, no version change).
   - The existing test "narration comes later" (`tests/ui/lesson-c1-c9.test.tsx`) is replaced: a test-writer edit, flagged.
7. **Scope of screens.** The lesson player only: C1 to C9, the refreshers, and the check and practice screens inside it. The start screen, hub, sandbox and `/readiness` are out of scope; they can mount the same control later.
8. **Requirement IDs.**
   - ID 8.1 ("Audio narration is text-to-speech in the prototype").
   - ID 11 (UDL, several representations).
   - D26, D115.
   - NFR-02 (accessibility: keyboard, 44 px, no colour-only signals).
   - NFR-05 (no network requests after first load).
   - [OPEN] The SE document has no FR for narration; check whether one should be added (FR-VIS-xx).

## Why

The ID promises text-to-speech narration (ID 8.1). The settings screen and the Aa menu already show a "Read text aloud" switch that cannot be turned on (D115). Students who learn better by listening, or who tire reading on a phone, get the same words read to them, without recorded audio (D26) and without the text leaving the device.

## What Changes

- The Narration switch can be turned on where the device has an on-device voice. Elsewhere it stays disabled with a short reason. The choice is stored with the other settings.
- With narration on, every lesson screen shows Read aloud. It reads the visible screen in reading order, using only words already on the screen, including the tree's text description.
- Pause, Resume and Stop. Speech stops on a screen change, on turning the setting off, and when the page is hidden.
- Only on-device voices are used, so no network request is ever made.
- New labels in `src/content/narration.ts` (flagged): Read aloud, Pause, Resume, Stop, and the "cannot read aloud" note.

## Out of scope

- Support for the student's own screen reader (the next change).
- Automatic reading on a screen change; word highlighting; speed or voice choice.
- Narration outside the lesson player.
- Recorded audio (D26).
- Any change to the lesson JSON or teaching text.

## Capabilities

### New Capabilities

- `narration`: reading the current lesson screen aloud with an on-device voice, controlled by the student, without network use or new wording.

### Modified Capabilities

- `display-settings`: the narration switch works where an on-device voice exists, and it is stored. This replaces "Narration comes later".
- `app-shell`: the Aa menu no longer shows "Read-aloud is coming in a later update." (found in the critique, task 3.1).

## Impact

- **New:**
  - `src/ui/narration/`: the speech adapter (wrapping `speechSynthesis`), a provider and hook, NarrationControls, and the reading-order collector;
  - `src/content/narration.ts` (content-author);
  - tests under `tests/ui/narration/`.
- **Changed:**
  - `src/state/storage.ts` (`parseSettings` keeps `narration`);
  - `src/ui/DisplaySettings.tsx` (the narration switch);
  - `src/ui/lesson/LessonPlayer.tsx` and the lesson blocks that render text, questions and trees (the marker attribute);
  - `src/App.tsx` or `ThemeContext` (mount the provider);
  - `tests/ui/lesson-c1-c9.test.tsx` (the "comes later" test).
- **Browser API:** `window.speechSynthesis` and `SpeechSynthesisUtterance`, both local.
- No new dependencies, no storage version change, no network.
