import { render, screen, fireEvent } from '@testing-library/react';
import { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { avlInsert } from '../../src/engine/avl';
import type { Key, Tree } from '../../src/engine/tree';
import { TreeView } from '../../src/ui/tree/TreeView';
import { NODE_DIAMETER } from '../../src/ui/tree/layout';

// Spec: add-tree-view / tree-view, "Keyboard navigation and selection". Requirement IDs: FR-VIS-10, NFR-02.

const avl = (keys: Key[]): Tree => keys.reduce<Tree>((t, k) => avlInsert(t, k).tree, null);
const three = avl([40, 20, 60]);
const seven = avl([40, 20, 60, 10, 30, 50, 70]);

function Harness({ tree, onSelect }: { tree: Tree; onSelect?: (k: Key) => void }) {
  const [sel, setSel] = useState<Key | null>(null);
  return (
    <TreeView
      tree={tree}
      interactive
      label="Example tree"
      selectedKey={sel}
      onSelect={(k) => {
        setSel(k);
        onSelect?.(k);
      }}
    />
  );
}

const item = (k: Key) => screen.getByRole('treeitem', { name: new RegExp(`^Node ${k}\\b`) });
const keyOf = (el: Element | null) => Number(el?.getAttribute('data-key'));
const live = (c: HTMLElement) => c.querySelector('[aria-live="polite"]')!;

describe('NFR-02 one tab stop with roving tabindex', () => {
  it('makes only the root tabbable when nothing is selected', () => {
    render(<Harness tree={seven} />);
    const tabbable = screen.getAllByRole('treeitem').filter((e) => e.getAttribute('tabindex') === '0');
    expect(tabbable).toHaveLength(1);
    expect(keyOf(tabbable[0])).toBe(40);
    for (const e of screen.getAllByRole('treeitem')) if (e !== tabbable[0]) expect(e).toHaveAttribute('tabindex', '-1');
  });

  it('moves the tab stop with focus', () => {
    render(<Harness tree={three} />);
    item(40).focus();
    fireEvent.keyDown(item(40), { key: 'ArrowLeft' });
    expect(item(20)).toHaveAttribute('tabindex', '0');
    expect(item(40)).toHaveAttribute('tabindex', '-1');
  });

  it('puts the tab stop on the selected node when there is one', () => {
    render(<Harness tree={three} />);
    fireEvent.click(item(60));
    expect(item(60)).toHaveAttribute('tabindex', '0');
    expect(item(40)).toHaveAttribute('tabindex', '-1');
  });
});

describe('FR-VIS-10 arrow keys', () => {
  it('moves Left, Up, Right, Right, Up as the spec says', () => {
    render(<Harness tree={three} />);
    item(40).focus();
    const press = (key: string) => fireEvent.keyDown(document.activeElement!, { key });
    const seen: number[] = [];
    for (const k of ['ArrowLeft', 'ArrowUp', 'ArrowRight', 'ArrowRight', 'ArrowUp']) {
      press(k);
      seen.push(keyOf(document.activeElement));
    }
    expect(seen).toEqual([20, 40, 60, 60, 40]);
  });

  it('does nothing and says nothing when there is no target', () => {
    const { container } = render(<Harness tree={three} />);
    item(40).focus();
    const before = live(container).textContent;
    fireEvent.keyDown(item(40), { key: 'ArrowUp' });
    expect(document.activeElement).toBe(item(40));
    item(20).focus();
    fireEvent.keyDown(item(20), { key: 'ArrowLeft' });
    expect(document.activeElement).toBe(item(20));
    expect(live(container).textContent).toBe(before);
  });
});

describe('FR-VIS-10 selection', () => {
  it('selects with Enter, calls onSelect once and announces it', () => {
    const onSelect = vi.fn();
    const { container } = render(<Harness tree={seven} onSelect={onSelect} />);
    item(30).focus();
    fireEvent.keyDown(item(30), { key: 'Enter' });
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith(30);
    expect(item(30)).toHaveAttribute('aria-selected', 'true');
    expect(item(40)).toHaveAttribute('aria-selected', 'false');
    expect(live(container).textContent).toBe('Node 30 selected');
  });

  it('shows selection with a rounded-rectangle frame on that node only', () => {
    const { container } = render(<Harness tree={seven} />);
    fireEvent.click(item(30));
    const frames = container.querySelectorAll('.tree-selected-frame');
    expect(frames).toHaveLength(1);
    expect(frames[0].tagName.toLowerCase()).toBe('rect');
    expect(item(30)).toContainElement(frames[0] as HTMLElement);
  });

  it('selects on click or tap like Enter, with a hit area of at least 44 units', () => {
    const onSelect = vi.fn();
    const { container } = render(<Harness tree={seven} onSelect={onSelect} />);
    fireEvent.click(item(70));
    expect(onSelect).toHaveBeenCalledWith(70);
    const hit = container.querySelector('[data-key="70"] .tree-hit')!;
    const size = hit.hasAttribute('r') ? Number(hit.getAttribute('r')) * 2 : Math.min(Number(hit.getAttribute('width')), Number(hit.getAttribute('height')));
    expect(size).toBeGreaterThanOrEqual(44);
    expect(NODE_DIAMETER).toBeGreaterThanOrEqual(44);
  });

  it('ignores keys and clicks in a read-only tree', () => {
    const onSelect = vi.fn();
    const { container } = render(<TreeView tree={seven} label="t" onSelect={onSelect} />);
    const g = container.querySelector('[data-key="40"]')!;
    fireEvent.keyDown(g, { key: 'Enter' });
    fireEvent.click(g);
    expect(onSelect).not.toHaveBeenCalled();
    expect(container.querySelector('.tree-selected-frame')).toBeNull();
  });
});

describe('NFR-02 focus style', () => {
  it('does not override the global focus rule in the tree stylesheet', async () => {
    const css = (await import('node:fs')).readFileSync('src/ui/tree/tree-view.css', 'utf8');
    expect(css).not.toMatch(/outline\s*:\s*(none|0)\b|outline-offset\s*:/);
  });
});
