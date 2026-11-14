import { describe, it, expect } from 'vitest'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import {
  EMPTY_HEIGHT,
  LEAF_HEIGHT,
  REBALANCE_CASES,
  balanceFactor,
} from '../../src/engine/conventions'

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) return sourceFiles(p)
    return /\.(ts|tsx)$/.test(name) && !/\.test\./.test(name) ? [p] : []
  })
}

describe('FR-ENG-10: conventions module', () => {
  it('default values', () => {
    expect(LEAF_HEIGHT).toBe(0)
    expect(EMPTY_HEIGHT).toBe(-1)
    expect(balanceFactor(2, 1)).toBe(-1) // ID 7.3: h(right) − h(left)
    expect([...REBALANCE_CASES]).toEqual(['LL', 'RR', 'LR', 'RL'])
  })

  it('no other file under src/ hard-codes the convention', () => {
    const forbidden: [string, RegExp][] = [
      ['balance factor subtraction', /[hH]eight\w*\s*-\s*\w*[hH]eight/],
      ['balance factor subtraction on children', /\.left\w*\s*-\s*\w*\.right/],
      ['height literal', /[hH]eight\s*[:=]\s*-?\d/],
      ['empty-tree literal', /\?\s*-1\s*:|:\s*-1\b/],
      ['node height formula', /Math\.max\([^)]*\)\s*\+\s*1/],
    ]
    const offenders: string[] = []
    for (const file of sourceFiles('src')) {
      if (file.endsWith(join('engine', 'conventions.ts'))) continue
      const text = readFileSync(file, 'utf8')
      for (const [label, re] of forbidden) if (re.test(text)) offenders.push(`${file}: ${label}`)
    }
    expect(offenders).toEqual([])
  })
})
