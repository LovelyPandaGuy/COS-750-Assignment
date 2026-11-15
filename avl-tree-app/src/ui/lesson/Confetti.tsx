// The celebration when a lesson is completed (lesson-celebration; revamp-lesson-frame design 2, D169;
// ID 10.4 "a short burst of confetti marks the completion of each lesson … once it is off it stays off").
// Side cannons from react-canvas-confetti (D173). Mounted once with the routes. Lessons completed before this visit never celebrate: the first render only
// records the completed list. No burst with the Confetti setting off or under reduced motion (quality bar 9).
import './confetti.css'
import { Component, useCallback, useEffect, useRef, useState, type ComponentType, type ReactNode } from 'react'
import * as canvasConfetti from 'react-canvas-confetti'
import { loadContent } from '../../live/load'
import { useLearner } from '../../state/LearnerContext'
import { useTheme } from '../ThemeContext'

const durationMs = () => (loadContent().content?.rewards as { confetti?: { durationMs?: number } } | undefined)?.confetti?.durationMs ?? 1500
const reducedMotion = () => typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

// The package is CommonJS only: depending on the bundler the default import is the component or the module
// object holding it (seen in the dev server, 15 Nov). Take whichever is the component.
type CanvasProps = { className?: string; onInit?: (p: { confetti: (options: Record<string, unknown>) => unknown }) => void }
const unwrap = (m: unknown): ComponentType<CanvasProps> => {
  const d = (m as { default?: unknown }).default
  return (typeof d === 'function' ? d : (d as { default: unknown }).default) as ComponentType<CanvasProps>
}
const ReactCanvasConfetti = unwrap(canvasConfetti)

/** Decorative only: if the confetti ever fails, show nothing rather than take the page down. */
class Decorative extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

/** Token colours read at fire time, so dark mode matches (D173); empty ones are skipped. */
const COLOUR_TOKENS = ['--action-primary', '--accent-highlight', '--node-balanced', '--node-unbalanced', '--node-rotating', '--node-new']
const tokenColours = (): string[] => {
  const cs = getComputedStyle(document.documentElement)
  return COLOUR_TOKENS.map((t) => cs.getPropertyValue(t).trim()).filter((c) => c !== '')
}
/** How often the cannons fire while the burst lasts. */
const FIRE_EVERY_MS = 30
/** The canvas stays until the last pieces have fallen: at most 4 s after completion (D173). */
const FALL_MS = 2400

/** Two side cannons, bottom-left and bottom-right towards the middle, for `duration` ms (D173). */
export function Confetti({ duration }: { duration: number }) {
  const timer = useRef<ReturnType<typeof setInterval> | undefined>(undefined)
  const onInit = useCallback(
    ({ confetti }: { confetti: (options: Record<string, unknown>) => unknown }) => {
      const colors = tokenColours()
      const base = { particleCount: 3, spread: 55, startVelocity: 55, disableForReducedMotion: true, ...(colors.length > 0 ? { colors } : {}) }
      const shoot = () => {
        confetti({ ...base, angle: 60, origin: { x: 0, y: 0.9 } })
        confetti({ ...base, angle: 120, origin: { x: 1, y: 0.9 } })
      }
      shoot()
      let fired = FIRE_EVERY_MS
      timer.current = setInterval(() => {
        if (fired >= duration) {
          clearInterval(timer.current)
          return
        }
        fired += FIRE_EVERY_MS
        shoot()
      }, FIRE_EVERY_MS)
    },
    [duration],
  )
  useEffect(() => () => clearInterval(timer.current), [])
  return (
    <div className="confetti" aria-hidden="true">
      <ReactCanvasConfetti className="confetti-canvas" onInit={onInit} />
    </div>
  )
}

export function Celebration() {
  const { learner } = useLearner()
  const on = useTheme()?.settings.confetti ?? true
  const seen = useRef<ReadonlySet<string> | null>(null)
  const [burst, setBurst] = useState(0)

  useEffect(() => {
    const now = new Set<string>(learner.completedModules)
    const before = seen.current
    seen.current = now
    if (before === null) return
    const added = [...now].some((m) => !before.has(m))
    if (added && on && !reducedMotion()) setBurst((n) => n + 1)
  }, [learner.completedModules, on])

  useEffect(() => {
    if (burst === 0) return
    const t = setTimeout(() => setBurst(0), durationMs() + FALL_MS)
    return () => clearTimeout(t)
  }, [burst])

  return burst > 0 ? (
    <Decorative key={burst}>
      <Confetti duration={durationMs()} />
    </Decorative>
  ) : null
}
