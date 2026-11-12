import { conventionsWording } from '../../../content/modules/conventionsWording'
import { practiceModuleCopy } from '../../../content/modules/practice'
import type { Key, Tree } from '../../../engine/tree'
import { rotationHintFacts } from '../../../modules/practice'
import { DoItYourself } from '../../practice/DoItYourself'
import { PracticeHints } from './PracticeFeedback'

const w = conventionsWording()

export interface RotatePracticeProps {
  /** AVL tree before the insert. */
  base: Tree
  /** The key whose plain BST insert unbalances it. */
  keyToInsert: Key
  hintsUsed: number
  onNewTree: () => void
}

/**
 * C5 rotation practice (LO6, D21): the existing Do it yourself tool, plus hints read from the
 * engine's insert trace and a New tree button. Nothing is stored.
 */
export function RotatePractice({ base, keyToInsert, hintsUsed, onNewTree }: RotatePracticeProps) {
  const facts = rotationHintFacts(base, keyToInsert)
  const hints = practiceModuleCopy.rotate.hints.slice(0, hintsUsed).map((h) => h(facts, w))
  return (
    <div className="practice">
      <DoItYourself base={base} keyToInsert={keyToInsert} />
      <PracticeHints hints={hints} />
      <button type="button" className="module-button module-button-quiet" onClick={onNewTree}>
        {practiceModuleCopy.newTree}
      </button>
    </div>
  )
}
