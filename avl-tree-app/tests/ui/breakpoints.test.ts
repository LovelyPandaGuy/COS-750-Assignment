import { describe, expect, it } from 'vitest';
import { BREAKPOINTS, MEDIA_MIN_WIDTHS } from '../../src/ui/breakpoints';
import { files, read, stripComments } from './base/css-helpers';

// Spec: add-ui-foundation / ui-foundation "Three layout widths". Requirement IDs: NFR-04, FR-VIS-10, D3.
// The no-horizontal-scroll scenario runs in the browser: tests/visual/foundation.spec.ts.

describe('NFR-04 three layout widths', () => {
  it('one constant: phone 390, tablet 768, desktop 1366; queries at tablet and desktop', () => {
    expect(BREAKPOINTS).toEqual({ phone: 390, tablet: 768, desktop: 1366 });
    expect(MEDIA_MIN_WIDTHS).toEqual([768, 1366]);
  });
  it('no other module under src declares those widths', () => {
    for (const p of files('src', /\.tsx?$/).filter((p) => !p.endsWith('breakpoints.ts'))) {
      expect(read(p), p).not.toMatch(/\b(?:390|768|1366)\b/);
    }
  });
  it('every width media query is min-width at 768px or 1366px', () => {
    for (const p of files('src', /\.css$/)) {
      for (const m of stripComments(read(p)).matchAll(/@media([^{]*)\{/g)) {
        const prelude = m[1];
        if (!/width/.test(prelude)) continue;
        expect(prelude.trim(), p).toMatch(/^\(min-width: (?:768|1366)px\)$/);
      }
    }
  });
  it('tokens.css documents the widths and points to the module', () => {
    const tokens = read('src/ui/tokens.css');
    const comments = (tokens.match(/\/\*[\s\S]*?\*\//g) ?? []).join('\n');
    for (const w of ['390', '768', '1366', 'breakpoints.ts']) expect(comments).toContain(w);
  });
  it('the style lint allow-list agrees with the constant', () => {
    const cfg = JSON.parse(read('.stylelintrc.json'));
    const allowed = cfg.rules['media-feature-name-value-allowed-list'];
    const list = Array.isArray(allowed[0]) ? allowed[0] : allowed;
    const minWidth = (list as Record<string, string[]>)['min-width'] ?? (allowed as Record<string, string[]>)['min-width'];
    expect(minWidth).toEqual(MEDIA_MIN_WIDTHS.map((w) => `${w}px`));
  });
});
