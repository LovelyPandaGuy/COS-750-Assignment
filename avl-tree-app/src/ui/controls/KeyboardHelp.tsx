// Wireframes 1h, 1m KeyboardHelp (tree-controls "Keyboard help"; design 4). A disclosure, closed by default
// and not stored, listing the screen's shortcuts from the registry (shortcutsFor) as key caps and actions.
import { useId, useState } from 'react'
import { controlsCopy } from '../../content/controls'
import { Button } from '../base'
import './controls.css'

export interface KeyboardHelpProps {
  heading: string
  keys: readonly { keys: string; action: string }[]
}

export function KeyboardHelp({ heading, keys }: KeyboardHelpProps) {
  const [open, setOpen] = useState(false)
  const panelId = useId()
  const headingId = useId()
  return (
    <div className="keyboard-help">
      <Button variant="quiet" aria-expanded={open} aria-controls={panelId} onClick={() => setOpen((o) => !o)}>
        {controlsCopy.help.show}
      </Button>
      {open && (
        <section id={panelId} aria-labelledby={headingId} className="keyboard-help-panel">
          <p id={headingId} className="keyboard-help-heading">
            {heading}
          </p>
          <dl className="keyboard-help-list">
            {keys.map((k) => (
              <div key={k.keys + k.action} className="keyboard-help-row">
                <dt>
                  <kbd>{k.keys}</kbd>
                </dt>
                <dd>{k.action}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}
    </div>
  )
}
