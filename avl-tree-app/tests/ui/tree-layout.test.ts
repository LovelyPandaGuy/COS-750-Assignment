import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { build, inOrder } from '../engine/helpers';
import { avlInsert } from '../../src/engine/avl';
import type { Key, Tree } from '../../src/engine/tree';
import { layoutTree, NODE_DIAMETER } from '../../src/ui/tree/layout';

// Spec: add-tree-view / tree-view, "Layout without overlap" (FR-VIS-01).
// Properties only, so the spike S1 constants can change without changing these tests.

const keysArb = fc.uniqueArray(fc.integer({ min: 1, max: 99 }), { minLength: 0, maxLength: 15 });
const avl = (keys: Key[]): Tree => keys.reduce<Tree>((t, k) => avlInsert(t, k).tree, null);
const perfect15 = avl([8, 4, 12, 2, 6, 10, 14, 1, 3, 5, 7, 9, 11, 13, 15]);
const asc = Array.from({ length: 15 }, (_, i) => i + 1);
const zigzag = [8, 1, 7, 2, 6, 3, 5, 4].concat([9, 15, 10, 14, 11, 13, 12]).slice(0, 15);

const shapes: [string, Tree][] = [
  ['perfect 15', perfect15],
  ['right chain', build(asc)],
  ['left chain', build([...asc].reverse())],
  ['zig-zag', build(zigzag)],
  ['single node', build([5])],
];

function dist(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

describe('FR-VIS-01 layoutTree', () => {
  it('puts keys left to right in ascending order with distinct x', () => {
    fc.assert(
      fc.property(keysArb, (keys) => {
        const tree = build(keys);
        const { nodes } = layoutTree(tree);
        const byX = [...nodes].sort((a, b) => a.x - b.x);
        expect(byX.map((n) => n.key)).toEqual(inOrder(tree));
        expect(new Set(nodes.map((n) => n.x)).size).toBe(nodes.length);
      }),
    );
  });

  it('puts each child below its parent, left child left and right child right', () => {
    fc.assert(
      fc.property(keysArb, (keys) => {
        const { nodes } = layoutTree(build(keys));
        const at = new Map(nodes.map((n) => [n.key, n]));
        for (const n of nodes) {
          if (n.parentKey === null) {
            expect(n.side).toBeNull();
            continue;
          }
          const p = at.get(n.parentKey)!;
          expect(n.y).toBeGreaterThan(p.y);
          if (n.side === 'left') expect(n.x).toBeLessThan(p.x);
          else expect(n.x).toBeGreaterThan(p.x);
        }
      }),
    );
  });

  it.each(shapes)('has no overlapping nodes: %s', (_name, tree) => {
    const { nodes } = layoutTree(tree);
    for (let i = 0; i < nodes.length; i++)
      for (let j = i + 1; j < nodes.length; j++) expect(dist(nodes[i], nodes[j])).toBeGreaterThanOrEqual(NODE_DIAMETER);
  });

  it('has no overlapping nodes in random BST and AVL trees', () => {
    fc.assert(
      fc.property(keysArb, (keys) => {
        for (const tree of [build(keys), avl(keys)]) {
          const { nodes } = layoutTree(tree);
          for (let i = 0; i < nodes.length; i++)
            for (let j = i + 1; j < nodes.length; j++) expect(dist(nodes[i], nodes[j])).toBeGreaterThanOrEqual(NODE_DIAMETER);
        }
      }),
    );
  });

  it('keeps every node inside the reported size', () => {
    fc.assert(
      fc.property(keysArb, (keys) => {
        const { nodes, width, height } = layoutTree(build(keys));
        for (const n of nodes) {
          expect(n.x - NODE_DIAMETER / 2).toBeGreaterThanOrEqual(0);
          expect(n.y - NODE_DIAMETER / 2).toBeGreaterThanOrEqual(0);
          expect(n.x + NODE_DIAMETER / 2).toBeLessThanOrEqual(width);
          expect(n.y + NODE_DIAMETER / 2).toBeLessThanOrEqual(height);
        }
      }),
    );
  });

  it('is pure: the same tree gives equal results', () => {
    fc.assert(
      fc.property(keysArb, (keys) => {
        const tree = build(keys);
        expect(layoutTree(tree)).toEqual(layoutTree(tree));
      }),
    );
  });

  it('gives the empty tree no nodes and zero size', () => {
    expect(layoutTree(null)).toEqual({ nodes: [], width: 0, height: 0 });
  });
});
