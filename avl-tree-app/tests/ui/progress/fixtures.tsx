// Neutral fixtures for the progress components (revamp-progress-and-hub). Every string says "Example",
// except the D3 intro and module IDs, so a test can tell fixture text from anything a component adds.
import type { ReactElement } from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Where } from './where';
import type { LessonItem, LessonState, PhaseState, StateLabels } from '../../../src/ui/progress/types';

export const IDS = ['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8', 'C9'] as const;

export const stateLabels: StateLabels = {
  words: { done: 'Example done', current: 'Example here', open: 'Example open', locked: 'Example not yet open' },
  symbols: { done: '✓', current: '▶', open: '○', locked: '◌' },
  optional: 'Example optional',
};

export const phaseLabels = {
  words: { done: 'Example phase done', next: 'Example phase next', 'to-do': 'Example phase to do' } as Record<PhaseState, string>,
  symbols: { done: '✓', next: '▶', 'to-do': '○' } as Record<PhaseState, string>,
};

/** Lessons C1 to C9 with the given states; locked ones get "Example: opens when C(n-1) is done". */
export function lessons(states: readonly LessonState[], extra: (i: number) => Partial<LessonItem> = () => ({})): LessonItem[] {
  return IDS.map((id, i) => {
    const title = `Example title ${id}`;
    const state = states[i];
    const base = state === 'locked'
      ? { id, title, state, reason: `Example: opens when ${IDS[i - 1] ?? 'C1'} is done` }
      : { id, title, state, href: `/module/${id}` };
    return { ...base, ...(id === 'C7' ? { optional: true } : {}), ...extra(i) } as LessonItem;
  });
}

/** C1, C2 done, C3 current, C4 open, C5 to C9 locked. */
export const MIXED: LessonState[] = ['done', 'done', 'current', 'open', 'locked', 'locked', 'locked', 'locked', 'locked'];

/** The current lesson at index `at`; earlier done, later per `rest`. */
export function at(index: number, rest: LessonState = 'locked'): LessonState[] {
  return IDS.map((_, i) => (i < index ? 'done' : i === index ? 'current' : rest));
}

export const mapProps = (list: LessonItem[] = lessons(MIXED)) => ({
  label: 'Example your path',
  lessons: list,
  labels: stateLabels,
  summary: { label: 'Example summary', href: '/readiness' },
});

export const D3_INTRO = 'About an hour, in nine short lessons you can stop and pick up again.';

export const startPanel = {
  heading: 'Example heading',
  intro: D3_INTRO,
  points: ['Example point one', 'Example point two'],
  startLabel: 'Example start',
};

export const dialog = {
  title: 'Example delete saved progress?',
  body: "Example: your answers and lecture questions will be removed. This can't be undone.",
  cancelLabel: 'Example cancel',
  confirmLabel: 'Example reset',
};

export function renderAt(ui: ReactElement, path = '/') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="*" element={<>{ui}<Where /></>} />
      </Routes>
    </MemoryRouter>,
  );
}

/** Every visible text node in the container, trimmed and non-empty. */
export function textNodes(root: Element): string[] {
  const out: string[] = [];
  const walk = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  for (let n = walk.nextNode(); n; n = walk.nextNode()) {
    const t = (n.textContent ?? '').trim();
    if (t && !n.parentElement?.closest('[data-testid="where"]')) out.push(t);
  }
  return out;
}
