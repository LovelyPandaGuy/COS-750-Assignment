import type { Key, Tree } from '../../engine/tree'

// Geometry in SVG user units. Assumed from FR-VIS-01 (spike S1 not run), see decision D17.
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

/**
 * Position every node: x by in-order index, y by depth. Keys therefore run left
 * to right in order, and no two nodes can be closer than SLOT_WIDTH in x or
 * LEVEL_HEIGHT in y (FR-VIS-01). Pure: depends only on the tree.
 */
export function layoutTree(tree: Tree): Layout {
  const nodes: LayoutNode[] = []
  // Empty tree: no nodes and a size of zero (the lengths are zero).
  if (tree === null) return { nodes, width: nodes.length, height: nodes.length }
  let index = 0
  let maxDepth = 0
  const visit = (node: Tree, depth: number, parentKey: Key | null, side: 'left' | 'right' | null): void => {
    if (node === null) return
    visit(node.left, depth + 1, node.key, 'left')
    nodes.push({
      key: node.key,
      x: MARGIN_X + NODE_DIAMETER / 2 + index * SLOT_WIDTH,
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
  return {
    nodes,
    width: 2 * MARGIN_X + NODE_DIAMETER + (index - 1) * SLOT_WIDTH,
    height: MARGIN_TOP + NODE_DIAMETER + maxDepth * LEVEL_HEIGHT + MARGIN_BOTTOM,
  }
}
