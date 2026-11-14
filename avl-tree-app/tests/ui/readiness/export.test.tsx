import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildExportText } from '../../../src/ui/readiness/exportText';
import { ExportActions } from '../../../src/ui/readiness/ExportActions';
import { ReadinessSummary } from '../../../src/ui/readiness/ReadinessSummary';
import { files, read, stripComments } from '../base/css-helpers';
import { LO, exportLabels, summary } from './fixtures';

// Spec: revamp-readiness / ui-readiness "Export by print, copy and save, on the device", "Print view",
// "Components show results and words they are given". FR-RDY-03, NFR-05, D14; proposal questions 4 and 8.

const TEXT = 'Example export text\nLO1 Example';

describe('FR-RDY-03 the export text holds everything', () => {
  it('every row, flag, question and listen-for point', () => {
    const s = summary();
    const text = buildExportText(s);
    for (const id of LO) {
      expect(text).toContain(id);
      expect(text).toContain(`Example name ${id}`);
    }
    expect(text).toContain('Example ready');
    expect(text).toContain('Example revise');
    expect(text).toContain('Example note LO1');
    expect(text).toContain('Example: you were sure, worth a second look');
    for (const q of s.questions.questions) expect(text).toContain(q.text);
    for (const p of s.listen.points) expect(text).toContain(p);
    expect(text).toContain('Example ready heading');
    expect(text).not.toMatch(/%/);
  });
});

describe('FR-RDY-03 NFR-05 export actions', () => {
  const fetchSpy = vi.fn();
  const xhrSpy = vi.fn();
  beforeEach(() => {
    vi.stubGlobal('fetch', fetchSpy);
    vi.stubGlobal('XMLHttpRequest', xhrSpy);
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    fetchSpy.mockReset();
    xhrSpy.mockReset();
  });

  const setup = () => {
    render(<ExportActions text={TEXT} fileName="example.txt" labels={exportLabels} />);
    return userEvent.setup();
  };
  const status = () => screen.getByRole('status');

  it('Copy writes the text and announces success', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    const user = setup();
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    await user.click(screen.getByRole('button', { name: 'Example copy' }));
    expect(writeText).toHaveBeenCalledExactlyOnceWith(TEXT);
    expect(status()).toHaveTextContent('Example copied');
    expect(screen.queryByRole('textbox')).toBeNull();
  });

  it('a rejecting clipboard shows the fallback and announces it', async () => {
    const user = setup();
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: vi.fn().mockRejectedValue(new Error('denied')) }, configurable: true });
    await user.click(screen.getByRole('button', { name: 'Example copy' }));
    const area = screen.getByRole('textbox', { name: 'Example summary text' });
    expect(area).toHaveValue(TEXT);
    expect(area).toHaveAttribute('readonly');
    expect(status()).toHaveTextContent('Example: copy the text below');
  });

  it('Save downloads a text/plain Blob under the file name and announces it', async () => {
    const created: Blob[] = [];
    const create = vi.fn((b: Blob) => (created.push(b), 'blob:example'));
    const revoke = vi.fn();
    Object.assign(URL, { createObjectURL: create, revokeObjectURL: revoke });
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
      expect(this.download).toBe('example.txt');
      expect(this.href).toBe('blob:example');
    });
    const user = setup();
    await user.click(screen.getByRole('button', { name: 'Example save file' }));
    expect(click).toHaveBeenCalledTimes(1);
    expect(created[0].type).toMatch(/^text\/plain/);
    expect(await created[0].text()).toBe(TEXT);
    expect(status()).toHaveTextContent('Example saved');
  });

  it('a throwing download shows the fallback', async () => {
    Object.assign(URL, { createObjectURL: () => { throw new Error('blocked'); }, revokeObjectURL: vi.fn() });
    const user = setup();
    await user.click(screen.getByRole('button', { name: 'Example save file' }));
    expect(screen.getByRole('textbox', { name: 'Example summary text' })).toHaveValue(TEXT);
    expect(status()).toHaveTextContent('Example: copy the text below');
  });

  it('Print calls window.print once', async () => {
    const print = vi.spyOn(window, 'print').mockImplementation(() => {});
    const user = setup();
    await user.click(screen.getByRole('button', { name: 'Example print' }));
    expect(print).toHaveBeenCalledTimes(1);
  });

  it('the live region is mounted and empty before any action', () => {
    setup();
    expect(status()).toHaveTextContent('');
  });

  it('no network on Copy, Save and Print', async () => {
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: vi.fn().mockResolvedValue(undefined) }, configurable: true });
    Object.assign(URL, { createObjectURL: () => 'blob:x', revokeObjectURL: vi.fn() });
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    vi.spyOn(window, 'print').mockImplementation(() => {});
    const user = setup();
    for (const n of ['Example copy', 'Example save file', 'Example print']) await user.click(screen.getByRole('button', { name: n }));
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(xhrSpy).not.toHaveBeenCalled();
  });

  it('the summary exports its own text', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    render(<MemoryRouter><ReadinessSummary {...summary()} /></MemoryRouter>);
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    await act(async () => screen.getByRole('button', { name: 'Example copy' }).click());
    expect(writeText).toHaveBeenCalledExactlyOnceWith(buildExportText(summary()));
  });
});

describe('FR-RDY-03 print view', () => {
  const printBlock = () => {
    const css = stripComments(read('src/ui/readiness/readiness.css'));
    const i = css.indexOf('@media print');
    expect(i).toBeGreaterThan(-1);
    let depth = 0;
    let j = css.indexOf('{', i);
    const start = j;
    for (; j < css.length; j++) {
      if (css[j] === '{') depth++;
      else if (css[j] === '}' && --depth === 0) break;
    }
    return css.slice(start, j);
  };

  it('hides controls, prints CanvasText on Canvas, body at least 12 pt', () => {
    const p = printBlock();
    expect(p).toMatch(/button/);
    expect(p).toMatch(/textarea/);
    expect(p).toMatch(/\.readiness-actions/);
    expect(p).toMatch(/display:\s*none/);
    expect(p).toMatch(/CanvasText/);
    expect(p).toMatch(/background[^;]*Canvas\b/);
    const sizes = [...p.matchAll(/font-size:\s*(\d+(?:\.\d+)?)pt/g)].map((m) => parseFloat(m[1]));
    expect(sizes.length).toBeGreaterThan(0);
    expect(Math.min(...sizes)).toBeGreaterThanOrEqual(12);
  });
});

describe('D18 readiness components show what they are given', () => {
  it('no source under src/ui/readiness imports content, state, live or live_content', () => {
    for (const p of files('src/ui/readiness', /\.tsx?$/)) {
      expect(read(p), p).not.toMatch(/from ['"][./]*(?:\.\.\/)*(content|state|live|live_content)\//);
    }
  });
});
