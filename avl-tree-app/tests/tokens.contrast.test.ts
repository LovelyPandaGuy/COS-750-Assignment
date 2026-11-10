import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';

// Contrast pairs from the design system's section 05, checked against src/ui/tokens.css (NFR-02).
const css = readFileSync('src/ui/tokens.css', 'utf8');

function block(start: RegExp): string {
  const m = start.exec(css);
  if (!m) throw new Error('block not found');
  let i = css.indexOf('{', m.index) + 1;
  let depth = 1;
  const from = i;
  while (depth > 0) {
    const ch = css[i++];
    if (ch === '{') depth++;
    if (ch === '}') depth--;
  }
  return css.slice(from, i - 1);
}

function vars(text: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const m of text.matchAll(/--([a-z0-9-]+):\s*(#[0-9A-Fa-f]{6})/g)) out[m[1]] = m[2].toUpperCase();
  return out;
}

const light = vars(block(/^:root\s*\{/m));
const dark = { ...light, ...vars(block(/^:root\[data-theme='dark'\]/m)) };

function lum(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function ratio(a: string, b: string): number {
  const [x, y] = [lum(a), lum(b)];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

type Pair = [fg: string, bg: string, need: number];
const lightPairs: Pair[] = [
  ['text-primary', 'bg-page', 4.5], ['text-primary', 'bg-surface', 4.5],
  ['text-secondary', 'bg-page', 4.5], ['text-secondary', 'bg-surface', 4.5],
  ['bg-surface', 'action-primary', 4.5], ['bg-surface', 'action-primary-hover', 4.5],
  ['action-primary', 'bg-page', 4.5], ['text-primary', 'action-primary-tint', 4.5],
  ['bloom-remember', 'bloom-remember-tint', 4.5], ['bloom-understand', 'bloom-understand-tint', 4.5], ['bloom-apply', 'bloom-apply-tint', 4.5],
  ['mastery-secure', 'bg-surface', 4.5], ['mastery-developing', 'mastery-developing-tint', 4.5], ['mastery-notyet', 'mastery-notyet-tint', 4.5],
  ['text-primary', 'feedback-correct-bg', 4.5], ['text-primary', 'feedback-notyet-bg', 4.5], ['feedback-notyet-icon', 'feedback-notyet-bg', 3],
  ['text-primary', 'code-highlight', 4.5],
  ['tree-new', 'bg-surface', 3], ['tree-z', 'bg-page', 4.5], ['tree-y', 'bg-surface', 3], ['tree-balanced', 'bg-surface', 3],
  ['bg-surface', 'tree-new', 4.5], ['bg-surface', 'tree-z', 4.5], ['bg-surface', 'tree-y', 4.5],
  ['border-control', 'bg-surface', 3], ['focus-ring-color', 'bg-page', 3], ['disabled-text', 'disabled-bg', 4.5],
];
const darkPairs: Pair[] = [
  ['text-primary', 'bg-page', 4.5], ['text-primary', 'bg-surface', 4.5], ['text-secondary', 'bg-surface', 4.5],
  ['bg-page', 'action-primary', 4.5],
  ['mastery-secure', 'mastery-secure-tint', 4.5], ['mastery-developing', 'mastery-developing-tint', 4.5], ['mastery-notyet', 'mastery-notyet-tint', 4.5],
  ['bloom-understand', 'bloom-understand-tint', 4.5], ['bloom-apply', 'bloom-apply-tint', 4.5],
  ['text-primary', 'feedback-notyet-bg', 4.5], ['text-primary', 'code-highlight', 4.5],
  ['tree-new', 'bg-surface', 3], ['tree-z', 'bg-surface', 4.5], ['tree-y', 'bg-surface', 3], ['tree-balanced', 'bg-surface', 3],
  ['bg-page', 'tree-z', 4.5], ['border-control', 'bg-surface', 3], ['focus-ring-color', 'bg-surface', 3],
];

describe('design token contrast (NFR-02, WCAG 2.2 AA)', () => {
  it.each(lightPairs)('light: %s on %s needs %d:1', (fg, bg, need) => {
    expect(light[fg], fg).toBeDefined();
    expect(light[bg], bg).toBeDefined();
    expect(ratio(light[fg], light[bg])).toBeGreaterThanOrEqual(need);
  });
  it.each(darkPairs)('dark: %s on %s needs %d:1', (fg, bg, need) => {
    expect(dark[fg], fg).toBeDefined();
    expect(dark[bg], bg).toBeDefined();
    expect(ratio(dark[fg], dark[bg])).toBeGreaterThanOrEqual(need);
  });
});
