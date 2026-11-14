import type { Key, Tree } from '../../engine/tree'

// Geometry in SVG user units. In-order layout, the outcome of spike S1 (D17, revamp-tree-view):
// a rotation keeps the in-order sequence, so under this layout it moves nodes only up or down.
/** A node is as wide as a 44 px touch target. */
export const NODE_DIAMETER = 44
/** Horizontal distance between neighbouring in-order slots. */
export const SLOT_WIDTH = 56
/** Vertical distance between levels; leaves room for the lines under a node. */
export const LEVEL_HEIGHT = 96
/** Room outside the outermost nodes for text under or above them. */
const MARGIN_X = 32
const MARGIN_TOP = 24
const MARGIN_BOTTOM = 44

export interface LayoutNode {
  key: Key
  /** Centre of the node. */
  x: number
  y: number
  depth: number
  parentKey: Key | null
  side: 'left' | 'right' | null
}

export interface Layout {
  nodes: LayoutNode[]
  width: number
  height: number
}

export interface LayoutOptions {
  /**
   * Slot keys: a superset of the tree's keys. x follows each key's in-order index among them,
   * so a key keeps its x when other slot keys are absent (stable slots across steps).
   */
  slots?: readonly Key[]
}

/** An empty child position, for overlays such as "place key here" (change A3). */
export interface EmptySlot {
  parentKey: Key
  side: 'left' | 'right'
  x: number
  y: number
}

const slotX = (index: number) => MARGIN_X + NODE_DIAMETER / 2 + index * SLOT_WIDTH
const widthFor = (count: number) => 2 * MARGIN_X + NODE_DIAMETER + (count - 1) * SLOT_WIDTH

/**
 * Position every node: x by in-order index (among the slot keys when given), y by depth.
 * Keys therefore run left to right in order, each parent lies between its children, and no two
 * nodes can be closer than SLOT_WIDTH in x or LEVEL_HEIGHT in y (FR-VIS-01). Pure.
 */
export function layoutTree(tree: Tree, options?: LayoutOptions): Layout {
  const nodes: LayoutNode[] = []
  // Empty tree: no nodes and a size of zero (the lengths are zero).
  if (tree === null) return { nodes, width: nodes.length, height: nodes.length }
  const slotIndex = options?.slots ? new Map([...options.slots].sort((a, b) => a - b).map((k, i) => [k, i])) : null
  let index = 0
  let maxDepth = 0
  const visit = (node: Tree, depth: number, parentKey: Key | null, side: 'left' | 'right' | null): void => {
    if (node === null) return
    visit(node.left, depth + 1, node.key, 'left')
    nodes.push({
      key: node.key,
      x: slotX(slotIndex?.get(node.key) ?? index),
      y: MARGIN_TOP + NODE_DIAMETER / 2 + depth * LEVEL_HEIGHT,
      depth,
      parentKey,
      side,
    })
    index += 1
    maxDepth = Math.max(maxDepth, depth)
    visit(node.right, depth + 1, node.key, 'right')
  }
  visit(tree, 0, null, null)
  const count = slotIndex ? Math.max(slotIndex.size, index) : index
  return {
    nodes,
    width: widthFor(count),
    height: MARGIN_TOP + NODE_DIAMETER + maxDepth * LEVEL_HEIGHT + MARGIN_BOTTOM,
  }
}

/**
 * The empty child positions of every node, half a slot to the side and one level down. Half a slot
 * cannot meet another node: no key lies between a node and its in-order neighbour on that side.
 */
export function emptySlots(layout: Layout): EmptySlot[] {
  const taken = new Set(layout.nodes.filter((n) => n.parentKey !== null).map((n) => `${n.parentKey}:${n.side}`))
  const out: EmptySlot[] = []
  for (const n of layout.nodes) {
    for (const side of ['left', 'right'] as const) {
      if (taken.has(`${n.key}:${side}`)) continue
      out.push({ parentKey: n.key, side, x: side === 'left' ? n.x - SLOT_WIDTH / 2 : n.x + SLOT_WIDTH / 2, y: n.y + LEVEL_HEIGHT })
    }
  }
  return out
}
