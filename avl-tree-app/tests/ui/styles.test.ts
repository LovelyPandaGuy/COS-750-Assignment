import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';

// Spec: openspec/changes/add-design-tokens-and-shell/specs/app-shell/spec.md
// Stylesheet-text checks: jsdom has no layout or :focus-visible (design.md decision 7).

function files(dir: string, ext: RegExp): string[] {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? files(p, ext) : ext.test(n) ? [p] : [];
  });
}
const read = (p: string) => readFileSync(p, 'utf8');
const stripComments = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, '');
const css = files('src', /\.css$/).filter((p) => !p.endsWith('tokens.css'));
const shellCss = () => stripComments(read('src/ui/shell.css'));
const rule = (text: string, selector: string) => {
  // Match the whole selector (followed by ',' or '{'), so '.a' does not match '.ab'.
  const esc = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const m = new RegExp(`(^|[,}\\s])${esc}\\s*[,{]`).exec(text);
  if (!m) throw new Error(`no rule for ${selector}`);
  const i = m.index;
  return text.slice(text.indexOf('{', i) + 1, text.indexOf('}', i));
};

describe('NFR-02 tokens are the only source of style', () => {
  it('has no hex, rgb( or hsl( colours outside tokens.css', () => {
    expect(css.length).toBeGreaterThan(0);
    for (const p of css) expect(stripComments(read(p)), p).not.toMatch(/#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(/);
  });

  it('removes the Vite starter variables', () => {
    for (const p of ['src/index.css', 'src/App.css'].filter(existsSync)) {
      expect(read(p), p).not.toMatch(/--(accent|text-h|social-bg)\s*:/);
    }
  });

  it('imports tokens.css before any other stylesheet', () => {
    const imports = [...read('src/main.tsx').matchAll(/import\s+['"]([^'"]+\.css)['"]/g)].map((m) => m[1]);
    expect(imports[0]).toBe('./ui/tokens.css');
  });
});

describe('NFR-02 light theme is pinned', () => {
  it('sets data-theme="light" on <html>', () => {
    expect(read('index.html')).toMatch(/<html[^>]*\sdata-theme="light"/);
  });
});

describe('NFR-02 one focus style', () => {
  it('defines a single :focus-visible rule in tokens.css using the variables', () => {
    const t = stripComments(read('src/ui/tokens.css'));
    expect(t.match(/:focus-visible/g)).toHaveLength(1);
    const body = rule(t, ':where(a, button, input, select, textarea, [tabindex]):focus-visible');
    expect(body).toMatch(/outline:\s*var\(--focus-ring-width\)\s+solid\s+var\(--focus-ring-color\)/);
    expect(body).toMatch(/outline-offset:\s*var\(--focus-ring-gap\)/);
  });

  it('is not overridden in the shell stylesheet or components', () => {
    const sources = [...css, ...files('src/ui', /\.tsx$/)];
    for (const p of sources) {
      expect(stripComments(read(p)), p).not.toMatch(/outline\s*:\s*(none|0)\b|outline-offset\s*:/);
    }
  });
});

describe('FR-VIS-10 / NFR-02 targets and narrow width', () => {
  it('gives top bar buttons, the Aa button and the skip link a 44 px target', () => {
    const t = shellCss();
    for (const sel of ['.topbar-action', '.aa-button', '.skip-link:focus']) {
      expect(rule(t, sel), sel).toMatch(/min-height:\s*var\(--target-min\)/);
    }
    for (const sel of ['.topbar-action', '.aa-button']) {
      expect(rule(t, sel), sel).toMatch(/min-width:\s*var\(--target-min\)/);
    }
  });

  it('wraps the top bar, has a side gutter of at least --space-4, and limits the reading column', () => {
    const t = shellCss();
    expect(rule(t, '.topbar')).toMatch(/flex-wrap:\s*wrap/);
    expect(rule(t, '.topbar')).not.toMatch(/(?<![-\w])width:\s*\d+px/);
    expect(rule(t, '.app-main')).toMatch(/padding-inline:\s*var\(--space-(4|5|6|7|8)\)/);
    expect(rule(t, '.app-main')).toMatch(/max-width:\s*var\(--reading-column\)/);
  });

  it('hides the skip link off-screen, not with display:none or visibility:hidden', () => {
    const t = shellCss();
    const hidden = rule(t, '.skip-link');
    expect(hidden).toMatch(/position:\s*absolute/);
    expect(hidden).toMatch(/(left|inset-inline-start|top):\s*-\d+/);
    expect(hidden).not.toMatch(/display:\s*none|visibility:\s*hidden/);
    expect(rule(t, '.skip-link:focus')).toMatch(/(left|inset-inline-start|top):\s*(0|var\(--space-\d\))/);
  });
});
