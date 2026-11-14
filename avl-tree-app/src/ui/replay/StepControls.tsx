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
  return (
    <div className="replay-controls" role="group" aria-label={copy.label}>
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
