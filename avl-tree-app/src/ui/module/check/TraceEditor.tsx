import { useEffect, useReducer, useRef, type KeyboardEvent } from 'react'
import { checkCopy } from '../../../content/check'
import { practiceCopy } from '../../../content/practice'
import { insert as bstInsert } from '../../../engine/bst'
import type { Key, Tree } from '../../../engine/tree'
import { initPractice, practiceReducer, type PracticeAction, type PracticeState } from '../../../practice/rotate'
import { InOrderStrip } from '../../practice/InOrderStrip'
import { RotationMenu } from '../../practice/RotationMenu'
import { TreeView } from '../../tree/TreeView'

const copy = practiceCopy.practice
const text = checkCopy.editor

interface EditorState {
  p: PracticeState
  /** How many of the keys are in. */
  inserted: number
  log: string[]
  /** Earlier states, for Undo across inserts and rotations. */
  undo: EditorState[]
}
type EditorAction = PracticeAction | { type: 'insert' }

export interface TraceEditorProps {
  /** The tree before the inserts. */
  base: Tree
  /** The keys to insert, one at a time, in order (one for a module check, several for C9's build item). */
  keys: readonly Key[]
  /** Locked once the answer is checked. */
  disabled: boolean
  /** The tree on screen, reported after every edit. */
  onTree: (tree: Tree) => void
}

/**
 * Trace-an-insert editor (FR-ASM-04): plain search-tree inserts of the listed keys, one at a time,
 * with rotations from the existing rotation menu between them, Undo, Reset and a log of edits.
 * Touch, pointer and keyboard.
 */
export function TraceEditor({ base, keys, disabled, onTree }: TraceEditorProps) {
  const [state, dispatch] = useReducer(
    (s: EditorState, a: EditorAction): EditorState => {
      switch (a.type) {
        case 'insert': {
          const key = keys[s.inserted]
          if (key === undefined) return s
          return { p: initPractice(bstInsert(s.p.tree, key).tree), inserted: s.inserted + 1, log: [...s.log, text.inserted(key)], undo: [...s.undo, s] }
        }
        case 'reset':
          return { p: { ...initPractice(base), last: 'reset' }, inserted: 0, log: [], undo: [] }
        case 'undo': {
          const before = s.undo[s.undo.length - 1]
          return before === undefined ? s : { ...before, p: { ...before.p, selected: null, feedback: null, last: 'undone' } }
        }
        case 'rotate': {
          const at = s.p.selected
          const p = practiceReducer(s.p, a)
          return p.history.length > s.p.history.length && at !== null
            ? { ...s, p, log: [...s.log, text.rotated(a.dir, at)], undo: [...s.undo, s] }
            : { ...s, p }
        }
        default:
          return { ...s, p: practiceReducer(s.p, a) }
      }
    },
    undefined,
    (): EditorState => ({ p: initPractice(base), inserted: 0, log: [], undo: [] }),
  )
  const { p } = state
  const next = keys[state.inserted]
  const lastIn = state.inserted > 0 ? keys[state.inserted - 1] : undefined
  const box = useRef<HTMLDivElement>(null)

  useEffect(() => onTree(p.tree), [p.tree, onTree])

  const focusTree = () => box.current?.querySelector<SVGGElement>('[role="treeitem"][tabindex="0"]')?.focus()
  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (disabled) return
    if ((e.ctrlKey || e.metaKey) && !e.altKey && e.key.toLowerCase() === 'z') {
      e.preventDefault()
      dispatch({ type: 'undo' })
      return
    }
    if (e.ctrlKey || e.altKey || e.metaKey || p.selected === null) return
    const key = e.key.toLowerCase()
    if (key === 'r' || key === 'l') {
      e.preventDefault()
      dispatch({ type: 'rotate', dir: key === 'r' ? 'right' : 'left' })
    } else if (key === 'escape') {
      e.preventDefault()
      dispatch({ type: 'clear-selection' })
      focusTree()
    }
  }
  const refused = p.feedback?.kind === 'refused' ? p.feedback : null

  return (
    <section ref={box} className="practice check-editor" aria-label={text.heading} onKeyDown={onKeyDown}>
      <p>{keys.length === 1 ? text.task(keys[0]) : text.taskMany(keys)}</p>
      <TreeView
        tree={p.tree}
        roles={lastIn !== undefined ? { [lastIn]: 'new' } : undefined}
        interactive={!disabled}
        label={text.treeLabel}
        selectedKey={p.selected}
        onSelect={(key) => dispatch({ type: 'select', key })}
      />
      {p.selected !== null && !disabled && (
        <RotationMenu node={p.selected} onRotate={(dir) => dispatch({ type: 'rotate', dir })} onCancel={() => dispatch({ type: 'clear-selection' })} />
      )}
      <InOrderStrip tree={p.tree} />
      <div className="practice-row">
        <button type="button" className="practice-button" disabled={disabled || next === undefined} onClick={() => dispatch({ type: 'insert' })}>
          {text.insert(next ?? keys[keys.length - 1])}
        </button>
        <button type="button" className="practice-button" disabled={disabled || state.undo.length === 0} onClick={() => dispatch({ type: 'undo' })}>
          <span aria-hidden="true">{copy.iconUndo}</span>
          {copy.undo}
        </button>
        <button type="button" className="practice-button" disabled={disabled} onClick={() => dispatch({ type: 'reset' })}>
          {copy.reset}
        </button>
      </div>
      {refused !== null && <p role="status">{text.cannotRotate(refused.node, refused.dir)}</p>}
      <p className="check-log-title"><strong>{text.logHeading}</strong></p>
      {state.log.length === 0 ? (
        <p>{text.logEmpty}</p>
      ) : (
        <ol aria-label={text.logHeading}>
          {state.log.map((entry, i) => (
            <li key={i}>{entry}</li>
          ))}
        </ol>
      )}
    </section>
  )
}
