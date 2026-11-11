import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../ui/start.css'
import { startCopy } from '../content/start'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { ResumeCard } from '../components/ResumeCard'
import { StorageNotice } from '../components/StorageNotice'
import { useLearner } from '../state/LearnerContext'
import { hasProgress } from '../state/learnerReducer'

/** Screen 1, Start (wireframe 1b): first visit, return visit and reset (FR-ONB-01, -03, -04). */
export function Start() {
  const { learner, loadStatus, persistent, reset } = useLearner()
  const navigate = useNavigate()
  const [confirming, setConfirming] = useState(false)
  const heading = useRef<HTMLHeadingElement>(null)
  const resetLink = useRef<HTMLButtonElement>(null)
  // Where focus goes once the dialog has closed and the page is no longer inert.
  const focusAfterClose = useRef<'reset-link' | 'heading' | null>(null)
  const progress = hasProgress(learner)

  useEffect(() => {
    if (confirming) return
    const target = focusAfterClose.current
    focusAfterClose.current = null
    if (target === 'reset-link') resetLink.current?.focus()
    if (target === 'heading') heading.current?.focus()
  }, [confirming])

  return (
    <>
      {/* Wireframe 1b: StartPanel on the left, a narrow column on the right. The hero
          diagram and PrivacyNotice that sit in that column are out of scope (proposal.md). */}
      <div className="start-page">
        <section className="start-panel">
          <h1 ref={heading} tabIndex={-1}>
            {startCopy.heading}
          </h1>
          <p className="start-intro">{startCopy.intro}</p>
          <ul className="start-bullets">
            {startCopy.bullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
          {progress ? (
            <ResumeCard
              module={learner.currentModule}
              onResume={() => navigate(`/module/${learner.currentModule}`, { state: { focusHeading: true } })}
            />
          ) : (
            <button
              type="button"
              className="button-primary button-large"
              onClick={() => navigate('/module/C1', { state: { focusHeading: true } })}
            >
              {startCopy.startButton}
            </button>
          )}
        </section>
        <div className="start-aside">
          <StorageNotice loadStatus={loadStatus} persistent={persistent} />
          {progress && (
            <button ref={resetLink} type="button" className="link-button" onClick={() => setConfirming(true)}>
              {startCopy.resetLink}
            </button>
          )}
        </div>
      </div>
      {confirming && (
        <ConfirmDialog
          title={startCopy.dialogTitle}
          body={startCopy.dialogBody}
          cancelLabel={startCopy.cancelButton}
          confirmLabel={startCopy.confirmButton}
          onCancel={() => {
            focusAfterClose.current = 'reset-link'
            setConfirming(false)
          }}
          onConfirm={() => {
            reset()
            focusAfterClose.current = 'heading'
            setConfirming(false)
          }}
        />
      )}
    </>
  )
}
