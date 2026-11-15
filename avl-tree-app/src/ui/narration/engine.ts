// The speech adapter (add-narration, design decisions 1 and 4). The one place that touches
// window.speechSynthesis and the one rule for choosing a voice (D147).

export interface Voice {
  name: string
  lang: string
  /** True when the browser says the voice runs on the device; remote voices send text to a server. */
  localService: boolean
}

export interface SpeechEngine {
  voices(): readonly Voice[]
  /** Voices often load late; returns an unsubscribe. */
  onVoicesChanged(cb: () => void): () => void
  /** Speaks the parts in order; onDone runs once after the last part (not after cancel). */
  speak(parts: readonly string[], voice: Voice, onDone: () => void): void
  pause(): void
  resume(): void
  cancel(): void
}

/** Parts longer than this are split at sentence ends (some browsers stop long utterances). */
export const MAX_UTTERANCE_CHARS = 200

/**
 * D174 (assumed): while no on-device voice is found, read the voice list again this often, for this
 * long. Chrome fires voiceschanged once per page and some browsers not at all (fix-narration-late-voices).
 */
export const VOICE_RECHECK = { intervalMs: 250, windowMs: 3000 } as const

/** NFR-05, D147: on-device voices only, English first; null when there is none. */
export function pickVoice(voices: readonly Voice[]): Voice | null {
  const local = voices.filter((v) => v.localService)
  return local.find((v) => v.lang.toLowerCase().startsWith('en')) ?? local[0] ?? null
}

/** Splits each part longer than the limit at sentence ends, packing sentences up to the limit. */
export function splitParts(parts: readonly string[], max = MAX_UTTERANCE_CHARS): string[] {
  const out: string[] = []
  for (const part of parts) {
    if (part.length <= max) {
      out.push(part)
      continue
    }
    let current = ''
    for (const sentence of part.split(/(?<=[.!?])\s+/)) {
      if (current !== '' && current.length + 1 + sentence.length > max) {
        out.push(current)
        current = sentence
      } else current = current === '' ? sentence : `${current} ${sentence}`
    }
    if (current !== '') out.push(current)
  }
  return out
}

/** The browser's speech, or null when the browser has none. */
export function browserEngine(): SpeechEngine | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window) || typeof SpeechSynthesisUtterance === 'undefined') return null
  const synth = window.speechSynthesis
  const native = () => synth.getVoices()
  return {
    voices: () => native().map((v) => ({ name: v.name, lang: v.lang, localService: v.localService })),
    onVoicesChanged(cb) {
      synth.addEventListener('voiceschanged', cb)
      return () => synth.removeEventListener('voiceschanged', cb)
    },
    speak(parts, voice, onDone) {
      const chosen = native().find((v) => v.name === voice.name && v.localService)
      // Never fall back to the browser's default voice, which may be remote (D147).
      if (chosen === undefined) return onDone()
      synth.cancel()
      parts.forEach((text, i) => {
        const u = new SpeechSynthesisUtterance(text)
        u.voice = chosen
        u.lang = chosen.lang
        if (i === parts.length - 1) {
          u.onend = () => onDone()
          u.onerror = () => onDone()
        }
        synth.speak(u)
      })
    },
    pause: () => synth.pause(),
    resume: () => synth.resume(),
    cancel: () => synth.cancel(),
  }
}
