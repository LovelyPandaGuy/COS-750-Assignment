// A guided pause in an animation (lesson-questions "Guided pauses"; ID 7.2 C6 "the second is guided"):
// select n and name the case, both marked from the engine's trace step, then the animation continues.
import { useState } from 'react'
import { lessonCopy } from '../../../content/lesson'
import { CONVENTIONS, caseLabel, REBALANCE_CASES, type RebalanceCase } from '../../../engine/conventions'
import type { FormatKey } from '../../../engine/shape'
import type { Key, Tree } from '../../../engine/tree'
import { ChoiceControl, NodePicker } from './Controls'

const fb = CONVENTIONS.feedback as unknown as { verdictCorrect: string; verdictIncorrect: string[]; nextStepRetry: string }
const g = lessonCopy.questions.guided

export function GuidedPause({
  tree,
  formatKey,
  label,
  askNode,
  askCase,
  node,
  rebalanceCase,
  onDone,
}: {
  tree: Tree
  formatKey: FormatKey
  label: string
  askNode: boolean
  askCase: boolean
  node: Key
  rebalanceCase: RebalanceCase | undefined
  onDone: () => void
}) {
  const [picked, setPicked] = useState<Key[]>([])
  const [choice, setChoice] = useState<string | null>(null)
  const [verdict, setVerdict] = useState<'right' | 'not-yet' | null>(null)
  // Cases in the ID's order: Case 1 (LL) to Case 4 (RR).
  const cases = (['LL', 'LR', 'RL', 'RR'] as const).filter((c) => REBALANCE_CASES.includes(c))
  const ready = (!askNode || picked.length === 1) && (!askCase || choice !== null)
  const check = () => {
    const ok = (!askNode || picked[0] === node) && (!askCase || choice === rebalanceCase)
    setVerdict(ok ? 'right' : 'not-yet')
    if (ok) onDone()
  }
  return (
    <section className="q-card lesson-guided" aria-label={g.legend}>
      <p className="q-stem" data-narrate>
        {g.legend}
      </p>
      {askNode && <NodePicker legend={g.askNode} shown={{ tree, formatKey, label: `${label}, ${g.askNode}` }} selected={picked} none={false} mode="one" onChange={(k) => setPicked(k)} disabled={verdict === 'right'} />}
      {askCase && <ChoiceControl legend={g.askCase} options={cases.map((c) => ({ id: c, text: caseLabel(c) }))} value={choice} onChange={setChoice} disabled={verdict === 'right'} />}
      {verdict !== 'right' && (
        <button type="button" className="module-button module-button-primary" disabled={!ready} onClick={check}>
          {lessonCopy.questions.checkAnswer}
        </button>
      )}
      <p role="status" aria-live="polite" className="q-status">
        {verdict === 'right' ? `${fb.verdictCorrect} ${g.done}` : verdict === 'not-yet' ? `${fb.verdictIncorrect[0]} ${g.askNode}` : ''}
      </p>
    </section>
  )
}
