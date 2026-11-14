import { describe, expect, it } from 'vitest';
import ts from 'typescript';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

// Spec: revamp-question-and-feedback / ui-feedback "The answer appears only at the cap", scenario "First miss":
// passing fullAnswer to the not-yet variant is a type error. Tests are outside tsconfig's include, so this
// compiles a small probe file (written here, under tests/) with the app's compiler options. (FR-SCA-03, D105)

const probeDir = resolve('tests/ui/learn/__probe__');
const probe = join(probeDir, 'probe.tsx');

function diagnosticsFor(source: string): string[] {
  mkdirSync(probeDir, { recursive: true });
  writeFileSync(probe, source);
  try {
    const cfg = ts.getParsedCommandLineOfConfigFile(resolve('tsconfig.app.json'), {}, { ...ts.sys, onUnRecoverableConfigFileDiagnostic: () => {} })!;
    const program = ts.createProgram([probe], { ...cfg.options, noEmit: true });
    return ts.getPreEmitDiagnostics(program, program.getSourceFile(probe)).map((d) => ts.flattenDiagnosticMessageText(d.messageText, '\n'));
  } finally {
    rmSync(probeDir, { recursive: true, force: true });
  }
}

const head = `import { FeedbackPanel } from '../../../../src/ui/learn/FeedbackPanel'
const base = { verdict: 'v', why: 'w', concept: { label: 'c', to: '/' }, next: { label: 'n', onClick: () => {} } }
`;

describe('FR-SCA-03 D105 FeedbackPanel variant types', () => {
  it('not-yet cannot take a full answer or a lecture draft', () => {
    expect(diagnosticsFor(`${head}export const a = <FeedbackPanel variant="not-yet" {...base} fullAnswer={null} />\n`).length).toBeGreaterThan(0);
    expect(diagnosticsFor(`${head}export const b = <FeedbackPanel variant="not-yet" {...base} lectureDraft={null} />\n`).length).toBeGreaterThan(0);
  });

  it('cap can, and not-yet without them compiles', () => {
    expect(diagnosticsFor(`${head}export const c = <FeedbackPanel variant="cap" {...base} fullAnswer={null} lectureDraft={null} />\nexport const d = <FeedbackPanel variant="not-yet" {...base} />\n`)).toEqual([]);
  });
}, 60_000);
