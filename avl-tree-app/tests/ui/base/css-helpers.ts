import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

export const read = (p: string) => readFileSync(p, 'utf8');
export const stripComments = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, '');
export const baseCss = () => stripComments(read('src/ui/base/base.css'));

export function files(dir: string, ext: RegExp): string[] {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? files(p, ext) : ext.test(n) ? [p] : [];
  });
}

/** The declarations of the first rule whose selector list contains `selector` exactly. */
export function rule(text: string, selector: string): string {
  const esc = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const m = new RegExp(`(^|[,}\\s])${esc}\\s*[,{]`).exec(text);
  if (!m) throw new Error(`no rule for ${selector}`);
  const i = m.index;
  return text.slice(text.indexOf('{', i) + 1, text.indexOf('}', i));
}
