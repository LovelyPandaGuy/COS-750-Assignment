import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';
import { ConfidenceFlags } from '../../../src/ui/readiness/ConfidenceFlags';
import { LectureQuestionsList } from '../../../src/ui/readiness/LectureQuestionsList';
import { ReadinessSummary } from '../../../src/ui/readiness/ReadinessSummary';
import { questionLabels, summary } from './fixtures';

// Spec: revamp-readiness / ui-readiness "Confidence flags are calm", "Lecture questions can be edited, with
// an empty state", "Summary at three widths" (keyboard), "Accessible". Frame 1o notes 2 and 3; ID 9.2; D27.

const wrap = (ui: React.ReactElement) => render(<MemoryRouter>{ui}</MemoryRouter>);
const flags = summary().flags;

describe('ID 9.2 D27 confidence flags are calm', () => {
  it('two flags with ID, text and link; the symbol is text; nothing reads wrong or fail', () => {
    const { container } = wrap(<ConfidenceFlags {...flags} />);
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent('LO2');
    expect(items[0]).toHaveTextContent('Example: you were sure, worth a second look');
    expect(within(items[0]).getByRole('link', { name: 'Example look again' })).toHaveAttribute('href', '/module/C3');
    expect(items[1]).toHaveTextContent('LO4');
    expect(container).toHaveTextContent('⚑');
    expect(container.textContent).not.toMatch(/\bwrong|\bfail/i);
  });

  it('no flags: no element', () => {
    const { container } = wrap(<ConfidenceFlags {...flags} items={[]} />);
    expect(container.children).toHaveLength(0);
  });
});

function list(onEdit = vi.fn(), onRemove = vi.fn()) {
  wrap(
    <LectureQuestionsList
      questions={[
        { id: 's1', text: 'Example question one', editable: true },
        { id: 'o1', text: 'Example question two', editable: true, removable: true },
      ]}
      labels={questionLabels}
      onEdit={onEdit}
      onRemove={onRemove}
    />,
  );
  return { onEdit, onRemove, user: userEvent.setup(), item: (i: number) => screen.getAllByRole('listitem')[i] };
}

describe('FR-RDY-02 lecture questions can be edited, with an empty state', () => {
  it('edit and save calls onEdit with the new text and returns focus to Edit', async () => {
    const { onEdit, user, item } = list();
    await user.click(within(item(0)).getByRole('button', { name: /Example edit/ }));
    const field = screen.getByRole('textbox', { name: /Example your question/ });
    expect(field).toHaveValue('Example question one');
    await user.clear(field);
    await user.type(field, 'Example new');
    await user.click(screen.getByRole('button', { name: 'Example save' }));
    expect(onEdit).toHaveBeenCalledExactlyOnceWith('s1', 'Example new');
    expect(within(item(0)).getByRole('button', { name: /Example edit/ })).toHaveFocus();
  });

  it('cancel keeps the old text and does not call onEdit', async () => {
    const { onEdit, user, item } = list();
    await user.click(within(item(0)).getByRole('button', { name: /Example edit/ }));
    await user.type(screen.getByRole('textbox'), ' more');
    await user.click(screen.getByRole('button', { name: 'Example cancel' }));
    expect(onEdit).not.toHaveBeenCalled();
    expect(item(0)).toHaveTextContent('Example question one');
    expect(screen.queryByRole('textbox')).toBeNull();
  });

  it('remove only where allowed', async () => {
    const { onRemove, user, item } = list();
    expect(within(item(0)).queryByRole('button', { name: /Example remove/ })).toBeNull();
    await user.click(within(item(1)).getByRole('button', { name: /Example remove/ }));
    expect(onRemove).toHaveBeenCalledExactlyOnceWith('o1');
  });

  it('a question not marked editable has no Edit', () => {
    wrap(<LectureQuestionsList questions={[{ id: 's1', text: 'Example question one' }]} labels={questionLabels} onEdit={vi.fn()} onRemove={vi.fn()} />);
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('empty state: the given text and no list', () => {
    wrap(<LectureQuestionsList questions={[]} labels={questionLabels} onEdit={vi.fn()} onRemove={vi.fn()} />);
    expect(screen.getByText('Example: nothing to bring this time')).toBeInTheDocument();
    expect(screen.queryByRole('list')).toBeNull();
  });
});

describe('NFR-02 FR-VIS-10 keyboard and axe', () => {
  it('Tab reaches every review link, flag link, Edit, Remove, Print, Copy and Save in reading order', async () => {
    wrap(<ReadinessSummary {...summary()} />);
    const user = userEvent.setup();
    const names: string[] = [];
    for (let i = 0; i < 20; i++) {
      await user.tab();
      const el = document.activeElement as HTMLElement;
      if (el === document.body) break;
      names.push(el.textContent?.trim() ?? '');
    }
    const firstIndex = (n: string) => names.findIndex((x) => x.includes(n));
    expect(names.filter((n) => n.includes('Example review'))).toHaveLength(7);
    expect(names.filter((n) => n.includes('Example look again'))).toHaveLength(2);
    for (const n of ['Example edit', 'Example remove', 'Example print', 'Example copy', 'Example save file']) expect(firstIndex(n), n).toBeGreaterThan(-1);
    expect(firstIndex('Example review')).toBeLessThan(firstIndex('Example look again'));
    expect(firstIndex('Example look again')).toBeLessThan(firstIndex('Example edit'));
    expect(firstIndex('Example edit')).toBeLessThan(firstIndex('Example print'));
  });

  it('axe with one question being edited', async () => {
    const { container } = wrap(<ReadinessSummary {...summary()} />);
    await userEvent.setup().click(within(screen.getAllByRole('listitem').find((li) => li.textContent?.includes('Example question two'))!).getByRole('button', { name: /Example edit/ }));
    expect(await axe(container)).toHaveNoViolations();
  });
});
