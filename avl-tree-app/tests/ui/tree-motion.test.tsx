import { act, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { avlDelete, avlInsert } from '../../src/engine/avl';
import { rotateRight } from '../../src/engine/rotations';
import { replaceAt, type Key, type Tree } from '../../src/engine/tree';
import { TreeView } from '../../src/ui/tree/TreeView';
import { describeTree } from '../../src/ui/tree/describe';
import { layoutTree } from '../../src/ui/tree/layout';
import { TREE_TRANSITION_MS } from '../../src/ui/tree/motion';

// Spec: revamp-tree-view / tree-view "Transitions between tree states", "Reduced motion snaps".
// NFR-03 ([OPEN] proposal question 10: confirm the SE ID), FR-VIS-01, D32.
// Positions are read from each node's transform="translate(x y)" and each edge's x1..y2 (edge: line.tree-edge[data-child]).

const T = TREE_TRANSITION_MS;
const FRAME = 16;
const avl = (keys: Key[]): Tree => keys.reduce<Tree>((t, k) => avlInsert(t, k).tree, null);

let reduced = false;
beforeEach(() => {
  reduced = false;
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date', 'performance', 'requestAnimationFrame', 'cancelAnimationFrame'] });
  vi.stubGlobal('matchMedia', (query: string) => ({
    get matches() {
      return query.includes('prefers-reduced-motion') && reduced;
    },
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }));
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

const advance = (ms: number) => act(() => vi.advanceTimersByTime(ms));
const pos = (c: HTMLElement, k: Key) => {
  const m = /translate\(([-\d.]+)[ ,]+([-\d.]+)\)/.exec(c.querySelector(`[data-key="${k}"]`)!.getAttribute('transform') ?? '')!;
  return { x: Number(m[1]), y: Number(m[2]) };
};
const final = (t: Tree, k: Key, slots?: Key[]) => {
  const n = layoutTree(t, slots ? { slots } : undefined).nodes.find((n) => n.key === k)!;
  return { x: n.x, y: n.y };
};
const strictlyBetween = (v: number, a: number, b: number) => v > Math.min(a, b) && v < Math.max(a, b);

// 40 / 20 60 / 10 30 ... then rotate right at 40: 20 becomes the root, 40 moves down, 10 moves up.
const before = avl([40, 20, 60, 10, 30]);
const rotated = replaceAt(before, 40, rotateRight);

describe('NFR-03 nodes slide between two tree states', () => {
  it('starts at the old positions, is between them halfway, and ends at the new ones', () => {
    const { container, rerender } = render(<TreeView tree={before} label="t" />);
    const old = Object.fromEntries([40, 20, 60, 10, 30].map((k) => [k, pos(container, k)]));
    rerender(<TreeView tree={rotated} label="t" />);
    for (const k of [40, 20, 10]) expect(pos(container, k), `t=0 key ${k}`).toEqual(old[k]);
    advance(T / 2);
    for (const k of [40, 20, 10]) {
      expect(strictlyBetween(pos(container, k).y, old[k].y, final(rotated, k).y), `t=T/2 key ${k}`).toBe(true);
      expect(pos(container, k).x).toBe(old[k].x); // a rotation is a vertical move (D17)
    }
    advance(T / 2 + 2 * FRAME);
    for (const k of [40, 20, 60, 10, 30]) expect(pos(container, k), `t=T key ${k}`).toEqual(final(rotated, k));
  });

  it('keeps every edge on the drawn centres of its parent and child at every sample', () => {
    const { container, rerender } = render(<TreeView tree={before} label="t" />);
    rerender(<TreeView tree={rotated} label="t" />);
    const parentOf = new Map(layoutTree(rotated).nodes.map((n) => [n.key, n.parentKey]));
    for (const step of [0, T / 4, T / 4, T / 4, T / 4 + 2 * FRAME]) {
      advance(step);
      const edges = [...container.querySelectorAll('line.tree-edge')];
      expect(edges.length).toBe(4);
      for (const e of edges) {
        const child = Number(e.getAttribute('data-child'));
        const p = pos(container, parentOf.get(child)!);
        const c = pos(container, child);
        expect([Number(e.getAttribute('x1')), Number(e.getAttribute('y1'))]).toEqual([p.x, p.y]);
        expect([Number(e.getAttribute('x2')), Number(e.getAttribute('y2'))]).toEqual([c.x, c.y]);
      }
    }
  });

  it('starts a new change from the positions drawn at that moment (no jump)', () => {
    const { container, rerender } = render(<TreeView tree={before} label="t" />);
    rerender(<TreeView tree={rotated} label="t" />);
    advance(T / 2);
    const mid = Object.fromEntries([40, 20, 10].map((k) => [k, pos(container, k)]));
    rerender(<TreeView tree={before} label="t" />);
    for (const k of [40, 20, 10]) expect(pos(container, k)).toEqual(mid[k]);
    advance(T + 2 * FRAME);
    for (const k of [40, 20, 10]) expect(pos(container, k)).toEqual(final(before, k));
  });
});

describe('NFR-03 FR-VIS-01 inserted and removed nodes', () => {
  const small = avl([40, 20, 60]);
  const grown = avlInsert(small, 50).tree; // 50 lands between 40 and 60
  const slots = [20, 40, 50, 60];

  it('with slot keys: the new node is final from time 0 and no other node changes x', () => {
    const { container, rerender } = render(<TreeView tree={small} slots={slots} label="t" />);
    const x0 = Object.fromEntries([20, 40, 60].map((k) => [k, pos(container, k).x]));
    rerender(<TreeView tree={grown} slots={slots} label="t" />);
    expect(pos(container, 50)).toEqual(final(grown, 50, slots));
    for (const step of [0, T / 2, T / 2 + 2 * FRAME]) {
      advance(step);
      for (const k of [20, 40, 60]) expect(pos(container, k).x).toBe(x0[k]);
    }
  });

  it('with slot keys: a removed node is gone at once and no other node changes x', () => {
    const { container, rerender } = render(<TreeView tree={grown} slots={slots} label="t" />);
    const x0 = Object.fromEntries([20, 40, 60].map((k) => [k, pos(container, k).x]));
    rerender(<TreeView tree={avlDelete(grown, 50).tree} slots={slots} label="t" />);
    expect(container.querySelector('[data-key="50"]')).toBeNull();
    for (const step of [0, T / 2, T / 2 + 2 * FRAME]) {
      advance(step);
      for (const k of [20, 40, 60]) expect(pos(container, k).x).toBe(x0[k]);
    }
  });

  it('without slot keys: a larger key slides smoothly, never jumping', () => {
    const { container, rerender } = render(<TreeView tree={small} label="t" />);
    const old60 = pos(container, 60);
    rerender(<TreeView tree={grown} label="t" />);
    expect(pos(container, 60)).toEqual(old60);
    advance(T / 2);
    expect(strictlyBetween(pos(container, 60).x, old60.x, final(grown, 60).x)).toBe(true);
    advance(T / 2 + 2 * FRAME);
    expect(pos(container, 60)).toEqual(final(grown, 60));
  });
});

describe('NFR-02 accessibility and focus follow the new tree at once', () => {
  function Harness({ tree }: { tree: Tree }) {
    const [sel, setSel] = useState<Key | null>(null);
    return <TreeView tree={tree} interactive selectedKey={sel} onSelect={setSel} label="t" />;
  }

  it('updates names, levels and the description before the transition ends', () => {
    const { container, rerender } = render(<Harness tree={before} />);
    rerender(<Harness tree={rotated} />);
    expect(screen.getByRole('treeitem', { name: /^Node 20\b/ })).toHaveAttribute('aria-level', '1');
    expect(screen.getByRole('treeitem', { name: /^Node 40\b/ })).toHaveAttribute('aria-level', '2');
    expect(container.querySelector('.tree-description')!.textContent).toBe(describeTree(rotated, {}));
  });

  it('keeps focus and the tab stop on a node that a rotation moves', () => {
    const { rerender } = render(<Harness tree={before} />);
    const n20 = screen.getByRole('treeitem', { name: /^Node 20\b/ });
    act(() => n20.focus());
    rerender(<Harness tree={rotated} />);
    expect(document.activeElement?.getAttribute('data-key')).toBe('20');
    expect(document.activeElement).toHaveAttribute('tabindex', '0');
  });
});

describe('NFR-03 D32 reduced motion snaps', () => {
  it('snaps with no animation frame when the user prefers reduced motion', () => {
    reduced = true;
    const raf = vi.spyOn(window, 'requestAnimationFrame');
    const { container, rerender } = render(<TreeView tree={before} label="t" />);
    rerender(<TreeView tree={rotated} label="t" />);
    for (const k of [40, 20, 60, 10, 30]) expect(pos(container, k)).toEqual(final(rotated, k));
    expect(raf).not.toHaveBeenCalled();
  });

  it('snaps when the screen passes a transition time of 0', () => {
    const { container, rerender } = render(<TreeView tree={before} transitionMs={0} label="t" />);
    rerender(<TreeView tree={rotated} transitionMs={0} label="t" />);
    for (const k of [40, 20, 60, 10, 30]) expect(pos(container, k)).toEqual(final(rotated, k));
  });

  it('snaps on the next change after the preference turns on', () => {
    const { container, rerender } = render(<TreeView tree={before} label="t" />);
    reduced = true;
    rerender(<TreeView tree={rotated} label="t" />);
    for (const k of [40, 20, 10]) expect(pos(container, k)).toEqual(final(rotated, k));
  });

  it('uses a positive default transition time held in one constant', () => {
    expect(T).toBeGreaterThan(0);
  });
});
