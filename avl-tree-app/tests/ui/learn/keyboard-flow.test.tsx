import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { axe } from 'vitest-axe';
import { describe, expect, it } from 'vitest';
import { LearnFlow } from '../../../src/ui/learn/LearnGallery';

// Spec: revamp-question-and-feedback / ui-feedback "Focus and announcement on feedback", scenario
// "Keyboard only, end to end"; ui-question "Try again returns focus to the first input". (NFR-02, FR-VIS-10)
// LearnFlow is the gallery's composed flow: a choice question (option B is not right, C is), a confidence
// rating, "Example check", then feedback whose next step is "Example try again" or "Example continue".

describe('NFR-02 FR-VIS-10 keyboard only, end to end', () => {
  it('answer, check, read feedback, try again, answer again, continue', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <LearnFlow />
      </MemoryRouter>,
    );
    await user.tab();
    expect(screen.getAllByRole('radio')[0]).toHaveFocus();
    await user.keyboard('b');
    expect(screen.getAllByRole('radio')[1]).toBeChecked();

    // Tab to the confidence rating, pick a level, then to the check button.
    await user.tab();
    expect(document.activeElement).toHaveAttribute('type', 'radio');
    await user.keyboard('{ArrowRight}');
    await user.tab();
    expect(screen.getByRole('button', { name: 'Example check' })).toHaveFocus();
    await user.keyboard('{Enter}');

    // Feedback: focus on the heading, the live region announces, the next step is reached by Tab.
    expect(screen.getByRole('heading', { name: 'Example not quite yet' })).toHaveFocus();
    expect(screen.getByRole('status')).toHaveTextContent(/^Example not quite yet\./);
    await user.tab();
    expect(document.activeElement).toHaveAttribute('href');
    await user.tab();
    expect(screen.getByRole('button', { name: 'Example try again' })).toHaveFocus();
    await user.keyboard('{Enter}');

    // Try again: a new problem, focus back on the first input.
    expect(screen.getAllByRole('radio')[0]).toHaveFocus();
    await user.keyboard('c');
    await user.tab();
    await user.tab();
    await user.keyboard('{Enter}');
    expect(screen.getByRole('heading', { name: 'Example right' })).toHaveFocus();
    expect(screen.getByRole('button', { name: 'Example continue' })).toBeInTheDocument();
  });

  it('the flow is axe clean', async () => {
    const { container } = render(
      <MemoryRouter>
        <LearnFlow />
      </MemoryRouter>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
