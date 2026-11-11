import { describe, it, expect } from 'vitest'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) return sourceFiles(p)
    return /\.(ts|tsx)$/.test(name) && !/\.test\./.test(name) ? [p] : []
  })
}

describe('NFR-05: single storage access point', () => {
  it('no file under src/ other than the storage adapter touches browser storage', () => {
    const forbidden = /\b(localStorage|sessionStorage|indexedDB)\b|document\.cookie/
    const offenders = sourceFiles('src')
      .filter((file) => !file.endsWith(join('state', 'storage.ts')))
      .filter((file) => forbidden.test(readFileSync(file, 'utf8')))
    expect(offenders).toEqual([])
  })
})
