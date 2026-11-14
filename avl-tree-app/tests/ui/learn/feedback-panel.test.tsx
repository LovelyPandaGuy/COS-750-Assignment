import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';
import { FeedbackPanel } from '../../../src/ui/learn/FeedbackPanel';
import { files, read, stripComments } from '../base/css-helpers';
import { feedbackBase, renderWithRouter } from './fixtures';

// Spec: revamp-question-and-feedback / ui-feedback, "FeedbackPanel has three variants with four parts",
// "Feedback is calm", "The answer appears only at the cap", "Focus and announcement on feedback".

const next = () => ({ label: 'Example next', onClick: vi.fn() });
const variants = ['correct', 'not-yet', 'cap'] as const;

describe('FR-ASM-03 FR-SCA-03 D27 three variants with four parts', () => {
  it.each(variants)('%s: verdict heading, why, concept link, one primary next step, in DOM order', (variant) => {
    const { container } = renderWithRouter(<FeedbackPanel variant={variant} {...feedbackBase} next={next()} />);
    const heading = screen.getByRole('heading', { name: 'Example verdict' });
    const why = within(container).getAllByText('Example why').find((el) => !el.closest('[role="status"]'))!;
    const link = screen.getByRole('link', { name: 'Example concept' });
    const button = screen.getByRole('button', { name: 'Example next' });
    expect(link).toHaveAttribute('href', '/example');
    const order = [heading, why, link, button];
    for (let i = 1; i < order.length; i++) expect(order[i - 1].compareDocumentPosition(order[i]) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.getAllByRole('button')).toHaveLength(1);
    expect(button.className).toMatch(/primary/);
    expect(container.querySelector('[data-variant]')).toHaveAttribute('data-variant', variant);
  });

  it('pressing the next step calls its action', async () => {
    const n = next();
    renderWithRouter(<FeedbackPanel variant="not-yet" {...feedbackBase} next={n} />);
    await userEvent.setup().click(screen.getByRole('button', { name: 'Example next' }));
    expect(n.onClick).toHaveBeenCalledTimes(1);
  });

  it('no variant shows nothing but the empty live region', () => {
    const { container } = renderWithRouter(<FeedbackPanel variant={null} />);
    expect(screen.queryByRole('heading')).toBeNull();
    expect(screen.getByRole('status')).toHaveTextContent('');
    expect(container.textContent).toBe('');
  });
});

describe('D27 NFR-02 feedback is calm', () => {
  it('markup has no cross glyph and no fail words of its own, and each variant names itself in text', () => {
    for (const variant of variants) {
      const { container, unmount } = renderWithRouter(<FeedbackPanel variant={variant} {...feedbackBase} next={next()} />);
      expect(container.textContent).not.toMatch(/[✗✕❌✘]|\bwrong\b|\bincorrect\b|\bfail/i);
      expect(screen.getByRole('heading')).toHaveTextContent('Example verdict');
      unmount();
    }
  });

  it('the learn stylesheet uses feedback tokens for the panel and no red token', () => {
    const css = stripComments(read('src/ui/learn/learn.css'));
    expect(css).toMatch(/--feedback-correct-bg/);
    expect(css).toMatch(/--feedback-notyet-bg/);
    expect(css).not.toMatch(/red|danger|error/i);
    for (const p of files('src/ui/learn', /\.tsx?$/)) expect(read(p), p).not.toMatch(/[✗✕❌✘]/);
  });
});

describe('FR-SCA-03 D105 the answer appears only at the cap', () => {
  it('not-yet renders no full answer and no lecture draft', () => {
    renderWithRouter(<FeedbackPanel variant="not-yet" {...feedbackBase} next={next()} />);
    expect(screen.queryByTestId('full-answer')).toBeNull();
    expect(screen.queryByTestId('lecture-draft')).toBeNull();
  });

  it('cap renders both slots after the why and before the concept link, with no Try again', () => {
    renderWithRouter(
      <FeedbackPanel
        variant="cap"
        {...feedbackBase}
        next={next()}
        fullAnswer={<div data-testid="full-answer" />}
        lectureDraft={<div data-testid="lecture-draft" />}
      />,
    );
    const full = screen.getByTestId('full-answer');
    const draft = screen.getByTestId('lecture-draft');
    const why = screen.getAllByText('Example why').find((el) => !el.closest('[role="status"]'))!;
    const link = screen.getByRole('link', { name: 'Example concept' });
    expect(why.compareDocumentPosition(full) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(full.compareDocumentPosition(draft) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(draft.compareDocumentPosition(link) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.getAllByRole('button')).toHaveLength(1);
  });
});

describe('NFR-02 FR-VIS-10 focus and announcement', () => {
  it('a shown variant moves focus to the heading and announces verdict and why only', () => {
    const { rerender } = render(
      <MemoryRouter>
        <FeedbackPanel variant={null} />
      </MemoryRouter>,
    );
    expect(document.body).toHaveFocus();
    rerender(
      <MemoryRouter>
        <FeedbackPanel variant="not-yet" {...feedbackBase} next={next()} />
      </MemoryRouter>,
    );
    const heading = screen.getByRole('heading', { name: 'Example verdict' });
    expect(heading).toHaveFocus();
    expect(heading).toHaveAttribute('tabindex', '-1');
    const live = screen.getByRole('status');
    expect(live).toHaveTextContent(/^Example verdict\. Example why$/);
    expect(within(live).queryByRole('button')).toBeNull();
    expect(within(live).queryByRole('link')).toBeNull();
  });

  it('a changed variant moves focus again', () => {
    const { rerender } = renderWithRouter(<FeedbackPanel variant="not-yet" {...feedbackBase} next={next()} />);
    (document.activeElement as HTMLElement).blur();
    rerender(
      <MemoryRouter>
        <FeedbackPanel variant="correct" {...feedbackBase} verdict="Example verdict two" next={next()} />
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { name: 'Example verdict two' })).toHaveFocus();
  });

  it('takes no focus on mount with no variant', () => {
    renderWithRouter(<FeedbackPanel variant={null} />);
    expect(document.body).toHaveFocus();
  });

  it('takes no focus on mount with a variant either (a page opening with feedback does not steal focus)', () => {
    renderWithRouter(<FeedbackPanel variant="cap" {...feedbackBase} next={next()} />);
    expect(document.body).toHaveFocus();
  });
});

describe('NFR-02 axe in every variant', () => {
  it.each([...variants, null])('%s', async (variant) => {
    const { container } = renderWithRouter(
      variant === null ? <FeedbackPanel variant={null} /> : <FeedbackPanel variant={variant} {...feedbackBase} next={next()} />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
