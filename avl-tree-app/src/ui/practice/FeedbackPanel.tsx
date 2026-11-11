import { forwardRef } from 'react'
import './practice.css'
import { practiceCopy } from '../../content/practice'
import type { PracticeMessage } from '../../practice/rotate'
import { signed } from '../tree/describe'

const copy = practiceCopy.feedback

function body(m: PracticeMessage): { icon: string; text: string } {
  switch (m.kind) {
    case 'balanced':
      return { icon: copy.balancedIcon, text: copy.balanced }
    case 'flipped':
      return { icon: copy.flippedIcon, text: copy.flipped(m.node, signed(m.balanceFactor)) }
    case 'unbalanced':
      return { icon: copy.unbalancedIcon, text: copy.unbalanced(m.node, signed(m.balanceFactor)) }
    case 'refused':
      return { icon: copy.refusedIcon, text: m.reason === 'no-node' ? copy.noNode(m.node) : copy.refused(m.node, m.side) }
  }
}

/** A polite live region that takes focus after a rotation. Empty (and hidden) with no message. */
export const FeedbackPanel = forwardRef<HTMLDivElement, { message: PracticeMessage | null }>(function FeedbackPanel(
  { message },
  ref,
) {
  const shown = message === null ? null : body(message)
  return (
    <div
      ref={ref}
      role="status"
      aria-label={practiceCopy.practice.feedbackLabel}
      tabIndex={-1}
      className="practice-feedback"
      data-kind={message?.kind}
    >
      {shown && (
        <>
          <span className="practice-icon" aria-hidden="true">
            {shown.icon}
          </span>
          {shown.text}
        </>
      )}
    </div>
  )
})
