import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

// Spec: revamp-tree-view / tree-view "Labels follow the conventions module". D2, D19, FR-ENG-10.
// The conventions module is replaced with the opposite sign (right minus left); the tree view must follow it.
vi.mock('../../src/engine/conventions', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../src/engine/conventions')>();
  return { ...actual, balanceFactor: (leftHeight: number, rightHeight: number) => rightHeight - leftHeight };
});

import { build } from '../engine/helpers';
import { TreeView } from '../../src/ui/tree/TreeView';

describe('D2 D19 the shown sign follows src/engine/conventions.ts', () => {
  it('shows bf −2 on the root of 30, 20, 10 in the drawing, the name and the description', () => {
    const chain3 = build([30, 20, 10]);
    const { container } = render(<TreeView tree={chain3} interactive label="t" />);
    const g = container.querySelector('[data-key="30"]')!;
    expect(g.querySelector('.tree-metrics')!.textContent).toBe('h2 · bf −2');
    expect(screen.getByRole('treeitem', { name: /^Node 30\b/ }).getAttribute('aria-label')).toMatch(/balance factor −2/);
    expect(container.querySelector('.tree-description')!.textContent).toMatch(/Root 30 \(height 2, balance factor −2/);
  });
});
