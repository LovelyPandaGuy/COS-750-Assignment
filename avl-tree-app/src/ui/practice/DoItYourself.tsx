import { useMemo, useReducer, useRef, useEffect, type KeyboardEvent } from 'react'
import './practice.css'
import { practiceCopy } from '../../content/practice'
import { initPractice, practiceReducer, rotationsNeeded, startTree } from '../../practice/rotate'
import type { Key, Tree } from '../../engine/tree'
import { TreeView } from '../tree/TreeView'
import { FeedbackPanel } from './FeedbackPanel'
import { InOrderStrip } from './InOrderStrip'
import { RotationMenu } from './RotationMenu'

const copy = practiceCopy.practice

export interface DoItYourselfProps {
  /** The tree before the insert. Practice starts from the tree after a plain BST insert of `keyToInsert`. */
  base: Tree
  keyToInsert: Key
}

export function DoItYourself({ base, keyToInsert }: DoItYourselfProps) {
  const start = useMemo(() => startTree(base, keyToInsert), [base, keyToInsert])
  const rotations = useMemo(() => rotationsNeeded(base, keyToInsert), [base, keyToInsert])
  const [state, dispatch] = useReducer(practiceReducer, start, initPractice)
  const box = useRef<HTMLElement>(null)
  const feedbackRef = useRef<HTMLDivElement>(null)
  const roles = useMemo(() => ({ [keyToInsert]: 'new' as const }), [keyToInsert])

  // After a successful rotation the menu closes, so focus goes to the feedback.
  // A refusal keeps the selection and the menu, and focus where it is.
  useEffect(() => {
    if (state.feedback !== null && state.selected === null) feedbackRef.current?.focus()
  }, [state.feedback, state.selected])

  const focusTree = () => box.current?.querySelector<SVGGElement>('[role="treeitem"][tabindex="0"]')?.focus()
  const cancel = () => {
    dispatch({ type: 'clear-selection' })
    focusTree()
  }
  const undo = () => {
    dispatch({ type: 'undo' })
    focusTree()
  }
  const reset = () => {
    dispatch({ type: 'reset' })
    focusTree()
  }

  // One handler on the container: the shortcuts only work while focus is inside the practice area.
  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if ((e.ctrlKey || e.metaKey) && !e.altKey && e.key.toLowerCase() === 'z') {
      e.preventDefault()
      undo()
      return
    }
    if (e.ctrlKey || e.altKey || e.metaKey || state.selected === null) return
    const key = e.key.toLowerCase()
    if (key === 'r' || key === 'l') {
      e.preventDefault()
      dispatch({ type: 'rotate', dir: key === 'r' ? 'right' : 'left' })
    } else if (key === 'escape') {
      e.preventDefault()
      cancel()
    }
  }

  if (rotations === 0) {
    return (
      <section className="practice" aria-label={copy.label}>
        <h3>{copy.heading}</h3>
        <p>{copy.noRotation}</p>
        <TreeView tree={start} roles={roles} label={copy.treeLabel} />
      </section>
    )
  }

  return (
    <section ref={box} className="practice" aria-label={copy.label} onKeyDown={onKeyDown}>
      <h3>{copy.heading}</h3>
      <p>{copy.task(rotations)}</p>
      <TreeView
        tree={state.tree}
        roles={roles}
        interactive
        label={copy.treeLabel}
        selectedKey={state.selected}
        onSelect={(key) => dispatch({ type: 'select', key })}
      />
      {state.selected !== null && (
        <RotationMenu node={state.selected} onRotate={(dir) => dispatch({ type: 'rotate', dir })} onCancel={cancel} />
      )}
      <InOrderStrip tree={state.tree} />
      <div className="practice-row">
        <button type="button" className="practice-button" disabled={state.history.length === 0} onClick={undo}>
          <span aria-hidden="true">{copy.iconUndo}</span>
          {copy.undo}
        </button>
        <button type="button" className="practice-button" onClick={reset}>
          {copy.reset}
        </button>
      </div>
      <FeedbackPanel ref={feedbackRef} message={state.feedback} />
      <p role="status" aria-label={copy.updatesLabel} className="practice-updates">
        {state.last === 'undone' ? copy.undone : state.last === 'reset' ? copy.resetDone : ''}
      </p>
      <p className="practice-help">{copy.help}</p>
    </section>
  )
}
