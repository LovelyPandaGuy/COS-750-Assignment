// The kind registry (add-question-model-and-bank, design decision 2).
import type { Kind, KindName } from '../types'
import { deleteRebalances, deleteRoot } from './delete'
import { insertFinalTree, lowestUnbalanced, rebalanceCase, rotationResult, rotationsNeeded } from './rotations'
import { insertParent, isBst, treeTerms } from './prerequisites'
import { buildAvl, searchBuilt, worstSearch } from './readiness'
import { scenarioChoice } from './scenario'
import { balanceFactorKind, bstHeight, isAvl, nodeHeight, searchVisits, sortedSearch } from './trees'

export { DELETE_FALLBACK, DELETE_ONE_FALLBACK, DELETE_ROOT_FALLBACK } from './delete'
export { DEEP_FALLBACK } from './rotations'
export { BUILD_FALLBACK } from './readiness'

export const KINDS: Record<KindName, Kind> = {
  'bst-height': bstHeight,
  'sorted-search': sortedSearch,
  'node-height': nodeHeight,
  'balance-factor': balanceFactorKind,
  'is-avl': isAvl,
  'search-visits': searchVisits,
  'rotation-result': rotationResult,
  'rotations-needed': rotationsNeeded,
  'lowest-unbalanced': lowestUnbalanced,
  'rebalance-case': rebalanceCase,
  'insert-final-tree': insertFinalTree,
  'delete-rebalances': deleteRebalances,
  'delete-root': deleteRoot,
  'scenario-choice': scenarioChoice,
  'tree-terms': treeTerms,
  'is-bst': isBst,
  'insert-parent': insertParent,
  'worst-search': worstSearch,
  'build-avl': buildAvl,
  'search-built': searchBuilt,
}
