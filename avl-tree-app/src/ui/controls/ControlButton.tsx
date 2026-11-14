// A tree control (tree-controls "Control buttons follow the design system"; design 2, D137, D139): the base
// Button, secondary or quiet, with an aria-hidden icon, the label and a key cap from the registry. Disabled
// means aria-disabled, so the button stays focusable in its toolbar and can still be found and explained.
import type { MouseEvent } from 'react'
import { Button } from '../base'
import { SHORTCUTS, type ShortcutId } from './shortcuts'

export interface ControlButtonProps {
  label: string
  icon?: string
  shortcut?: ShortcutId
  variant?: 'secondary' | 'quiet'
  /** A toggle: shown pressed (aria-pressed and a dashed border, not colour alone). */
  pressed?: boolean
  disabled?: boolean
  onClick: () => void
}

export function ControlButton({ label, icon, shortcut, variant = 'secondary', pressed, disabled = false, onClick }: ControlButtonProps) {
  const s = shortcut === undefined ? undefined : SHORTCUTS[shortcut]
  const click = (e: MouseEvent<HTMLButtonElement>) => {
    if (disabled) {
      e.preventDefault()
      return
    }
    onClick()
  }
  return (
    <Button
      variant={variant}
      className="control-button"
      aria-disabled={disabled ? true : undefined}
      aria-pressed={pressed}
      aria-keyshortcuts={s?.aria}
      onClick={click}
    >
      {icon !== undefined && (
        <span className="control-icon" aria-hidden="true">
          {icon}
        </span>
      )}
      <span className="control-label">{label}</span>
      {s !== undefined && <kbd aria-hidden="true">{s.caps}</kbd>}
    </Button>
  )
}
