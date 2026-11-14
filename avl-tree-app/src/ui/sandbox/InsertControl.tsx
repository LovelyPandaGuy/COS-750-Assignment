import { useId, type FormEvent } from 'react'
import { controlsCopy } from '../../content/controls'
import { sandboxCopy as copy } from '../../content/sandbox'
import { ControlBar } from '../controls/ControlBar'
import { ControlButton } from '../controls/ControlButton'
import type { Notice } from '../../sandbox/sandbox'

export interface InsertControlProps {
  value: string
  onValue: (value: string) => void
  full: boolean
  notice: Notice | null
  onInsert: (key: number) => void
  onDelete: (key: number) => void
  onSorted: () => void
  onRandom: () => void
  onClear: () => void
}

/**
 * Key field, then the shared control bar (Insert, Delete, the shortcuts, Clear) and the inline notice
 * (wireframe 1n InsertControl; revamp-sandbox-layout, D137 to D139). Enter in the field submits the form.
 */
export function InsertControl({ value, onValue, full, notice, onInsert, onDelete, onSorted, onRandom, onClear }: InsertControlProps) {
  const fieldId = useId()
  const noticeId = useId()
  // Anything that is not a number goes to the reducer as NaN and comes back as the range notice.
  const key = () => (value.trim() === '' ? Number.NaN : Number(value))
  const insert = () => {
    if (!full) onInsert(key())
  }
  const submit = (e: FormEvent) => {
    e.preventDefault()
    insert()
  }
  return (
    <div className="sandbox-controls">
      <form className="sandbox-row" onSubmit={submit} noValidate>
        <label htmlFor={fieldId}>{copy.fieldLabel}</label>
        <input
          id={fieldId}
          className="sandbox-input"
          type="number"
          inputMode="numeric"
          min={1}
          max={99}
          step={1}
          value={value}
          onChange={(e) => onValue(e.target.value)}
          aria-describedby={noticeId}
        />
      </form>
      <ControlBar label={copy.controlsLabel}>
        <ControlButton icon={controlsCopy.icons.place} label={copy.insert} disabled={full} onClick={insert} />
        <ControlButton icon={controlsCopy.icons.remove} label={copy.delete} onClick={() => onDelete(key())} />
        <ControlButton label={copy.sorted} disabled={full} onClick={onSorted} />
        <ControlButton label={copy.random} disabled={full} onClick={onRandom} />
        <ControlButton variant="quiet" label={copy.clear} onClick={onClear} />
      </ControlBar>
      <div id={noticeId} role="status" aria-label={copy.noticeLabel} className="sandbox-notice">
        {full ? copy.full : notice === null ? '' : copy.notice(notice)}
      </div>
    </div>
  )
}
