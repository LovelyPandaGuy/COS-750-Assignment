import { useState } from 'react'
import { stepsOf } from '../../../assessment/scaffold'
import type { Instance } from '../../../assessment/types'
import { checkCopy } from '../../../content/check'
import type { Tree } from '../../../engine/tree'
import { TreeView } from '../../tree/TreeView'

const copy = checkCopy.ladder

/** The text of an instance's correct answer, or null for a tree answer. */
function answerText(inst: Instance): string | null {
  if (inst.type === 'tree') return null
  if (inst.type === 'choice') return inst.options!.find((o) => o.correct)!.text
  return String(inst.answer)
}

export interface ScaffoldLadderProps {
  /** Levels open, 0 to 3. */
  level: 0 | 1 | 2 | 3
  hint: string
  /** The question on screen. */
  inst: Instance
  /** Another variant of the item, solved. */
  example: Instance
  /** The retry cap is reached: every step and the answer are shown. */
  capped: boolean
  onOpenNext: () => void
}

function Answer({ inst, line, treeLine }: { inst: Instance; line: (a: string) => string; treeLine: string }) {
  const text = answerText(inst)
  return (
    <>
      <p>{text !== null ? line(text) : treeLine}</p>
      {text === null && <TreeView tree={inst.answer as Tree} label={copy.treeAnswerLabel} />}
    </>
  )
}

/**
 * Support for a check question (FR-SCA-02, D21): a hint, a worked example, a guided step-through,
 * opened in that order by wrong attempts or on request. Calm wording, a polite live region.
 */
export function ScaffoldLadder({ level, hint, inst, example, capped, onOpenNext }: ScaffoldLadderProps) {
  const steps = stepsOf(inst)
  const [shown, setShown] = useState(1)
  const visible = capped ? steps.length : Math.min(shown, steps.length)
  const nextLabel = level === 0 ? copy.hint : level === 1 ? copy.worked : level === 2 ? copy.walk : null

  return (
    <section className="check-ladder" aria-label={copy.region}>
      <p role="status" className="visually-hidden">
        {level > 0 ? copy.opened(level as 1 | 2 | 3) : ''}
      </p>
      {capped && <p>{copy.cappedNote}</p>}
      {level >= 1 && (
        <div className="check-ladder-level">
          <p>
            <strong>{copy.hintLabel}</strong>
          </p>
          <p>{hint}</p>
        </div>
      )}
      {level >= 2 && (
        <div className="check-ladder-level">
          <p>
            <strong>{copy.workedLabel}</strong>
          </p>
          <p>{example.stem}</p>
          <p>{example.correctExplanation}</p>
          <Answer inst={example} line={copy.exampleAnswer} treeLine={copy.treeAnswerLine} />
        </div>
      )}
      {level >= 3 && (
        <div className="check-ladder-level">
          <p>
            <strong>{copy.walkLabel}</strong>
          </p>
          <ol>
            {steps.slice(0, visible).map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
          {visible < steps.length ? (
            <button type="button" className="module-button module-button-secondary" onClick={() => setShown((n) => n + 1)}>
              {copy.nextStep}
            </button>
          ) : (
            <Answer inst={inst} line={copy.answerLine} treeLine={copy.treeAnswerLine} />
          )}
        </div>
      )}
      {nextLabel !== null && !capped && (
        <button type="button" className="module-button module-button-secondary" onClick={onOpenNext}>
          {nextLabel}
        </button>
      )}
    </section>
  )
}
