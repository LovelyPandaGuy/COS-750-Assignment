import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';
import { LectureQuestionDraft } from '../../../src/ui/learn/LectureQuestionDraft';
import { draftLabels } from './fixtures';

// Spec: revamp-question-and-feedback / ui-feedback "LectureQuestionDraft". (FR-SCA-03, FR-RDY-02)

type Props = Parameters<typeof LectureQuestionDraft>[0];
const base = (over: Partial<Props> = {}): Props => ({
  text: 'Example draft',
  added: false,
  onAdd: vi.fn(),
  onChange: vi.fn(),
  onDecline: vi.fn(),
  labels: draftLabels,
  ...over,
});

describe('FR-SCA-03 FR-RDY-02 LectureQuestionDraft', () => {
  it('heading, note, an editable field holding the text, Add (primary) and No thanks (quiet)', () => {
    render(<LectureQuestionDraft {...base()} />);
    expect(screen.getByRole('heading', { name: draftLabels.heading })).toBeInTheDocument();
    expect(screen.getByText(draftLabels.note)).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: draftLabels.field })).toHaveValue('Example draft');
    expect(screen.getByRole('button', { name: draftLabels.add }).className).toMatch(/primary/);
    expect(screen.getByRole('button', { name: draftLabels.decline }).className).toMatch(/quiet/);
  });

  it('editing calls onChange; Add calls onAdd once; nothing is stored', async () => {
    const user = userEvent.setup();
    const p = base();
    const setItem = vi.spyOn(Storage.prototype, 'setItem');
    render(<LectureQuestionDraft {...p} />);
    await user.type(screen.getByRole('textbox'), '!');
    expect(p.onChange).toHaveBeenLastCalledWith('Example draft!');
    await user.click(screen.getByRole('button', { name: draftLabels.add }));
    expect(p.onAdd).toHaveBeenCalledTimes(1);
    expect(setItem).not.toHaveBeenCalled();
    setItem.mockRestore();
  });

  it('No thanks calls onDecline', async () => {
    const p = base();
    render(<LectureQuestionDraft {...p} />);
    await userEvent.setup().click(screen.getByRole('button', { name: draftLabels.decline }));
    expect(p.onDecline).toHaveBeenCalledTimes(1);
  });

  it('added: the status shows the added label and Add is disabled', () => {
    const { rerender } = render(<LectureQuestionDraft {...base()} />);
    expect(screen.getByRole('status')).toHaveTextContent('');
    rerender(<LectureQuestionDraft {...base({ added: true })} />);
    expect(screen.getByRole('status')).toHaveTextContent(draftLabels.added);
    expect(screen.getByRole('button', { name: draftLabels.add })).toBeDisabled();
  });

  it.each([false, true])('axe clean, added %s', async (added) => {
    const { container } = render(<LectureQuestionDraft {...base({ added })} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
