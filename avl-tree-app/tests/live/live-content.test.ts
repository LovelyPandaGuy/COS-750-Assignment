import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'
import { bundledFiles, loadContent, loadFrom } from '../../src/live/load'
import type { Problem } from '../../src/live/types'

// Spec: add-live-lesson-content / live-content. ID 7.1, 12.1, 12.2, 5.1, 5.2, 3.2.
// Broken-content cases change a deep copy of the bundled files in memory; the real files are never touched.

type Files = Record<string, unknown>
type Obj = Record<string, unknown>

const copy = (): Files => structuredClone(bundledFiles())
const problems = (files: Files): Problem[] => loadFrom(files).problems
const lessonFile = (files: Files, id: string) => files[`lessons/${id}.json`] as { screens: Obj[] } & Obj
const screen = (files: Files, lesson: string, id: string) => lessonFile(files, lesson).screens.find((s) => s.id === id)!
const question = (files: Files, file: string, id: string) => (files[file] as { questions: Obj[] }).questions.find((q) => q.id === id)!
const some = (ps: Problem[], match: Partial<Problem> & { text?: RegExp }) =>
  ps.some((p) => (match.file === undefined || p.file === match.file) && (match.id === undefined || p.id === match.id) && (match.field === undefined || p.field === match.field) && (match.text === undefined || match.text.test(p.message)))

describe('ID 7.1 content is loaded in manifest order', () => {
  it('lesson order', () => {
    const r = loadContent()
    expect(r.problems).toEqual([])
    expect(r.content!.lessons.map((l) => l.id)).toEqual(['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'c9'])
    expect(r.content!.lessons[2].title).toBe('The AVL property')
  })

  it('order follows the manifest', () => {
    const f = copy()
    const m = f['manifest.json'] as { files: string[] }
    const i2 = m.files.indexOf('lessons/c2.json')
    const i3 = m.files.indexOf('lessons/c3.json')
    ;[m.files[i2], m.files[i3]] = [m.files[i3], m.files[i2]]
    const r = loadFrom(f)
    expect(r.content!.lessons.map((l) => l.id).slice(1, 3)).toEqual(['c3', 'c2'])
  })
})

describe('ID 12 one loader for all lesson content', () => {
  const files = (dir: string): string[] =>
    readdirSync(dir).flatMap((n) => {
      const p = join(dir, n)
      return statSync(p).isDirectory() ? files(p) : /\.(ts|tsx)$/.test(n) ? [p] : []
    })
  const src = join(__dirname, '../../src')

  it('no other importer', () => {
    const importers = files(src)
      .filter((p) => /live_content/.test(readFileSync(p, 'utf8').split('\n').filter((l) => /^\s*import|import\.meta\.glob/.test(l)).join('\n')))
      .map((p) => relative(src, p))
    expect(importers.sort()).toEqual(['engine/conventions.ts', 'live/load.ts'])
  })

  it('no mock lesson content left', () => {
    for (const id of ['c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8']) expect(() => statSync(join(src, `content/modules/${id}.ts`))).toThrow()
  })
})

describe('ID 12.1 missing and unlisted files are errors', () => {
  it('missing file', () => {
    const f = copy()
    delete f['lessons/c5.json']
    expect(some(problems(f), { file: 'lessons/c5.json', text: /missing/ })).toBe(true)
  })

  it('unlisted file', () => {
    const f = copy()
    f['lessons/c10.json'] = { id: 'c10', title: 'x', outcomeIds: [], screens: [] }
    expect(some(problems(f), { file: 'lessons/c10.json', text: /not in the manifest/ })).toBe(true)
  })
})

describe('ID 12.2 structure is validated per file', () => {
  it('missing field', () => {
    const f = copy()
    delete screen(f, 'c3', 'c3-s04').merrillPhase
    expect(some(problems(f), { file: 'lessons/c3.json', id: 'c3-s04', field: 'merrillPhase' })).toBe(true)
  })

  it('unknown screen type', () => {
    const f = copy()
    screen(f, 'c3', 'c3-s04').type = 'carousel'
    expect(some(problems(f), { id: 'c3-s04', text: /carousel/ })).toBe(true)
  })

  it('lesson-blocks: an unknown field on a content screen is reported', () => {
    const f = copy()
    screen(f, 'c3', 'c3-s08').zoom = 2
    expect(some(problems(f), { id: 'c3-s08', field: 'zoom' })).toBe(true)
  })

  it('duplicate id', () => {
    const f = copy()
    const qs = (f['questions/checks.json'] as { questions: Obj[] }).questions
    qs.push({ ...qs.find((q) => q.id === 'chk4-01')! })
    expect(some(problems(f), { id: 'chk4-01', text: /used twice/ })).toBe(true)
  })

  it('the shipped content is valid', () => {
    expect(loadContent().problems).toEqual([])
  })
})

describe('ID 12.1 references are validated', () => {
  it('dangling misconception', () => {
    const f = copy()
    const q = question(f, 'questions/checks.json', 'chk6-02')
    ;(q.options as Obj[])[1].misconceptionId = 'misc-none'
    expect(some(problems(f), { id: 'chk6-02', text: /misc-none/ })).toBe(true)
  })

  it('wrong option without a misconception (ID 9.5)', () => {
    const f = copy()
    const q = question(f, 'questions/checks.json', 'chk6-02')
    delete (q.options as Obj[]).find((o) => o.id !== q.correctOptionId)!.misconceptionId
    expect(some(problems(f), { id: 'chk6-02', text: /no misconception/ })).toBe(true)
  })
})

describe('ID 3.2 lesson structure is validated', () => {
  it('event and phase disagree', () => {
    const f = copy()
    screen(f, 'c3', 'c3-s04').merrillPhase = 'application'
    expect(some(problems(f), { id: 'c3-s04', field: 'gagneEvent' })).toBe(true)
  })

  it('summary not last', () => {
    const f = copy()
    const l = lessonFile(f, 'c3')
    l.screens.push({ ...l.screens[3], id: 'c3-s99' })
    expect(some(problems(f), { id: 'c3', text: /end with its summary/ })).toBe(true)
  })
})

describe('ID 5.1 5.2 objectives and Bloom levels are validated', () => {
  it('criterion out of range', () => {
    const f = copy()
    question(f, 'questions/checks.json', 'chk3-01').criteria = ['LO2.3']
    expect(some(problems(f), { id: 'chk3-01', field: 'criteria' })).toBe(true)
  })

  it('level does not match the objective', () => {
    const f = copy()
    question(f, 'questions/checks.json', 'chk8-01').level = 'apply'
    expect(some(problems(f), { id: 'chk8-01', field: 'level' })).toBe(true)
  })

  it('lesson objective', () => {
    const lessons = loadContent().content!.lessons
    expect(Object.fromEntries(lessons.slice(1, 8).map((l) => [l.id, l.outcomeIds.join()]))).toEqual({
      c2: 'LO1',
      c3: 'LO2',
      c4: 'LO3',
      c5: 'LO4',
      c6: 'LO5',
      c7: 'LO7',
      c8: 'LO6',
    })
  })
})

describe('ID 12.2 trees are insertion sequences of one key type', () => {
  it('mixed keys', () => {
    const f = copy()
    screen(f, 'c3', 'c3-s04').tree = { insert: [10, 'A'] }
    expect(some(problems(f), { id: 'c3-s04', field: 'tree', text: /mix/ })).toBe(true)
  })

  it('a tree that is not a BST', () => {
    const q = loadContent().content!.diagnostic.questions.find((x) => x.id === 'dia-02')!
    expect(q.tree).toEqual({ structure: [8, [4, [2], [9]], [12, [10], [14]]] })
  })
})

describe('ID 12.2 typed answers agree with the engine', () => {
  it('balance factors agree', () => {
    expect(loadContent().problems).toEqual([])
  })

  it('a wrong typed value is reported', () => {
    const f = copy()
    ;(screen(f, 'c3', 'c3-s11').task as Obj).expected = [-4]
    const p = problems(f).find((x) => x.id === 'c3-s11-task')!
    expect(p.message).toMatch(/\[-4\]/)
    expect(p.message).toMatch(/\[4\]/)
  })

  it('animation steps agree, and a changed caption is reported', () => {
    const f = copy()
    const s = screen(f, 'c4', 'c4-s04')
    expect(s.steps).toEqual(['30 > 20: go right.', '30 < 40: go left.', '30 = 30: found.'])
    expect(s.result).toBe('20(10, 40(30, 50))')
    ;(s.steps as string[])[1] = '30 > 40: go right.'
    expect(some(problems(f), { id: 'c4-s04', field: 'steps' })).toBe(true)
  })
})
