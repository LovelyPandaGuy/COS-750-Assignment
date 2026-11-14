// Neutral fixtures for the learn components (revamp-question-and-feedback). No student wording: every
// string says "Example" so a test can tell fixture text from anything a component adds itself.
import type { ReactElement } from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { Instance, Mark, Option } from '../../../src/assessment/types';
import type { Tree } from '../../../src/engine/tree';
import { build } from '../../engine/helpers';

export const threeNodes: Tree = build([20, 10, 30]);

const opt = (id: string, text: string, correct = false): Option => ({ id, value: id, text, correct, explanation: `Example explanation ${id}` });

export function choiceInstance(overrides: Partial<Instance> = {}): Instance {
  return {
    itemId: 'example-choice',
    seed: 1,
    attempt: 0,
    variant: 1,
    type: 'choice',
    stem: 'Example stem',
    facts: { tree: null, keys: [], values: {} },
    signature: 'example',
    answer: 'opt-c',
    options: [opt('opt-a', 'Option one'), opt('opt-b', 'Option two'), opt('opt-c', 'Option three', true), opt('opt-d', 'Option four')],
    correctExplanation: 'Example correct explanation',
    numbers: [],
    ...overrides,
  };
}

export function numberInstance(overrides: Partial<Instance> = {}): Instance {
  return { ...choiceInstance(), itemId: 'example-number', type: 'number', answer: 2, options: undefined, ...overrides };
}

export function treeInstance(): Instance {
  return { ...choiceInstance(), itemId: 'example-tree', type: 'tree', answer: threeNodes, options: undefined };
}

export const correctMark: Mark = { status: 'correct', explanation: 'Example why' };
export const notYetMark: Mark = { status: 'not-yet', explanation: 'Example why' };

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
