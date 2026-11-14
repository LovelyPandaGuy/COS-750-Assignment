import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';
import { ConfidenceRating } from '../../../src/ui/learn/ConfidenceRating';
import { confidenceLevels } from './fixtures';

// Spec: revamp-question-and-feedback / ui-question, "ConfidenceRating levels" and "ConfidenceRating input".

type Props = Parameters<typeof ConfidenceRating>[0];
const base = (over: Partial<Props> = {}): Props => ({
  value: null,
  onChange: vi.fn(),
  label: 'Example confidence',
  levels: confidenceLevels,
  ...over,
});
const filledBars = (radio: HTMLElement) => radio.closest('[data-level]')!.querySelectorAll('[data-bar][data-filled]').length;
const allBars = (radio: HTMLElement) => radio.closest('[data-level]')!.querySelectorAll('[data-bar]').length;

describe('FR-RDY-01 NFR-02 ConfidenceRating levels', () => {
  it('a radio group named by its label, one radio per level in order, named by its text', () => {
    render(<ConfidenceRating {...base({ optionalNote: 'Example optional' })} />);
    expect(screen.getByRole('radiogroup', { name: /Example confidence/ })).toBeInTheDocument();
    expect(screen.getByText('Example optional')).toBeInTheDocument();
    const r = screen.getAllByRole('radio');
    expect(r).toHaveLength(confidenceLevels.length);
    r.forEach((x, i) => expect(x).toHaveAccessibleName(confidenceLevels[i].text));
  });

  it('two levels: 1 of 2 then 2 of 2 bars filled', () => {
    render(<ConfidenceRating {...base({ levels: confidenceLevels.slice(0, 2) })} />);
    const [a, b] = screen.getAllByRole('radio');
    expect([filledBars(a), allBars(a)]).toEqual([1, 2]);
    expect([filledBars(b), allBars(b)]).toEqual([2, 2]);
  });

  it('three levels: 1, 2 and 3 of 3 bars filled; bars are hidden from assistive tech', () => {
    render(<ConfidenceRating {...base()} />);
    const r = screen.getAllByRole('radio');
    expect(r.map(filledBars)).toEqual([1, 2, 3]);
    for (const x of r) expect(x.closest('[data-level]')!.querySelector('[data-bar]')!.closest('[aria-hidden="true"]')).not.toBeNull();
  });
});

describe('NFR-02 FR-VIS-10 ConfidenceRating input', () => {
  it('three levels by keyboard: tab in, ArrowRight twice', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { rerender } = render(<ConfidenceRating {...base({ onChange })} />);
    await user.tab();
    await user.keyboard('{ArrowRight}');
    rerender(<ConfidenceRating {...base({ onChange, value: 'two' })} />);
    await user.keyboard('{ArrowRight}');
    expect(onChange.mock.calls.map((c) => c[0])).toEqual(['two', 'three']);
  });

  it('null value checks nothing; a value checks its level and marks it selected', () => {
    const { rerender } = render(<ConfidenceRating {...base()} />);
    for (const r of screen.getAllByRole('radio')) expect(r).not.toBeChecked();
    rerender(<ConfidenceRating {...base({ value: 'two' })} />);
    const two = screen.getAllByRole('radio')[1];
    expect(two).toBeChecked();
    expect(two.closest('[data-level]')).toHaveAttribute('data-selected');
  });

  it('disabled disables every level', () => {
    render(<ConfidenceRating {...base({ disabled: true })} />);
    for (const r of screen.getAllByRole('radio')) expect(r).toBeDisabled();
  });

  it.each([
    ['empty', {}],
    ['selected', { value: 'two' }],
    ['disabled', { disabled: true, value: 'one' }],
  ])('axe clean: %s', async (_n, over) => {
    const { container } = render(<ConfidenceRating {...base(over as Partial<Props>)} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
