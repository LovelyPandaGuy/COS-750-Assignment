import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { axe } from 'vitest-axe';
import { describe, expect, it } from 'vitest';
import { baseCopy } from '../../../src/content/base';
import { OutcomeStatusTable } from '../../../src/ui/readiness/OutcomeStatusTable';
import { ReadinessSummary } from '../../../src/ui/readiness/ReadinessSummary';
import { read, rule, stripComments } from '../base/css-helpers';
import { LO, columns, rows, statusLabels, summary } from './fixtures';

// Spec: revamp-readiness / ui-readiness "Every objective row is complete", "Status by word, symbol and
// border", "Headline follows the given overall result", "Listen-for points", "Components show results and
// words they are given". Frame 1o; ID 5.1, 9.3, 10.4; D25, D113.

const wrap = (ui: React.ReactElement) => render(<MemoryRouter>{ui}</MemoryRouter>);
const table = (list = rows({ LO2: 'revise', LO7: 'revise' })) => wrap(<OutcomeStatusTable rows={list} labels={statusLabels} columns={columns} />);
const rowOf = (id: string) => screen.getByRole('rowheader', { name: new RegExp(`^${id}\\b`) }).closest('tr')!;
const css = () => stripComments(read('src/ui/readiness/readiness.css'));

describe('FR-RDY-01 every objective row is complete', () => {
  it('seven rows in order, each with name, level, status, note and a review link; LO7 optional', () => {
    table();
    const body = screen.getAllByRole('rowgroup')[1];
    const trs = within(body).getAllByRole('row');
    expect(trs).toHaveLength(7);
    trs.forEach((tr, i) => {
      const id = LO[i];
      expect(tr).toHaveTextContent(id);
      expect(tr).toHaveTextContent(`Example name ${id}`);
      expect(tr.querySelector('[data-status]')).not.toBeNull();
      expect(within(tr).getByRole('link', { name: /Example review/ })).toHaveAttribute('href', `/module/C${i + 2}`);
      if (i !== 2) expect(tr).toHaveTextContent(`Example note ${id}`);
    });
    expect(rowOf('LO7')).toHaveTextContent('Example optional');
    expect(rowOf('LO1')).not.toHaveTextContent('Example optional');
  });

  it('a table with a caption and column headers', () => {
    table();
    expect(screen.getByRole('table', { name: columns.caption })).toBeInTheDocument();
    for (const h of [columns.objective, columns.level, columns.status, columns.change]) expect(screen.getByRole('columnheader', { name: h })).toBeInTheDocument();
  });

  it('LO3 shows two level tags', () => {
    table();
    expect(rowOf('LO3').querySelectorAll('[data-level]')).toHaveLength(2);
  });

  it('a level the chip does not style is a plain tag with its word', () => {
    table();
    const tag = rowOf('LO6').querySelector('[data-level="evaluate"]')!;
    expect(tag).toHaveTextContent('Example evaluate');
    expect(tag.className).not.toMatch(/chip-/);
  });

  it('a known level uses the OutcomeChip glyph and word', () => {
    table();
    const tag = rowOf('LO1').querySelector('[data-level="understand"]')!;
    expect(tag.querySelector('.chip-glyph')).not.toBeNull();
    expect(tag).toHaveTextContent(baseCopy.bloom.understand);
  });

  it('no note given: the row adds none', () => {
    table();
    const note = rowOf('LO3').querySelector('[data-cell="change"]')!;
    expect((note.textContent ?? '').trim()).toBe('');
  });
});

describe('D25 status by word, symbol and border', () => {
  it('each status cell has its word and symbol', () => {
    table();
    for (const [id, s] of [['LO1', 'ready'], ['LO2', 'revise']] as const) {
      const cell = rowOf(id).querySelector(`[data-status="${s}"]`)!;
      expect(cell).toHaveTextContent(statusLabels.words[s]);
      expect(cell).toHaveTextContent(statusLabels.symbols[s]);
    }
  });

  it('the stylesheet gives ready and revise different border styles', () => {
    const ready = rule(css(), ".readiness-status[data-status='ready']");
    const revise = rule(css(), ".readiness-status[data-status='revise']");
    expect(ready).toMatch(/solid/);
    expect(revise).toMatch(/dotted/);
  });

  it('a mastery badge only where given, beside the status', () => {
    table(rows({}, (id) => (id === 'LO1' ? { mastery: 'developing' } : {})));
    expect(rowOf('LO1').querySelector('.badge')).not.toBeNull();
    expect(rowOf('LO2').querySelector('.badge')).toBeNull();
    expect(rowOf('LO1').querySelector('[data-status]')!.contains(rowOf('LO1').querySelector('.badge'))).toBe(false);
  });
});

describe('ID 9.1 D113 headline follows the given overall result', () => {
  it('overall Ready with LO7 (optional) Revise keeps the Ready heading', () => {
    wrap(<ReadinessSummary {...summary()} />);
    expect(screen.getByRole('heading', { level: 2, name: 'Example ready heading' })).toBeInTheDocument();
    expect(screen.getByText('Example ready line')).toBeInTheDocument();
    expect(rowOf('LO7')).toHaveTextContent('Example revise');
    expect(rowOf('LO7')).toHaveTextContent('Example optional');
    expect(document.querySelector('[data-overall]')).toHaveAttribute('data-overall', 'ready');
  });

  it('overall Revise shows the Revise heading', () => {
    const s = summary();
    wrap(<ReadinessSummary {...s} headline={{ status: 'revise', heading: 'Example revise heading', line: 'Example revise line' }} />);
    expect(screen.getByRole('heading', { level: 2, name: 'Example revise heading' })).toBeInTheDocument();
    expect(document.querySelector('[data-overall]')).toHaveAttribute('data-overall', 'revise');
  });

  it('ID 10.4 the title words and message show, no rank letter', () => {
    const s = summary();
    // The live Title carries a rank; the type takes only words and message, so extra fields are ignored.
    const title = { words: 'Example title words', message: 'Example title message', rank: 'A', minShare: 0.66 } as { words: string; message: string };
    const { container } = wrap(<ReadinessSummary {...s} headline={{ ...s.headline, title }} />);
    expect(screen.getByText('Example title words')).toBeInTheDocument();
    expect(screen.getByText('Example title message')).toBeInTheDocument();
    expect(container.textContent).not.toMatch(/\bA\b/);
    expect(container.textContent).not.toMatch(/0\.66|66/);
  });

  it('FR-MOT-04 no score, percentage or rank words anywhere', () => {
    const { container } = wrap(<ReadinessSummary {...summary()} />);
    expect(container.textContent).not.toMatch(/%|\b\d+\s*\/\s*\d+\b|score|points|\brank|grade|\bpass|\bfail/i);
  });

  it('heading level is given', () => {
    wrap(<ReadinessSummary {...summary({ headingLevel: 1 })} />);
    expect(screen.getByRole('heading', { level: 1, name: 'Example ready heading' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Example listen heading' })).toBeInTheDocument();
  });
});

describe('ID 7.2 listen-for points', () => {
  it('the heading and three points in order', () => {
    wrap(<ReadinessSummary {...summary()} />);
    const list = screen.getByRole('heading', { name: 'Example listen heading' }).parentElement!.querySelector('ul')!;
    expect(within(list).getAllByRole('listitem').map((li) => li.textContent)).toEqual(['Example point one', 'Example point two', 'Example point three']);
  });

  it('no points: no block', () => {
    wrap(<ReadinessSummary {...summary({ listen: { heading: 'Example listen heading', points: [] } })} />);
    expect(screen.queryByRole('heading', { name: 'Example listen heading' })).toBeNull();
  });
});

describe('D18 only given words appear', () => {
  it('every text node is a fixture string, an objective ID, a symbol or a chip level word', () => {
    const { container } = wrap(<ReadinessSummary {...summary()} />);
    const allowed = new Set([...Object.values(statusLabels.symbols), '⚑', ...Object.values(baseCopy.bloom)]);
    const walk = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
    for (let n = walk.nextNode(); n; n = walk.nextNode()) {
      const t = (n.textContent ?? '').trim();
      if (!t) continue;
      expect(/^(Example|LO[1-7]$)/.test(t) || allowed.has(t), t).toBe(true);
    }
  });
});

describe('NFR-02 axe', () => {
  it('ReadinessSummary', async () => {
    const { container } = wrap(<ReadinessSummary {...summary()} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
