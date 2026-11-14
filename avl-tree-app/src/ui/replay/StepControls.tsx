import { useLayoutEffect, useRef, type FocusEvent } from 'react'
import './replay.css'
import { replayCopy } from '../../content/replay'
import { SPEEDS, type Speed } from '../../replay/replay'

const copy = replayCopy.controls

export interface StepControlsProps {
  position: number
  length: number
  playing: boolean
  speed: Speed
  /** Waiting for a prediction: Play, Step and Replay are disabled. */
  held: boolean
  onBack: () => void
  onToggle: () => void
  onStep: () => void
  onSpeed: (speed: Speed) => void
  /** Back to position 0 and play from there (revamp-tree-controls). */
  onReplay: () => void
}

/**
 * The replay strip (FR-VIS-03, D23, wireframe 1f): replay navigation on one side (Back, Play or Pause,
 * Step, Replay), progress and speed on the other. Stateless. Learning aids live in the module strip.
 */
export function StepControls({ position, length, playing, speed, held, onBack, onToggle, onStep, onSpeed, onReplay }: StepControlsProps) {
  const atEnd = position >= length
  const strip = useRef<HTMLDivElement>(null)
  // The strip button that last had focus while focus is in the strip (review C4, WCAG 2.4.3).
  const lastFocused = useRef<HTMLButtonElement | null>(null)
  const onFocus = (e: FocusEvent<HTMLDivElement>) => {
    lastFocused.current = e.target instanceof HTMLButtonElement ? e.target : null
  }
  const onBlur = (e: FocusEvent<HTMLDivElement>) => {
    if (!(e.relatedTarget instanceof Node) || !strip.current?.contains(e.relatedTarget)) lastFocused.current = null
  }
  // A disabled button drops focus (browsers send no blur when it happens). If the focused button has just
  // been disabled and focus has not gone anywhere else, move it to the next enabled strip button, else the previous.
  useLayoutEffect(() => {
    const was = lastFocused.current
    const root = strip.current
    if (!was || !root || !was.disabled) return
    const active = document.activeElement
    if (active !== was && active !== document.body && active !== null) return
    const buttons = Array.from(root.querySelectorAll('button'))
    const i = buttons.indexOf(was)
    const target = buttons.slice(i + 1).find((b) => !b.disabled) ?? buttons.slice(0, Math.max(i, 0)).reverse().find((b) => !b.disabled)
    if (target) target.focus()
    else lastFocused.current = null
  })
  return (
    <div ref={strip} className="replay-controls" role="group" aria-label={copy.label} onFocus={onFocus} onBlur={onBlur}>
      <div className="replay-side" role="group" aria-label={copy.navGroup}>
        <button type="button" className="replay-button" disabled={position <= 0} onClick={onBack}>
          <span aria-hidden="true">{copy.iconBack}</span>
          {copy.back}
        </button>
        <button type="button" className="replay-button" data-primary="" disabled={held} onClick={onToggle}>
          <span aria-hidden="true">{playing ? copy.iconPause : copy.iconPlay}</span>
          {playing ? copy.pause : copy.play}
        </button>
        <button type="button" className="replay-button" disabled={held || atEnd} onClick={onStep}>
          {copy.step}
          <span aria-hidden="true">{copy.iconStep}</span>
        </button>
        <button type="button" className="replay-button" disabled={held || (position <= 0 && !playing)} onClick={onReplay}>
          <span aria-hidden="true">{copy.iconReplay}</span>
          {copy.replay}
        </button>
      </div>
      <div className="replay-side replay-progress" role="group" aria-label={copy.progressGroup}>
        <progress value={position} max={Math.max(length, 1)} aria-label={copy.progress} />
        <span className="replay-counter">{copy.counter(position, length)}</span>
        <div className="replay-side" role="group" aria-label={copy.speed}>
          <span className="replay-speed-label" aria-hidden="true">
            {copy.speed}
          </span>
          {SPEEDS.map((s) => (
            <button key={s} type="button" className="replay-button" aria-pressed={s === speed} onClick={() => onSpeed(s)}>
              {copy.speedLabel(s)}
            </button>
          ))}
        </div>
      </div>
      {held && <p className="replay-note">{copy.held}</p>}
    </div>
  )
}
