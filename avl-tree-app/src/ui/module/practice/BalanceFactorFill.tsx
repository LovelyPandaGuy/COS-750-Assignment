import { useId, useRef, useState, type FormEvent } from 'react'
import { conventionsWording } from '../../../content/modules/conventionsWording'
import { practiceModuleCopy } from '../../../content/modules/practice'
import type { Key, Tree } from '../../../engine/tree'
import { markBalanceFactor, parseWhole, treeKeys, type BalanceFactorResult } from '../../../modules/practice'
import { TreeView } from '../../tree/TreeView'
import { PracticeFeedback, PracticeHints } from './PracticeFeedback'

const copy = practiceModuleCopy.fillIn
const w = conventionsWording()

export interface BalanceFactorFillProps {
  tree: Tree
  /** Keys answered correctly so far; kept by the player so Back and Next keep them. */
  answered: readonly Key[]
  onAnswered: (key: Key) => void
  hintsUsed: number
  onReview: () => void
  onNewTree: () => void
  label?: string
}

/** C3 practice: fill in the balance factors (LO3). Practice only: nothing is stored. */
export function BalanceFactorFill({ tree, answered, onAnswered, hintsUsed, onReview, onNewTree, label = copy.treeLabel }: BalanceFactorFillProps) {
  const fieldId = useId()
  const field = useRef<HTMLInputElement>(null)
  const [selected, setSelected] = useState<Key | null>(null)
  const [value, setValue] = useState('')
  const [result, setResult] = useState<BalanceFactorResult | null>(null)
  const [note, setNote] = useState<string | null>(null)

  const keys = treeKeys(tree)
  const complete = keys.length > 0 && keys.every((k) => answered.includes(k))

  const select = (key: Key) => {
    setSelected(key)
    setResult(null)
    setNote(null)
    setValue('')
  }

  const step = (by: number) => setValue(w.num((parseWhole(value) ?? 0) + by))

  const check = (e?: FormEvent) => {
    e?.preventDefault()
    if (selected === null) return setNote(copy.selectFirst)
    const n = parseWhole(value)
    if (n === null) return setNote(copy.notWhole)
    const r = markBalanceFactor(tree, selected, n)
    setNote(null)
    setResult(r)
    if (r.kind === 'right' && !answered.includes(selected)) onAnswered(selected)
  }

  const tryAgain = () => {
    setResult(null)
    field.current?.focus()
  }

  const hintKey = selected ?? keys.find((k) => !answered.includes(k)) ?? null
  const hintFacts = hintKey === null ? null : markBalanceFactor(tree, hintKey, 0)
  const hints =
    hintFacts === null ? [] : copy.hints.slice(0, hintsUsed).map((h) => h({ key: hintFacts.key, leftHeight: hintFacts.leftHeight, rightHeight: hintFacts.rightHeight }, w))

  return (
    <div className="practice">
      <TreeView tree={tree} interactive selectedKey={selected} onSelect={select} hideBalance={{ reveal: answered }} label={label} />
      <form className="practice-form" onSubmit={check}>
        <label htmlFor={fieldId}>{copy.fieldLabel(selected)}</label>
        <div className="practice-field">
          <button type="button" className="module-button module-button-secondary" aria-label={copy.decrease} onClick={() => step(-1)}>
            {'−'}
          </button>
          <input
            ref={field}
            id={fieldId}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            className="practice-input"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          <button type="button" className="module-button module-button-secondary" aria-label={copy.increase} onClick={() => step(1)}>
            +
          </button>
          <button type="submit" className="module-button module-button-primary">
            {practiceModuleCopy.check}
          </button>
        </div>
      </form>
      <PracticeFeedback
        verdict={result === null ? null : result.kind === 'right' ? 'right' : 'not-yet'}
        text={result === null ? note : copy.why(result, w)}
        after={complete ? null : copy.pickAnother}
        onTryAgain={tryAgain}
        onReview={onReview}
      />
      {complete && <p className="practice-complete">{copy.complete}</p>}
      <PracticeHints hints={hints} />
      <button type="button" className="module-button module-button-quiet" onClick={onNewTree}>
        {practiceModuleCopy.newTree}
      </button>
    </div>
  )
}
