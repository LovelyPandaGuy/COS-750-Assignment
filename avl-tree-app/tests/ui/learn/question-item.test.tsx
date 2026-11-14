import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';
import { QuestionItem } from '../../../src/ui/learn/QuestionItem';
import type { Response } from '../../../src/live/mark';
import { CORRECT_OPTION, choiceQuestion, correctMark, notYetMark, numberQuestion, questionLabels, threeNodes, treeQuestion } from './fixtures';

// Spec: revamp-question-and-feedback / ui-question.

type Props = Parameters<typeof QuestionItem>[0];
const base = (over: Partial<Props> = {}): Props => ({
  question: choiceQuestion(),
  response: null,
  onResponse: vi.fn(),
  disabled: false,
  labels: questionLabels,
  ...over,
});
const radios = () => screen.getAllByRole('radio');
const optionOf = (text: string) => screen.getByRole('radio', { name: new RegExp(text) }).closest('[data-option]') as HTMLElement;

describe('FR-ASM-01 QuestionItem shows what it is given', () => {
  it('stem first, a read-only tree, then the options in the order given', () => {
    const inst = choiceQuestion();
    inst.options = [...inst.options!].reverse();
    const { container } = render(<QuestionItem {...base({ question: inst, tree: { tree: threeNodes, label: 'Example tree' } })} />);
    const text = container.textContent ?? '';
    expect(text.indexOf('Example stem')).toBeLessThan(text.indexOf('Option four'));
    expect(screen.getByRole('img', { name: 'Example tree' })).toBeInTheDocument();
    expect(radios().map((r) => r.getAttribute('value'))).toEqual(['opt-d', 'opt-c', 'opt-b', 'opt-a']);
  });

  it('the editor slot replaces the answer input', () => {
    render(<QuestionItem {...base({ question: treeQuestion(), editor: <div data-testid="editor-slot" /> })} />);
    expect(screen.getByTestId('editor-slot')).toBeInTheDocument();
    expect(screen.queryByRole('radiogroup')).toBeNull();
    expect(screen.queryAllByRole('radio')).toHaveLength(0);
    expect(screen.queryByRole('spinbutton')).toBeNull();
  });

  it('marks nothing itself: no response and no mark means no option is checked or tagged', () => {
    render(<QuestionItem {...base()} />);
    for (const r of radios()) expect(r).not.toBeChecked();
    expect(screen.queryByText(questionLabels.yourAnswer)).toBeNull();
    expect(screen.queryByText(questionLabels.correct)).toBeNull();
  });
});

describe('FR-ASM-01 FR-VIS-10 choice answers are a lettered radio group', () => {
  it('is a radio group named by the legend; each option name starts with its letter', () => {
    render(<QuestionItem {...base()} />);
    expect(screen.getByRole('group', { name: questionLabels.choiceLegend })).toBeInTheDocument();
    radios().forEach((r, i) => expect(r).toHaveAccessibleName(new RegExp(`^${'ABCD'[i]}\\b`)));
  });

  it('picks by click, by arrow and by letter inside the group', async () => {
    const user = userEvent.setup();
    const onResponse = vi.fn<(r: Response) => void>();
    const { rerender } = render(<QuestionItem {...base({ onResponse })} />);
    await user.click(radios()[1]);
    rerender(<QuestionItem {...base({ onResponse, response: { kind: 'option', id: 'opt-b' } })} />);
    await user.keyboard('{ArrowDown}');
    rerender(<QuestionItem {...base({ onResponse, response: { kind: 'option', id: 'opt-c' } })} />);
    await user.keyboard('a');
    expect(onResponse.mock.calls.map((c) => c[0])).toEqual([{ kind: 'option', id: 'opt-b' }, { kind: 'option', id: 'opt-c' }, { kind: 'option', id: 'opt-a' }]);
  });

  it('letters do nothing outside the group', async () => {
    const user = userEvent.setup();
    const onResponse = vi.fn();
    render(
      <>
        <button type="button">Example outside</button>
        <QuestionItem {...base({ onResponse })} />
      </>,
    );
    screen.getByRole('button', { name: 'Example outside' }).focus();
    await user.keyboard('b');
    expect(onResponse).not.toHaveBeenCalled();
  });
});

describe('FR-ASM-01 FR-VIS-10 compute-a-value answers are a stepper', () => {
  const stepperProps = (over: Partial<Props> = {}) => base({ question: numberQuestion(), range: { min: -3, max: 3, step: 1 }, ...over });

  it('minus, a spin button and plus, named by the labels, and no text input', () => {
    render(<QuestionItem {...stepperProps()} />);
    expect(screen.getByRole('button', { name: questionLabels.decrease })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: questionLabels.increase })).toBeInTheDocument();
    expect(screen.getByRole('spinbutton', { name: questionLabels.value })).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).toBeNull();
    expect(document.querySelector('input:not([type="radio"])')).toBeNull();
  });

  it('steps within the range as signed strings, buttons and arrows alike', async () => {
    const user = userEvent.setup();
    const onResponse = vi.fn<(r: Response) => void>();
    const { rerender } = render(<QuestionItem {...stepperProps({ onResponse })} />);
    const plus = () => screen.getByRole('button', { name: questionLabels.increase });
    await user.click(plus());
    rerender(<QuestionItem {...stepperProps({ onResponse, response: { kind: 'values', values: [0] } })} />);
    await user.click(plus());
    rerender(<QuestionItem {...stepperProps({ onResponse, response: { kind: 'values', values: [1] } })} />);
    await user.click(plus());
    rerender(<QuestionItem {...stepperProps({ onResponse, response: { kind: 'values', values: [2] } })} />);
    screen.getByRole('spinbutton').focus();
    await user.keyboard('{ArrowDown}');
    expect(onResponse.mock.calls.map((c) => c[0])).toEqual([{ kind: 'values', values: [0] }, { kind: 'values', values: [1] }, { kind: 'values', values: [2] }, { kind: 'values', values: [1] }]);
  });

  it('shows the empty label until a value exists, and the value as signed text after', () => {
    const { rerender } = render(<QuestionItem {...stepperProps()} />);
    expect(screen.getByRole('spinbutton')).toHaveTextContent(questionLabels.empty);
    rerender(<QuestionItem {...stepperProps({ response: { kind: 'values', values: [-2] } })} />);
    expect(screen.getByRole('spinbutton')).toHaveAttribute('aria-valuenow', '-2');
    expect(screen.getByRole('spinbutton')).toHaveTextContent(/[-−]2/);
  });

  it('first press goes to the in-range value nearest 0', async () => {
    const user = userEvent.setup();
    const onResponse = vi.fn();
    render(<QuestionItem {...base({ question: numberQuestion(), range: { min: 1, max: 5, step: 1 }, onResponse })} />);
    await user.click(screen.getByRole('button', { name: questionLabels.decrease }));
    expect(onResponse).toHaveBeenCalledWith({ kind: 'values', values: [1] });
  });

  it('disables each button at its end of the range', () => {
    render(<QuestionItem {...stepperProps({ response: { kind: 'values', values: [3] } })} />);
    expect(screen.getByRole('button', { name: questionLabels.increase })).toBeDisabled();
    expect(screen.getByRole('button', { name: questionLabels.decrease })).toBeEnabled();
  });
});

describe('FR-ASM-03 NFR-02 D27 QuestionItem states', () => {
  it('selected: the chosen option is checked and marked selected', () => {
    render(<QuestionItem {...base({ response: { kind: 'option', id: 'opt-b' } })} />);
    expect(radios()[1]).toBeChecked();
    expect(optionOf('Option two')).toHaveAttribute('data-state', 'selected');
  });

  it('locked after submit: nothing responds', async () => {
    const user = userEvent.setup();
    const onResponse = vi.fn();
    const { unmount } = render(<QuestionItem {...base({ disabled: true, onResponse })} />);
    for (const r of radios()) expect(r).toBeDisabled();
    await user.click(radios()[0]);
    unmount();
    render(<QuestionItem {...base({ question: numberQuestion(), disabled: true, onResponse, range: { min: -3, max: 3, step: 1 } })} />);
    expect(screen.getByRole('button', { name: questionLabels.increase })).toBeDisabled();
    expect(screen.getByRole('button', { name: questionLabels.decrease })).toBeDisabled();
    const spin = screen.getByRole('spinbutton');
    expect(spin.getAttribute('aria-disabled') === 'true' || spin.getAttribute('aria-readonly') === 'true').toBe(true);
    spin.focus();
    await user.keyboard('{ArrowUp}');
    expect(onResponse).not.toHaveBeenCalled();
  });

  it('a correct submission: "your answer" and the correct state on the chosen option', () => {
    render(<QuestionItem {...base({ disabled: true, response: { kind: 'option', id: 'opt-c' }, mark: correctMark })} />);
    const chosen = optionOf('Option three');
    expect(within(chosen).getByText(questionLabels.yourAnswer)).toBeInTheDocument();
    expect(chosen).toHaveAttribute('data-state', 'correct');
  });

  it('a stepper submission shows the value and "your answer"', () => {
    render(<QuestionItem {...base({ question: numberQuestion(), disabled: true, response: { kind: 'values', values: [-2] }, mark: notYetMark, range: { min: -3, max: 3, step: 1 } })} />);
    expect(screen.getByText(questionLabels.yourAnswer)).toBeInTheDocument();
  });
});

describe('FR-ASM-07 FR-SCA-03 D130 correct option revealed only at the cap', () => {
  const missed = (reveal: boolean) => base({ disabled: true, response: { kind: 'option', id: 'opt-b' }, mark: notYetMark, revealCorrect: reveal ? CORRECT_OPTION : undefined });

  it('first miss does not reveal the answer', () => {
    const { container } = render(<QuestionItem {...missed(false)} />);
    const chosen = optionOf('Option two');
    expect(within(chosen).getByText(questionLabels.yourAnswer)).toBeInTheDocument();
    expect(chosen).toHaveAttribute('data-state', 'not-yet');
    expect(screen.queryByText(questionLabels.correct)).toBeNull();
    expect(container.querySelector('[data-state="correct"]')).toBeNull();
    expect(container.textContent).not.toMatch(/[✗✕❌✘]/);
    expect(container.innerHTML).not.toMatch(/red/i);
  });

  it('at the cap the correct option is marked and "your answer" stays', () => {
    render(<QuestionItem {...missed(true)} />);
    const correct = optionOf('Option three');
    expect(within(correct).getByText(questionLabels.correct)).toBeInTheDocument();
    expect(correct).toHaveAttribute('data-state', 'correct');
    expect(within(optionOf('Option two')).getByText(questionLabels.yourAnswer)).toBeInTheDocument();
  });
});

describe('FR-VIS-10 NFR-02 Try again returns focus to the first input', () => {
  it('moves focus to the first radio when disabled turns false', () => {
    const { rerender } = render(<QuestionItem {...base({ disabled: true, response: { kind: 'option', id: 'opt-b' }, mark: notYetMark })} />);
    rerender(<QuestionItem {...base({ question: choiceQuestion({ id: 'example-choice-2' }) })} />);
    expect(radios()[0]).toHaveFocus();
  });

  it('moves focus to the minus button for a stepper', () => {
    const p = { question: numberQuestion(), range: { min: -3, max: 3, step: 1 } };
    const { rerender } = render(<QuestionItem {...base({ ...p, disabled: true })} />);
    rerender(<QuestionItem {...base({ ...p, question: numberQuestion({ id: 'example-number-2' }) })} />);
    expect(screen.getByRole('button', { name: questionLabels.decrease })).toHaveFocus();
  });

  it('takes no focus on mount', () => {
    render(<QuestionItem {...base()} />);
    expect(document.body).toHaveFocus();
  });
});

describe('NFR-02 axe in every state', () => {
  const states: [string, Partial<Props>][] = [
    ['default', {}],
    ['selected', { response: { kind: 'option', id: 'opt-b' } }],
    ['disabled', { disabled: true }],
    ['submitted correct', { disabled: true, response: { kind: 'option', id: 'opt-c' }, mark: correctMark }],
    ['submitted not quite yet', { disabled: true, response: { kind: 'option', id: 'opt-b' }, mark: notYetMark }],
    ['revealed at the cap', { disabled: true, response: { kind: 'option', id: 'opt-b' }, mark: notYetMark, revealCorrect: CORRECT_OPTION }],
    ['stepper empty', { question: numberQuestion(), range: { min: -3, max: 3, step: 1 } }],
    ['stepper submitted', { question: numberQuestion(), range: { min: -3, max: 3, step: 1 }, response: { kind: 'values', values: [1] }, disabled: true, mark: notYetMark }],
    ['with tree', { tree: { tree: threeNodes, label: 'Example tree' } }],
  ];
  it.each(states)('%s', async (_name, over) => {
    const { container } = render(<QuestionItem {...base(over)} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
