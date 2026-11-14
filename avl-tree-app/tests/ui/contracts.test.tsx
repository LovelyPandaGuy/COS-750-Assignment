import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { describe, expect, it } from 'vitest';
import { BUILT, CONTRACT_NAMES, STUBBED } from '../../src/ui/contracts';
import { STUBS } from '../../src/ui/stubs';
import { files, read } from './base/css-helpers';

// Spec: add-ui-foundation / ui-foundation "Component contracts". Wireframe index frames 1b to 1o; D18.

/** The component names in the design index's Screens table, frames 1b to 1o, in order, once each. */
function indexNames(): string[] {
  const rows = read('.claude/docs/design/INDEX.md').split('\n').filter((l) => /^\| 1[b-o] \|/.test(l));
  const names: string[] = [];
  for (const r of rows) for (const n of r.split('|')[3].match(/[A-Z][A-Za-z]+/g) ?? []) if (!names.includes(n)) names.push(n);
  return names;
}
const contracts = () => read('src/ui/contracts.ts');
const sources = () => files('src', /\.tsx?$/).filter((p) => !p.includes('/ui/stubs/') && !p.endsWith('/ui/contracts.ts'));
const exportsName = (src: string, name: string) => new RegExp(`export (?:function|const) ${name}\\b`).test(src);

describe('every named component has a contract', () => {
  it('45 names, the index\'s, each exported as <Name>Props', () => {
    const names = indexNames();
    expect(names).toHaveLength(45);
    expect([...CONTRACT_NAMES].sort()).toEqual([...names].sort());
    for (const n of names) expect(contracts(), n).toMatch(new RegExp(`export (?:type|interface) ${n}Props\\b`));
  });
  it('built and stubbed split the names with no overlap', () => {
    expect([...BUILT, ...STUBBED].sort()).toEqual([...CONTRACT_NAMES].sort());
    // 14 and 31 after the merge with the live content (D121); revamp-question-and-feedback then built
    // QuestionItem, ConfidenceRating, FullAnswer, LectureQuestionDraft and FeedbackPanel (D128): 19 and 26.
    expect(BUILT).toHaveLength(19);
    expect(STUBBED).toHaveLength(26);
  });
});

describe('built components keep their props', () => {
  it('each built contract is the component\'s own parameter type', () => {
    for (const n of BUILT) {
      expect(contracts(), n).toMatch(new RegExp(`export type ${n}Props = ComponentProps<typeof ${n}>`));
    }
  });
});

describe('stubs render against their contract', () => {
  it.each(STUBBED.map((n) => [n]))('%s renders a named placeholder', async (name) => {
    const Stub = STUBS[name as keyof typeof STUBS] as (p: object) => React.JSX.Element;
    const { container } = render(<Stub {...({} as object)} />);
    expect(container.children).toHaveLength(1);
    const el = container.firstElementChild!;
    expect(el).toHaveAttribute('data-stub', name);
    expect(el.getAttribute('aria-label')).toContain(name);
    expect(await axe(container)).toHaveNoViolations();
  });
  it('a stub holds no content: no content import, no text but its name', () => {
    for (const p of files('src/ui/stubs', /\.tsx$/)) {
      const src = read(p);
      expect(src, p).not.toMatch(/from ['"][./]*\/?content\//);
    }
    for (const name of STUBBED) {
      const Stub = STUBS[name as keyof typeof STUBS] as (p: object) => React.JSX.Element;
      const { container, unmount } = render(<Stub />);
      expect(container.textContent).toBe(name);
      unmount();
    }
  });
});

describe('unbuilt components are stubs', () => {
  it('no stubbed name has a real component, and every built name does', () => {
    const all = sources().map(read);
    for (const n of STUBBED) expect(all.some((s) => exportsName(s, n)), `${n} is built: take it off STUBBED`).toBe(false);
    for (const n of BUILT) expect(all.some((s) => exportsName(s, n)), `${n} is not exported`).toBe(true);
  });
});
