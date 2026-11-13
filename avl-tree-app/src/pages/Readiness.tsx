import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import '../ui/readiness.css'
import { confidentErrors, lectureList, outcomeStatus, summaryText, type OutcomeState } from '../assessment/readiness'
import { moduleLabel } from '../content/modules'
import { OUTCOME_MODULE, OUTCOME_TEXT, readinessCopy as copy } from '../content/readiness'
import { screenCopy } from '../content/screens'
import { paths } from '../routes'
import { useLearner } from '../state/LearnerContext'

const WORD: Record<OutcomeState, { word: string; symbol: string }> = {
  ready: { word: copy.states.ready, symbol: '✓' },
  revise: { word: copy.states.revise, symbol: '↺' },
  'not-tried': { word: copy.states.notTried, symbol: '○' },
}

/** Wireframe 1o: Ready or Revise per outcome, confident errors, the lecture list, the student's own question, and print, save or copy (FR-RDY-01 to -03). */
export function Readiness() {
  const { learner, addOwnQuestion } = useLearner()
  const [draft, setDraft] = useState('')
  const [message, setMessage] = useState('')
  const statuses = outcomeStatus(learner.attempts)
  const flags = confidentErrors(learner.attempts)
  const lecture = lectureList(learner.attempts, learner.lectureQuestions ?? [], learner.profileId)
  const own = (learner.ownQuestions ?? []).map((q) => q.text)
  const canExport = own.length > 0
  const text = () => summaryText({ statuses, flags, lecture, own })

  const add = (e: FormEvent) => {
    e.preventDefault()
    addOwnQuestion(draft)
    setDraft('')
  }
  const copyText = () => {
    const clip = typeof navigator !== 'undefined' ? navigator.clipboard : undefined
    if (clip === undefined) return setMessage(copy.copyFailed)
    clip.writeText(text()).then(
      () => setMessage(copy.copied),
      () => setMessage(copy.copyFailed),
    )
  }
  const save = () => {
    const url = URL.createObjectURL(new Blob([text()], { type: 'text/plain' }))
    const a = document.createElement('a')
    a.href = url
    a.download = copy.fileName
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="screen-stack readiness">
      <h1 tabIndex={-1}>{screenCopy.headings.readiness}</h1>
      <p>{copy.intro}</p>
      <table className="readiness-table" aria-label={copy.tableLabel}>
        <thead>
          <tr>
            <th scope="col">{copy.columns.outcome}</th>
            <th scope="col">{copy.columns.status}</th>
            <th scope="col">{copy.columns.back}</th>
          </tr>
        </thead>
        <tbody>
          {statuses.map(({ outcome, state }) => (
            <tr key={outcome}>
              <th scope="row">
                {outcome} {OUTCOME_TEXT[outcome]}
                {outcome === 'LO8' && ` (${copy.optional})`}
              </th>
              <td>
                <span aria-hidden="true">{WORD[state].symbol} </span>
                <strong>{WORD[state].word}</strong>
                {flags.has(outcome) && <span className="readiness-flag">{copy.flag}</span>}
              </td>
              <td>
                <Link to={paths.activity(OUTCOME_MODULE[outcome], 'example')}>{copy.backLink(moduleLabel(OUTCOME_MODULE[outcome]))}</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <section aria-labelledby="readiness-lecture">
        <h2 id="readiness-lecture">{copy.lectureHeading}</h2>
        {lecture.length === 0 ? (
          <p>{copy.lectureEmpty}</p>
        ) : (
          <ul aria-label={copy.lectureHeading}>
            {lecture.map((q) => (
              <li key={q}>{q}</li>
            ))}
          </ul>
        )}
      </section>

      <section className="readiness-own" aria-labelledby="readiness-own">
        <h2 id="readiness-own">{copy.ownHeading}</h2>
        <p>{copy.ownNote}</p>
        {own.length > 0 && (
          <ul aria-label={copy.ownListLabel}>
            {own.map((q, i) => (
              <li key={i}>{q}</li>
            ))}
          </ul>
        )}
        <form onSubmit={add}>
          <label>
            <span>{copy.ownLabel}</span>
            <input type="text" maxLength={300} value={draft} onChange={(e) => setDraft(e.target.value)} />
          </label>
          <button type="submit" className="module-button module-button-secondary" disabled={draft.trim() === ''}>
            {copy.ownAdd}
          </button>
        </form>
      </section>

      <section aria-label={copy.exportLabel}>
        {!canExport && <p>{copy.exportNeedsOwn}</p>}
        <div className="readiness-actions">
          <button type="button" className="module-button module-button-secondary" disabled={!canExport} onClick={() => window.print()}>
            {copy.print}
          </button>
          <button type="button" className="module-button module-button-secondary" disabled={!canExport} onClick={save}>
            {copy.save}
          </button>
          <button type="button" className="module-button module-button-secondary" disabled={!canExport} onClick={copyText}>
            {copy.copy}
          </button>
        </div>
        <p role="status">{message}</p>
      </section>

      <Link className="screen-link readiness-back" to={paths.hub()}>
        {screenCopy.links.backToPath}
      </Link>
    </div>
  )
}
