import { useEffect, useMemo, useReducer, useState, type KeyboardEvent } from 'react'
import './replay.css'
import { replayCopy } from '../../content/replay'
import { pseudocode } from '../../content/pseudocode'
import type { SearchForm } from '../../engine/search'
import type { Key, Tree } from '../../engine/tree'
import type { Representation } from '../../modules/schema'
import { explainAt, initReplay, replayReducer, rolesAt, stepAt, traceFor, treeAt, visitedAt, type Operation } from '../../replay/replay'
import { describeTree } from '../tree/describe'
import { TREE_TRANSITION_MS } from '../tree/motion'
import { TreeView } from '../tree/TreeView'
import { Caption } from './Caption'
import { PseudocodePanel } from './PseudocodePanel'
import { lockedBox } from './representations'
import { RepresentationSwitcher } from './RepresentationSwitcher'
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
  /**
   * Told the position and trace length whenever the position changes, so a parent can react to the
   * end of the replay (add-insert-replay). Give it a stable identity (useCallback). No visible effect.
   */
  onPosition?: (position: number, length: number) => void
  /**
   * The step's representations (D22, D106). When given, the player shows the switcher with the primary
   * locked on and `supporting` ticked, and resets the boxes for each new operation.
   */
  representations?: { primary: Representation; supporting: readonly Representation[] }
  /** What to show, owned by an outer host (for example the mode switch, screen 1h). The player then shows no switcher. */
  shown?: readonly Representation[]
}

/** Everything, as before this change, for callers that pass no representations. */
const ALL: readonly Representation[] = ['diagram', 'text', 'pseudocode']

const inOrder = (t: Tree): Key[] => (t === null ? [] : [...inOrder(t.left), t.key, ...inOrder(t.right)])

function defaultsOf(r: NonNullable<ReplayPlayerProps['representations']>): Representation[] {
  return [lockedBox(r.primary), ...r.supporting.map((s) => (s === 'animation' ? 'diagram' : s))]
}

/**
 * Watch mode (FR-VIS-03, FR-VIS-04, FR-VIS-07, wireframe 1f): switcher, tree, caption, step controls,
 * pseudocode and the whole tree in words (D23, D105, D106). Steps slide over stable slots (D103).
 */
export function ReplayPlayer({ operation, label, held = false, showStep, onPosition, representations, shown: hostShown }: ReplayPlayerProps) {
  const { kind, tree: start, key } = operation
  const [form, setForm] = useState<SearchForm>('loop')
  const { trace } = useMemo(() => traceFor({ kind, tree: start, key } as Operation, form), [kind, start, key, form])
  const [state, dispatch] = useReducer(replayReducer, trace.length, (n) => initReplay(n, held))
  const [boxes, setBoxes] = useState<Representation[] | null>(() => (representations ? defaultsOf(representations) : null))
  // A new run restarts the play interval, so Replay while playing waits a full step before the first tick.
  const [run, setRun] = useState(0)

  // Adjust state while rendering when inputs change (no effect, so no stale frame is drawn).
  const [seenTrace, setSeenTrace] = useState(trace)
  if (seenTrace !== trace) {
    setSeenTrace(trace)
    dispatch({ type: 'reset', length: trace.length })
  }
  // A new operation (not a new search form) returns the boxes to the step's defaults (D22).
  const [seenOp, setSeenOp] = useState({ kind, start, key })
  if (seenOp.kind !== kind || seenOp.start !== start || seenOp.key !== key) {
    setSeenOp({ kind, start, key })
    setBoxes(representations ? defaultsOf(representations) : null)
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

  useEffect(() => {
    onPosition?.(state.position, state.length)
  }, [onPosition, state.position, state.length])

  // One interval per play and speed. A tick while paused or at the end is ignored by the reducer,
  // so Pause never races a pending tick; a speed change restarts the interval from that moment.
  useEffect(() => {
    if (!state.playing) return
    const t = setInterval(() => dispatch({ type: 'tick' }), replayCopy.baseMs / state.speed)
    return () => clearInterval(t)
  }, [state.playing, state.speed, run])

  // Every key keeps its x at every position: lay each step out over the final tree's keys (D103).
  const slots = useMemo(() => inOrder(treeAt(start, trace, trace.length)), [start, trace])
  const transitionMs = Math.min(TREE_TRANSITION_MS, replayCopy.baseMs / state.speed / 2)
  const shown = hostShown ?? boxes ?? ALL
  const hostsSwitcher = representations !== undefined && hostShown === undefined
  const toggle = (r: Representation) => setBoxes((b) => {
    const now = b ?? ALL
    return now.includes(r) ? now.filter((x) => x !== r) : [...now, r]
  })
  const replay = () => {
    dispatch({ type: 'reset', length: trace.length })
    dispatch({ type: 'play' })
    setRun((n) => n + 1)
  }

  // Shortcuts work only while focus is inside the player (WCAG 2.1.4). Form radios keep their own keys.
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.ctrlKey || e.altKey || e.metaKey) return
    if (e.target instanceof HTMLInputElement) return
    // Inside the tree's scroll box the arrows scroll a wide tree (D17); they step everywhere else (review C5).
    const arrow = e.key === 'ArrowLeft' || e.key === 'ArrowRight'
    if (arrow && e.target instanceof Element && e.target.closest('.tree-scroll')) return
    // On a button or summary, Space keeps its native action and activates it (review A1/R3).
    if (e.key === ' ' && e.target instanceof Element && e.target.closest('button, summary')) return
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

  const p = state.position
  const step = stepAt(trace, p)
  const op = { kind, tree: start, key } as Operation
  const listing = kind === 'insert' ? pseudocode.insert : form === 'loop' ? pseudocode.searchLoop : pseudocode.searchRecursive
  const name =
    kind === 'insert' ? replayCopy.panel.insert : form === 'loop' ? replayCopy.panel.searchLoop : replayCopy.panel.searchRecursive

  const tree = treeAt(start, trace, p)
  const roles = rolesAt(trace, p)

  return (
    <div className="replay" onKeyDown={onKeyDown}>
      {hostsSwitcher && <RepresentationSwitcher primary={representations.primary} shown={shown} onToggle={toggle} />}
      <TreeView tree={tree} roles={roles} label={label} slots={slots} transitionMs={transitionMs} />
      <Caption sentence={sentenceFor(op, explainAt(op, trace, p))} visited={kind === 'search' ? visitedAt(trace, p) : undefined} />
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
        onReplay={replay}
      />
      {shown.includes('pseudocode') && (
        <PseudocodePanel
          name={name}
          listing={listing}
          line={step?.pseudocodeLine ?? null}
          rebalanceCase={step?.rebalanceCase}
          {...(kind === 'search' && { form, onForm: setForm })}
        />
      )}
      {shown.includes('text') && <StepExplanation description={describeTree(tree, roles)} />}
      <p className="replay-help">{replayCopy.controls.help}</p>
    </div>
  )
}
