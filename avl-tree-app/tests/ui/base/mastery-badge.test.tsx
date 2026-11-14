import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { describe, expect, it } from 'vitest';
import * as content from '../../../src/content/base';
import { baseCopy } from '../../../src/content/base';
import { MasteryBadge } from '../../../src/ui/base';
import { baseCss, read, rule } from './css-helpers';

// Spec: add-ui-foundation / ui-foundation "MasteryBadge". Requirement IDs: NFR-02, D25, D27; design principle 4.

const STATES = ['secure', 'developing', 'not-yet'] as const;
const FILL = { secure: 'full', developing: 'half', 'not-yet': 'empty' } as const;

describe('NFR-02 D25 word and fill per state', () => {
  it.each(STATES)('%s shows its word and a hidden icon with its fill', (state) => {
    const { container } = render(<MasteryBadge state={state} />);
    const badge = container.firstElementChild as HTMLElement;
    expect(badge).toHaveClass('badge', `badge-${state}`);
    expect(screen.getByText(baseCopy.mastery[state])).toBeVisible();
    const icon = badge.querySelector('svg')!;
    expect(icon).toHaveAttribute('data-fill', FILL[state]);
    expect(icon).toHaveAttribute('aria-hidden', 'true');
    expect(rule(baseCss(), `.badge-${state}`)).toContain(`var(--mastery-${state.replace('-', '')}`);
  });
  it('compact keeps the word as visible text', () => {
    const { container } = render(<MasteryBadge state="secure" compact />);
    expect(container.firstElementChild).toHaveClass('badge-compact');
    const word = screen.getByText(baseCopy.mastery.secure);
    expect(word).toBeVisible();
    expect(word.className).not.toMatch(/sr|hidden/);
  });
});

describe('principle 4: change against the student\'s own last try', () => {
  it('developing after not yet: before word, hidden arrow, now word, since phrase; announced in words', () => {
    const { container } = render(<MasteryBadge state="developing" before="not-yet" />);
    const change = container.querySelector('.badge-change')!;
    const visible = change.querySelector('[aria-hidden="true"]')!;
    expect(visible.textContent!.replace(/\s/g, '')).toBe(
      `${baseCopy.mastery['not-yet']}→${baseCopy.mastery.developing}${baseCopy.sinceLastTry}`.replace(/\s/g, ''),
    );
    expect(screen.getByText(baseCopy.change('not-yet', 'developing'))).toBeInTheDocument();
  });
  it('no change line when the state is the same, or no earlier state', () => {
    const same = render(<MasteryBadge state="secure" before="secure" />);
    expect(same.container.querySelector('.badge-change')).toBeNull();
    same.unmount();
    const none = render(<MasteryBadge state="secure" />);
    expect(none.container.querySelector('.badge-change')).toBeNull();
  });
});

describe('D27 wording is calm and from content', () => {
  it('lives in src/content, is flagged beyond ID, and has no judging words', () => {
    expect(content.BASE_SOURCE).toBe('beyond ID');
    const text = JSON.stringify(baseCopy) + baseCopy.change('not-yet', 'developing');
    expect(text).not.toMatch(/\b(fail\w*|wrong|score|rank|average)\b/i);
    const src = read('src/ui/base/MasteryBadge.tsx');
    expect(src).not.toMatch(/'(Secure|Developing|Not yet)'/);
  });
});

describe('NFR-02 MasteryBadge axe', () => {
  it('every state, with and without a change, has no violations', async () => {
    const { container } = render(
      <div>
        {STATES.map((s) => (
          <MasteryBadge key={s} state={s} />
        ))}
        <MasteryBadge state="developing" before="not-yet" />
        <MasteryBadge state="secure" before="developing" compact />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
