// Trees compared by keys and shape only; stored heights never matter (FR-ASM-04).
import type { Tree } from '../engine/tree'

/** A string that is equal for two trees exactly when they have the same keys in the same shape. */
export function shapeKey(tree: Tree): string {
  return tree === null ? '.' : `(${tree.key} ${shapeKey(tree.left)} ${shapeKey(tree.right)})`
}

export function sameShape(a: Tree, b: Tree): boolean {
  return shapeKey(a) === shapeKey(b)
}

export function isTreeValue(v: unknown): v is Tree {
  return v === null || (typeof v === 'object' && 'key' in (v as object))
}
