// A fake speech engine for the narration tests (add-narration). Records what would be spoken; never speaks.
import type { SpeechEngine, Voice } from '../../../src/ui/narration/engine'

export const LOCAL_EN: Voice = { name: 'Example local English', lang: 'en-GB', localService: true }
export const REMOTE_EN: Voice = { name: 'Example remote English', lang: 'en-US', localService: false }
export const LOCAL_FR: Voice = { name: 'Example local French', lang: 'fr-FR', localService: true }

export interface FakeEngine extends SpeechEngine {
  spoken: string[][]
  voicesUsed: (Voice | null)[]
  calls: { pause: number; resume: number; cancel: number }
  /** Ends the current speech as the browser would when the last part is read. */
  finish(): void
  /** Changes the voice list and fires voiceschanged. */
  setVoices(v: Voice[]): void
  /** Changes the voice list without firing voiceschanged, as some browsers do (fix-narration-late-voices). */
  setVoicesSilently(v: Voice[]): void
  /** How many times the voice list has been read. */
  reads: number
}

export interface FakeEngineOptions {
  /** The first read returns no voices, as Chrome's first getVoices() does while it loads them. */
  emptyFirstRead?: boolean
}

export function fakeEngine(initial: Voice[] = [LOCAL_EN], opts: FakeEngineOptions = {}): FakeEngine {
  let list = initial
  let done: (() => void) | null = null
  const listeners = new Set<() => void>()
  const e: FakeEngine = {
    spoken: [],
    voicesUsed: [],
    calls: { pause: 0, resume: 0, cancel: 0 },
    reads: 0,
    voices: () => (e.reads++ === 0 && opts.emptyFirstRead ? [] : list),
    onVoicesChanged(cb) {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    speak(parts, voice, onDone) {
      e.spoken.push([...parts])
      e.voicesUsed.push(voice)
      done = onDone
    },
    pause: () => void e.calls.pause++,
    resume: () => void e.calls.resume++,
    cancel: () => {
      e.calls.cancel++
      done = null
    },
    finish() {
      const d = done
      done = null
      d?.()
    },
    setVoices(v) {
      list = v
      listeners.forEach((l) => l())
    },
    setVoicesSilently(v) {
      list = v
    },
  }
  return e
}
