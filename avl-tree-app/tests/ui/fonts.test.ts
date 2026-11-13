import { existsSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { files, read, stripComments } from './base/css-helpers';

// Spec: add-ui-foundation / ui-foundation "Fonts are self-hosted". Requirement IDs: NFR-05, NFR-02.
// The browser check (document.fonts, no off-origin request) is in tests/visual/foundation.spec.ts.

const FONTS_CSS = 'src/ui/fonts/fonts.css';
const faces = () =>
  [...stripComments(read(FONTS_CSS)).matchAll(/@font-face\s*\{([^}]*)\}/g)].map((m) => {
    const body = m[1];
    return {
      family: /font-family:\s*['"]([^'"]+)['"]/.exec(body)?.[1],
      weight: /font-weight:\s*(\d+)/.exec(body)?.[1],
      url: /url\(\s*['"]?([^'")]+)['"]?\s*\)/.exec(body)?.[1],
      display: /font-display:\s*([a-z]+)/.exec(body)?.[1],
    };
  });

describe('NFR-05 fonts are self-hosted', () => {
  it('declares Next 400 and 700 and Mono 400, each a local woff2 with font-display swap', () => {
    const got = faces();
    const want = [
      ['Atkinson Hyperlegible Next', '400'],
      ['Atkinson Hyperlegible Next', '700'],
      ['Atkinson Hyperlegible Mono', '400'],
    ];
    for (const [family, weight] of want) {
      const f = got.find((x) => x.family === family && x.weight === weight);
      expect(f, `${family} ${weight}`).toBeDefined();
      expect(f!.url).toMatch(/^\.\/[\w.-]+\.woff2$/);
      expect(existsSync(join(dirname(FONTS_CSS), f!.url!)), f!.url).toBe(true);
      expect(f!.display).toBe('swap');
    }
  });
  it('the family names match the type tokens', () => {
    const tokens = read('src/ui/tokens.css');
    expect(tokens).toMatch(/--font-sans:\s*'Atkinson Hyperlegible Next'/);
    expect(tokens).toMatch(/--font-mono:\s*'Atkinson Hyperlegible Mono'/);
  });
  it('tokens.css is the first stylesheet import in main.tsx and the fonts the second', () => {
    const imports = [...read('src/main.tsx').matchAll(/^import\s+'([^']+\.css)'/gm)].map((m) => m[1]);
    expect(imports.slice(0, 2)).toEqual(['./ui/tokens.css', './ui/fonts/fonts.css']);
  });
  it('nothing in any stylesheet or index.html points to another origin', () => {
    for (const p of files('src', /\.css$/)) {
      const css = stripComments(read(p));
      expect(css, p).not.toMatch(/url\(\s*['"]?(?:https?:)?\/\//);
      expect(css, p).not.toMatch(/@import\s+(?:url\()?\s*['"]?(?:https?:)?\/\//);
    }
    const html = read('index.html');
    expect(html).not.toMatch(/<link[^>]+href=["'](?:https?:)?\/\//);
  });
  it('the licence is shipped beside the files', () => {
    const names = readdirSync('src/ui/fonts');
    expect(names).toContain('OFL.txt');
    expect(read('src/ui/fonts/OFL.txt')).toMatch(/SIL OPEN FONT LICENSE/i);
  });
});
