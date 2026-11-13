import { useId, type FormEvent } from 'react'
import { sandboxCopy as copy } from '../../content/sandbox'
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

/** Key field, Insert and Delete, the shortcuts and the inline notice (wireframe 1n InsertControl). */
export function InsertControl({ value, onValue, full, notice, onInsert, onDelete, onSorted, onRandom, onClear }: InsertControlProps) {
  const fieldId = useId()
  const noticeId = useId()
  // Anything that is not a number goes to the reducer as NaN and comes back as the range notice.
  const key = () => (value.trim() === '' ? Number.NaN : Number(value))
  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!full) onInsert(key())
  }
  return (
    <section className="sandbox-controls" aria-label={copy.controlsLabel}>
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
        <button type="submit" className="module-button module-button-primary" disabled={full}>
          {copy.insert}
        </button>
        <button type="button" className="module-button module-button-secondary" onClick={() => onDelete(key())}>
          {copy.delete}
        </button>
      </form>
      <div className="sandbox-row">
        <button type="button" className="module-button module-button-secondary" onClick={onSorted} disabled={full}>
          {copy.sorted}
        </button>
        <button type="button" className="module-button module-button-secondary" onClick={onRandom} disabled={full}>
          {copy.random}
        </button>
        <button type="button" className="module-button module-button-quiet" onClick={onClear}>
          {copy.clear}
        </button>
      </div>
      <div id={noticeId} role="status" aria-label={copy.noticeLabel} className="sandbox-notice">
        {full ? copy.full : notice === null ? '' : copy.notice(notice)}
      </div>
    </section>
  )
}
