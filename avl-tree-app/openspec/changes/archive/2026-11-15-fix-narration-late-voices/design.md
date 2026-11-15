# Design

## Context

`NarrationProvider` holds the chosen voice in state. It sets the voice once with `pickVoice(engine.voices())` during the first render, and again in a `voiceschanged` listener that a `useEffect` adds after the first paint. In Chrome:

- The first `getVoices()` call returns `[]` and starts an asynchronous load.
- `voiceschanged` fires once when the load finishes and never again on that page.
- After that, `getVoices()` returns the full list straight away.

If the load finishes between the first render and the effect, the event is lost and the voice stays `null` for the whole visit. The adapter (`browserEngine`) and `pickVoice` are correct. The bug is in when the provider reads the list.

## Goals / Non-Goals

**Goals:**
- Narration finds the on-device voices Chrome on macOS has, however fast they load.
- Keep D147 and NFR-05: on-device voices only, no network.
- Keep it testable with the existing fake engine, without a real browser.

**Non-Goals:**
- Changing which voice is chosen, or letting the student choose.
- Allowing remote voices.
- Changing the `SpeechEngine` interface.

## Decisions

1. **Read the voice list again inside the effect, right after subscribing.** This closes the race: anything that loaded before the listener existed is found at that moment, and anything that loads later fires the event. This is the main fix. Alternative considered: subscribing before the first read, at module level. That does not fit the provider's lifecycle or the injected test engine.

2. **A bounded re-check as a safety net (D174, assumed).** While the chosen voice is `null`, read the list every `VOICE_RECHECK.intervalMs` (250) until `VOICE_RECHECK.windowMs` (3000) has passed, then stop. Stop as soon as `pickVoice` returns a voice, and clear the timer on unmount. Both numbers live in one exported constant in `engine.ts`, next to `MAX_UTTERANCE_CHARS`. Why: some engines (older Chrome builds, Safari) fill the list without firing the event at all. Alternative considered: polling with no end. Rejected because it wastes work on devices that really have no voice.

3. **One function to update the voice.** Each read goes through `refresh = () => setVoice(pickVoice(engine.voices()))`. The event, the read on mount and the re-check all call it, so they choose the voice the same way. `setVoice` with an equal voice object still re-renders. To avoid needless renders, `refresh` keeps the current voice when the new pick has the same `name` and `lang`.

4. **No change to `browserEngine.speak`.** It already looks the voice up by name among the native voices with `localService`, and stops without speaking if it is missing (D147).

## Risks / Trade-offs

- **The cause is inferred, not observed.** Task 1.1 confirms it in the user's Chrome before any code changes. If Chrome reports no `localService` voice, this design does not apply. Stop and raise D147.
- **The re-check costs up to 12 `getVoices()` calls** on a device with no voice. These are cheap, local calls, and nothing runs after 3 s.
- **StrictMode** runs effects twice in development. The cleanup must clear the timer and remove the listener, so no second timer is left running.
