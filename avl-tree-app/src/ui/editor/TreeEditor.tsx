// The tree editor (tree-editor; revamp-tree-editor design 3, 5, 7; D132 to D135; revamp-tree-controls D136 to
// D139). One component for every build-tree and perform-rotation question. Fixed DOM order at every width:
// tree region, rotation menu, control bar, in-order strip, edit log, keyboard help, status. The reducer in builder.ts is the only state.
import './editor.css'
import { useEffect, useMemo, useReducer, useRef, type CSSProperties, type KeyboardEvent } from 'react'
import { controlsCopy } from '../../content/controls'
import { lessonCopy } from '../../content/lesson'
import type { Key, Tree } from '../../engine/tree'
import type { BuilderStep } from '../../live/mark'
import { KeyboardHelp } from '../controls/KeyboardHelp'
import { matches, shortcutsFor } from '../controls/shortcuts'
import { builderReducer, initBuilder, targetsOf, type Target } from '../lesson/questions/builder'
import { InOrderStrip } from '../practice/InOrderStrip'
import { RotationMenu } from '../practice/RotationMenu'
import { LEVEL_HEIGHT, layoutTree } from '../tree/layout'
import { TreeView } from '../tree/TreeView'
import { EditLog } from './EditLog.tsx'
import { editLogEntries } from './editLog'
import { SlotOverlay, type PlacedSlot } from './SlotOverlay'
import { TreeEditorToolbar } from './TreeEditorToolbar'

const copy = lessonCopy.questions.builder
const SCROLL: ScrollIntoViewOptions = { block: 'nearest', inline: 'center' }
/** Room for the slot row under the deepest level (and its "empty" word). */
const SLOT_ROW = LEVEL_HEIGHT - 20
const HELP_KEYS = shortcutsFor('editor').map((s) => ({ keys: s.caps, action: s.action }))

export interface TreeEditorProps {
  start: Tree
  pending: readonly Key[]
  deletable: Key | null
  formatKey: (k: Key) => string
  label: string
  disabled: boolean
  onChange: (tree: Tree, log: BuilderStep[], complete: boolean) => void
}

const isLeaf = (tree: Tree, key: Key): boolean => {
  let n = tree
  while (n !== null && n.key !== key) n = key < n.key ? n.left : n.right
  // After a wrong placement the tree may not be in BST order: fall back to a full walk.
  if (n === null) {
    const walk = (t: Tree): Tree => (t === null ? null : t.key === key ? t : walk(t.left) ?? walk(t.right))
    n = walk(tree)
  }
  return n !== null && n.left === null && n.right === null
}

export function TreeEditor({ start, pending, deletable, formatKey: k, label, disabled, onChange }: TreeEditorProps) {
  const [s, dispatch] = useReducer(builderReducer, undefined, () => initBuilder(start, pending, deletable))
  const root = useRef<HTMLDivElement>(null)
  const focusAfter = useRef<Key | null>(null)
  const next = s.pending[0] ?? null
  const last = s.log.at(-1)
  const placedKey = last?.type === 'place' ? last.key : null
  const entries = useMemo(() => editLogEntries(s.log, k), [s.log, k])
  const layout = useMemo(() => layoutTree(s.tree), [s.tree])

  useEffect(() => onChange(s.tree, s.log, s.pending.length === 0), [s.tree, s.log, s.pending, onChange])

  // Keep the held key's slots and the selected node in view on a narrow screen (D135).
  useEffect(() => {
    const el = s.held ? root.current?.querySelector('.editor-slot') : s.selected !== null ? root.current?.querySelector(`[data-key="${s.selected}"]`) : null
    el?.scrollIntoView?.(SCROLL)
  }, [s.held, s.selected])

  // After a rotation the menu closes: return focus to the node it was about, so the keyboard keeps its place.
  useEffect(() => {
    if (focusAfter.current === null) return
    const el = root.current?.querySelector<SVGGElement>(`[data-key="${focusAfter.current}"]`)
    focusAfter.current = null
    el?.focus()
  }, [s.tree])

  const rotate = (dir: 'left' | 'right') => {
    if (s.selected === null) return
    focusAfter.current = s.selected
    dispatch({ type: 'rotate', dir })
  }

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return
    const t = e.target as HTMLElement
    if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA') return
    if (matches('undo', e)) {
      e.preventDefault()
      dispatch({ type: 'undo' })
    } else if (matches('cancel', e)) {
      if (s.held) dispatch({ type: 'letGo' })
      else if (s.selected !== null) dispatch({ type: 'select', key: null })
    } else if (s.selected !== null && (matches('rotateRight', e) || matches('rotateLeft', e))) {
      e.preventDefault()
      rotate(matches('rotateRight', e) ? 'right' : 'left')
    }
  }

  // Slots in in-order order (targetsOf), placed at the positions TreeView draws (emptySlots), matched by parent:side.
  const slotsFor = (drawn: readonly { parentKey: Key; side: 'left' | 'right'; x: number; y: number }[]): PlacedSlot[] => {
    const at = new Map(drawn.map((d) => [`${d.parentKey}:${d.side}`, d]))
    return targetsOf(s.tree).flatMap((t) => {
      const d = at.get(`${t.parent}:${t.side}`)
      return d === undefined ? [] : [{ ...t, x: d.x, y: d.y }]
    })
  }
  const place = (t: Target) => !disabled && dispatch({ type: 'place', target: t })

  const selectedAt = s.selected === null ? undefined : layout.nodes.find((n) => n.key === s.selected)
  const menuStyle = selectedAt && ({ '--menu-x': `${selectedAt.x}px`, '--menu-y': `${selectedAt.y}px` } as CSSProperties)
  const menuSide = selectedAt && selectedAt.x > layout.width / 2 ? 'left' : 'right'
  const status = s.refused !== null ? copy.cannotRotate(k(s.refused.key), s.refused.side) : s.held && next !== null ? copy.held(k(next)) : (entries.at(-1) ?? '')

  return (
    <div className="q-builder tree-editor" role="group" aria-label={copy.label} ref={root} onKeyDown={onKeyDown}>
      <div className="editor-tree">
        {s.tree === null ? (
          s.held && next !== null ? (
            <svg className="editor-root-slot" width={88} height={88} viewBox="0 0 88 88" aria-label={copy.slotsLabel(k(next))} role="group">
              <SlotOverlay slots={[{ parent: null, side: null, x: 44, y: 34 }]} formatKey={k} onPlace={place} />
            </svg>
          ) : (
            <TreeView tree={null} label={label} />
          )
        ) : (
          <TreeView
            tree={s.tree}
            formatKey={k}
            label={label}
            interactive
            selectedKey={s.selected}
            roles={placedKey !== null ? { [placedKey]: 'placed' } : undefined}
            onSelect={(key) => !disabled && dispatch({ type: 'select', key })}
            extraHeight={s.held ? SLOT_ROW : 0}
            layer={s.held && !disabled && next !== null ? { label: copy.slotsLabel(k(next)), render: (drawn) => <SlotOverlay slots={slotsFor(drawn.emptySlots)} formatKey={k} onPlace={place} /> } : undefined}
          />
        )}
        {s.selected !== null && !disabled && (
          <div className="editor-menu" data-side={menuSide} style={menuStyle}>
            <RotationMenu node={k(s.selected)} onRotate={rotate} onCancel={() => dispatch({ type: 'select', key: null })} />
          </div>
        )}
      </div>
      <TreeEditorToolbar
        nextKey={next}
        held={s.held}
        onInsert={() => dispatch({ type: s.held ? 'letGo' : 'hold' })}
        canUndo={s.history.length > 0}
        onUndo={() => dispatch({ type: 'undo' })}
        onReset={() => dispatch({ type: 'reset' })}
        deleteKey={s.deletable}
        canDelete={s.deletable !== null && isLeaf(s.tree, s.deletable)}
        onDelete={() => dispatch({ type: 'delete' })}
        formatKey={k}
        disabled={disabled}
      />
      {next === null && pending.length > 0 && <p className="q-status">{copy.allPlaced}</p>}
      {s.selected === null && !s.held && !disabled && <p className="q-status">{copy.selectToRotate}</p>}
      <InOrderStrip tree={s.tree} formatKey={k} rotation={s.lastRotation} newKey={placedKey} />
      <EditLog heading={copy.logHeading} entries={entries} emptyText={copy.logEmpty} />
      <KeyboardHelp heading={controlsCopy.help.heading} keys={HELP_KEYS} />
      <p className="q-status editor-status" role="status">
        {status}
      </p>
    </div>
  )
}

