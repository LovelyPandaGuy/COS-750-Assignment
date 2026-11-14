import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { describe, expect, it } from 'vitest';
import { FullAnswer } from '../../../src/ui/learn/FullAnswer';
import type { FullAnswerValue } from '../../../src/ui/learn/FullAnswer';
import { threeNodes } from './fixtures';

// Spec: revamp-question-and-feedback / ui-feedback "FullAnswer". (FR-SCA-03)

const labels = { show: 'Example show', treeAnswer: 'Example answer tree' };
// The engine's answer in each form the question takes, with the explanation from the content.
const props = (answer: FullAnswerValue = { kind: 'value', value: 2 }) => ({ answer, explanation: 'Example explanation', labels });;

describe('FR-SCA-03 FullAnswer', () => {
  it('is collapsed by default, then shows the signed answer and the explanation', async () => {
    render(<FullAnswer {...props()} />);
    const button = screen.getByRole('button', { name: 'Example show' });
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText('Example explanation')).not.toBeVisible();
    await userEvent.setup().click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Example explanation')).toBeVisible();
    expect(screen.getByText('+2')).toBeVisible();
  });

  it('a choice answer shows the correct option text', async () => {
    render(<FullAnswer {...props({ kind: 'option', text: 'Option three' })} />);
    await userEvent.setup().click(screen.getByRole('button', { name: 'Example show' }));
    expect(screen.getByText('Option three')).toBeVisible();
  });

  it('a tree answer is a read-only tree', async () => {
    render(<FullAnswer {...props({ kind: 'tree', tree: threeNodes })} />);
    await userEvent.setup().click(screen.getByRole('button', { name: 'Example show' }));
    expect(screen.getByRole('img', { name: 'Example answer tree' })).toBeInTheDocument();
  });

  it('axe clean, closed and open', async () => {
    const { container } = render(<FullAnswer {...props()} />);
    expect(await axe(container)).toHaveNoViolations();
    await userEvent.setup().click(screen.getByRole('button', { name: 'Example show' }));
    expect(await axe(container)).toHaveNoViolations();
  });
});
