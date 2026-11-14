import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import './tree-view.css'
import { treeViewCopy as copy } from '../../content/treeView'
import type { Key, Tree } from '../../engine/tree'
import { describeTree, describeTreeParts, nodeName, signed, type HideBalance, type NodeRole, type Roles } from './describe'
import { NODE_DIAMETER, emptySlots, layoutTree, type EmptySlot, type LayoutNode } from './layout'
import { TREE_TRANSITION_MS, prefersReducedMotion, useTweenedLayout } from './motion'

export type { NodeRole }

/** What an overlay receives: the positions as drawn in this frame, and the empty child slots. */
export interface DrawnLayout {
  nodes: LayoutNode[]
  emptySlots: EmptySlot[]
  width: number
  height: number
}

export interface TreeViewProps {
  tree: Tree
  /** Roles by key (new, z, y, balanced). A node without one is neutral. */
  roles?: Roles
  /** Read-only (an image) when false; the ARIA tree pattern with keyboard navigation when true. */
  interactive?: boolean
  /** Controlled selection; the parent updates it from onSelect. */
  selectedKey?: Key | null
  onSelect?: (key: Key) => void
  /** Accessible name, supplied by the screen. */
  label: string
  /** Practice: hide balance factors and the Unbalanced flag, except on revealed keys. */
  hideBalance?: HideBalance
  /** Slot keys (a superset of the tree's keys): keys keep their x across steps that add or remove others. */
  slots?: readonly Key[]
  /** Time for nodes to move to a new tree, in ms. Defaults to TREE_TRANSITION_MS; 0 snaps. */
  transitionMs?: number
  /** A sentence the screen wants read out (polite). Only for screens without a live region of their own. */
  announce?: string
  /** Extension point (editing, menus): drawn inside the SVG above the nodes, from the drawn layout. */
  overlay?: (layout: DrawnLayout) => ReactNode
}

const R = NODE_DIAMETER / 2
const RING: Record<NodeRole | 'neutral', 'solid' | 'dotted' | 'double' | 'dashed' | 'thick'> = {
  neutral: 'solid',
  new: 'dotted',
  balanced: 'thick',
  z: 'double',
  y: 'dashed',
}
const NO_ROLES: Roles = {}
/** Roving tabindex: only one node is a tab stop. */
const OFF_TAB_STOP = -1
/** Role tag pill (design system section 01 D): top right of the node, 20 high, fully rounded. */
const PILL_HEIGHT = 20
const PILL_X = R - 13
const PILL_Y = -R - 10
const pillWidth = (text: string) => Math.max(22, 12 + 8 * text.length)

const scrollOptions = (): ScrollIntoViewOptions => ({
  block: 'nearest',
  inline: 'nearest',
  behavior: prefersReducedMotion() ? 'auto' : 'smooth',
})

export function TreeView({
  tree,
  roles = NO_ROLES,
  interactive = false,
  selectedKey = null,
  onSelect,
  label,
  hideBalance,
  slots,
  transitionMs = TREE_TRANSITION_MS,
  announce,
  overlay,
}: TreeViewProps) {
  const descId = useId()
  const [open, setOpen] = useState(false)
  const [focusKey, setFocusKey] = useState<Key | null>(null)
  const items = useRef(new Map<Key, SVGGElement>())

  const slotKey = slots ? slots.join(',') : ''
  // Memoised on the tree and the slot keys, so the tween sees a new target only when the tree changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const target = useMemo(() => layoutTree(tree, slots ? { slots } : undefined), [tree, slotKey])
  const layout = useTweenedLayout(target, transitionMs)
  // Names, levels and the description follow the new tree at once; only positions move.
  const parts = describeTreeParts(tree, roles, hideBalance)
  const partOf = new Map(parts.map((p) => [p.key, p]))
  const structure = new Map(target.nodes.map((n) => [n.key, n]))
  const drawnAt = new Map(layout.nodes.map((n) => [n.key, n]))
  const rootKey = tree?.key ?? null
  const tabKey = [focusKey, selectedKey, rootKey].find((k) => k !== null && structure.has(k)) ?? rootKey

  // Live region: whichever changed last, the screen's announcement or the selection (on first render
  // the announcement wins). Taken in during render, so no effect sets state.
  const selectionText = interactive && selectedKey !== null ? copy.selected(selectedKey) : null
  const [live, setLive] = useState({ announce, selectionText, text: announce ?? selectionText ?? '' })
  let liveText = live.text
  if (live.announce !== announce || live.selectionText !== selectionText) {
    if (announce !== live.announce && announce !== undefined) liveText = announce
    else if (selectionText !== live.selectionText && selectionText !== null) liveText = selectionText
    setLive({ announce, selectionText, text: liveText })
  }

  // When the tree changes (not on first render), keep the node being taught, z, in view.
  const firstTree = useRef(true)
  useEffect(() => {
    if (firstTree.current) {
      firstTree.current = false
      return
    }
    const z = Object.keys(roles).map(Number).find((k) => roles[k] === 'z')
    if (z !== undefined) items.current.get(z)?.scrollIntoView?.(scrollOptions())
    // Only a tree change should scroll; roles arrive with it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tree])

  const childOf = (key: Key, side: 'left' | 'right') =>
    target.nodes.find((n) => n.parentKey === key && n.side === side)?.key ?? null

  const select = (key: Key) => {
    setFocusKey(key)
    onSelect?.(key)
  }
  const moveTo = (key: Key | null) => {
    if (key === null) return
    setFocusKey(key)
    const el = items.current.get(key)
    el?.focus()
    el?.scrollIntoView?.(scrollOptions())
  }
  const onKeyDown = (key: Key) => (e: KeyboardEvent<SVGGElement>) => {
    const target =
      e.key === 'ArrowUp' ? structure.get(key)?.parentKey ?? null
      : e.key === 'ArrowLeft' ? childOf(key, 'left')
      : e.key === 'ArrowRight' ? childOf(key, 'right')
      : undefined
    if (target !== undefined) {
      e.preventDefault()
      moveTo(target)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      select(key)
    }
  }

  if (tree === null) return <p className="tree-empty">{copy.emptyTree}</p>

  return (
    <div className="tree-view">
      <div className="tree-scroll" role="region" aria-label={label} tabIndex={0}>
        <svg
          role={interactive ? 'tree' : 'img'}
          aria-label={label}
          aria-describedby={descId}
          width={layout.width}
          height={layout.height}
          viewBox={`0 0 ${layout.width} ${layout.height}`}
        >
          <g aria-hidden="true">
            {layout.nodes.map((n) => {
              const p = n.parentKey === null ? undefined : drawnAt.get(n.parentKey)
              return p && <line key={n.key} className="tree-edge" data-child={n.key} x1={p.x} y1={p.y} x2={n.x} y2={n.y} />
            })}
          </g>
          {layout.nodes.map((n) => {
            const part = partOf.get(n.key)!
            const role = part.role ?? 'neutral'
            const selected = interactive && n.key === selectedKey
            const tag = role === 'new' || role === 'z' || role === 'y' ? copy.roleTag[role] : null
            return (
              <g
                key={n.key}
                ref={(el) => {
                  if (el) items.current.set(n.key, el)
                  else items.current.delete(n.key)
                }}
                data-key={n.key}
                data-role={role}
                data-ring={RING[role]}
                transform={`translate(${n.x} ${n.y})`}
                {...(interactive && {
                  role: 'treeitem',
                  'aria-level': n.depth + 1,
                  'aria-selected': selected,
                  'aria-label': nodeName(part),
                  tabIndex: n.key === tabKey ? 0 : OFF_TAB_STOP,
                  onKeyDown: onKeyDown(n.key),
                  onClick: () => select(n.key),
                  onFocus: () => setFocusKey(n.key),
                })}
              >
                <circle className="tree-hit" r={R} />
                {selected && (
                  <rect className="tree-selected-frame" x={-R - 5} y={-R - 5} width={NODE_DIAMETER + 10} height={NODE_DIAMETER + 10} rx={8} />
                )}
                <circle className="tree-node-fill" r={R - 2} />
                <circle className="tree-ring" r={R - 2} />
                {role === 'z' && <circle className="tree-ring-inner" r={R - 6} />}
                <text className="tree-key">{n.key}</text>
                <text className="tree-metrics" y={R + 16} data-unbalanced={part.unbalanced && !part.hidden ? '' : undefined}>
                  {part.hidden ? copy.metricsHidden(part.height) : copy.metrics(part.height, signed(part.balanceFactor))}
                </text>
                {part.unbalanced && !part.hidden && (
                  <text className="tree-flag" y={R + 34}>
                    {copy.unbalancedFlag}
                  </text>
                )}
                {tag !== null && (
                  <>
                    <rect className="tree-tag-pill" x={PILL_X} y={PILL_Y} width={pillWidth(tag)} height={PILL_HEIGHT} rx={PILL_HEIGHT / 2} />
                    <text className="tree-tag" x={PILL_X + pillWidth(tag) / 2} y={PILL_Y + PILL_HEIGHT / 2}>
                      {tag}
                    </text>
                  </>
                )}
                {role === 'balanced' && (
                  <g className="tree-badge" transform={`translate(${R} ${-R})`}>
                    <title>{copy.balancedWord}</title>
                    <circle className="tree-badge-ring" r={9} />
                    <path className="tree-badge-check" d="M -4 0 L -1 3 L 4 -3" />
                  </g>
                )}
              </g>
            )
          })}
          {overlay?.({ nodes: layout.nodes, emptySlots: emptySlots(layout), width: layout.width, height: layout.height })}
        </svg>
      </div>
      <button type="button" className="tree-describe-button" aria-expanded={open} aria-controls={descId} onClick={() => setOpen((o) => !o)}>
        {copy.describeButton}
      </button>
      <p id={descId} className="tree-description" hidden={!open}>
        {describeTree(tree, roles, hideBalance)}
      </p>
      <div className="tree-live" aria-live="polite">
        {liveText}
      </div>
    </div>
  )
}
