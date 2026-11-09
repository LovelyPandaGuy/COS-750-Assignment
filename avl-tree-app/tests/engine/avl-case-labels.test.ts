import { describe, it, expect, vi } from 'vitest'

vi.mock('../../src/engine/conventions', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../src/engine/conventions')>()
  return { ...actual, REBALANCE_CASES: ['left-left', 'right-right', 'left-right', 'right-left'] }
})

import { insertAvl } from '../../src/engine/avl'
import type { Key, Tree } from '../../src/engine/tree'

function lastTrace(keys: Key[]) {
  let tree: Tree = null
  let trace: ReturnType<typeof insertAvl>['trace'] = []
  for (const k of keys) ({ tree, trace } = insertAvl(tree, k))
  return trace
}

describe('FR-ENG-04 / FR-ENG-10: case labels come from the conventions module', () => {
  it.each([
    [[3, 2, 1], 'left-left'],
    [[1, 2, 3], 'right-right'],
    [[3, 1, 2], 'left-right'],
    [[1, 3, 2], 'right-left'],
  ])('%j is labelled %s on imbalance and rotation steps', (keys, label) => {
    const labelled = lastTrace(keys).filter((s) => s.kind === 'imbalance' || s.kind === 'rotation')
    expect(labelled.length).toBeGreaterThan(0)
    for (const s of labelled) expect(s.rebalanceCase).toBe(label)
  })
})
