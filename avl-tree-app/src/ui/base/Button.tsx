import { useId, type ButtonHTMLAttributes } from 'react'
import './base.css'

export type ButtonVariant = 'primary' | 'secondary' | 'quiet'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Primary is for the one main action on a screen (design system). Defaults to secondary. */
  variant?: ButtonVariant
  /** Shown next to a disabled button and linked to it, so the student knows why (design system). */
  disabledReason?: string
}

/** The base button (add-ui-foundation): a native button, so click, Enter and Space all activate it. */
export function Button({ variant = 'secondary', type = 'button', disabledReason, className, disabled, ...rest }: ButtonProps) {
  const reasonId = useId()
  const reason = disabled && disabledReason ? disabledReason : undefined
  const describedBy = [rest['aria-describedby'], reason ? reasonId : undefined].filter(Boolean).join(' ') || undefined
  return (
    <>
      <button
        {...rest}
        type={type}
        disabled={disabled}
        aria-describedby={describedBy}
        className={['btn', `btn-${variant}`, className].filter(Boolean).join(' ')}
      />
      {reason && (
        <span id={reasonId} className="btn-reason">
          {reason}
        </span>
      )}
    </>
  )
}
