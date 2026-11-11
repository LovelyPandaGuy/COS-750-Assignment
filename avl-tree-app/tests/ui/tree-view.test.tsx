import { render, screen, fireEvent, within } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { readFileSync } from 'node:fs';
import { build } from '../engine/helpers';
import { avlInsert } from '../../src/engine/avl';
import { balanceFactorOf, makeNode, type Key, type Tree, type TreeNode } from '../../src/engine/tree';
import { TreeView, type NodeRole } from '../../src/ui/tree/TreeView';
import { describeTree, describeTreeParts } from '../../src/ui/tree/describe';
import { layoutTree } from '../../src/ui/tree/layout';

// Spec: add-tree-view / tree-view. Requirement IDs: FR-VIS-02, FR-VIS-07, FR-VIS-09, NFR-02.
// DOM contract (see design.md): each node is <g data-key data-role data-ring>, with .tree-metrics,
// .tree-tag, .tree-flag, .tree-badge; the live region is [aria-live=polite]; the scroll region is .tree-scroll.

const avl = (keys: Key[]): Tree => keys.reduce<Tree>((t, k) => avlInsert(t, k).tree, null);
const keysArb = fc.uniqueArray(fc.integer({ min: 1, max: 99 }), { minLength: 0, maxLength: 15 });
const node = (c: HTMLElement, k: Key) => c.querySelector<SVGGElement>(`[data-key="${k}"]`)!;
const sign = (n: number) => (n > 0 ? `+${n}` : n < 0 ? `\u2212${-n}` : '0');

function walk(t: Tree, f: (n: TreeNode) => void) {
  if (t === null) return;
  f(t);
  walk(t.left, f);
  walk(t.right, f);
}

const seven = avl([40, 20, 60, 10, 30, 50, 70]);
const chain3 = build([30, 20, 10]); // root 30 leans left by two

describe('FR-VIS-02 node roles by shape, text and colour', () => {
  const roles: Record<number, NodeRole> = { 40: 'new', 20: 'z', 60: 'y', 10: 'balanced' };

  it('gives each role a different ring style and a text name', () => {
    const { container } = render(<TreeView tree={seven} roles={roles} label="Example tree" />);
    const ring = (k: Key) => node(container, k).getAttribute('data-ring');
    // new 40, z 20, y 60, balanced 10, neutral 30
    expect(ring(30)).toBe('solid');
    expect(ring(40)).toBe('dotted');
    expect(ring(20)).toBe('double');
    expect(ring(60)).toBe('dashed');
    expect(ring(10)).toBe('thick');
    expect(new Set([30, 40, 20, 60, 10].map(ring)).size).toBe(5);
    expect(node(container, 30).getAttribute('data-role')).toBe('neutral');
    expect(node(container, 40).querySelector('.tree-tag')!.textContent).toBe('new');
    expect(node(container, 20).querySelector('.tree-tag')!.textContent).toBe('z');
    expect(node(container, 60).querySelector('.tree-tag')!.textContent).toBe('y');
    expect(node(container, 10).querySelector('.tree-badge')).not.toBeNull();
    expect(node(container, 10).textContent).toMatch(/balanced/);
    expect(node(container, 30).querySelector('.tree-tag')).toBeNull();
  });

  it('keeps shapes and positions the same when only roles change', () => {
    const a = render(<TreeView tree={seven} label="t" />).container;
    const b = render(<TreeView tree={seven} roles={roles} label="t" />).container;
    const pos = (c: HTMLElement) =>
      [...c.querySelectorAll('[data-key]')].map((g) => [g.getAttribute('data-key'), g.getAttribute('transform')]);
    expect(pos(a)).toEqual(pos(b));
  });

  it('has tag text colours with at least 4.5:1 against --bg-surface (light theme)', () => {
    const css = readFileSync('src/ui/tokens.css', 'utf8');
    const v = (n: string) => new RegExp(`--${n}:\\s*(#[0-9A-Fa-f]{6})`).exec(css)![1];
    const lum = (hex: string) => {
      const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    for (const name of ['tree-new', 'tree-z', 'tree-y', 'tree-balanced']) {
      const [x, y] = [lum(v(name)), lum(v('bg-surface'))];
      expect((Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05), name).toBeGreaterThanOrEqual(4.5);
    }
  });
});

describe('FR-VIS-09 height and balance factor on every node', () => {
  it('shows values equal to the engine for random BST and AVL trees', () => {
    fc.assert(
      fc.property(keysArb, (keys) => {
        for (const tree of [build(keys), avl(keys)]) {
          const { container, unmount } = render(<TreeView tree={tree} label="t" />);
          walk(tree, (n) => {
            const text = node(container, n.key).querySelector('.tree-metrics')!.textContent;
            expect(text).toBe(`h${n.height} \u00b7 bf ${sign(balanceFactorOf(n))}`);
          });
          unmount();
        }
      }),
      { numRuns: 30 },
    );
  });

  it('follows the D2 convention: a single node is h0, a three-node left chain has bf +2 at the root', () => {
    const one = render(<TreeView tree={makeNode(5, null, null)} label="t" />).container;
    expect(node(one, 5).querySelector('.tree-metrics')!.textContent).toBe('h0 \u00b7 bf 0');
    const three = render(<TreeView tree={chain3} label="t" />).container;
    expect(node(three, 30).querySelector('.tree-metrics')!.textContent).toBe('h2 \u00b7 bf +2');
  });

  it('flags an out-of-balance node with the text "Unbalanced" and nothing else', () => {
    const bad = render(<TreeView tree={chain3} label="t" />).container;
    expect([...bad.querySelectorAll('.tree-flag')].map((e) => e.textContent)).toEqual(['Unbalanced']);
    expect(node(bad, 30).querySelector('.tree-flag')).not.toBeNull();
    const ok = render(<TreeView tree={seven} label="t" />).container;
    expect(ok.querySelector('.tree-flag')).toBeNull();
  });

  it('keeps the flag as text when styles are absent (jsdom loads none)', () => {
    const { container } = render(<TreeView tree={chain3} label="t" />);
    expect(container.textContent).toMatch(/Unbalanced/);
  });

  it('shows stored heights when they differ from the real ones', () => {
    const stale: TreeNode = { key: 20, height: 5, left: makeNode(10, null, null), right: null };
    const { container } = render(<TreeView tree={stale} label="t" />);
    expect(node(container, 20).querySelector('.tree-metrics')!.textContent).toBe('h5 \u00b7 bf +1');
  });
});

describe('FR-VIS-07 text description', () => {
  it('describes every node once, in pre-order, naming parent and side', () => {
    fc.assert(
      fc.property(keysArb, (keys) => {
        const tree = avl(keys);
        const parts = describeTreeParts(tree, {});
        const pre: Key[] = [];
        walk(tree, (n) => pre.push(n.key));
        expect(parts.map((p) => p.key)).toEqual(pre);
        parts.forEach((p, i) => {
          if (i === 0) expect(p.parentKey).toBeNull();
          else {
            expect(p.parentKey).not.toBeNull();
            expect(['left', 'right']).toContain(p.side);
          }
        });
      }),
    );
  });

  it('matches the numbers drawn on the nodes', () => {
    const parts = describeTreeParts(seven, {});
    const { container } = render(<TreeView tree={seven} label="t" />);
    for (const p of parts) {
      expect(node(container, p.key).querySelector('.tree-metrics')!.textContent).toBe(`h${p.height} \u00b7 bf ${sign(p.balanceFactor)}`);
    }
  });

  it('says "unbalanced" and the role in the sentence for an unbalanced z node', () => {
    const parts = describeTreeParts(chain3, { 30: 'z' });
    expect(parts[0]).toMatchObject({ key: 30, unbalanced: true, role: 'z' });
    const text = describeTree(chain3, { 30: 'z' });
    expect(text).toMatch(/unbalanced/i);
    expect(text).toMatch(/\bz\b/);
  });

  it('describes the empty tree as empty and draws no nodes', () => {
    expect(describeTreeParts(null, {})).toEqual([]);
    expect(describeTree(null, {})).toMatch(/empty/i);
    const { container } = render(<TreeView tree={null} label="t" />);
    expect(container.querySelectorAll('[data-key]')).toHaveLength(0);
  });

  it('shows the description in a 44 px disclosure linked by aria-describedby', () => {
    const { container } = render(<TreeView tree={seven} label="Example tree" />);
    const btn = screen.getByRole('button', { name: /describe/i });
    expect(btn).toHaveAttribute('aria-expanded', 'false');
    const svg = container.querySelector('svg')!;
    const target = document.getElementById(svg.getAttribute('aria-describedby')!)!;
    expect(target).toHaveTextContent(/root 40/i);
    expect(target).not.toBeVisible();
    fireEvent.click(btn);
    expect(btn).toHaveAttribute('aria-expanded', 'true');
    expect(target).toBeVisible();
    fireEvent.click(btn);
    expect(btn).toHaveAttribute('aria-expanded', 'false');
    expect(readFileSync('src/ui/tree/tree-view.css', 'utf8')).toMatch(/\.tree-describe-button[^{]*\{[^}]*min-height:\s*var\(--target-min\)/);
  });

  it('takes its wording from src/content/treeView.ts', () => {
    const src = readFileSync('src/ui/tree/describe.ts', 'utf8') + readFileSync('src/ui/tree/TreeView.tsx', 'utf8');
    const literals = src.match(/'[^'\n]*'|"[^"\n]*"|`[^`]*`/g) ?? [];
    for (const s of literals) expect(s).not.toMatch(/\b(Unbalanced|unbalanced|Left child|Right child|balance factor)\b/);
    expect(readFileSync('src/content/treeView.ts', 'utf8')).toMatch(/Unbalanced/);
  });
});

describe('NFR-02 read-only and interactive modes', () => {
  it('read-only is an image with a name, no focusable nodes, and no axe violations', async () => {
    const { container } = render(<TreeView tree={seven} label="Example tree" />);
    const svg = container.querySelector('svg')!;
    expect(svg).toHaveAttribute('role', 'img');
    expect(svg).toHaveAttribute('aria-label', 'Example tree');
    expect(svg.querySelector('[tabindex]')).toBeNull();
    expect(await axe(container)).toHaveNoViolations();
  });

  it('interactive is a tree of treeitems with levels, names and no axe violations', async () => {
    const { container } = render(<TreeView tree={seven} interactive label="Example tree" />);
    expect(screen.getByRole('tree', { name: 'Example tree' })).toBeInTheDocument();
    const items = screen.getAllByRole('treeitem');
    expect(items).toHaveLength(7);
    expect(node(container, 40)).toHaveAttribute('aria-level', '1');
    expect(node(container, 20)).toHaveAttribute('aria-level', '2');
    expect(node(container, 10)).toHaveAttribute('aria-level', '3');
    expect(screen.getByRole('treeitem', { name: /^Node 40\b.*height 2/i })).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('NFR-02 / FR-VIS-10 wide trees keep their size', () => {
  const asc15 = build(Array.from({ length: 15 }, (_, i) => i + 1));

  it('draws the SVG at its natural width', () => {
    const { container } = render(<TreeView tree={asc15} label="t" />);
    const { width, height } = layoutTree(asc15);
    const svg = container.querySelector('svg')!;
    expect(svg.getAttribute('width')).toBe(String(width));
    expect(svg.getAttribute('height')).toBe(String(height));
    expect(svg.getAttribute('viewBox')).toBe(`0 0 ${width} ${height}`);
    expect(svg.getAttribute('style') ?? '').not.toMatch(/width:\s*100%/);
  });

  it('puts it in a labelled, focusable, horizontally scrolling region', () => {
    const { container } = render(<TreeView tree={asc15} label="Example tree" />);
    const region = container.querySelector('.tree-scroll')!;
    expect(region).toHaveAttribute('tabindex', '0');
    expect(within(container).getByRole('region', { name: 'Example tree' })).toBe(region);
    expect(readFileSync('src/ui/tree/tree-view.css', 'utf8')).toMatch(/\.tree-scroll[^{]*\{[^}]*overflow-x:\s*auto/);
  });
});

describe('NFR-02 style comes from tokens', () => {
  it('has a stylesheet that imports nothing but uses var(--...) for colours (scan lives in styles.test.ts)', () => {
    const css = readFileSync('src/ui/tree/tree-view.css', 'utf8');
    expect(css).toMatch(/var\(--tree-z\)/);
    expect(css).not.toMatch(/#[0-9a-fA-F]{3,8}\b|rgba?\(/);
    expect(readFileSync('src/ui/tree/TreeView.tsx', 'utf8')).toMatch(/import\s+['"]\.\/tree-view\.css['"]/);
  });
});
