import { useEffect, useId, useRef, useState } from 'react'
import { Button } from '../base'
import type { ExportLabels } from './types'
import './readiness.css'

export interface ExportActionsProps {
  /** The plain text Copy and Save export (from buildExportText). */
  text: string
  fileName: string
  labels: ExportLabels
  /** Defaults to the browser's Print. */
  onPrint?: () => void
  disabled?: boolean
  disabledReason?: string
}

/**
 * Frame 1o ExportActions (FR-RDY-03, NFR-05; design decision 7): Print, Copy and Save as a text file, all
 * in the browser. Copy and Save confirm in a polite live region; if either fails, the text appears in a
 * read-only text area to copy by hand (proposal question 4).
 */
export function ExportActions({ text, fileName, labels, onPrint, disabled = false, disabledReason }: ExportActionsProps) {
  const [message, setMessage] = useState('')
  const [fallback, setFallback] = useState(false)
  const area = useRef<HTMLTextAreaElement>(null)
  const areaId = useId()

  useEffect(() => {
    if (fallback) {
      area.current?.focus()
      area.current?.select()
    }
  }, [fallback])

  const showFallback = () => {
    setFallback(true)
    setMessage(labels.fallback)
  }

  const copy = async () => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('no clipboard')
      await navigator.clipboard.writeText(text)
      setMessage(labels.copied)
    } catch {
      showFallback()
    }
  }

  const save = () => {
    try {
      const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }))
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      a.click()
      URL.revokeObjectURL(url)
      setMessage(labels.saved)
    } catch {
      showFallback()
    }
  }

  return (
    <div className="readiness-export">
      <div className="readiness-actions" role="group" aria-label={labels.group}>
        <Button variant="primary" onClick={() => (onPrint ?? (() => window.print()))()} disabled={disabled} disabledReason={disabled ? disabledReason : undefined}>
          {labels.print}
        </Button>
        <Button variant="secondary" onClick={() => void copy()} disabled={disabled}>
          {labels.copy}
        </Button>
        <Button variant="secondary" onClick={save} disabled={disabled}>
          {labels.save}
        </Button>
      </div>
      <p className="readiness-live" role="status">
        {message}
      </p>
      {fallback && (
        <div className="readiness-fallback">
          <label className="readiness-field-label" htmlFor={areaId}>
            {labels.fallbackLabel}
          </label>
          <textarea ref={area} id={areaId} className="readiness-field" readOnly rows={10} value={text} />
        </div>
      )}
    </div>
  )
}
