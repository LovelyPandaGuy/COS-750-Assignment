// The narration session (add-narration, design decision 2): whether narration can and may speak, what
// it is doing, and the actions. Components outside the provider get null and show nothing.
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { collectNarration } from './collect'
import { pickVoice, splitParts, type SpeechEngine, type Voice } from './engine'

export type NarrationState = 'idle' | 'speaking' | 'paused'

export interface NarrationSession {
  /** An engine with an on-device voice exists (D147). */
  available: boolean
  /** The setting is on and narration is available. */
  enabled: boolean
  state: NarrationState
  read: (root: Element | null) => void
  pause: () => void
  resume: () => void
  stop: () => void
}

const Ctx = createContext<NarrationSession | null>(null)

export function NarrationProvider({ engine, on, initialState = 'idle', children }: { engine: SpeechEngine | null; on: boolean; /** For the gallery only. */ initialState?: NarrationState; children?: ReactNode }) {
  const [voice, setVoice] = useState<Voice | null>(() => (engine ? pickVoice(engine.voices()) : null))
  const [state, setState] = useState<NarrationState>(initialState)
  const stateRef = useRef(state)
  useEffect(() => {
    stateRef.current = state
  }, [state])
  // Each read has a number, so a late "done" from cancelled speech changes nothing.
  const generation = useRef(0)

  // The engine is fixed for the app's life; voices that load late are picked up here.
  useEffect(() => engine?.onVoicesChanged(() => setVoice(pickVoice(engine.voices()))), [engine])

  const enabled = on && voice !== null

  const stop = useCallback(() => {
    generation.current++
    if (stateRef.current !== 'idle') engine?.cancel()
    setState('idle')
  }, [engine])

  const read = useCallback(
    (root: Element | null) => {
      if (!engine || voice === null || root === null) return
      const parts = splitParts(collectNarration(root))
      if (parts.length === 0) return
      engine.cancel()
      const g = ++generation.current
      engine.speak(parts, voice, () => {
        if (generation.current === g) setState('idle')
      })
      setState('speaking')
    },
    [engine, voice],
  )
  const pause = useCallback(() => {
    engine?.pause()
    setState('paused')
  }, [engine])
  const resume = useCallback(() => {
    engine?.resume()
    setState('speaking')
  }, [engine])

  // Turning narration off stops speech (D148): the state resets during render, the engine in an effect.
  const [wasEnabled, setWasEnabled] = useState(enabled)
  if (wasEnabled !== enabled) {
    setWasEnabled(enabled)
    if (!enabled && state !== 'idle') setState('idle')
  }
  useEffect(() => {
    if (!enabled) {
      generation.current++
      engine?.cancel()
    }
  }, [enabled, engine])

  // A hidden page stops speech (D148).
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') stop()
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [stop])

  const value = useMemo<NarrationSession>(() => ({ available: voice !== null, enabled, state, read, pause, resume, stop }), [voice, enabled, state, read, pause, resume, stop])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components -- the hook belongs with its provider
export function useNarration(): NarrationSession | null {
  return useContext(Ctx)
}
