import { useId, useRef, useState, type KeyboardEvent } from 'react'
import './tree-view.css'
import { treeViewCopy as copy } from '../../content/treeView'
import type { Key, Tree } from '../../engine/tree'
import { describeTree, describeTreeParts, nodeName, signed, type NodeRole, type Roles } from './describe'
import { NODE_DIAMETER, layoutTree } from './layout'

export type { NodeRole }

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

export function TreeView({ tree, roles = NO_ROLES, interactive = false, selectedKey = null, onSelect, label }: TreeViewProps) {
  const descId = useId()
  const [open, setOpen] = useState(false)
  const [focusKey, setFocusKey] = useState<Key | null>(null)
  const items = useRef(new Map<Key, SVGGElement>())

  const layout = layoutTree(tree)
  const parts = describeTreeParts(tree, roles)
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
            const role = part.role ?? 'neutral'
            const selected = interactive && n.key === selectedKey
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
                <circle className="tree-node-fill" r={R - 2} />
                <circle className="tree-ring" r={R - 2} />
                {role === 'z' && <circle className="tree-ring-inner" r={R - 6} />}
                {selected && (
                  <rect className="tree-selected-frame" x={-R - 5} y={-R - 5} width={NODE_DIAMETER + 10} height={NODE_DIAMETER + 10} rx={8} />
                )}
                <text className="tree-key">{n.key}</text>
                <text className="tree-metrics" y={R + 16}>
                  {copy.metrics(part.height, signed(part.balanceFactor))}
                </text>
                {part.unbalanced && (
                  <text className="tree-flag" y={R + 34}>
                    {copy.unbalancedFlag}
                  </text>
                )}
                {(role === 'new' || role === 'z' || role === 'y') && (
                  <text className="tree-tag" y={-R - 8}>
                    {copy.roleTag[role]}
                  </text>
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
        </svg>
      </div>
      <button type="button" className="tree-describe-button" aria-expanded={open} aria-controls={descId} onClick={() => setOpen((o) => !o)}>
        {copy.describeButton}
      </button>
      <p id={descId} className="tree-description" hidden={!open}>
        {describeTree(tree, roles)}
      </p>
      <div className="tree-live" aria-live="polite">
        {interactive && selectedKey !== null ? copy.selected(selectedKey) : ''}
      </div>
    </div>
  )
}
