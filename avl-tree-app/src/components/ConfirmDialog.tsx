import { useEffect, useId, useLayoutEffect, useRef } from 'react'

export interface ConfirmDialogProps {
  title: string
  body: string
  cancelLabel: string
  confirmLabel: string
  onCancel: () => void
  onConfirm: () => void
}

/**
 * Modal confirmation (wireframe 1b note 4): focus starts on Cancel, Tab wraps inside,
 * Escape cancels, and everything outside the dialog is inert while it is open.
 * Keys are handled on the document, so Escape and Tab still work after a click on the
 * dialog text or backdrop moves focus to <main>.
 * Hand-built rather than <dialog>.showModal() so jsdom can test it (design decision 5).
 */
export function ConfirmDialog({ title, body, cancelLabel, confirmLabel, onCancel, onConfirm }: ConfirmDialogProps) {
  const dialog = useRef<HTMLDivElement>(null)
  const cancel = useRef<HTMLButtonElement>(null)
  const titleId = useId()
  const bodyId = useId()

  useLayoutEffect(() => {
    // Make every sibling on the path from the dialog up to <body> inert.
    const made: Element[] = []
    for (let node = dialog.current?.parentElement ?? null; node && node !== document.body; node = node.parentElement) {
      for (const sibling of Array.from(node.parentElement?.children ?? [])) {
        if (sibling !== node && !sibling.hasAttribute('inert') && sibling.tagName !== 'SCRIPT') {
          sibling.setAttribute('inert', '')
          made.push(sibling)
        }
      }
    }
    cancel.current?.focus()
    return () => made.forEach((el) => el.removeAttribute('inert'))
  }, [])

  const cancelRef = useRef(onCancel)
  useEffect(() => {
    cancelRef.current = onCancel
  })

  useEffect(() => {
    function onKeyDown(e: globalThis.KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault()
        cancelRef.current()
        return
      }
      if (e.key !== 'Tab' || !dialog.current) return
      const focusable = dialog.current.querySelectorAll<HTMLElement>('button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])')
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const inside = dialog.current.contains(document.activeElement)
      if (!inside) {
        e.preventDefault()
        ;(e.shiftKey ? last : first).focus()
      } else if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <div className="dialog-backdrop">
      <div
        ref={dialog}
        className="dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={bodyId}
      >
        <h2 id={titleId}>{title}</h2>
        <p id={bodyId}>{body}</p>
        <div className="dialog-actions">
          <button ref={cancel} type="button" className="button-secondary" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button type="button" className="button-primary" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
