import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import '../ui/readiness.css'
import { c9RunFinished } from '../assessment/readiness'
import { lectureList, readinessReport, summaryText, type Verdict } from '../assessment/report'
import { moduleLabel } from '../content/modules'
import { OUTCOME_TEXT, readinessCopy as copy } from '../content/readiness'
import { screenCopy } from '../content/screens'
import { OWN_QUESTION_MAX_LENGTH } from '../modules/config'
import { paths } from '../routes'
import { useLearner } from '../state/LearnerContext'

const WORD: Record<Verdict, { word: string; symbol: string }> = {
  ready: { word: copy.states.ready, symbol: '✓' },
  revise: { word: copy.states.revise, symbol: '↺' },
}

/**
 * Wireframe 1o: the readiness report (Ready or Revise per outcome, LO8 never blocking, confident
 * errors, links back), the bring-to-the-lecture list, the student's own question, and print, save or
 * copy (FR-RDY-01 to -03). Every verdict comes from `readinessReport` (add-readiness-c9).
 */
export function Readiness() {
  const { learner, addOwnQuestion, completeModule } = useLearner()
  const [draft, setDraft] = useState('')
  const [message, setMessage] = useState('')
  const report = readinessReport(learner.attempts)
  const list = lectureList(learner.attempts, learner.lectureQuestions)
  const lecture = [...list.drafted.map((q) => q.text), ...list.generated.map((g) => g.text)]
  const own = list.own.map((q) => q.text)
  const canExport = !list.needsOwn
  const text = () => summaryText(report, list)

  // C9 completes once its run is over and an own question exists (decision 11).
  useEffect(() => {
    if (!list.needsOwn && c9RunFinished(learner.attempts) && !learner.completedModules.includes('C9')) completeModule('C9')
  }, [list.needsOwn, learner.attempts, learner.completedModules, completeModule])

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
      <p>
        <strong>{copy.overall(WORD[report.overall].word)}</strong>
      </p>
      <table className="readiness-table" aria-label={copy.tableLabel}>
        <thead>
          <tr>
            <th scope="col">{copy.columns.outcome}</th>
            <th scope="col">{copy.columns.status}</th>
            <th scope="col">{copy.columns.back}</th>
          </tr>
        </thead>
        <tbody>
          {report.outcomes.map(({ outcome, verdict, confidentErrors, links, blocksReady }) => (
            <tr key={outcome}>
              <th scope="row">
                {outcome} {OUTCOME_TEXT[outcome]}
                {!blocksReady && ` (${copy.optional})`}
              </th>
              <td>
                <span aria-hidden="true">{WORD[verdict].symbol} </span>
                <strong>{WORD[verdict].word}</strong>
                {confidentErrors > 0 && <span className="readiness-flag">{copy.flag}</span>}
              </td>
              <td>
                {links.map((l) => (
                  <Link key={l.module} className="readiness-link" to={paths.activity(l.module, l.activity)}>
                    {copy.backLink(moduleLabel(l.module))}
                  </Link>
                ))}
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
            <input type="text" maxLength={OWN_QUESTION_MAX_LENGTH} value={draft} onChange={(e) => setDraft(e.target.value)} />
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
