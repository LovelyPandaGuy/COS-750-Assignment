import './replay.css'
import { replayCopy } from '../../content/replay'
import { SPEEDS, type Speed } from '../../replay/replay'

const copy = replayCopy.controls

export interface StepControlsProps {
  position: number
  length: number
  playing: boolean
  speed: Speed
  /** Waiting for a prediction: Play and Step are disabled. */
  held: boolean
  onBack: () => void
  onToggle: () => void
  onStep: () => void
  onSpeed: (speed: Speed) => void
}

/** Back, Play/Pause, Step, progress and speed (FR-VIS-03, wireframe 1f). Stateless. */
export function StepControls({ position, length, playing, speed, held, onBack, onToggle, onStep, onSpeed }: StepControlsProps) {
  const atEnd = position >= length
  return (
    <div className="replay-controls" role="group" aria-label={copy.label}>
      <div className="replay-row">
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
      </div>
      <div className="replay-row replay-progress">
        <progress value={position} max={Math.max(length, 1)} aria-label={copy.progress} />
        <span>{copy.counter(position, length)}</span>
      </div>
      <div className="replay-row" role="group" aria-label={copy.speed}>
        <span className="replay-speed-label" aria-hidden="true">
          {copy.speed}
        </span>
        {SPEEDS.map((s) => (
          <button key={s} type="button" className="replay-button" aria-pressed={s === speed} onClick={() => onSpeed(s)}>
            {copy.speedLabel(s)}
          </button>
        ))}
      </div>
      {held && <p className="replay-note">{copy.held}</p>}
    </div>
  )
}
