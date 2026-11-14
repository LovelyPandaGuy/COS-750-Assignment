import { render, screen, fireEvent, within } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { describe, it, expect, vi } from 'vitest';
import fc from 'fast-check';
import { existsSync, readFileSync } from 'node:fs';
import { build } from '../engine/helpers';
import { avlDelete, avlInsert } from '../../src/engine/avl';
import { rotateLeft, rotateRight } from '../../src/engine/rotations';
import { balanceFactorOf, makeNode, replaceAt, type Key, type Tree, type TreeNode } from '../../src/engine/tree';
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

describe('FR-VIS-02 ID 11.1 node states by colour, shape and text', () => {
  const roles: Record<number, NodeRole> = { 40: 'new', 20: 'rotating', 60: 'n' };

  it('ID 11.1: each state is distinguishable without colour', () => {
    const { container } = render(<TreeView tree={seven} roles={{ 40: 'new', 20: 'rotating' }} label="Example tree" />);
    const ring = (k: Key) => node(container, k).getAttribute('data-ring');
    const state = (k: Key) => node(container, k).getAttribute('data-state');
    expect(state(30)).toBe('balanced');
    expect(state(40)).toBe('new');
    expect(state(20)).toBe('rotating');
    expect(ring(20)).toBe('thick');
    expect(node(container, 40).querySelector('.tree-tag')!.textContent).toBe('NEW');
    const bad = render(<TreeView tree={chain3} roles={{ 30: 'n' }} label="t" />).container;
    expect(node(bad, 30).getAttribute('data-state')).toBe('out-of-balance');
    expect(node(bad, 30).getAttribute('data-ring')).toBe('dashed');
    expect(node(bad, 30).querySelector('.tree-marker')!.textContent).toBe('!');
    expect(node(bad, 30).querySelector('.tree-tag')!.textContent).toBe('n');
    expect(describeTree(seven, { 40: 'new', 20: 'rotating' })).toMatch(/newly inserted.*|being rotated/);
  });

  it('ID 11.1: state from the balance factor', () => {
    const { container } = render(<TreeView tree={build([10, 20, 30])} label="t" />);
    expect(node(container, 10).getAttribute('data-state')).toBe('out-of-balance');
    expect(node(container, 10).querySelector('.tree-marker')!.textContent).toBe('!');
    expect(node(container, 20).getAttribute('data-state')).toBe('balanced');
    expect(node(container, 30).getAttribute('data-state')).toBe('balanced');
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
          const { container, unmount } = render(<TreeView tree={tree} show={['height', 'balanceFactor']} label="t" />);
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

  it('follows the ID 7.3 convention: a single node is h0, a three-node left chain has bf −2 at the root', () => {
    const one = render(<TreeView tree={makeNode(5, null, null)} label="t" />).container;
    expect(node(one, 5).querySelector('.tree-metrics')!.textContent).toBe('bf 0');
    const three = render(<TreeView tree={chain3} label="t" />).container;
    expect(node(three, 30).querySelector('.tree-metrics')!.textContent).toBe('bf \u22122');
  });

  it('ID 12.4 show list: only the root shows a balance factor', () => {
    const t = build([50, 30, 70, 20, 80, 10, 90]);
    const { container } = render(<TreeView tree={t} show={['balanceFactor:root']} label="t" />);
    expect(node(container, 50).querySelector('.tree-metrics')!.textContent).toBe('bf 0');
    for (const k of [30, 70, 20, 80, 10, 90]) {
      expect(node(container, k).querySelector('.tree-metrics')!.textContent).toBe('');
      expect(node(container, k).getAttribute('data-state')).toBe('neutral');
    }
    expect(container.querySelector('.tree-description')!.textContent).not.toMatch(/unbalanced/);
  });

  it('ID 8.3 default: every node shows its balance factor and no node its height', () => {
    const { container } = render(<TreeView tree={seven} label="t" />);
    for (const k of [40, 20, 60, 10, 30, 50, 70]) expect(node(container, k).querySelector('.tree-metrics')!.textContent).toBe('bf 0');
  });

  it('letter keys are drawn as letters', () => {
    const t = build([71, 67, 72]);
    const { container } = render(<TreeView tree={t} formatKey={(k) => String.fromCharCode(k)} label="t" />);
    expect(node(container, 71).querySelector('.tree-key')!.textContent).toBe('G');
    expect(container.querySelector('.tree-description')!.textContent).toMatch(/Root G/);
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
    const { container } = render(<TreeView tree={stale} show={['height', 'balanceFactor']} label="t" />);
    expect(node(container, 20).querySelector('.tree-metrics')!.textContent).toBe('h5 \u00b7 bf \u22121');
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
    const { container } = render(<TreeView tree={seven} show={['height', 'balanceFactor']} label="t" />);
    for (const p of parts) {
      expect(node(container, p.key).querySelector('.tree-metrics')!.textContent).toBe(`h${p.height} \u00b7 bf ${sign(p.balanceFactor)}`);
    }
  });

  it('says "unbalanced" and the role in the sentence for the unbalanced node n', () => {
    const parts = describeTreeParts(chain3, { 30: 'n' });
    expect(parts[0]).toMatchObject({ key: 30, unbalanced: true, role: 'n' });
    const text = describeTree(chain3, { 30: 'n' });
    expect(text).toMatch(/unbalanced/i);
    expect(text).toMatch(/\bn, the first unbalanced node\b/);
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
    expect(css).toMatch(/var\(--node-unbalanced\)/);
    expect(css).not.toMatch(/#[0-9a-fA-F]{3,8}\b|rgba?\(/);
    expect(readFileSync('src/ui/tree/TreeView.tsx', 'utf8')).toMatch(/import\s+['"]\.\/tree-view\.css['"]/);
  });
});

// Spec: add-modules-c2-c3 / tree-view "Hidden balance factors for practice". FR-VIS-07.
describe('FR-VIS-07 hidden balance factors for practice', () => {
  const metrics = (c: HTMLElement, k: Key) => node(c, k).querySelector('.tree-metrics')!.textContent;

  it('nothing leaks when no key is revealed', () => {
    const { container } = render(<TreeView tree={chain3} hideBalance={{}} label="Practice tree" />);
    for (const k of [30, 20, 10]) expect(metrics(container, k)).toMatch(/^h\d · bf \?$/);
    expect(container.querySelectorAll('.tree-flag')).toHaveLength(0);
    const text = describeTree(chain3, {}, {});
    expect(text).not.toMatch(/unbalanced/i);
    expect(text).not.toMatch(/balance factor [+−]?\d/);
    expect(text).toMatch(/height 2/);
    expect(container.querySelector('.tree-description')!.textContent).toBe(text);
  });

  it('a revealed node is drawn as usual', () => {
    const { container } = render(<TreeView tree={chain3} hideBalance={{ reveal: [30] }} show={['height', 'balanceFactor']} label="Practice tree" />);
    expect(metrics(container, 30)).toBe('h2 · bf −2');
    expect(node(container, 30).querySelector('.tree-flag')).toHaveTextContent('Unbalanced');
    expect(metrics(container, 20)).toBe('h1 · bf ?');
    expect(metrics(container, 10)).toBe('h0 · bf ?');
  });

  it('default rendering is unchanged', () => {
    const { container } = render(<TreeView tree={chain3} show={['height', 'balanceFactor']} label="Example tree" />);
    expect(metrics(container, 30)).toBe('h2 · bf −2');
    expect(describeTree(chain3, {})).toBe(describeTree(chain3, {}, undefined));
  });

  it('accessible in hidden mode', async () => {
    const { container } = render(<TreeView tree={seven} interactive hideBalance={{}} label="Practice tree" />);
    for (const item of screen.getAllByRole('treeitem')) {
      const name = item.getAttribute('aria-label') ?? '';
      expect(name).toMatch(/^Node \d+, height \d+/);
      expect(name).toMatch(/hidden/);
      expect(name).not.toMatch(/balance factor [+−]?\d/);
    }
    expect(await axe(container)).toHaveNoViolations();
  });
});

// ---- Spec: revamp-tree-view / tree-view (modified and added requirements) ----
// DOM contract added by this change: a role tag is a <rect class="tree-tag-pill"> drawn before its
// <text class="tree-tag">; an out-of-balance node's <text class="tree-metrics"> has data-unbalanced;
// each edge is <line class="tree-edge" data-child="k">; props `announce` and `overlay`.

const treeCss = () => readFileSync('src/ui/tree/tree-view.css', 'utf8');
/** The declarations of the first rule whose selector list contains `selector`. */
const rule = (selector: string) => {
  const css = treeCss().replace(/\/\*[\s\S]*?\*\//g, '');
  for (const m of css.matchAll(/([^{}]+)\{([^}]*)\}/g)) {
    if (m[1].split(',').some((s) => s.trim() === selector)) return m[2];
  }
  return '';
};

describe('FR-VIS-02 D25 roles survive greyscale and use pill tags (revamp-tree-view)', () => {
  const roles: Record<number, NodeRole> = { 40: 'new', 20: 'z', 60: 'y', 10: 'balanced' };

  it('keeps every pair of roles apart by ring style or tag text when colour is ignored', () => {
    const { container } = render(<TreeView tree={seven} roles={roles} label="t" />);
    const look = (k: Key) => {
      const g = node(container, k);
      const tag = g.querySelector('.tree-tag')?.textContent ?? g.querySelector('.tree-badge title')?.textContent ?? '';
      return `${g.getAttribute('data-ring')}|${tag}`;
    };
    const looks = [30, 40, 20, 60, 10].map(look);
    expect(new Set(looks).size).toBe(5);
  });

  it('draws the new, z and y tags as filled pills behind surface-coloured text', () => {
    const { container } = render(<TreeView tree={seven} roles={roles} label="t" />);
    for (const k of [40, 20, 60]) {
      const pill = node(container, k).querySelector('rect.tree-tag-pill');
      const text = node(container, k).querySelector('.tree-tag')!;
      expect(pill, `pill on ${k}`).not.toBeNull();
      expect(Number(pill!.getAttribute('rx'))).toBeGreaterThan(0);
      expect(pill!.compareDocumentPosition(text) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    }
    expect(node(container, 30).querySelector('.tree-tag-pill')).toBeNull();
    expect(rule('.tree-tag-pill')).toMatch(/fill:\s*var\(--role-color\)/);
    expect(rule('.tree-tag')).toMatch(/fill:\s*var\(--bg-surface\)/);
    expect(treeCss()).toMatch(/\[data-theme='dark'\][^{]*\.tree-tag\s*\{[^}]*fill:\s*var\(--bg-page\)/);
  });

  it('has pill text contrast of at least 4.5:1 (light: surface on new, z, y; dark: page on z)', () => {
    const css = readFileSync('src/ui/tokens.css', 'utf8');
    const block = (start: RegExp) => {
      const i = css.search(start);
      return css.slice(i, css.indexOf('}', i));
    };
    const pick = (text: string, n: string) => new RegExp(`--${n}:\\s*(#[0-9A-Fa-f]{6})`).exec(text)![1];
    const lum = (hex: string) => {
      const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    const ratio = (a: string, b: string) => {
      const [x, y] = [lum(a), lum(b)];
      return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
    };
    const light = block(/^:root\s*\{/m);
    const dark = block(/^:root\[data-theme='dark'\]\s*\{\s*--/m);
    for (const n of ['tree-new', 'tree-z', 'tree-y']) expect(ratio(pick(light, 'bg-surface'), pick(light, n)), n).toBeGreaterThanOrEqual(4.5);
    expect(ratio(pick(dark, 'bg-page'), pick(dark, 'tree-z'))).toBeGreaterThanOrEqual(4.5);
  });
});

describe('FR-VIS-09 the unbalanced annotation is marked (revamp-tree-view)', () => {
  it('marks only the out-of-balance node and styles it with --tree-z and bold', () => {
    const { container } = render(<TreeView tree={chain3} label="t" />);
    expect(node(container, 30).querySelector('.tree-metrics')).toHaveAttribute('data-unbalanced');
    for (const k of [20, 10]) expect(node(container, k).querySelector('.tree-metrics')).not.toHaveAttribute('data-unbalanced');
    const decl = rule('.tree-metrics[data-unbalanced]');
    expect(decl).toMatch(/fill:\s*var\(--tree-z\)/);
    expect(decl).toMatch(/font-weight:\s*(700|bold)/);
  });

  it('does not mark a hidden balance factor (nothing leaks in practice)', () => {
    const { container } = render(<TreeView tree={chain3} hideBalance={{}} label="t" />);
    expect(container.querySelector('[data-unbalanced]')).toBeNull();
  });
});

describe('FR-VIS-10 selected and hover look from tokens (revamp-tree-view)', () => {
  it('fills the selected frame with the tint and outlines it with the action colour', () => {
    const decl = rule('.tree-selected-frame');
    expect(decl).toMatch(/fill:\s*var\(--action-primary-tint\)/);
    expect(decl).toMatch(/stroke:\s*var\(--action-primary\)/);
  });

  it('fills a hovered node with the tint and rings it with the action colour', () => {
    expect(rule("[role='treeitem']:hover .tree-node-fill")).toMatch(/fill:\s*var\(--action-primary-tint\)/);
    expect(rule("[role='treeitem']:hover .tree-ring")).toMatch(/stroke:\s*var\(--action-primary\)/);
  });
});

describe('FR-VIS-07 NFR-02 the description matches the drawing after every update', () => {
  type Op = { kind: 'insert' | 'delete' | 'rotate'; key: number; left: boolean };
  const opArb = fc.record({
    kind: fc.constantFrom<Op['kind']>('insert', 'insert', 'delete', 'rotate'),
    key: fc.integer({ min: 1, max: 30 }),
    left: fc.boolean(),
  });
  const apply = (t: Tree, op: Op): Tree => {
    if (op.kind === 'insert') return avlInsert(t, op.key).tree;
    if (op.kind === 'delete') return avlDelete(t, op.key).tree;
    const keys: Key[] = [];
    walk(t, (n) => {
      if (op.left ? n.right : n.left) keys.push(n.key);
    });
    if (keys.length === 0) return t;
    return replaceAt(t, keys[op.key % keys.length], op.left ? rotateLeft : rotateRight);
  };
  const drawnKeys = (c: HTMLElement) => [...c.querySelectorAll('[data-key]')].map((g) => Number(g.getAttribute('data-key'))).sort((a, b) => a - b);

  it('re-describes and re-draws exactly the current tree after each operation', () => {
    fc.assert(
      fc.property(fc.array(opArb, { minLength: 1, maxLength: 10 }), (ops) => {
        let t: Tree = null;
        const { container, rerender, unmount } = render(<TreeView tree={t} label="t" />);
        for (const op of ops) {
          t = apply(t, op);
          rerender(<TreeView tree={t} label="t" />);
          const keys: Key[] = [];
          walk(t, (n) => keys.push(n.key));
          if (t === null) {
            expect(container.querySelectorAll('[data-key]')).toHaveLength(0);
            continue;
          }
          expect(container.querySelector('.tree-description')!.textContent).toBe(describeTree(t, {}));
          expect(drawnKeys(container)).toEqual(keys.sort((a, b) => a - b));
        }
        unmount();
      }),
      { numRuns: 30 },
    );
  });
});

describe('NFR-02 FR-VIS-07 screen-supplied announcements', () => {
  const live = (c: HTMLElement) => c.querySelector('[aria-live="polite"]')!;

  it('puts each announcement in the polite live region', () => {
    const { container, rerender } = render(<TreeView tree={seven} announce="Inserted 5" label="t" />);
    expect(live(container)).toHaveTextContent('Inserted 5');
    rerender(<TreeView tree={avl([40, 20, 60, 10, 30, 50, 70, 5])} announce="Rotated right at 20" label="t" />);
    expect(live(container)).toHaveTextContent('Rotated right at 20');
  });

  it('says nothing about a tree change when no announcement is passed', () => {
    const { container, rerender } = render(<TreeView tree={seven} label="t" />);
    const before = live(container).textContent;
    rerender(<TreeView tree={avl([40, 20, 60, 10, 30, 50, 70, 5])} label="t" />);
    expect(live(container).textContent).toBe(before);
  });
});

describe('FR-VIS-06 overlay extension point (change A3)', () => {
  const three = avl([20, 10, 30]);
  const centre = (g: Element) => {
    const m = /translate\(([-\d.]+)[ ,]+([-\d.]+)\)/.exec(g.getAttribute('transform') ?? '')!;
    return { x: Number(m[1]), y: Number(m[2]) };
  };

  it('passes the drawn layout and the empty slots, and draws the result inside the SVG after the nodes', () => {
    const overlay = vi.fn(() => <circle data-testid="overlay-mark" r={3} />);
    const { container } = render(<TreeView tree={three} overlay={overlay} label="t" />);
    expect(overlay).toHaveBeenCalled();
    const arg = overlay.mock.calls.at(-1)![0] as { nodes: { key: Key; x: number; y: number }[]; emptySlots: unknown[] };
    expect(arg.nodes).toHaveLength(3);
    for (const n of arg.nodes) expect({ x: n.x, y: n.y }).toEqual(centre(node(container, n.key)));
    expect(arg.emptySlots).toHaveLength(4);
    const mark = screen.getByTestId('overlay-mark');
    expect(container.querySelector('svg')!.contains(mark)).toBe(true);
    for (const g of container.querySelectorAll('[data-key]'))
      expect(g.compareDocumentPosition(mark) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('draws nothing extra without an overlay', () => {
    const a = render(<TreeView tree={three} label="t" />).container.querySelector('svg')!.innerHTML;
    const b = render(<TreeView tree={three} overlay={undefined} label="t" />).container.querySelector('svg')!.innerHTML;
    expect(b).toBe(a);
  });
});

describe('D2 D19 nothing about the conventions is hard-coded in src/ui/tree', () => {
  it('has no height or balance-factor comparison with a number and no left-minus-right arithmetic', () => {
    for (const f of ['layout.ts', 'describe.ts', 'TreeView.tsx', 'motion.ts']) {
      if (!existsSync(`src/ui/tree/${f}`)) continue;
      const src = readFileSync(`src/ui/tree/${f}`, 'utf8');
      expect(src, f).not.toMatch(/\b(height|balance(Factor)?|bf)\b\s*(<=?|>=?|===?|!==?)\s*-?\d/i);
      expect(src, f).not.toMatch(/\.left\b[^;\n]*height[^;\n]*-[^;\n]*\.right\b[^;\n]*height/);
      expect(src, f).not.toMatch(/\.right\b[^;\n]*height[^;\n]*-[^;\n]*\.left\b[^;\n]*height/);
    }
  });
});
