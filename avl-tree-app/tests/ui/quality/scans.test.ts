import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { files, read, stripComments } from '../base/css-helpers'
import { TERMS } from './terms'

// Spec: ui-quality-sweep / ui-foundation "Quality bar 8" (scenario "No hover-only affordances") and "Quality bar
// 10" (scenarios "No harsh words or red", "One term per concept"). Design decision 6. D27, ID 10.1, NFR-02.
// Content in src/live_content/ is never edited by an agent (CLAUDE.md): what these scans find there is written
// to test-results/quality/ for the audit, and only src/content/ and the stylesheets fail the tests.

const REPORT = 'test-results/quality'
function report(name: string, data: unknown): void {
  mkdirSync(REPORT, { recursive: true })
  writeFileSync(join(REPORT, `${name}.json`), JSON.stringify(data, null, 2))
}

/** Each rule in a stylesheet: its selector list and declarations (nested @media blocks are flattened). */
function rules(css: string): { selector: string; body: string }[] {
  const out: { selector: string; body: string }[] = []
  for (const m of stripComments(css).matchAll(/([^{}@;]+)\{([^{}]*)\}/g)) out.push({ selector: m[1].trim(), body: m[2] })
  return out
}

/** The string literals of a TypeScript content file that read as UI wording (a space, or a capital first). */
function uiStrings(path: string): string[] {
  const src = stripComments(read(path)).replace(/^\s*\/\/.*$/gm, '')
  const lits = [...src.matchAll(/'((?:[^'\\\n]|\\.)*)'|`((?:[^`\\]|\\.)*)`|"((?:[^"\\\n]|\\.)*)"/g)].map((m) => m[1] ?? m[2] ?? m[3] ?? '')
  return lits
    .filter((s) => !s.startsWith('.') && !s.startsWith('/') && !s.includes('/live_content') && (/\s/.test(s) || /^[A-Z]/.test(s)))
    // Placeholders (`${module}`, `{module}`) are filled in at run time; they are not words a student reads.
    .map((s) => s.replace(/\$?\{[^}]*\}/g, '…'))
}

/** Every string value in a JSON tree, with its path; ids and keys are not visible text. */
function jsonStrings(value: unknown, path = ''): { path: string; text: string }[] {
  if (typeof value === 'string') return [{ path, text: value }]
  if (Array.isArray(value)) return value.flatMap((v, i) => jsonStrings(v, `${path}[${i}]`))
  if (value !== null && typeof value === 'object')
    return Object.entries(value).flatMap(([k, v]) => (/(^id$|Id$|Ids$|^type$|^set$|^concept$|^subSkill$)/.test(k) ? [] : jsonStrings(v, `${path}.${k}`)))
  return []
}

const contentFiles = () => readdirSync('src/content').filter((f) => f.endsWith('.ts')).map((f) => `src/content/${f}`)
const liveFiles = () => files('src/live_content', /\.json$/)

describe('quality bar 8: no hover-only affordances', () => {
  it('no :hover rule shows something hidden unless the same rule covers keyboard focus', () => {
    const offenders: string[] = []
    for (const p of files('src', /\.css$/)) {
      for (const r of rules(read(p))) {
        if (!r.selector.includes(':hover')) continue
        const shows = /(^|;)\s*display:\s*(?!none)[\w-]+/.test(r.body) || /visibility:\s*visible/.test(r.body) || /opacity:\s*(1|0?\.\d*[1-9])/.test(r.body)
        if (shows && !/:focus(-visible|-within)?/.test(r.selector)) offenders.push(`${p}: ${r.selector}`)
      }
    }
    expect(offenders).toEqual([])
  })
})

const HARSH = /\b(wrong|fail(ed|s|ure)?|incorrect)\b/i

describe('quality bar 10: no harsh words, no red in answer states', () => {
  it('UI wording in src/content has no "wrong", "fail" or "incorrect"', () => {
    const hits = contentFiles().flatMap((p) => uiStrings(p).filter((s) => HARSH.test(s)).map((s) => `${p}: ${s.slice(0, 80)}`))
    expect(hits).toEqual([])
  })

  it('reports (does not fail on) harsh words in src/live_content, which agents never edit', () => {
    const hits = liveFiles().flatMap((p) => jsonStrings(JSON.parse(readFileSync(p, 'utf8'))).filter((s) => HARSH.test(s.text)).map((s) => ({ file: p, path: s.path, text: s.text.slice(0, 160) })))
    report('harsh-words-live-content', hits)
    expect(Array.isArray(hits)).toBe(true)
  })

  it('answer-state rules use no red or error colour', () => {
    // Resolve light-theme tokens to hex, then to a hue: red is a hue under 20 or over 340 degrees, saturated.
    const tokens = new Map([...read('src/ui/tokens.css').matchAll(/(--[\w-]+):\s*(#[0-9a-fA-F]{6})/g)].map((m) => [m[1], m[2]]))
    const isRed = (hex: string) => {
      const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
      const max = Math.max(r, g, b)
      const min = Math.min(r, g, b)
      const d = max - min
      if (d < 0.15) return false
      const h = max === r ? (60 * ((g - b) / d) + 360) % 360 : max === g ? 60 * ((b - r) / d) + 120 : 60 * ((r - g) / d) + 240
      return h < 20 || h > 340
    }
    const offenders: string[] = []
    for (const p of files('src', /\.css$/)) {
      for (const r of rules(read(p))) {
        if (!/not-?yet|notyet|verdict|feedback|incorrect|partial|cap\b/i.test(r.selector)) continue
        for (const v of r.body.matchAll(/var\((--[\w-]+)\)/g)) {
          if (/error|danger|red\b/i.test(v[1])) offenders.push(`${p}: ${r.selector} uses ${v[1]}`)
          const hex = tokens.get(v[1])
          if (hex !== undefined && isRed(hex)) offenders.push(`${p}: ${r.selector} uses ${v[1]} (${hex}, a red)`)
        }
      }
    }
    expect(offenders).toEqual([])
  })
})

describe('quality bar 10: one term per concept (terms.ts)', () => {
  for (const term of TERMS) {
    it(`"${term.allowed}" (${term.concept}): no synonym in UI wording`, () => {
      const re = new RegExp(`\\b(${term.synonyms.join('|')})s?\\b`, 'i')
      const hits = contentFiles().flatMap((p) => uiStrings(p).filter((s) => re.test(s)).map((s) => `${p}: ${s.slice(0, 80)}`))
      const live = liveFiles().flatMap((p) => jsonStrings(JSON.parse(readFileSync(p, 'utf8'))).filter((s) => re.test(s.text)).map((s) => ({ file: p, path: s.path, text: s.text.slice(0, 120) })))
      report(`terms-${term.allowed}-live-content`, live)
      expect(hits).toEqual([])
    })
  }
})
