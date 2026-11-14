import type { Key, Tree } from '../../engine/tree'
import type { FormatKey } from '../../engine/shape'
import { buildTree } from '../../live/build'
import type { RawTree, ShowItem } from '../../live/types'
import { TreeView, type NodeRole } from '../tree/TreeView'

export interface LessonTreeProps {
  raw: RawTree
  show?: readonly ShowItem[]
  /** Accessible name; defaults to "Tree: <screen title>". */
  label: string
  highlightKey?: Key | null
}

/** A read-only drawing of a content tree, built by the engine from its insertion sequence (ID 12.2). */
export function LessonTree({ raw, show, label, highlightKey }: LessonTreeProps) {
  const { tree, formatKey } = buildTree(raw)
  return <DrawnTree tree={tree} formatKey={formatKey} show={show} label={label} highlightKey={highlightKey} />
}

export function DrawnTree(props: { tree: Tree; formatKey: FormatKey; show?: readonly ShowItem[]; label: string; roles?: Partial<Record<Key, NodeRole>>; highlightKey?: Key | null }) {
  return <TreeView tree={props.tree} formatKey={props.formatKey} show={props.show} label={props.label} roles={props.roles} highlightKey={props.highlightKey} />
}
