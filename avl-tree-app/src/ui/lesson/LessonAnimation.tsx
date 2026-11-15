import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { lessonCopy } from '../../content/lesson'
import { pseudocode } from '../../content/pseudocode'
import { inOrderKeys } from '../../engine/shape'
import { playOperation } from '../../live/build'
import type { Operation, RawTree, ShowItem } from '../../live/types'
import { rolesAt, treeAt } from '../../replay/replay'
import { PseudocodePanel } from '../replay/PseudocodePanel'
import { DrawnTree } from './LessonTree'
import { GuidedPause } from './questions/GuidedPause'

const copy = lessonCopy.animation

export interface LessonAnimationProps {
  tree: RawTree
  operation: Operation
  label: string
  show?: readonly ShowItem[]
  /** The screen's caption: shown before the first step (step-replay). */
  startCaption?: string
  pseudocode?: 'search-loop' | 'search-recursive'
  /** Reports the caption of the current position, for the frame's caption region. */
  onCaption?: (text: string) => void
  /** Reports when the last position is reached. */
  onEnd?: (atEnd: boolean) => void
  /** Each change re-runs the current step (ID 8.2 "Replay step"). */
  replayNonce?: number
  /** Pause at each imbalance and ask for n and the case (lesson-questions "Guided pauses"; ID 7.2 C6). */
  guided?: { askNode?: boolean; askCase?: boolean }
}

/**
 * A lesson replay (step-replay "Lesson replays step by caption"): one position per caption, every
 * tree and caption from the engine. It opens at position 0, paused, and moves only when the student steps.
 */
export function LessonAnimation({ tree, operation, label, show, startCaption, pseudocode: listing, onCaption, onEnd, replayNonce = 0, guided }: LessonAnimationProps) {
  const played = useMemo(() => playOperation(tree, operation), [tree, operation])
  const total = played.captions.length
  const [p, setP] = useState(0)
  const [flash, setFlash] = useState(false)
  const counterId = useId()

  // The number of trace steps shown at position p.
  const steps = p === 0 ? 0 : played.captions[p - 1].last + 1
  const caption = p === 0 ? (startCaption ?? '') : played.captions[p - 1].text
  const shown = flash ? Math.max(0, p === 0 ? 0 : (p === 1 ? 0 : played.captions[p - 2].last + 1)) : steps
  const current = shown === 0 ? null : played.trace[shown - 1]
  const compared = played.trace.slice(0, shown).filter((s) => s.kind === 'compare').length
  // Where a search is (D171): the node compared at the current step, or the node found; nothing at the start.
  const at = operation.name === 'search' ? [...played.trace.slice(0, shown)].reverse().find((s) => s.kind === 'compare' || s.kind === 'found') : undefined
  const highlightKey = at === undefined ? null : at.nodes[0]
  // A guided pause: the next caption is an imbalance the student has not named yet.
  const [answered, setAnswered] = useState<ReadonlySet<number>>(() => new Set())
  const nextImbalance = p < total ? played.captions[p].steps.map((i) => played.trace[i]).find((st) => st.kind === 'imbalance') : undefined
  const paused = guided !== undefined && nextImbalance !== undefined && !answered.has(p)

  useEffect(() => onCaption?.(caption), [caption, onCaption])
  useEffect(() => onEnd?.(p === total), [p, total, onEnd])
  useEffect(() => {
    if (!flash) return
    const t = setTimeout(() => setFlash(false), 600)
    return () => clearTimeout(t)
  }, [flash])

  const lastNonce = useRef(replayNonce)
  useEffect(() => {
    if (replayNonce === lastNonce.current) return
    lastNonce.current = replayNonce
    // eslint-disable-next-line react-hooks/set-state-in-effect -- a replay request is an external event
    if (p > 0) setFlash(true)
  }, [replayNonce, p])

  return (
    <div className="lesson-animation">
      <DrawnTree tree={treeAt(played.start, played.trace, shown)} formatKey={played.formatKey} show={show} label={label} roles={rolesAt(played.trace, shown)} highlightKey={highlightKey} />
      <div role="group" aria-label={copy.controlsLabel} className="lesson-animation-controls">
        <button type="button" className="module-button module-button-secondary" onClick={() => setP((x) => Math.max(0, x - 1))} disabled={p === 0}>
          {copy.previous}
        </button>
        <span id={counterId} className="lesson-counter">
          {copy.stepOf(p, total)}
        </span>
        <button type="button" className="module-button module-button-secondary" onClick={() => setP((x) => Math.min(total, x + 1))} disabled={p === total || paused}>
          {copy.next}
        </button>
        {operation.name === 'search' && <span className="lesson-counter">{copy.comparisons(compared)}</span>}
      </div>
      {paused && nextImbalance !== undefined && (
        <GuidedPause
          key={p}
          tree={treeAt(played.start, played.trace, shown)}
          formatKey={played.formatKey}
          label={label}
          askNode={guided?.askNode !== false}
          askCase={guided?.askCase !== false}
          node={nextImbalance.nodes[0]}
          rebalanceCase={nextImbalance.rebalanceCase}
          onDone={() => setAnswered((a) => new Set(a).add(p))}
        />
      )}
      {listing !== undefined && (
        <PseudocodePanel
          name={lessonCopy.pseudocode[listing]}
          listing={listing === 'search-loop' ? pseudocode.searchLoop : pseudocode.searchRecursive}
          line={current?.pseudocodeLine ?? null}
        />
      )}
    </div>
  )
}

/** The in-order key sequence before and after (ID 7.2 C5), worded by conventions.captions.inorderCheck. */
export function InOrderCheck({ tree, operation }: { tree: RawTree; operation: Operation }) {
  const played = useMemo(() => playOperation(tree, operation), [tree, operation])
  const words = (t: typeof played.start) => inOrderKeys(t).map(played.formatKey).join(', ')
  return <p className="lesson-inorder">{copy.inorder(words(played.start), words(played.end))}</p>
}
