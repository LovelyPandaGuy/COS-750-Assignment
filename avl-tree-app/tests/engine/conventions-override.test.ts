import { describe, it, expect, vi } from 'vitest'

vi.mock('../../src/engine/conventions', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../src/engine/conventions')>()
  return { ...actual, EMPTY_HEIGHT: 0, LEAF_HEIGHT: 1 }
})

import { height, makeNode } from '../../src/engine/tree'

describe('FR-ENG-10: changing the constant changes the results', () => {
  it('empty-tree and leaf heights follow the overridden constants', () => {
    expect(height(null)).toBe(0)
    expect(makeNode(1, null, null).height).toBe(1)
  })
})
