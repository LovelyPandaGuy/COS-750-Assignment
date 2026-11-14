import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { build, inOrder } from '../engine/helpers';
import { avlDelete, avlInsert } from '../../src/engine/avl';
import { rotateLeft, rotateRight } from '../../src/engine/rotations';
import { replaceAt, type Key, type Tree } from '../../src/engine/tree';
import { emptySlots, layoutTree, NODE_DIAMETER } from '../../src/ui/tree/layout';

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

// Spec: revamp-tree-view / tree-view "Layout without overlap" (modified). FR-VIS-01, D17.
const xOf = (layout: ReturnType<typeof layoutTree>) => new Map(layout.nodes.map((n) => [n.key, n.x]));
const keysOf = (t: Tree): Key[] => inOrder(t);
const withChild = (t: Tree, side: 'left' | 'right'): Key[] => {
  const out: Key[] = [];
  const go = (n: Tree) => {
    if (n === null) return;
    if (n[side] !== null) out.push(n.key);
    go(n.left);
    go(n.right);
  };
  go(t);
  return out;
};
const sortedUnion = (a: Key[], b: Key[]) => [...new Set([...a, ...b])].sort((x, y) => x - y);
const expectSound = (layout: ReturnType<typeof layoutTree>, tree: Tree) => {
  const byX = [...layout.nodes].sort((a, b) => a.x - b.x);
  expect(byX.map((n) => n.key)).toEqual(inOrder(tree));
  for (let i = 0; i < layout.nodes.length; i++)
    for (let j = i + 1; j < layout.nodes.length; j++)
      expect(dist(layout.nodes[i], layout.nodes[j])).toBeGreaterThanOrEqual(NODE_DIAMETER);
  for (const n of layout.nodes) expect(n.x + NODE_DIAMETER / 2).toBeLessThanOrEqual(layout.width);
};

describe('FR-VIS-01 D17 layout invariants (revamp-tree-view)', () => {
  it('puts every parent strictly between its children and the root on top', () => {
    fc.assert(
      fc.property(keysArb, (keys) => {
        for (const tree of [build(keys), avl(keys)]) {
          const { nodes } = layoutTree(tree);
          if (nodes.length === 0) continue;
          const minY = Math.min(...nodes.map((n) => n.y));
          for (const n of nodes) {
            const kids = nodes.filter((c) => c.parentKey === n.key);
            const left = kids.find((c) => c.side === 'left');
            const right = kids.find((c) => c.side === 'right');
            if (left && right) {
              expect(n.x).toBeGreaterThan(left.x);
              expect(n.x).toBeLessThan(right.x);
            }
            if (n.parentKey === null) expect(n.y).toBe(minY);
            else expect(n.y).toBeGreaterThan(minY);
          }
        }
      }),
    );
  });

  it('moves nodes only vertically in a single rotation (in-order is kept)', () => {
    fc.assert(
      fc.property(keysArb.filter((k) => k.length >= 2), fc.boolean(), fc.nat(), (keys, left, pick) => {
        for (const tree of [build(keys), avl(keys)]) {
          const side = left ? 'right' : 'left'; // rotate left needs a right child
          const candidates = withChild(tree, side);
          if (candidates.length === 0) continue;
          const at = candidates[pick % candidates.length];
          const rotated = replaceAt(tree, at, left ? rotateLeft : rotateRight);
          expect(xOf(layoutTree(rotated))).toEqual(xOf(layoutTree(tree)));
        }
      }),
    );
  });

  it('keeps every shared key at the same x across an insert or delete when given slot keys', () => {
    fc.assert(
      fc.property(
        fc.uniqueArray(fc.integer({ min: 1, max: 99 }), { minLength: 1, maxLength: 14 }),
        fc.integer({ min: 1, max: 99 }),
        (keys, extra) => {
          const before = avl(keys);
          const after = keys.includes(extra) ? avlDelete(before, extra).tree : avlInsert(before, extra).tree;
          const slots = sortedUnion(keysOf(before), keysOf(after));
          const a = layoutTree(before, { slots });
          const b = layoutTree(after, { slots });
          expectSound(a, before);
          expectSound(b, after);
          const ax = xOf(a);
          const bx = xOf(b);
          for (const k of keysOf(before)) if (bx.has(k)) expect(bx.get(k)).toBe(ax.get(k));
          // Same drawing width while both trees are drawn (an empty tree draws no SVG; its size is 0).
          if (after !== null) expect(a.width).toBe(b.width);
        },
      ),
    );
  });

  it('is unchanged by default and by slot keys equal to the tree keys', () => {
    fc.assert(
      fc.property(keysArb, (keys) => {
        const tree = avl(keys);
        expect(layoutTree(tree, { slots: keysOf(tree) })).toEqual(layoutTree(tree));
      }),
    );
  });

  it('lists the empty child slots of every node (overlay extension point)', () => {
    const three = avl([20, 10, 30]);
    const slots = emptySlots(layoutTree(three));
    expect(slots).toHaveLength(4);
    expect(slots.map((s) => `${s.parentKey}${s.side}`).sort()).toEqual(['10left', '10right', '30left', '30right']);
    fc.assert(
      fc.property(keysArb, (keys) => {
        const tree = build(keys);
        // A binary tree with n nodes has n + 1 empty child positions.
        expect(emptySlots(layoutTree(tree))).toHaveLength(tree === null ? 0 : keys.length + 1);
      }),
    );
  });
});
