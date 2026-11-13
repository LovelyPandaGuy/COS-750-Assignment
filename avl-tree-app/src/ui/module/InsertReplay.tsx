import { useCallback, useState } from 'react'
import type { Key, Tree } from '../../engine/tree'
import type { PredictionKind } from '../../practice/predict'
import { ModeSwitch } from '../practice/ModeSwitch'
import { PredictionReveal } from '../practice/PredictionReveal'
import { PredictPrompt, type PredictionReport } from '../practice/PredictPrompt'
import { ReplayPlayer } from '../replay/ReplayPlayer'

export interface InsertReplayProps {
  /** The AVL tree before the insert. */
  tree: Tree
  keyToInsert: Key
  /** Accessible name of the tree. */
  label: string
  /** Ask for a prediction of this kind before the replay (FR-VIS-05). */
  predict?: PredictionKind
  /** Offer the Watch or Do it yourself switch (FR-VIS-06). */
  doItYourself?: boolean
}

/**
 * One insert in a module step (add-insert-replay): the existing replay, optionally preceded by a
 * prediction and followed by its reveal, optionally inside the Watch or Do it yourself switch.
 * Predictions are practice: nothing here is stored. The parent keys it on the step, so Back and
 * Next start it fresh (prompt empty, replay at step 0, Watch selected).
 */
export function InsertReplay({ tree, keyToInsert, label, predict, doItYourself = false }: InsertReplayProps) {
  const [report, setReport] = useState<PredictionReport | null>(null)
  const [jump, setJump] = useState<{ index: number; nonce: number } | undefined>(undefined)
  // Latched: "Replay that step" moves the replay back, but the reveal stays once it has appeared.
  const [reachedEnd, setReachedEnd] = useState(false)
  const onPosition = useCallback((position: number, length: number) => {
    if (length > 0 && position === length) setReachedEnd(true)
  }, [])

  const held = predict !== undefined && report === null
  const reveal = predict !== undefined && report !== null && !report.skipped && reachedEnd

  const watch = (
    <>
      {predict !== undefined && <PredictPrompt tree={tree} keyToInsert={keyToInsert} kind={predict} onProceed={setReport} />}
      <ReplayPlayer operation={{ kind: 'insert', tree, key: keyToInsert }} label={label} held={held} showStep={jump} onPosition={onPosition} />
      {reveal && (
        <PredictionReveal
          tree={tree}
          keyToInsert={keyToInsert}
          kind={predict}
          choice={report.choice}
          onReplayStep={(index) => setJump((j) => ({ index, nonce: (j?.nonce ?? 0) + 1 }))}
        />
      )}
    </>
  )

  return doItYourself ? <ModeSwitch watch={watch} base={tree} keyToInsert={keyToInsert} /> : watch
}
