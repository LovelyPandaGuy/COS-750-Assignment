import { replayCopy } from '../../content/replay'
import type { Explanation, Operation } from '../../replay/replay'
import { signed } from '../tree/describe'

const s = replayCopy.sentence

/** Words for one explanation (FR-VIS-07). The numbers come from `explainAt`, the wording from content. */
export function sentenceFor(op: Operation, e: Explanation): string {
  const k = op.key
  const key = e.key ?? k
  const dir = e.direction ?? 'left'
  const bf = signed(e.balanceFactor ?? 0)
  switch (e.tag) {
    case 'start':
      return op.kind === 'insert' ? s.startInsert(k) : s.startSearch(k)
    case 'compare':
      return e.direction === undefined ? s.compareEqual(k, key) : s.compare(k, key, dir)
    case 'descend':
      return s.descend(key, e.other!, dir)
    case 'descend-none':
      return op.kind === 'insert' ? s.descendNoneInsert(k, key, dir) : s.descendNoneSearch(key, dir)
    case 'found':
      return s.found(k)
    case 'duplicate':
      return s.duplicate(k)
    case 'not-found':
      return s.notFound(k)
    case 'insert':
      return s.insert(key)
    case 'height':
      return s.height(key, e.height!, bf)
    case 'imbalance':
      return s.imbalance(key, bf, e.other!, e.rebalanceCase!)
    case 'rotation':
      return s.rotation(key, e.other!, dir, e.rebalanceCase!)
  }
}
