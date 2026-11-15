# Proposal

## Open questions

No `[OPEN]` item blocks the specs (D18). Please read these before `/opsx:apply`.

1. **Unconfirmed: the cause has not yet been seen in your browser.** I found the cause by reading the code, not by running Chrome. Task 1.1 asks you to paste one line into the DevTools console on the page that shows the note. If the list printed there has voices with `localService: true`, this change is the fix. If every voice prints `false`, Chrome on your Mac offers only remote (Google) voices. That is a different problem, a policy question on D147/NFR-05 (may a remote voice ever be used?), and this change will not fix it. In that case stop after task 1.1.
2. **Assumed, not blocking (D174): Chrome gets a 3 s window to deliver voices.** As well as the `voiceschanged` event, the provider reads the voice list again once when it mounts and then every 250 ms until a voice is found or 3 s pass. Both numbers sit in one constant in `src/ui/narration/engine.ts`. A new row D174 goes into `decisions.md` when this change is merged.
3. **Kept as is (D147, NFR-05): on-device voices only.** The rule for choosing a voice does not change. The fix only makes sure the app sees the voices Chrome has.

Serves ID 8.1 (narration), ID 11 (accessibility), NFR-05 (no text leaves the device), D145, D147.

## Why

On macOS in Chrome, the narration switch is disabled with "This device has no built-in voice that works offline", even though macOS has on-device voices (Samantha, Daniel and others).

What the code does now (`src/ui/narration/NarrationContext.tsx`):

- On the first render, the provider calls `speechSynthesis.getVoices()` once. In Chrome the first call returns an empty list and starts loading the voices in the background.
- The `voiceschanged` listener is added later, in a `useEffect` that runs after the first paint.
- Chrome fires `voiceschanged` **once per page**. If the voices load before the effect runs, the event fires with nobody listening. After that, `getVoices()` would return the full list, but nothing asks for it again. The voice stays `null`, `available` is false, and the settings show the "no built-in voice" note for the rest of the visit.

Why it worked before and fails now: the race depends on how long the first render and paint take. Recent UI work (the sidebar, the confetti canvas, more on every screen) made that first render longer, so Chrome's voices now usually arrive before the listener is added. The existing test ("voices that load late make it available") does not catch this, because its fake fires the event only after the provider has subscribed.

## What Changes

- **Voices are read again after subscribing (changed):** when the provider adds its `voiceschanged` listener, it reads the voice list straight away. Voices that arrived before the listener existed are found.
- **A short bounded re-check (new):** until an on-device voice is found, the provider reads the list again every 250 ms for up to 3 s (D174, assumed). It then stops. This covers browsers that fill the list without firing the event. Nothing runs after a voice is found, after the window ends, or after unmount.
- **No change to which voice is chosen**, to what is spoken, or to the "no built-in voice" note. The note still shows on a device with no on-device voice.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `narration`: the "On-device voices only" requirement gains scenarios saying that voices already loaded before the app listens, and voices that arrive without an event, are found.

## Impact

- `src/ui/narration/NarrationContext.tsx`: the voices effect.
- `src/ui/narration/engine.ts`: one constant for the re-check interval and window.
- `tests/ui/narration/fake.ts`: a way to change the voice list without firing the event (test-writer).
- `tests/ui/narration/controls.test.tsx`: new tests.
- No change to content, the speech adapter's interface, storage or styles.

## Out of scope

- Allowing remote voices (D147 stands). If task 1.1 shows only remote voices, that is a separate proposal.
- Choosing a voice in the settings, or a voice preference.
- Safari or Firefox behaviour beyond what the same fix covers.
