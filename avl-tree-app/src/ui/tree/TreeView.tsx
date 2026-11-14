import { useId, useRef, useState, type KeyboardEvent } from 'react'
import './tree-view.css'
import { treeViewCopy as copy } from '../../content/treeView'
import type { FormatKey } from '../../engine/shape'
import type { Key, Tree } from '../../engine/tree'
import { DEFAULT_SHOW, describeTree, describeTreeParts, nodeName, signed, type HideBalance, type NodeRole, type Roles, type ShowItem } from './describe'
import { NODE_DIAMETER, layoutTree } from './layout'

export type { NodeRole }

export type { ShowItem }

/** The ID 11.1 node states; neutral when the balance factor is not shown. */
export type NodeState = 'balanced' | 'out-of-balance' | 'rotating' | 'new' | 'neutral'

export interface TreeViewProps {
  tree: Tree
  /** Roles by key (new, rotating, n). Balanced and unbalanced come from the balance factor. */
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
  /** What each node shows (default: its balance factor). */
  show?: readonly ShowItem[]
  /** How keys are written (letters for a letter tree). */
  formatKey?: FormatKey
  /** A node to frame in a read-only drawing (the node a worked-example step is about). */
  highlightKey?: Key | null
  /** Several selected nodes (questions that ask for many or none); framed and announced as selected. */
  selectedKeys?: readonly Key[]
}

const R = NODE_DIAMETER / 2
/** Ring style per state: the non-colour backup of ID 11.1 (unbalanced: thick dashed; being rotated: bold). */
const RING: Record<NodeState, 'solid' | 'dashed' | 'thick'> = {
  neutral: 'solid',
  balanced: 'solid',
  new: 'solid',
  'out-of-balance': 'dashed',
  rotating: 'thick',
}
const NO_ROLES: Roles = {}
/** Roving tabindex: only one node is a tab stop. */
const OFF_TAB_STOP = -1

export function TreeView({ tree, roles = NO_ROLES, interactive = false, selectedKey = null, onSelect, label, hideBalance, show = DEFAULT_SHOW, formatKey = String, highlightKey = null, selectedKeys }: TreeViewProps) {
  const descId = useId()
  const [open, setOpen] = useState(false)
  const [focusKey, setFocusKey] = useState<Key | null>(null)
  const items = useRef(new Map<Key, SVGGElement>())

  const layout = layoutTree(tree)
  const showHeight = show.includes('height')
  // A balance factor the screen does not show is hidden in the drawing and the description alike,
  // so neither colour nor words give it away (tree-view "Node values follow the screen's show list").
  const hide: HideBalance | undefined =
    hideBalance ?? (show.includes('balanceFactor') ? undefined : { reveal: show.includes('balanceFactor:root') && tree !== null ? [tree.key] : [] })
  const parts = describeTreeParts(tree, roles, hide, formatKey)
  const partOf = new Map(parts.map((p) => [p.key, p]))
  const at = new Map(layout.nodes.map((n) => [n.key, n]))
  const rootKey = tree?.key ?? null
  const tabKey = [focusKey, selectedKey, rootKey].find((k) => k !== null && at.has(k)) ?? rootKey

  const childOf = (key: Key, side: 'left' | 'right') =>
    layout.nodes.find((n) => n.parentKey === key && n.side === side)?.key ?? null

  const select = (key: Key) => {
    setFocusKey(key)
    onSelect?.(key)
  }
  const moveTo = (key: Key | null) => {
    if (key === null) return
    setFocusKey(key)
    items.current.get(key)?.focus()
  }
  const onKeyDown = (key: Key) => (e: KeyboardEvent<SVGGElement>) => {
    const target =
      e.key === 'ArrowUp' ? at.get(key)?.parentKey ?? null
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
              const p = n.parentKey === null ? undefined : at.get(n.parentKey)
              return p && <line key={n.key} className="tree-edge" x1={p.x} y1={p.y} x2={n.x} y2={n.y} />
            })}
          </g>
          {layout.nodes.map((n) => {
            const part = partOf.get(n.key)!
            const role = part.role
            const state: NodeState = part.hidden ? 'neutral' : role === 'new' ? 'new' : role === 'rotating' ? 'rotating' : part.unbalanced ? 'out-of-balance' : 'balanced'
            const tag = role === null ? undefined : copy.roleTag[role]
            const selected = (interactive && (n.key === selectedKey || (selectedKeys?.includes(n.key) ?? false))) || n.key === highlightKey
            return (
              <g
                key={n.key}
                ref={(el) => {
                  if (el) items.current.set(n.key, el)
                  else items.current.delete(n.key)
                }}
                data-key={n.key}
                data-role={role ?? 'none'}
                data-state={state}
                data-ring={RING[state]}
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
                <circle className="tree-node-fill" r={R - 2} />
                <circle className="tree-ring" r={R - 2} />
                {selected && (
                  <rect className="tree-selected-frame" x={-R - 5} y={-R - 5} width={NODE_DIAMETER + 10} height={NODE_DIAMETER + 10} rx={8} />
                )}
                <text className="tree-key">{part.label}</text>
                <text className="tree-metrics" y={R + 16}>
                  {part.hidden
                    ? hideBalance !== undefined
                      ? copy.metricsHidden(part.height)
                      : copy.metrics(showHeight ? part.height : null, null)
                    : copy.metrics(showHeight ? part.height : null, signed(part.balanceFactor))}
                </text>
                {part.unbalanced && !part.hidden && (
                  <>
                    <text className="tree-marker" x={R - 2} y={-R + 6} aria-hidden="true">
                      {copy.unbalancedMarker}
                    </text>
                    <text className="tree-flag" y={R + 34}>
                      {copy.unbalancedFlag}
                    </text>
                  </>
                )}
                {tag !== undefined && (
                  <text className="tree-tag" y={-R - 8}>
                    {tag}
                  </text>
                )}
              </g>
            )
          })}
        </svg>
      </div>
      <button type="button" className="tree-describe-button" aria-expanded={open} aria-controls={descId} onClick={() => setOpen((o) => !o)}>
        {copy.describeButton}
      </button>
      <p id={descId} className="tree-description" hidden={!open}>
        {describeTree(tree, roles, hide, formatKey)}
      </p>
      <div className="tree-live" aria-live="polite">
        {interactive && selectedKey !== null ? copy.selected(formatKey(selectedKey)) : ''}
      </div>
    </div>
  )
}
