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
  inserted: boolean
  log: string[]
}
type EditorAction = PracticeAction | { type: 'insert' }

export interface TraceEditorProps {
  /** The tree before the insert. */
  base: Tree
  keyToInsert: Key
  /** Locked once the answer is checked. */
  disabled: boolean
  /** The tree on screen, reported after every edit. */
  onTree: (tree: Tree) => void
}

/**
 * Trace-an-insert editor (FR-ASM-04): a plain search-tree insert of the listed key, then rotations
 * from the existing rotation menu, with Undo, Reset and a log of edits. Touch, pointer and keyboard.
 */
export function TraceEditor({ base, keyToInsert, disabled, onTree }: TraceEditorProps) {
  const [state, dispatch] = useReducer(
    (s: EditorState, a: EditorAction): EditorState => {
      switch (a.type) {
        case 'insert':
          return s.inserted ? s : { p: initPractice(bstInsert(base, keyToInsert).tree), inserted: true, log: [text.inserted(keyToInsert)] }
        case 'reset':
          return { p: { ...initPractice(base), last: 'reset' }, inserted: false, log: [] }
        case 'undo':
          if (s.p.history.length > 0) return { ...s, p: practiceReducer(s.p, a), log: s.log.slice(0, -1) }
          return s.inserted ? { p: { ...initPractice(base), last: 'undone' }, inserted: false, log: [] } : s
        case 'rotate': {
          const at = s.p.selected
          const p = practiceReducer(s.p, a)
          return p.history.length > s.p.history.length && at !== null
            ? { ...s, p, log: [...s.log, text.rotated(a.dir, at)] }
            : { ...s, p }
        }
        default:
          return { ...s, p: practiceReducer(s.p, a) }
      }
    },
    undefined,
    (): EditorState => ({ p: initPractice(base), inserted: false, log: [] }),
  )
  const { p } = state
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
      <p>{text.task(keyToInsert)}</p>
      <TreeView
        tree={p.tree}
        roles={state.inserted ? { [keyToInsert]: 'new' } : undefined}
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
        <button type="button" className="practice-button" disabled={disabled || state.inserted} onClick={() => dispatch({ type: 'insert' })}>
          {text.insert(keyToInsert)}
        </button>
        <button type="button" className="practice-button" disabled={disabled || !state.inserted} onClick={() => dispatch({ type: 'undo' })}>
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
