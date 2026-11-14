import { shellCopy } from '../content/shell'

/** A display setting as a switch (display-settings): a native button with role="switch", On or Off in words. */
export function SettingSwitch({ label, on, onToggle, disabled = false, note }: { label: string; on: boolean; onToggle: () => void; disabled?: boolean; note?: string }) {
  return (
    <div className="setting-row">
      <button type="button" role="switch" aria-checked={on} className="theme-switch" onClick={onToggle} disabled={disabled}>
        <span>{label}</span>
        <span className="theme-switch-state" aria-hidden="true">
          {on ? shellCopy.switchOn : shellCopy.switchOff}
          <span className="theme-switch-track">
            <span className="theme-switch-knob" />
          </span>
        </span>
      </button>
      {note !== undefined && <p className="setting-note">{note}</p>}
    </div>
  )
}
