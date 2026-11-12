import { useEffect, useMemo, useReducer, useState, type KeyboardEvent } from 'react'
import './replay.css'
import { replayCopy } from '../../content/replay'
import { pseudocode } from '../../content/pseudocode'
import type { SearchForm } from '../../engine/search'
import { explainAt, initReplay, replayReducer, rolesAt, stepAt, traceFor, treeAt, visitedAt, type Operation } from '../../replay/replay'
import { TreeView } from '../tree/TreeView'
import { PseudocodePanel } from './PseudocodePanel'
import { StepControls } from './StepControls'
import { StepExplanation } from './StepExplanation'
import { sentenceFor } from './sentence'

export interface ReplayPlayerProps {
  /** The insert or search to replay. The player asks the engine for its trace. */
  operation: Operation
  /** Accessible name of the tree. */
  label: string
  /** Hold at the start while a prediction is open (FR-VIS-05). */
  held?: boolean
  /** "Replay that step": show the position after trace step `index`. A new nonce repeats the request. */
  showStep?: { index: number; nonce: number }
}

/** Watch mode (FR-VIS-03, FR-VIS-04, FR-VIS-07, wireframe 1f): tree, step controls, pseudocode and the step sentence. */
export function ReplayPlayer({ operation, label, held = false, showStep }: ReplayPlayerProps) {
  const { kind, tree: start, key } = operation
  const [form, setForm] = useState<SearchForm>('loop')
  const { trace } = useMemo(() => traceFor({ kind, tree: start, key } as Operation, form), [kind, start, key, form])
  const [state, dispatch] = useReducer(replayReducer, trace.length, (n) => initReplay(n, held))

  // Adjust state while rendering when inputs change (no effect, so no stale frame is drawn).
  const [seenTrace, setSeenTrace] = useState(trace)
  if (seenTrace !== trace) {
    setSeenTrace(trace)
    dispatch({ type: 'reset', length: trace.length })
  }
  const [seenHeld, setSeenHeld] = useState(held)
  if (seenHeld !== held) {
    setSeenHeld(held)
    dispatch({ type: 'hold', held })
  }
  const [seenShow, setSeenShow] = useState(showStep?.nonce)
  if (showStep && seenShow !== showStep.nonce) {
    setSeenShow(showStep.nonce)
    dispatch({ type: 'jumpTo', stepIndex: showStep.index })
  }

  // One interval per play and speed. A tick while paused or at the end is ignored by the reducer,
  // so Pause never races a pending tick; a speed change restarts the interval from that moment.
  useEffect(() => {
    if (!state.playing) return
    const t = setInterval(() => dispatch({ type: 'tick' }), replayCopy.baseMs / state.speed)
    return () => clearInterval(t)
  }, [state.playing, state.speed])

  // Shortcuts work only while focus is inside the player (WCAG 2.1.4). Form radios keep their own keys.
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.ctrlKey || e.altKey || e.metaKey) return
    if (e.target instanceof HTMLInputElement) return
    const action =
      e.key === ' ' ? 'toggle'
      : e.key === 'ArrowLeft' ? 'back'
      : e.key === 'ArrowRight' ? 'step'
      : e.key === '[' ? 'slower'
      : e.key === ']' ? 'faster'
      : null
    if (action === null) return
    e.preventDefault()
    dispatch({ type: action })
  }
  // A focused button turns Space into a click on keyup; stop that so one press is one toggle.
  const onKeyUp = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === ' ' && !(e.target instanceof HTMLInputElement)) e.preventDefault()
  }

  const p = state.position
  const step = stepAt(trace, p)
  const op = { kind, tree: start, key } as Operation
  const listing = kind === 'insert' ? pseudocode.insert : form === 'loop' ? pseudocode.searchLoop : pseudocode.searchRecursive
  const name =
    kind === 'insert' ? replayCopy.panel.insert : form === 'loop' ? replayCopy.panel.searchLoop : replayCopy.panel.searchRecursive

  return (
    <div className="replay" onKeyDown={onKeyDown} onKeyUp={onKeyUp}>
      <TreeView tree={treeAt(start, trace, p)} roles={rolesAt(trace, p)} label={label} />
      <StepControls
        position={p}
        length={state.length}
        playing={state.playing}
        speed={state.speed}
        held={state.held}
        onBack={() => dispatch({ type: 'back' })}
        onToggle={() => dispatch({ type: 'toggle' })}
        onStep={() => dispatch({ type: 'step' })}
        onSpeed={(speed) => dispatch({ type: 'setSpeed', speed })}
      />
      <PseudocodePanel
        name={name}
        listing={listing}
        line={step?.pseudocodeLine ?? null}
        rebalanceCase={step?.rebalanceCase}
        {...(kind === 'search' && { form, onForm: setForm })}
      />
      <StepExplanation sentence={sentenceFor(op, explainAt(op, trace, p))} visited={kind === 'search' ? visitedAt(trace, p) : undefined} />
      <p className="replay-help">{replayCopy.controls.help}</p>
    </div>
  )
}
