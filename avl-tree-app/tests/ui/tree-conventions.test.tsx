import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

// Spec: revamp-tree-view / tree-view "Labels follow the conventions module". D93, FR-ENG-10.
// The real sign is right minus left (D93); the module is replaced with the opposite sign (left minus right)
// and the tree view must follow it. By default a node shows its balance factor only (D98).
vi.mock('../../src/engine/conventions', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../src/engine/conventions')>();
  return { ...actual, balanceFactor: (leftHeight: number, rightHeight: number) => leftHeight - rightHeight };
});

import { build } from '../engine/helpers';
import { TreeView } from '../../src/ui/tree/TreeView';

describe('D93 D98 the shown sign follows src/engine/conventions.ts', () => {
  it('shows bf +2 on the root of 30, 20, 10 in the drawing, the name and the description', () => {
    const chain3 = build([30, 20, 10]);
    const { container } = render(<TreeView tree={chain3} interactive label="t" />);
    const g = container.querySelector('[data-key="30"]')!;
    expect(g.querySelector('.tree-metrics')!.textContent).toBe('bf +2');
    expect(screen.getByRole('treeitem', { name: /^Node 30\b/ }).getAttribute('aria-label')).toMatch(/balance factor \+2/);
    expect(container.querySelector('.tree-description')!.textContent).toMatch(/Root 30 \(height 2, balance factor \+2/);
  });
});
