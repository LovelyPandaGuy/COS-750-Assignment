import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';
import { ScaffoldPanel } from '../../../src/ui/learn/ScaffoldPanel';
import { read, rule, stripComments } from '../base/css-helpers';
import { scaffoldLabels } from './fixtures';

// Spec: revamp-question-and-feedback / ui-feedback "ScaffoldPanel shows rungs as given" and
// "Hint button shows the hints left". (FR-SCA-02, FR-VIS-10, D21, D23, D76, D131)

type Props = Parameters<typeof ScaffoldPanel>[0];
type Rung = Props['rungs'][number];
const rung = (kind: Rung['kind'], state: Rung['state'], n: number): Rung => ({ kind, state, title: `Example rung ${n}`, body: <p>Example body {n}</p> });
const practice: Rung[] = [rung('nudge', 'seen', 1), rung('fuller-hint', 'open', 2)];
const check: Rung[] = [rung('fuller-hint', 'seen', 1), rung('worked-example', 'available', 2), rung('guided', 'waiting', 3)];
const base = (over: Partial<Props> = {}): Props => ({ rungs: check, hintsLeft: 2, onHint: vi.fn(), labels: scaffoldLabels, ...over });
const items = () => screen.getAllByRole('listitem');

describe('FR-SCA-02 D131 ScaffoldPanel shows rungs as given', () => {
  it.each([
    ['practice', practice],
    ['check', check],
  ])('%s: exactly the rungs given, in order, with number and state word; body only when open', (_n, rungs) => {
    render(<ScaffoldPanel {...base({ rungs })} />);
    expect(screen.getByRole('region', { name: scaffoldLabels.region })).toBeInTheDocument();
    expect(items()).toHaveLength(rungs.length);
    items().forEach((li, i) => {
      const r = rungs[i];
      expect(li).toHaveAttribute('data-kind', r.kind);
      expect(li).toHaveAttribute('data-state', r.state);
      expect(within(li).getByText(String(i + 1))).toBeInTheDocument();
      expect(within(li).getByText(r.title)).toBeInTheDocument();
      expect(within(li).getByText(scaffoldLabels.state[r.state])).toBeInTheDocument();
      if (r.state === 'open') expect(within(li).getByText(`Example body ${i + 1}`)).toBeInTheDocument();
      else expect(within(li).queryByText(`Example body ${i + 1}`)).toBeNull();
    });
  });

  it('greyscale: each state has its own border style in the stylesheet', () => {
    const css = stripComments(read('src/ui/learn/learn.css'));
    const border = (state: string) => rule(css, `.learn-rung[data-state='${state}']`);
    expect(border('waiting')).toMatch(/dashed/);
    expect(border('available')).toMatch(/solid/);
    expect(border('open')).toMatch(/3px/);
    expect(border('seen')).toMatch(/--border-subtle/);
    const styles = ['open', 'seen', 'available', 'waiting'].map(border);
    expect(new Set(styles).size).toBe(4);
  });
});

describe('FR-VIS-10 D21 D23 Hint button shows the hints left', () => {
  it('shows the count as a numeral, named by the label function, and calls onHint', async () => {
    const p = base();
    render(<ScaffoldPanel {...p} />);
    const button = screen.getByRole('button', { name: 'Example hint, 2 left' });
    expect(button).toHaveTextContent('2');
    expect(button).toHaveTextContent(scaffoldLabels.hintText);
    await userEvent.setup().click(button);
    expect(p.onHint).toHaveBeenCalledTimes(1);
  });

  it('at 0 it stays, shows 0, is aria-disabled and does nothing', async () => {
    const p = base({ hintsLeft: 0 });
    render(<ScaffoldPanel {...p} />);
    const button = screen.getByRole('button', { name: 'Example hint, 0 left' });
    expect(button).toHaveTextContent('0');
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(button).not.toBeDisabled();
    await userEvent.setup().click(button);
    expect(p.onHint).not.toHaveBeenCalled();
  });

  it.each([
    ['practice', practice, 2],
    ['check', check, 1],
    ['none left', check, 0],
  ])('axe clean: %s', async (_n, rungs, hintsLeft) => {
    const { container } = render(<ScaffoldPanel {...base({ rungs, hintsLeft })} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
