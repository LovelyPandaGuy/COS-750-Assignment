import { useState } from 'react'
import type { GuidedStep, WorkedExample } from '../../../assessment/scaffold'
import type { Instance } from '../../../assessment/types'
import { checkCopy } from '../../../content/check'
import type { Tree } from '../../../engine/tree'
import { explainAt, type Operation } from '../../../replay/replay'
import { sentenceFor } from '../../replay/sentence'
import { TreeView } from '../../tree/TreeView'

const copy = checkCopy.ladder

/** The text of an instance's correct answer, or null for a tree answer. */
function answerText(inst: Instance): string | null {
  if (inst.type === 'tree') return null
  if (inst.type === 'choice') return inst.options!.find((o) => o.correct)!.text
  return String(inst.answer)
}

export interface ScaffoldLadderProps {
  /** Rungs open, 0 to 3, in SCAFFOLD_LADDER order (D21). */
  level: number
  hint: string
  /** The question the guided step-through walks (the last one once capped). */
  inst: Instance
  /** A sibling problem, solved by the engine. */
  example: WorkedExample
  steps: GuidedStep[]
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

/** One step in words: a text step as it is, a trace step in the replay player's sentence. */
function stepText(step: GuidedStep, index: number, steps: GuidedStep[], inst: Instance): string {
  if (step.kind === 'text') return step.text
  const op: Operation = { kind: 'insert', tree: inst.facts.tree, key: inst.facts.target! }
  const trace = steps.flatMap((s) => (s.kind === 'trace' ? [s.step] : []))
  return sentenceFor(op, explainAt(op, trace, index + 1))
}

/**
 * Support for a check question (FR-SCA-02, D21): a hint, a worked example, a guided step-through,
 * opened in that order by wrong answers or on request. Calm wording, a polite live region.
 */
export function ScaffoldLadder({ level, hint, inst, example, steps, capped, onOpenNext }: ScaffoldLadderProps) {
  const [shown, setShown] = useState(1)
  const visible = capped ? steps.length : Math.min(shown, steps.length)
  const nextLabel = level === 0 ? copy.hint : level === 1 ? copy.worked : level === 2 ? copy.walk : null

  return (
    <section className="check-ladder" aria-label={copy.region}>
      <p role="status" className="visually-hidden">
        {level > 0 ? copy.opened(Math.min(level, 3) as 1 | 2 | 3) : ''}
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
          <p>{example.instance.stem}</p>
          <p>{example.explanation}</p>
          <Answer inst={example.instance} line={copy.exampleAnswer} treeLine={copy.treeAnswerLine} />
        </div>
      )}
      {level >= 3 && (
        <div className="check-ladder-level">
          <p>
            <strong>{copy.walkLabel}</strong>
          </p>
          <ol>
            {steps.slice(0, visible).map((s, i) => (
              <li key={i}>{stepText(s, i, steps, inst)}</li>
            ))}
          </ol>
          {visible < steps.length && (
            <button type="button" className="module-button module-button-secondary" onClick={() => setShown((n) => n + 1)}>
              {copy.nextStep}
            </button>
          )}
          {visible >= steps.length && capped && <Answer inst={inst} line={copy.answerLine} treeLine={copy.treeAnswerLine} />}
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
