import stylelint from 'stylelint';
import { describe, expect, it } from 'vitest';
import { read } from './base/css-helpers';

// Spec: add-ui-foundation / ui-foundation "Style lint". Quality bar check 2; NFR-02.

const configFile = '.stylelintrc.json';
const lintFile = async (file: string) => (await stylelint.lint({ files: file, configFile })).results[0];
const fixture = (name: string) => `tests/fixtures/stylelint/${name}.css`;

describe('NFR-02 the style lint is wired in', () => {
  it('npm run lint runs eslint and stylelint; the config ignores tokens.css', () => {
    const lint = JSON.parse(read('package.json')).scripts.lint as string;
    expect(lint).toMatch(/eslint/);
    expect(lint).toMatch(/stylelint/);
    const cfg = JSON.parse(read(configFile));
    expect(JSON.stringify(cfg.ignoreFiles)).toMatch(/tokens\.css/);
  });
});

describe('NFR-02 each rule fires', () => {
  it.each(['hex-colour', 'named-colour', 'rgb', 'radius', 'font-size', 'max-width', 'other-min-width'])(
    '%s is an error',
    async (name) => {
      const r = await lintFile(fixture(name));
      expect(r.errored, name).toBe(true);
    },
    30_000,
  );
  it('tokens, inherit, the two allowed widths and print points pass', async () => {
    const r = await lintFile(fixture('allowed'));
    expect(r.warnings.map((w) => w.text)).toEqual([]);
  }, 30_000);
});

describe('NFR-02 the current stylesheets pass', () => {
  it('stylelint over src/**/*.css reports nothing', async () => {
    const { results } = await stylelint.lint({ files: 'src/**/*.css', configFile });
    const problems = results.flatMap((r) => r.warnings.map((w) => `${r.source}:${w.line} ${w.text}`));
    expect(problems).toEqual([]);
  }, 60_000);
});
