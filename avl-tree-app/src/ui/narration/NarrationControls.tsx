import { Button } from '../base'
import { useNarration } from './NarrationContext'
import './narration.css'

export interface NarrationLabels {
  group: string
  readAloud: string
  pause: string
  resume: string
  stop: string
}

/**
 * Read aloud, Pause or Resume, and Stop (add-narration, design decision 5, D148). Nothing renders unless
 * narration is on and an on-device voice exists. The first button stays the same element through its
 * states, so keyboard focus is not lost when Read aloud becomes Pause.
 */
export function NarrationControls({ getRoot, labels }: { getRoot: () => Element | null; labels: NarrationLabels }) {
  const n = useNarration()
  if (n === null || !n.enabled) return null
  const { state } = n
  const main = state === 'idle' ? { label: labels.readAloud, act: () => n.read(getRoot()) } : state === 'speaking' ? { label: labels.pause, act: n.pause } : { label: labels.resume, act: n.resume }
  return (
    <div className="narration-controls" role="group" aria-label={labels.group} data-state={state}>
      <Button variant="secondary" onClick={main.act}>
        {main.label}
      </Button>
      {state !== 'idle' && (
        <Button variant="quiet" onClick={n.stop}>
          {labels.stop}
        </Button>
      )}
    </div>
  )
}
