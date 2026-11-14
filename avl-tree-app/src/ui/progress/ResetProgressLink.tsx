import { useEffect, useRef, useState } from 'react'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import './progress.css'

export interface ResetProgressLinkProps {
  label: string
  /** The body names what will be erased (FR-ONB-04). */
  dialog: { title: string; body: string; cancelLabel: string; confirmLabel: string }
  onReset: () => void
}

/**
 * Frame 1b note 4: a deliberate two-step (design decision 7). The link opens the existing ConfirmDialog;
 * only Confirm resets. Cancel and Escape close it and return focus to the link.
 */
export function ResetProgressLink({ label, dialog, onReset }: ResetProgressLinkProps) {
  const [open, setOpen] = useState(false)
  const trigger = useRef<HTMLButtonElement>(null)
  const returnFocus = useRef(false)
  // Runs after the dialog has unmounted and removed `inert` from the page, so the link can take focus.
  useEffect(() => {
    if (!open && returnFocus.current) {
      returnFocus.current = false
      trigger.current?.focus()
    }
  }, [open])
  return (
    <>
      <button ref={trigger} type="button" className="reset-link" onClick={() => setOpen(true)}>
        {label}
      </button>
      {open && (
        <ConfirmDialog
          {...dialog}
          onCancel={() => {
            returnFocus.current = true
            setOpen(false)
          }}
          onConfirm={() => {
            setOpen(false)
            onReset()
          }}
        />
      )}
    </>
  )
}
