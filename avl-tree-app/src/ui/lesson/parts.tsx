// Lesson block parts: the components the block regions are built from (lesson-blocks).
import { useState } from 'react'
import { lessonCopy } from '../../content/lesson'
import { CONVENTIONS } from '../../engine/conventions'
import { encodeKey } from '../../live/keys'
import type { WorkedExampleScreen } from '../../live/types'
import { LessonTree } from './LessonTree'
import { treeLabel } from './labels'

export const Points = ({ points }: { points?: string[] }) =>
  points === undefined || points.length === 0 ? null : (
    <ul className="lesson-points">
      {points.map((p, i) => (
        <li key={i} data-narrate>
          {p}
        </li>
      ))}
    </ul>
  )

export const Text = ({ text }: { text?: string }) => (text === undefined ? null : <p data-narrate>{text}</p>)

/** The four-case chart from conventions.json (ID 7.3, ID 8.1 "Case chart"). */
export function CaseChart() {
  const c = lessonCopy.caseChart
  const cases = Object.entries(CONVENTIONS.cases)
  return (
    <div className="lesson-table-scroll">
      <table className="lesson-table">
        <caption>{c.caption}</caption>
        <thead>
          <tr>
            {c.headers.map((h) => (
              <th key={h} scope="col">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {cases.map(([n, k]) => (
            <tr key={n}>
              <th scope="row">{CONVENTIONS.labels.caseName[n as '1']}</th>
              <td>{k.insertedInto}</td>
              <td>{k.side}</td>
              <td>{k.fix.join(c.then)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/** "Node 10: …" names the node a post-order step is about. */
function nodeOfStep(step: string): string | null {
  return /^Node (\w+):/.exec(step)?.[1] ?? null
}

export function WorkedExample({ s }: { s: WorkedExampleScreen }) {
  const [shown, setShown] = useState(1)
  const c = lessonCopy.worked
  const named = s.order === 'post-order' ? nodeOfStep(s.steps[shown - 1] ?? '') : null
  const highlight = named === null || s.tree === undefined ? null : encodeKey(/^\d+$/.test(named) ? Number(named) : named)
  return (
    <div className="lesson-worked">
      <Text text={s.text} />
      {s.tree !== undefined && <LessonTree raw={s.tree} show={s.show} label={treeLabel(s.title)} highlightKey={highlight} />}
      <ol className="lesson-steps" aria-label={c.stepsLabel}>
        {s.steps.slice(0, shown).map((step, i) => (
          <li key={i}>{step}</li>
        ))}
      </ol>
      <div className="lesson-animation-controls">
        <span className="lesson-counter" aria-live="polite">
          {c.stepOf(shown, s.steps.length)}
        </span>
        <button type="button" className="module-button module-button-secondary" disabled={shown >= s.steps.length} onClick={() => setShown((n) => n + 1)}>
          {c.nextStep}
        </button>
        <button type="button" className="module-button module-button-quiet" disabled={shown >= s.steps.length} onClick={() => setShown(s.steps.length)}>
          {c.showAll}
        </button>
      </div>
    </div>
  )
}

export function WhatChanged({ answer }: { answer: string }) {
  const [open, setOpen] = useState(false)
  const c = lessonCopy.animation
  return (
    <div className="lesson-what-changed">
      <h3>{c.whatChanged}</h3>
      {open ? <p>{answer}</p> : (
        <button type="button" className="module-button module-button-secondary" onClick={() => setOpen(true)}>
          {c.reveal}
        </button>
      )}
    </div>
  )
}

