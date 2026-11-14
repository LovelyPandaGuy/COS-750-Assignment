// Neutral fixtures for the learn components (revamp-question-and-feedback). No student wording: every
// string says "Example" so a test can tell fixture text from anything a component adds itself.
import type { ReactElement } from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { Mark } from '../../../src/live/mark';
import type { Option, Question } from '../../../src/live/types';
import type { Tree } from '../../../src/engine/tree';
import { build } from '../../engine/helpers';

export const threeNodes: Tree = build([20, 10, 30]);

const opt = (id: string, text: string): Option => ({ id, text, explanation: `Example explanation ${id}` });

/** The engine's correct option in the choice fixture (passed to `revealCorrect` at the cap). */
export const CORRECT_OPTION = 'opt-c';

export function choiceQuestion(overrides: Partial<Question> = {}): Question {
  return {
    id: 'example-choice',
    set: 'example',
    lessonId: 'example',
    type: 'mcq',
    outcomeId: 'example',
    criteria: [],
    subSkill: 'example',
    level: 'apply',
    concept: 'example',
    stem: 'Example stem',
    hint: 'Example hint',
    options: [opt('opt-a', 'Option one'), opt('opt-b', 'Option two'), opt('opt-c', 'Option three'), opt('opt-d', 'Option four')],
    ...overrides,
  };
}

export function numberQuestion(overrides: Partial<Question> = {}): Question {
  return { ...choiceQuestion(), id: 'example-number', type: 'enter-values', options: undefined, ...overrides };
}

export function treeQuestion(): Question {
  return { ...choiceQuestion(), id: 'example-tree', type: 'build-tree', options: undefined };
}

export const correctMark: Mark = { verdict: 'right', reason: 'Example why' };
export const notYetMark: Mark = { verdict: 'not-yet', reason: 'Example why' };

export const questionLabels = {
  choiceLegend: 'Example legend',
  yourAnswer: 'Example your answer',
  correct: 'Example correct',
  notYetGlyph: '*',
  decrease: 'Example decrease',
  increase: 'Example increase',
  value: 'Example value',
  empty: 'Example empty',
};

export const confidenceLevels = [
  { value: 'one', text: 'Level one' },
  { value: 'two', text: 'Level two' },
  { value: 'three', text: 'Level three' },
];

export const feedbackBase = {
  verdict: 'Example verdict',
  why: 'Example why',
  concept: { label: 'Example concept', to: '/example' },
  icon: '*',
};

export const draftLabels = {
  heading: 'Example draft heading',
  note: 'Example draft note',
  field: 'Example draft field',
  add: 'Example add',
  decline: 'Example decline',
  added: 'Example added',
};

export const scaffoldLabels = {
  region: 'Example ladder',
  state: { open: 'Example open', seen: 'Example seen', available: 'Example available', waiting: 'Example waiting' },
  hintText: 'Example hint',
  hint: (left: number) => `Example hint, ${left} left`,
};

/** Render inside a router, for components with a concept link. */
export const renderWithRouter = (ui: ReactElement) => render(<MemoryRouter>{ui}</MemoryRouter>);
