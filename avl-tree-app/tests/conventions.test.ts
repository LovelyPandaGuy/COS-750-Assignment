import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { EMPTY_HEIGHT, LEAF_HEIGHT, balanceFactor, nodeHeight } from '../src/engine/conventions';

describe('conventions (D2, FR-ENG-03)', () => {
  it('leaf has height 0 and empty tree -1', () => {
    expect(LEAF_HEIGHT).toBe(0);
    expect(EMPTY_HEIGHT).toBe(-1);
    expect(nodeHeight(EMPTY_HEIGHT, EMPTY_HEIGHT)).toBe(LEAF_HEIGHT);
  });

  it('a node with only a leaf as left child has balance factor +1', () => {
    expect(balanceFactor(0, EMPTY_HEIGHT)).toBe(1);
  });

  it('left subtree of height 1 and empty right gives +2', () => {
    expect(balanceFactor(1, EMPTY_HEIGHT)).toBe(2);
  });

  it('balance factor flips sign when sides swap', () => {
    fc.assert(
      fc.property(fc.integer({ min: -1, max: 40 }), fc.integer({ min: -1, max: 40 }), (l, r) => {
        expect(balanceFactor(l, r) + balanceFactor(r, l)).toBe(0);
      }),
    );
  });
});
