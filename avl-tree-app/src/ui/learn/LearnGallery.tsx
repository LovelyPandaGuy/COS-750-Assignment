// Development-only gallery section (revamp-question-and-feedback, design decision 10): every state of the
// learn components with neutral fixture text, plus a composed keyboard flow. Developer text, not content.
import { useState, type ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import type { Instance, Mark, Response } from '../../assessment/types'
import { avlInsert } from '../../engine/avl'
import type { Tree } from '../../engine/tree'
import { Button } from '../base'
import { ConfidenceRating } from './ConfidenceRating'
import { FeedbackPanel } from './FeedbackPanel'
import { FullAnswer } from './FullAnswer'
import { LectureQuestionDraft } from './LectureQuestionDraft'
import { QuestionItem, type QuestionItemLabels } from './QuestionItem'
import { ScaffoldPanel, type Rung } from './ScaffoldPanel'

// Built by the engine, so heights follow the conventions module (D2).
const sample: Tree = [20, 10, 30].reduce<Tree>((t, k) => avlInsert(t, k).tree, null)

const choice = (stem = 'Example stem'): Instance => ({
  itemId: 'gallery-choice',
  seed: 1,
  attempt: 0,
  variant: 1,
  type: 'choice',
  stem,
  facts: { tree: null, keys: [], values: {} },
  signature: 'gallery',
  answer: 'opt-c',
  options: ['Option one', 'Option two', 'Option three', 'Option four'].map((text, i) => ({
    id: `opt-${'abcd'[i]}`,
    value: `opt-${'abcd'[i]}`,
    text,
    correct: i === 2,
    explanation: 'Example explanation',
  })),
  correctExplanation: 'Example explanation',
  numbers: [],
})
const number = (): Instance => ({ ...choice('Example compute stem'), itemId: 'gallery-number', type: 'number', answer: 2, options: undefined })

const labels: QuestionItemLabels = {
  choiceLegend: 'Example options',
  yourAnswer: 'Example your answer',
  correct: 'Example correct answer',
  notYetGlyph: '💡',
  decrease: 'Example decrease',
  increase: 'Example increase',
  value: 'Example value',
  empty: '–',
}
const levels = [
  { value: 'one', text: 'Example guessing' },
  { value: 'two', text: 'Example fairly sure' },
  { value: 'three', text: 'Example certain' },
]
const range = { min: -3, max: 3, step: 1 }
const notYet: Mark = { status: 'not-yet', explanation: 'Example why' }
const right: Mark = { status: 'correct', explanation: 'Example why' }
const noop = () => {}
const parts = {
  why: 'Example why: a sentence or two on the reasoning, from the engine and content.',
  concept: { label: 'Example review the concept', to: '/' },
  next: { label: 'Example next step', onClick: noop },
}
const scaffoldLabels = {
  region: 'Example support',
  state: { open: 'Example open', seen: 'Example seen', available: 'Example available', waiting: 'Example waiting' },
  hintText: 'Example hint',
  hint: (left: number) => `Example hint, ${left} left`,
}
const rung = (kind: Rung['kind'], state: Rung['state'], title: string): Rung => ({ kind, state, title, body: <p>Example rung body for {title}.</p> })

function Cell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="learn-gallery-cell">
      <p className="gallery-label">{title}</p>
      {children}
    </div>
  )
}

/** The composed flow the keyboard test walks (NFR-02, FR-VIS-10): answer, check, feedback, try again. */
export function LearnFlow() {
  const [attempt, setAttempt] = useState(0)
  const [response, setResponse] = useState<Response | null>(null)
  const [confidence, setConfidence] = useState<string | null>(null)
  const [mark, setMark] = useState<Mark | null>(null)
  const inst = { ...choice(attempt === 0 ? 'Example flow stem' : 'Example flow stem, new problem'), attempt }
  const check = () => {
    if (response === null || !('choice' in response)) return
    const ok = inst.options!.find((o) => o.id === response.choice)?.correct === true
    setMark(ok ? right : notYet)
  }
  const tryAgain = () => {
    setAttempt((a) => a + 1)
    setResponse(null)
    setConfidence(null)
    setMark(null)
  }
  return (
    <div className="learn-flow">
      <QuestionItem instance={inst} response={response} onResponse={setResponse} disabled={mark !== null} mark={mark ?? undefined} labels={labels} />
      <ConfidenceRating value={confidence} onChange={setConfidence} label="Example how sure" optionalNote="Example optional" levels={levels} disabled={mark !== null} />
      {mark === null && (
        <Button variant="primary" onClick={check}>
          Example check
        </Button>
      )}
      {mark === null ? (
        <FeedbackPanel variant={null} />
      ) : mark.status === 'correct' ? (
        <FeedbackPanel variant="correct" verdict="Example right" why="Example why" concept={parts.concept} next={{ label: 'Example continue', onClick: noop }} />
      ) : (
        <FeedbackPanel variant="not-yet" verdict="Example not quite yet" why="Example why" concept={parts.concept} next={{ label: 'Example try again', onClick: tryAgain }} />
      )}
    </div>
  )
}

export function LearnGallery() {
  const [draft, setDraft] = useState('Example drafted lecture question, editable by the student.')
  const [added, setAdded] = useState(false)
  return (
    <MemoryRouter>
      <section className="gallery-section learn-gallery" aria-labelledby="g-learn" data-learn-gallery="">
        <h2 id="g-learn">Learn components</h2>

        <h3>QuestionItem, choice</h3>
        <div className="learn-gallery-grid">
          <Cell title="Default, with tree">
            <QuestionItem instance={choice()} response={null} onResponse={noop} disabled={false} labels={labels} tree={{ tree: sample, label: 'Example tree' }} />
          </Cell>
          <Cell title="Selected">
            <QuestionItem instance={choice()} response={{ choice: 'opt-b' }} onResponse={noop} disabled={false} labels={labels} />
          </Cell>
          <Cell title="Disabled">
            <QuestionItem instance={choice()} response={null} onResponse={noop} disabled labels={labels} />
          </Cell>
          <Cell title="Submitted, correct">
            <QuestionItem instance={choice()} response={{ choice: 'opt-c' }} onResponse={noop} disabled mark={right} labels={labels} />
          </Cell>
          <Cell title="Submitted, not quite yet (answer not revealed)">
            <QuestionItem instance={choice()} response={{ choice: 'opt-b' }} onResponse={noop} disabled mark={notYet} labels={labels} />
          </Cell>
          <Cell title="Revealed at the cap">
            <QuestionItem instance={choice()} response={{ choice: 'opt-b' }} onResponse={noop} disabled mark={notYet} revealCorrect labels={labels} />
          </Cell>
        </div>

        <h3>QuestionItem, stepper</h3>
        <div className="learn-gallery-grid">
          <Cell title="Empty">
            <QuestionItem instance={number()} response={null} onResponse={noop} disabled={false} labels={labels} range={range} />
          </Cell>
          <Cell title="Value, at the top of the range">
            <QuestionItem instance={number()} response={{ number: '+3' }} onResponse={noop} disabled={false} labels={labels} range={range} />
          </Cell>
          <Cell title="Submitted, not quite yet">
            <QuestionItem instance={number()} response={{ number: '-2' }} onResponse={noop} disabled mark={notYet} labels={labels} range={range} />
          </Cell>
        </div>

        <h3>ConfidenceRating</h3>
        <div className="learn-gallery-grid">
          <Cell title="Three levels, none chosen">
            <ConfidenceRating value={null} onChange={noop} label="Example how sure" optionalNote="Example optional" levels={levels} />
          </Cell>
          <Cell title="Selected">
            <ConfidenceRating value="two" onChange={noop} label="Example how sure" levels={levels} />
          </Cell>
          <Cell title="Two levels, disabled">
            <ConfidenceRating value="one" onChange={noop} label="Example how sure" levels={levels.slice(0, 2)} disabled />
          </Cell>
        </div>

        <h3>FeedbackPanel</h3>
        <div className="learn-gallery-stack">
          <FeedbackPanel variant="correct" verdict="Example correct verdict" icon="✓" {...parts} />
          <FeedbackPanel variant="not-yet" verdict="Example not quite yet verdict" icon="💡" {...parts} />
          <FeedbackPanel
            variant="cap"
            verdict="Example retry cap verdict"
            icon="💡"
            {...parts}
            fullAnswer={
              <FullAnswer
                example={{ instance: number(), answer: 2, explanation: 'Example worked explanation.' }}
                labels={{ show: 'Example show the full answer', treeAnswer: 'Example answer tree' }}
              />
            }
            lectureDraft={
              <LectureQuestionDraft
                text={draft}
                added={added}
                onAdd={() => setAdded(true)}
                onChange={setDraft}
                onDecline={noop}
                labels={{
                  heading: 'Example add to lecture questions?',
                  note: 'Example note about the draft.',
                  field: 'Example your question',
                  add: 'Example add',
                  decline: 'Example no thanks',
                  added: 'Example added',
                }}
              />
            }
          />
        </div>

        <h3>ScaffoldPanel</h3>
        <div className="learn-gallery-grid">
          <Cell title="Practice: two rungs">
            <ScaffoldPanel rungs={[rung('nudge', 'seen', 'Example nudge'), rung('fuller-hint', 'open', 'Example fuller hint')]} hintsLeft={0} onHint={noop} labels={scaffoldLabels} />
          </Cell>
          <Cell title="Check: three rungs">
            <ScaffoldPanel
              rungs={[rung('fuller-hint', 'open', 'Example hint'), rung('worked-example', 'available', 'Example worked example'), rung('guided', 'waiting', 'Example guided')]}
              hintsLeft={2}
              onHint={noop}
              labels={scaffoldLabels}
            />
          </Cell>
        </div>

        <h3>Keyboard flow</h3>
        <LearnFlow />
      </section>
    </MemoryRouter>
  )
}
