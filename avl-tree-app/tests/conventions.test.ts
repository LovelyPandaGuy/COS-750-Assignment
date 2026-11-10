import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { EMPTY_HEIGHT, LEAF_HEIGHT, balanceFactor, isOutOfBalance, nodeHeight } from '../src/engine/conventions';
import { analyseTree } from '../src/engine/analyse';
import { build } from './engine/helpers';
import { balanceFactorOf, type Tree } from '../src/engine/tree';

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

describe('isOutOfBalance (D2, FR-ENG-10)', () => {
  it('is true only below -1 or above +1', () => {
    expect([-2, -1, 0, 1, 2].map(isOutOfBalance)).toEqual([true, false, false, false, true]);
  });

  it('flags exactly the nodes analyseTree reports', () => {
    const nodesWithBf = (t: Tree, out: number[] = []): number[] => {
      if (t === null) return out;
      if (isOutOfBalance(balanceFactorOf(t))) out.push(t.key);
      nodesWithBf(t.left, out);
      nodesWithBf(t.right, out);
      return out;
    };
    fc.assert(
      fc.property(fc.uniqueArray(fc.integer({ min: 1, max: 99 }), { maxLength: 15 }), (keys) => {
        const tree = build(keys);
        const expected = analyseTree(tree).balanceViolations.map((v) => v.key).sort((a, b) => a - b);
        expect(nodesWithBf(tree).sort((a, b) => a - b)).toEqual(expected);
      }),
    );
  });
});
