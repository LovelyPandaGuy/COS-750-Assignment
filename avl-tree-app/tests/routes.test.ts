import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it, expect } from 'vitest'
import { ACTIVITIES_BY_MODULE, paths, parseActivity, parseModuleId } from '../src/routes'
import { mapStatuses } from '../src/progress'
import { MODULE_IDS } from '../src/state/learnerState'

// Spec: add-routing-and-screen-skeleton / app-routing and module-hub. Requirement IDs: FR-LRN-03, FR-LRN-04, FR-VIS-08.

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n)
    return statSync(p).isDirectory() ? sourceFiles(p) : /\.(ts|tsx)$/.test(n) ? [p] : []
  })
}

describe('FR-LRN-04 paths come from one module', () => {
  it('builds every path', () => {
    expect(paths.start()).toBe('/')
    expect(paths.hub()).toBe('/path')
    expect(paths.module('C4')).toBe('/module/C4')
    expect(paths.activity('C4', 'explore')).toBe('/module/C4/explore')
    expect(paths.warmUpResult()).toBe('/module/C1/check/result')
    expect(paths.sandbox()).toBe('/sandbox')
    expect(paths.readiness()).toBe('/readiness')
  })

  it('lists the activities of each module in default order', () => {
    expect(ACTIVITIES_BY_MODULE.C1).toEqual(['check', 'refresher'])
    for (const id of ['C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8'] as const) {
      expect(ACTIVITIES_BY_MODULE[id]).toEqual(['explore', 'example', 'check'])
    }
    expect(ACTIVITIES_BY_MODULE.C9).toEqual(['check'])
    expect(Object.keys(ACTIVITIES_BY_MODULE)).toEqual([...MODULE_IDS])
  })

  it('parses module IDs and activities, and refuses anything else', () => {
    expect(parseModuleId('C4')).toBe('C4')
    expect(parseModuleId('C10')).toBeNull()
    expect(parseModuleId('c4')).toBeNull()
    expect(parseModuleId(undefined)).toBeNull()
    expect(parseActivity('refresher')).toBe('refresher')
    expect(parseActivity('play')).toBeNull()
  })

  it('has no hand-written paths outside the routes module', () => {
    for (const p of sourceFiles('src')) {
      if (p === join('src', 'routes.ts')) continue
      expect(readFileSync(p, 'utf8'), p).not.toMatch(/['"`]\/(module\/|path\b|sandbox|readiness)/)
    }
  })
})

describe('FR-LRN-03 progress map statuses', () => {
  it('return visit: done, current, next, later', () => {
    const s = mapStatuses('C4', ['C1', 'C2', 'C3'])
    expect(MODULE_IDS.map((id) => s[id])).toEqual([
      'done', 'done', 'done', 'current', 'next', 'later', 'later', 'later', 'later',
    ])
  })

  it('fresh learner', () => {
    const s = mapStatuses('C1', [])
    expect(MODULE_IDS.map((id) => s[id])).toEqual(['current', 'next', 'later', 'later', 'later', 'later', 'later', 'later', 'later'])
  })

  it('shows only what the state says: an earlier module not completed is later', () => {
    const s = mapStatuses('C5', ['C1', 'C3', 'C4'])
    expect(s.C2).toBe('later')
    expect(s.C5).toBe('current')
  })

  it('has no next at the last module, and current wins over done', () => {
    const last = mapStatuses('C9', ['C1'])
    expect(MODULE_IDS.filter((id) => last[id] === 'next')).toEqual([])
    expect(mapStatuses('C2', ['C2']).C2).toBe('current')
  })
})
