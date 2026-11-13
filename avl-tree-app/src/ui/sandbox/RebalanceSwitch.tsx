import { sandboxCopy as copy } from '../../content/sandbox'

/** Rebalancing ON or OFF, always in words as well as the thumb position (wireframe 1n note 1). */
export function RebalanceSwitch({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <div className="sandbox-switch-row">
      <button type="button" role="switch" aria-checked={on} className="sandbox-switch" data-on={on} onClick={onToggle}>
        <span className="sandbox-switch-track" aria-hidden="true">
          <span className="sandbox-switch-thumb" />
        </span>
        {copy.switchLabel(on)}
      </button>
      <p>{copy.switchHint(on)}</p>
    </div>
  )
}
