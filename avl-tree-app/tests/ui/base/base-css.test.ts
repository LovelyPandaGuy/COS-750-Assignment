import { describe, expect, it } from 'vitest';
import { baseCss } from './css-helpers';

// Spec: add-ui-foundation / ui-foundation "Base components use tokens only". Quality bar checks 2, 6, 9; NFR-02.

const PROPS = ['color', 'background', 'background-color', 'border-color', 'font', 'font-size', 'border-radius', 'padding', 'margin', 'gap'];
const ALLOWED = /^(?:(?:var\(--[\w-]+\)|0|inherit|currentColor|none|underline)\s*)+$/;

/** Declarations outside any @media block, and the @media blocks' preludes with their bodies. */
function declarations(css: string): [string, string][] {
  return [...css.matchAll(/([a-z-]+)\s*:\s*([^;{}]+);/g)].map((m) => [m[1], m[2].trim()]);
}

describe('NFR-02 quality bar 2: tokens only', () => {
  it('every colour, font, size, radius and space value is a variable or a keyword', () => {
    const decls = declarations(baseCss()).filter(([p]) => PROPS.includes(p));
    expect(decls.length).toBeGreaterThan(10);
    for (const [p, v] of decls) expect(v, `${p}: ${v}`).toMatch(ALLOWED);
  });
  it('has no hex, rgb( or hsl(', () => {
    expect(baseCss()).not.toMatch(/#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(/);
  });
});

describe('quality bar 9: reduced motion', () => {
  it('no animation, and any transition sits under prefers-reduced-motion: no-preference', () => {
    const css = baseCss();
    expect(css).not.toMatch(/animation/);
    const outside = css.replace(/@media \(prefers-reduced-motion: no-preference\)\s*\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/g, '');
    expect(outside).not.toMatch(/transition/);
  });
});
