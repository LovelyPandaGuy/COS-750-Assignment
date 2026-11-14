import { describe, expect, it, vi } from 'vitest';
import type { ReactElement } from 'react';
import { files, read } from '../base/css-helpers';
import { ConfidenceRating } from '../../../src/ui/learn/ConfidenceRating';
import { FeedbackPanel } from '../../../src/ui/learn/FeedbackPanel';
import { FullAnswer } from '../../../src/ui/learn/FullAnswer';
import { LectureQuestionDraft } from '../../../src/ui/learn/LectureQuestionDraft';
import { QuestionItem } from '../../../src/ui/learn/QuestionItem';
import { ScaffoldPanel } from '../../../src/ui/learn/ScaffoldPanel';
import { BUILT, STUBBED } from '../../../src/ui/contracts';
import {
  CORRECT_OPTION,
  choiceQuestion,
  confidenceLevels,
  draftLabels,
  feedbackBase,
  notYetMark,
  numberQuestion,
  questionLabels,
  renderWithRouter,
  scaffoldLabels,
} from './fixtures';

// Spec: revamp-question-and-feedback / ui-question "Question wording comes from props" (D128).

describe('D128 question and feedback wording comes from props', () => {
  it('no file under src/ui/learn imports from src/content', () => {
    const sources = files('src/ui/learn', /\.tsx?$/);
    expect(sources.length).toBeGreaterThan(0);
    for (const p of sources) expect(read(p), p).not.toMatch(/from ['"][./]*\/?content\//);
  });

  // Text a component may add itself: option letters, digits, signs, separators and the fixture glyph.
  const noise = /[\sA-Z0-9+\-−*.,:/]/g;
  const allowed = [
    ...Object.values(questionLabels),
    ...confidenceLevels.map((l) => l.text),
    'Example confidence',
    ...Object.values(feedbackBase).filter((v): v is string => typeof v === 'string'),
    'Example concept',
    'Example next',
    ...Object.values(draftLabels),
    'Example draft',
    scaffoldLabels.region,
    scaffoldLabels.hintText,
    ...Object.values(scaffoldLabels.state),
    'Example rung',
    'Example body',
    'Example stem',
    'Option one',
    'Option two',
    'Option three',
    'Option four',
    'Example show',
    'Example explanation',
  ].sort((a, b) => b.length - a.length);
  const leftover = (text: string) => allowed.reduce((t, a) => t.split(a).join(' '), text).replace(noise, '');

  const cases: [string, ReactElement][] = [
    [
      'QuestionItem, choice at the cap',
      <QuestionItem question={choiceQuestion()} response={{ kind: 'option', id: 'opt-b' }} onResponse={vi.fn()} disabled mark={notYetMark} revealCorrect={CORRECT_OPTION} labels={questionLabels} />,
    ],
    [
      'QuestionItem, stepper',
      <QuestionItem question={numberQuestion()} response={null} onResponse={vi.fn()} disabled={false} labels={questionLabels} range={{ min: -3, max: 3, step: 1 }} />,
    ],
    ['ConfidenceRating', <ConfidenceRating value="two" onChange={vi.fn()} label="Example confidence" levels={confidenceLevels} />],
    ['FeedbackPanel', <FeedbackPanel variant="cap" {...feedbackBase} next={{ label: 'Example next', onClick: vi.fn() }} />],
    [
      'FullAnswer',
      <FullAnswer answer={{ kind: 'value', value: 2 }} explanation="Example explanation" labels={{ show: 'Example show', treeAnswer: 'Example show' }} />,
    ],
    ['LectureQuestionDraft', <LectureQuestionDraft text="Example draft" added onAdd={vi.fn()} onChange={vi.fn()} onDecline={vi.fn()} labels={draftLabels} />],
    [
      'ScaffoldPanel',
      <ScaffoldPanel
        rungs={[{ kind: 'nudge', state: 'open', title: 'Example rung', body: <p>Example body</p> }]}
        hintsLeft={1}
        onHint={vi.fn()}
        labels={scaffoldLabels}
      />,
    ],
  ];

  it.each(cases)('%s shows no words but the fixtures', (_name, ui) => {
    const { container } = renderWithRouter(ui);
    expect(leftover(container.textContent ?? '')).toBe('');
  });

  it('the five built names left STUBBED (D128; FeedbackPanel since the merge with main)', () => {
    for (const n of ['QuestionItem', 'ConfidenceRating', 'FullAnswer', 'LectureQuestionDraft', 'FeedbackPanel']) {
      expect(BUILT).toContain(n);
      expect(STUBBED).not.toContain(n);
    }
  });
});
