import { fireEvent, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { describe, expect, it } from 'vitest';
import { ActivityList } from '../../../src/ui/progress/ActivityList';
import { HubView } from '../../../src/ui/progress/HubView';
import { LectureQuestionsCard } from '../../../src/ui/progress/LectureQuestionsCard';
import { LessonMenu } from '../../../src/ui/progress/LessonMenu';
import { ProgressMap } from '../../../src/ui/progress/ProgressMap';
import { SandboxCard } from '../../../src/ui/progress/SandboxCard';
import type { LessonState } from '../../../src/ui/progress/types';
import { read, rule, stripComments } from '../base/css-helpers';
import { IDS, MIXED, at, lessons, mapProps, phaseLabels, renderAt, stateLabels, textNodes } from './fixtures';

// Spec: revamp-progress-and-hub / ui-progress "Lesson states are shown by word, symbol and border",
// "Done is neutral ink, apart from mastery", "Locked lessons say why, in text", "Hub screen".
// Wireframe 1e notes 1, 3 and 4; design system ProgressMap; D11, D25, D27.

const css = () => stripComments(read('src/ui/progress/progress.css'));
const STATES: LessonState[] = ['done', 'current', 'open', 'locked'];
const item = (root: HTMLElement, id: string) => root.querySelector<HTMLElement>(`[data-lesson="${id}"]`)!;

const phases = [
  { id: 'problem', title: 'Example Problem', state: 'done' as const },
  { id: 'learn', title: 'Example Learn', state: 'next' as const },
  { id: 'check', title: 'Example Check', state: 'to-do' as const },
];

function hub(states: LessonState[] = MIXED, sandboxSuggestion?: string) {
  const list = lessons(states);
  const current = list.find((l) => l.state === 'current') ?? list[8];
  return renderAt(
    <HubView
      heading="Example your path"
      map={mapProps(list)}
      current={{
        card: { id: current.id, title: current.title, goal: 'Example goal', time: 'Example about 6 min', state: current.state, labels: stateLabels },
        activities: { label: 'Example phases', phases, labels: phaseLabels },
        continueLabel: 'Example continue',
        continueHref: `/module/${current.id}`,
      }}
      sandbox={{ title: 'Example sandbox', text: 'Example try your own keys', suggestion: sandboxSuggestion, openLabel: 'Example open sandbox', href: '/sandbox' }}
      lectureQuestions={{ title: 'Example lecture questions', text: 'Example: 2 questions saved', count: 2, linkLabel: 'Example view list', href: '/readiness' }}
    />,
  );
}

describe('FR-LRN-03 D25 each state has a word, symbol and border', () => {
  it('map items carry their state word and symbol in text, and data-state', () => {
    const { container } = renderAt(<ProgressMap {...mapProps()} />);
    MIXED.forEach((state, i) => {
      const el = item(container, IDS[i]);
      expect(el).toHaveAttribute('data-state', state);
      expect(el).toHaveTextContent(stateLabels.words[state]);
      expect(el).toHaveTextContent(stateLabels.symbols[state]);
    });
  });

  it('the stylesheet gives the four states four different borders', () => {
    const bodies = STATES.map((s) => rule(css(), `.progress-item[data-state='${s}']`).replace(/\s+/g, ' ').trim());
    for (const b of bodies) expect(b).toMatch(/border/);
    expect(new Set(bodies).size).toBe(4);
    expect(bodies[0]).toMatch(/solid/);
    expect(bodies[2]).toMatch(/dashed/);
    expect(bodies[3]).toMatch(/dotted/);
  });

  it('the current item has aria-current="step" inside a labelled nav', () => {
    renderAt(<ProgressMap {...mapProps()} />);
    const nav = screen.getByRole('navigation', { name: 'Example your path' });
    const current = within(nav).getAllByRole('link').filter((l) => l.getAttribute('aria-current') === 'step');
    expect(current).toHaveLength(1);
    expect(current[0]).toHaveTextContent('Example title C3');
  });

  it('the last item links to the summary', () => {
    renderAt(<ProgressMap {...mapProps()} />);
    expect(screen.getByRole('link', { name: /Example summary/ })).toHaveAttribute('href', '/readiness');
  });

  it('optional C7 shows the optional word in the map and the menu', async () => {
    const { container } = renderAt(
      <>
        <ProgressMap {...mapProps()} />
        <LessonMenu buttonLabel="Example lessons" panelLabel="Example all lessons" lessons={lessons(MIXED)} labels={stateLabels} />
      </>,
    );
    await userEvent.setup().click(screen.getByRole('button', { name: 'Example lessons' }));
    const c7s = container.querySelectorAll('[data-lesson="C7"]');
    expect(c7s).toHaveLength(2);
    for (const c of c7s) expect(c).toHaveTextContent('Example optional');
  });

  it('either navigation rule: each item is exactly the state given', () => {
    const d20 = at(2, 'open');
    const id82 = at(2, 'locked');
    for (const states of [d20, id82]) {
      const { container, unmount } = renderAt(<ProgressMap {...mapProps(lessons(states))} />);
      states.forEach((s, i) => expect(item(container, IDS[i])).toHaveAttribute('data-state', s));
      unmount();
    }
  });
});

describe('design system ProgressMap: done is neutral ink, apart from mastery', () => {
  it('the stylesheet uses no mastery token', () => {
    expect(css()).not.toMatch(/--mastery-/);
  });

  it('the badge is a separate element, only where given', () => {
    const list = lessons(MIXED, (i) => (i === 0 ? { mastery: 'secure' } : {}));
    const { container } = renderAt(<ProgressMap {...mapProps(list)} />);
    const c1 = item(container, 'C1').closest('li')!;
    const c2 = item(container, 'C2').closest('li')!;
    const badge = c1.querySelector('.badge');
    expect(badge).not.toBeNull();
    expect(item(container, 'C1').contains(badge)).toBe(false);
    expect(c2.querySelector('.badge')).toBeNull();
  });
});

describe('ID 8.2 FR-LRN-04 locked lessons say why, in text', () => {
  it('a locked item is focusable, aria-disabled, and described by its visible reason', () => {
    const { container } = renderAt(<ProgressMap {...mapProps()} />);
    const c5 = item(container, 'C5');
    expect(c5).toHaveAttribute('aria-disabled', 'true');
    expect(c5).toHaveAttribute('tabindex', '0');
    expect(c5).not.toHaveAttribute('href');
    expect(c5).toHaveAccessibleDescription('Example: opens when C4 is done');
    expect(screen.getByText('Example: opens when C4 is done')).toBeVisible();
  });

  it('clicking or pressing Enter on it does not navigate', async () => {
    const { container } = renderAt(<ProgressMap {...mapProps()} />, '/path');
    const c5 = item(container, 'C5');
    await userEvent.setup().click(c5);
    c5.focus();
    fireEvent.keyDown(c5, { key: 'Enter' });
    expect(screen.getByTestId('where')).toHaveTextContent('/path');
  });

  it('D27 the text and accessible names add none of locked, fail or wrong', () => {
    // Text and ARIA only: `data-state="locked"` is a styling hook the student never sees or hears.
    const { container } = renderAt(<ProgressMap {...mapProps()} />);
    const aria = Array.from(container.querySelectorAll('[aria-label], [title]')).map((e) => `${e.getAttribute('aria-label') ?? ''} ${e.getAttribute('title') ?? ''}`);
    expect([container.textContent, ...aria].join(' ')).not.toMatch(/locked|\bfail|\bwrong/i);
  });

  it('an open lesson navigates', async () => {
    const { container } = renderAt(<ProgressMap {...mapProps()} />, '/path');
    await userEvent.setup().click(item(container, 'C4'));
    expect(screen.getByTestId('where')).toHaveTextContent('/module/C4');
  });
});

describe('FR-LRN-05 FR-MOT-04 hub screen', () => {
  it('the UnitCard names the current lesson with goal and time, and there is one primary action', () => {
    const { container } = hub();
    const card = container.querySelector<HTMLElement>('[data-unit-card]')!;
    for (const t of ['C3', 'Example title C3', 'Example goal', 'Example about 6 min', stateLabels.words.current]) expect(card).toHaveTextContent(t);
    const primaries = Array.from(container.querySelectorAll('a, button')).filter((el) => /primary/.test(el.className));
    expect(primaries).toHaveLength(1);
    expect(primaries[0]).toHaveTextContent('Example continue');
    expect(primaries[0]).toHaveAttribute('href', '/module/C3');
  });

  it('the ActivityList is ordered, with state words, and has no reorder control', () => {
    renderAt(<ActivityList label="Example phases" phases={phases} labels={phaseLabels} />);
    const list = screen.getByRole('list', { name: 'Example phases' });
    expect(list.tagName).toBe('OL');
    const items = within(list).getAllByRole('listitem');
    expect(items.map((li) => li.getAttribute('data-state'))).toEqual(['done', 'next', 'to-do']);
    items.forEach((li, i) => expect(li).toHaveTextContent(phaseLabels.words[phases[i].state]));
    expect(within(list).queryAllByRole('button')).toHaveLength(0);
  });

  it.each([...IDS.map((_, i) => [`current ${IDS[i]}`, at(i)] as const), ['all done', IDS.map(() => 'done' as LessonState)] as const])(
    'FR-VIS-08 D11 the SandboxCard is present: %s',
    (_name, states) => {
      hub([...states]);
      expect(screen.getByRole('link', { name: 'Example open sandbox' })).toHaveAttribute('href', '/sandbox');
    },
  );

  it('the sandbox suggestion line shows only when given', () => {
    const { unmount } = renderAt(<SandboxCard title="Example sandbox" text="Example text" suggestion="Example suggestion" openLabel="Example open" href="/sandbox" />);
    expect(screen.getByText('Example suggestion')).toBeVisible();
    expect(screen.getByRole('link', { name: 'Example open' })).toBeInTheDocument();
    unmount();
    renderAt(<SandboxCard title="Example sandbox" text="Example text" openLabel="Example open" href="/sandbox" />);
    expect(screen.queryByText('Example suggestion')).toBeNull();
    expect(screen.getByRole('link', { name: 'Example open' })).toBeInTheDocument();
  });

  it.each([
    [2, 'Example: 2 questions saved'],
    [0, 'Example: none yet'],
  ])('the LectureQuestionsCard with %i shows its text and a link', (count, text) => {
    renderAt(<LectureQuestionsCard title="Example lecture questions" text={text} count={count} linkLabel="Example view list" href="/readiness" />);
    expect(screen.getByText(text)).toBeVisible();
    expect(screen.getByRole('link', { name: 'Example view list' })).toHaveAttribute('href', '/readiness');
  });

  it('no scores: the markup adds none of the score words', () => {
    const { container } = hub();
    expect(container.textContent).not.toMatch(/score|points|streak|rank|grade|\bpass|\bfail/i);
  });

  it('D18 every text node is a fixture string, an ID or a symbol', () => {
    const { container } = hub();
    const symbols = new Set([...Object.values(stateLabels.symbols), ...Object.values(phaseLabels.symbols)]);
    for (const t of textNodes(container)) {
      expect(/^(Example|C[1-9]$)/.test(t) || symbols.has(t), t).toBe(true);
    }
  });
});

describe('NFR-02 axe', () => {
  it('ProgressMap', async () => {
    const { container } = renderAt(<ProgressMap {...mapProps()} />);
    expect(await axe(container)).toHaveNoViolations();
  });
  it('HubView', async () => {
    const { container } = hub(MIXED, 'Example suggestion');
    expect(await axe(container)).toHaveNoViolations();
  });
});
