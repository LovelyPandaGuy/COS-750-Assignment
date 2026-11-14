import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { describe, expect, it } from 'vitest';
import { FullAnswer } from '../../../src/ui/learn/FullAnswer';
import type { WorkedExample } from '../../../src/assessment/scaffold';
import { choiceInstance, numberInstance, threeNodes, treeInstance } from './fixtures';

// Spec: revamp-question-and-feedback / ui-feedback "FullAnswer". (FR-SCA-03)

const labels = { show: 'Example show', treeAnswer: 'Example answer tree' };
const example = (inst = numberInstance(), answer: WorkedExample['answer'] = 2): WorkedExample => ({ instance: inst, answer, explanation: 'Example explanation' });

describe('FR-SCA-03 FullAnswer', () => {
  it('is collapsed by default, then shows the signed answer and the explanation', async () => {
    render(<FullAnswer example={example()} labels={labels} />);
    const button = screen.getByRole('button', { name: 'Example show' });
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText('Example explanation')).not.toBeVisible();
    await userEvent.setup().click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Example explanation')).toBeVisible();
    expect(screen.getByText('+2')).toBeVisible();
  });

  it('a choice answer shows the correct option text', async () => {
    render(<FullAnswer example={example(choiceInstance(), 'opt-c')} labels={labels} />);
    await userEvent.setup().click(screen.getByRole('button', { name: 'Example show' }));
    expect(screen.getByText('Option three')).toBeVisible();
  });

  it('a tree answer is a read-only tree', async () => {
    render(<FullAnswer example={example(treeInstance(), threeNodes)} labels={labels} />);
    await userEvent.setup().click(screen.getByRole('button', { name: 'Example show' }));
    expect(screen.getByRole('img', { name: 'Example answer tree' })).toBeInTheDocument();
  });

  it('axe clean, closed and open', async () => {
    const { container } = render(<FullAnswer example={example()} labels={labels} />);
    expect(await axe(container)).toHaveNoViolations();
    await userEvent.setup().click(screen.getByRole('button', { name: 'Example show' }));
    expect(await axe(container)).toHaveNoViolations();
  });
});
