import { isOutOfBalance } from '../../engine/conventions'
import { balanceFactorOf, type Key, type Tree } from '../../engine/tree'
import { treeViewCopy as copy } from '../../content/treeView'

export type NodeRole = 'new' | 'z' | 'y' | 'balanced'
export type Roles = Readonly<Partial<Record<Key, NodeRole>>>

export interface NodePart {
  key: Key
  parentKey: Key | null
  side: 'left' | 'right' | null
  height: number
  balanceFactor: number
  unbalanced: boolean
  role: NodeRole | null
  /** Balance factor and Unbalanced flag hidden (practice, hidden-balance mode). */
  hidden: boolean
}

/** Hidden-balance mode: every node's balance factor is hidden except the revealed keys. */
export interface HideBalance {
  reveal?: readonly Key[]
}

/** Balance factor as shown: +2, 0, −1. */
export function signed(n: number): string {
  return n > 0 ? `+${n}` : n < 0 ? `−${-n}` : '0'
}

/**
 * One part per node in pre-order. Height is the stored height and the balance
 * factor comes from the children's stored heights, so a trace snapshot is
 * described as it is drawn (FR-VIS-09).
 */
export function describeTreeParts(tree: Tree, roles: Roles, hide?: HideBalance): NodePart[] {
  const parts: NodePart[] = []
  const visit = (node: Tree, parentKey: Key | null, side: 'left' | 'right' | null): void => {
    if (node === null) return
    const bf = balanceFactorOf(node)
    parts.push({
      key: node.key,
      parentKey,
      side,
      height: node.height,
      balanceFactor: bf,
      unbalanced: isOutOfBalance(bf),
      role: roles[node.key] ?? null,
      hidden: hide !== undefined && !(hide.reveal ?? []).includes(node.key),
    })
    visit(node.left, node.key, 'left')
    visit(node.right, node.key, 'right')
  }
  visit(tree, null, null)
  return parts
}

/** Words that follow the numbers: the unbalanced word, then the role. */
export function extrasOf(part: NodePart): string[] {
  const extras: string[] = []
  if (part.unbalanced && !part.hidden) extras.push(copy.unbalancedWord)
  if (part.role === 'balanced') extras.push(copy.balancedWord)
  else if (part.role !== null) extras.push(copy.roleTag[part.role])
  return extras
}

export function nodeName(part: NodePart): string {
  return part.hidden
    ? copy.nodeNameHidden(part.key, part.height, extrasOf(part))
    : copy.nodeName(part.key, part.height, signed(part.balanceFactor), extrasOf(part))
}

/** The whole tree in words, one sentence per node (FR-VIS-07). */
export function describeTree(tree: Tree, roles: Roles, hide?: HideBalance): string {
  const parts = describeTreeParts(tree, roles, hide)
  if (parts.length === 0) return copy.emptyTree
  return parts
    .map((p) => {
      const details = p.hidden
        ? copy.detailsHidden(p.height, extrasOf(p))
        : copy.details(p.height, signed(p.balanceFactor), extrasOf(p))
      return p.parentKey === null || p.side === null
        ? copy.rootSentence(p.key, details)
        : copy.childSentence(copy.sideWord[p.side], p.key, p.parentKey, details)
    })
    .join(' ')
}
