// Predict, then reveal (lesson-questions "Predict screens"; ID 8.1, ID 10.3). Never blocks Next.
import { useState } from 'react'
import { lessonCopy } from '../../../content/lesson'
import { CONVENTIONS } from '../../../engine/conventions'
import type { OtherScreen } from '../../../live/types'
import { ChoiceControl } from './Controls'
import { predictAnswer } from './draft'

const fb = CONVENTIONS.feedback as unknown as { verdictCorrect: string; verdictIncorrect: string[] }

export function PredictBlock({ s }: { s: OtherScreen }) {
  const [choice, setChoice] = useState<string | null>(null)
  const [revealed, setRevealed] = useState(false)
  const options = (s.options ?? []).map((text) => ({ id: text, text }))
  const matched = choice !== null && choice === predictAnswer(s)
  return (
    <div className="q-card">
      <ChoiceControl legend={lessonCopy.questions.predictLegend} options={options} value={choice} onChange={setChoice} disabled={revealed} />
      {!revealed && (
        <button type="button" className="module-button module-button-primary" disabled={choice === null} onClick={() => setRevealed(true)}>
          {lessonCopy.questions.reveal}
        </button>
      )}
      <div role="status" aria-live="polite" className="practice-panel q-feedback" data-verdict={!revealed ? 'none' : matched ? 'right' : 'not-yet'}>
        {revealed && (
          <>
            <strong>
              <span aria-hidden="true" className="q-icon">{matched ? '✓' : '↻'} </span>
              {matched ? fb.verdictCorrect : fb.verdictIncorrect[0]}{' '}
            </strong>
            <span>{s.reveal}</span>
          </>
        )}
      </div>
    </div>
  )
}
