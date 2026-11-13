import { useId, useState, type FormEvent } from 'react'
import { conventionsWording } from '../../../content/modules/conventionsWording'
import { practiceModuleCopy } from '../../../content/modules/practice'
import { REBALANCE_CASES, type RebalanceCase } from '../../../engine/conventions'
import { markCase, type CaseProblem, type CaseResult } from '../../../modules/casePractice'
import { TreeView } from '../../tree/TreeView'
import { PracticeFeedback, PracticeHints } from './PracticeFeedback'

const copy = practiceModuleCopy.nameCase
const w = conventionsWording()

export interface NameTheCaseProps {
  problem: CaseProblem
  solved: boolean
  onSolved: () => void
  hintsUsed: number
  onReview: () => void
  onNewTree: () => void
}

/**
 * C6 practice, first phase (LO7): name the case for a tree after a plain insert. The four options
 * are named by the conventions wording (D19) and the engine marks the answer. Retries are unlimited
 * and nothing is stored. When it is solved the player shows the rotation tool for the same problem.
 */
export function NameTheCase({ problem, solved, onSolved, hintsUsed, onReview, onNewTree }: NameTheCaseProps) {
  const [picked, setPicked] = useState<RebalanceCase | null>(null)
  const [result, setResult] = useState<CaseResult | null>(null)
  const group = useId()

  const choose = (c: RebalanceCase) => {
    setPicked(c)
    setResult(null)
  }
  const check = (e: FormEvent) => {
    e.preventDefault()
    if (picked === null || solved) return
    const r = markCase(problem, picked)
    setResult(r)
    if (r.kind === 'right') onSolved()
  }

  const shown = solved ? markCase(problem, problem.answer) : result
  const facts = { z: problem.z, y: problem.y, zBalance: problem.zBalance, yBalance: problem.yBalance }
  const hints = solved ? [] : copy.hints.slice(0, hintsUsed).map((h) => h(facts, w))

  return (
    <div className="practice name-case">
      <TreeView tree={problem.tree} label={copy.treeLabel} />
      <form className="practice-form" onSubmit={check}>
        <fieldset className="practice-group" disabled={solved}>
          <legend>{copy.groupLabel}</legend>
          <p>{copy.question}</p>
          <div className="practice-row">
            {REBALANCE_CASES.map((c) => (
              <label key={c} className="practice-option">
                <input type="radio" name={group} value={c} checked={picked === c} onChange={() => choose(c)} />
                {w.caseName(c)}
              </label>
            ))}
          </div>
        </fieldset>
        <button type="submit" className="module-button module-button-primary" disabled={picked === null || solved}>
          {practiceModuleCopy.check}
        </button>
      </form>
      <PracticeFeedback
        verdict={shown === null ? null : shown.kind === 'right' ? 'right' : 'not-yet'}
        text={shown === null ? null : copy.why(shown, w)}
        after={solved ? copy.done : null}
        onTryAgain={() => setResult(null)}
        onReview={onReview}
      />
      <PracticeHints hints={hints} />
      {/* Once solved, the rotation tool below has its own New tree. */}
      {!solved && (
        <button type="button" className="module-button module-button-quiet" onClick={onNewTree}>
          {practiceModuleCopy.newTree}
        </button>
      )}
    </div>
  )
}
