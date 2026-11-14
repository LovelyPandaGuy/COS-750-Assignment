import { useId } from 'react'
import './replay.css'
import { replayCopy } from '../../content/replay'
import type { Representation } from '../../modules/schema'
import { lockedBox, SWITCHER_BOXES, type SwitcherBox } from './representations'

const copy = replayCopy.switcher

const LABEL: Record<SwitcherBox, string> = { diagram: copy.diagram, text: copy.text, pseudocode: copy.pseudocode }

export type SwitcherMode = 'watch' | 'do'

export interface RepresentationSwitcherProps {
  /** The step's primary representation; its box is locked on. `animation` plays on the diagram, so it locks Diagram. */
  primary: Representation
  shown: readonly Representation[]
  onToggle: (representation: Representation) => void
  /** Screen 1h: the Watch or Do it yourself choice in the same bar. */
  mode?: { value: SwitcherMode; onChange: (mode: SwitcherMode) => void }
  /** The task, shown at the end of the bar (screen 1f: "Insert 5 into an AVL tree"). */
  task?: string
}

/**
 * "Show:" choices for one step (FR-LRN-02, D22, D106, wireframes 1f and 1h). One primary, locked on and
 * marked "main"; the others start from the step's defaults and toggle on demand. Stateless.
 */
export function RepresentationSwitcher({ primary, shown, onToggle, mode, task }: RepresentationSwitcherProps) {
  const group = useId()
  const locked = lockedBox(primary)
  return (
    <div className="switcher">
      <fieldset className="switcher-group">
        <legend>{copy.show}</legend>
        {SWITCHER_BOXES.map((r) => {
          const isLocked = r === locked
          return (
            <label key={r} className="switcher-option">
              <input type="checkbox" checked={isLocked || shown.includes(r)} disabled={isLocked} onChange={() => onToggle(r)} />
              {LABEL[r]}
              {isLocked && (
                <>
                  {' '}
                  <span className="switcher-main">{copy.main}</span>
                </>
              )}
            </label>
          )
        })}
      </fieldset>
      {mode && (
        <fieldset className="switcher-group">
          <legend>{copy.mode}</legend>
          {(['watch', 'do'] as const).map((m) => (
            <label key={m} className="switcher-option">
              <input type="radio" name={group} checked={mode.value === m} onChange={() => mode.onChange(m)} />
              {m === 'watch' ? copy.watch : copy.doIt}
            </label>
          ))}
        </fieldset>
      )}
      {task !== undefined && <p className="switcher-task">{task}</p>}
    </div>
  )
}
