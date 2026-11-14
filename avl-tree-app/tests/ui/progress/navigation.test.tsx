import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';
import { LessonMenu } from '../../../src/ui/progress/LessonMenu';
import { LessonProgress } from '../../../src/ui/progress/LessonProgress';
import { files, read } from '../base/css-helpers';
import { IDS, MIXED, lessons, renderAt, stateLabels } from './fixtures';

// Spec: revamp-progress-and-hub / ui-progress "Lesson progress readout", "Lesson menu", "Components show
// state and words they are given". ID 8.2, 8.3, 10.4, 11.2; D117; FR-LRN-04; NFR-02.

describe('ID 8.2 10.4 lesson progress readout', () => {
  it('shows the label as text and fills the bar to the completed share', () => {
    const { container } = renderAt(<LessonProgress label="Example lesson 4 of 9" completed={3} total={9} />);
    expect(screen.getByText('Example lesson 4 of 9')).toBeVisible();
    const bar = container.querySelector<HTMLElement>('[data-progress-bar]')!;
    expect(bar).toHaveAttribute('aria-hidden', 'true');
    const share = parseFloat(bar.style.getPropertyValue('--progress-share'));
    expect(share).toBeCloseTo(1 / 3, 5);
  });

  it.each([
    [0, 0],
    [9, 1],
  ])('ends: %i of 9 gives a share of %i, label still shown', (completed, share) => {
    const { container } = renderAt(<LessonProgress label="Example lesson 9 of 9" completed={completed} total={9} />);
    expect(screen.getByText('Example lesson 9 of 9')).toBeVisible();
    expect(parseFloat(container.querySelector<HTMLElement>('[data-progress-bar]')!.style.getPropertyValue('--progress-share'))).toBe(share);
  });

  it('a share outside 0 to 1 is clamped', () => {
    const { container } = renderAt(<LessonProgress label="Example" completed={12} total={9} />);
    expect(parseFloat(container.querySelector<HTMLElement>('[data-progress-bar]')!.style.getPropertyValue('--progress-share'))).toBe(1);
  });
});

function menu(onNavigate = vi.fn()) {
  renderAt(<LessonMenu buttonLabel="Example lessons" panelLabel="Example all lessons" lessons={lessons(MIXED)} labels={stateLabels} onNavigate={onNavigate} />, '/path');
  return { button: screen.getByRole('button', { name: 'Example lessons' }), user: userEvent.setup(), onNavigate };
}

describe('ID 8.2 ID 11.2 FR-LRN-04 lesson menu', () => {
  it('opens with Enter and closes with Escape, focus back on the button', async () => {
    const { button, user } = menu();
    expect(button).toHaveAttribute('aria-expanded', 'false');
    const panel = document.getElementById(button.getAttribute('aria-controls')!)!;
    expect(panel).not.toBeVisible();
    button.focus();
    await user.keyboard('{Enter}');
    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(panel).toBeVisible();
    await user.tab();
    await user.keyboard('{Escape}');
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(button).toHaveFocus();
  });

  it('Tab visits all nine lessons in order, and locked ones announce their reasons', async () => {
    const { button, user } = menu();
    await user.click(button);
    const nav = screen.getByRole('navigation', { name: 'Example all lessons' });
    const seen: string[] = [];
    for (let i = 0; i < IDS.length; i++) {
      await user.tab();
      const el = document.activeElement as HTMLElement;
      expect(nav.contains(el)).toBe(true);
      seen.push(el.getAttribute('data-lesson')!);
      if (el.getAttribute('aria-disabled') === 'true') expect(el).toHaveAccessibleDescription(`Example: opens when ${IDS[i - 1]} is done`);
    }
    expect(seen).toEqual([...IDS]);
  });

  it('Enter on an open lesson follows its link and closes the panel', async () => {
    const { button, user, onNavigate } = menu();
    await user.click(button);
    const nav = screen.getByRole('navigation', { name: 'Example all lessons' });
    const c4 = within(nav).getByRole('link', { name: /Example title C4/ });
    c4.focus();
    await user.keyboard('{Enter}');
    expect(screen.getByTestId('where')).toHaveTextContent('/module/C4');
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(onNavigate).toHaveBeenCalledTimes(1);
  });

  it('the button toggles the panel closed again', async () => {
    const { button, user } = menu();
    await user.click(button);
    await user.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  it('the panel is not a modal', async () => {
    const { button, user } = menu();
    await user.click(button);
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.querySelector('[aria-modal]')).toBeNull();
  });

  it('axe with the panel open', async () => {
    const { button, user } = menu();
    await user.click(button);
    expect(await axe(document.body)).toHaveNoViolations();
  });
});

describe('D18 progress components show what they are given', () => {
  it('no source under src/ui/progress imports content, state or live', () => {
    for (const p of files('src/ui/progress', /\.tsx?$/)) {
      expect(read(p), p).not.toMatch(/from ['"][./]*(?:\.\.\/)*(content|state|live)\//);
    }
  });
});
