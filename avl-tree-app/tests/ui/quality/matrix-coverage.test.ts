import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { lessonCopy } from '../../../src/content/lesson'
import { sandboxCopy } from '../../../src/content/sandbox'
import { screenCopy } from '../../../src/content/screens'
import { startCopy } from '../../../src/content/start'
import { treeViewCopy } from '../../../src/content/treeView'
import { CONVENTIONS } from '../../../src/engine/conventions'
import { loadContent } from '../../../src/live/load'
import { markQuestion } from '../../../src/live/mark'
import { patterns } from '../../../src/routes'
import { LEARNER_KEY as APP_LEARNER_KEY, SETTINGS_KEY as APP_SETTINGS_KEY } from '../../../src/state/storage'
import { LEARNER_KEY, SEEDS, SETTINGS_KEY } from '../../visual/matrix/seed'
import { CAPABILITIES, ENTRIES, FRAMES, LABELS, LESSONS, OPEN_FRAME_STATES, OPEN_STATES, type Capability } from '../../visual/matrix/states'

// Spec: ui-quality-sweep / ui-foundation "State matrix" (scenario "Every route and screen type is listed"),
// "Quality bar 1" (scenario "Frames covered"), and each component capability's "states are in the state
// matrix" (scenario "States listed"). Quality bar 1 and 4; D150.

/** The capability's state list, from the sentence "it has an entry for each of these states: …". */
function specStates(cap: Capability): string[] {
  const where = [`openspec/changes/ui-quality-sweep/specs/${cap}/spec.md`, `openspec/specs/${cap}/spec.md`].find((p) => existsSync(p) && readFileSync(p, 'utf8').includes('each of these states:'))
  if (where === undefined) throw new Error(`no state list for ${cap}`)
  const line = readFileSync(where, 'utf8').split('\n').find((l) => l.includes('each of these states:'))!
  const list = line.slice(line.indexOf('each of these states:') + 'each of these states:'.length).trim()
  // Split on commas outside parentheses: "each lesson state (done, current, open, locked)" is one state.
  const out: string[] = []
  let depth = 0
  let cur = ''
  for (const ch of list) {
    if (ch === '(') depth++
    if (ch === ')') depth--
    if (ch === ',' && depth === 0) {
      out.push(cur.trim())
      cur = ''
    } else cur += ch
  }
  out.push(cur.trim())
  return out.filter((s) => s.length > 0)
}

describe('ui-foundation: State matrix, every route and screen type is listed', () => {
  it('ids are unique and seeds are known', () => {
    const ids = ENTRIES.map((e) => e.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const e of ENTRIES) expect(SEEDS, e.id).toContain(e.seed)
  })

  it('every route in src/routes.ts has an entry', () => {
    const app = ENTRIES.filter((e) => !e.route.startsWith('gallery:')).map((e) => e.route)
    for (const [name, pattern] of Object.entries(patterns)) {
      const re = new RegExp(`^${pattern.replace(/:[a-zA-Z]+/g, '[^/]+')}$`)
      expect(
        app.some((r) => re.test(r)),
        `route ${name} (${pattern})`,
      ).toBe(true)
    }
  })

  it('every screen type in the lesson files (with the refresher) has an entry', () => {
    const types = new Set(LESSONS.flatMap((l) => [...l.screens, ...(l.refresher?.screens ?? [])].map((s) => s.type)))
    expect(types.size).toBe(21)
    const covered = new Set(ENTRIES.map((e) => e.screenType).filter(Boolean))
    for (const t of types) expect(covered.has(t), `screen type ${t}`).toBe(true)
  })

  it('every gallery entry names a gallery section that exists', () => {
    const sources = readdirSync('src/ui', { recursive: true })
      .filter((p) => String(p).endsWith('.tsx'))
      .map((p) => readFileSync(`src/ui/${String(p)}`, 'utf8'))
      .join('\n')
    for (const e of ENTRIES.filter((x) => x.route.startsWith('gallery:'))) expect(sources, e.id).toContain(e.route.slice('gallery:'.length))
  })
})

describe('ui-foundation: Quality bar 1, frames covered', () => {
  it('every frame in the design has a screen spec', () => {
    const specs = readdirSync('.claude/docs/design/screens').filter((f) => /^1[a-z]\.md$/.test(f)).map((f) => f.slice(0, 2))
    expect([...specs].sort()).toEqual([...FRAMES].sort())
  })

  it('every frame is named by an entry, or has an [OPEN] note saying why not', () => {
    const named = new Set(ENTRIES.map((e) => e.frame).filter(Boolean))
    for (const f of FRAMES) expect(named.has(f) || OPEN_FRAME_STATES[f] !== undefined, `frame ${f}`).toBe(true)
  })
})

describe('component capabilities: states listed in the matrix', () => {
  for (const cap of CAPABILITIES) {
    it(`${cap}: each state in its spec has an entry or an open note`, () => {
      const listed = new Set(ENTRIES.flatMap((e) => e.states?.[cap] ?? []))
      const open = OPEN_STATES[cap] ?? {}
      const states = specStates(cap)
      expect(states.length).toBeGreaterThan(0)
      for (const s of states) expect(listed.has(s) || s in open, `${cap}: "${s}"`).toBe(true)
      // Nothing claimed that the spec does not list (typos would hide a gap).
      for (const s of [...listed, ...Object.keys(open)]) expect(states, `${cap}: unknown state "${s}"`).toContain(s)
    })
  }
})

describe('the matrix steps stay true to the app (design: steps break loudly when wording changes)', () => {
  it('every label the steps use is the content file\'s current wording', () => {
    const feedback = (CONVENTIONS as unknown as { feedback: { nextStepRetry: string } }).feedback
    expect(LABELS).toEqual({
      RETRY: feedback.nextStepRetry,
      HINT: lessonCopy.controls.hint,
      NEXT_STEP: lessonCopy.animation.next,
      DESCRIBE: treeViewCopy.describeButton,
      CHECK: lessonCopy.questions.checkAnswer,
      RESET: startCopy.resetLink,
      INSERT: sandboxCopy.insert,
      TITLE_SUFFIX: screenCopy.titleSuffix,
    })
  })

  it('storage keys match the app', () => {
    expect(LEARNER_KEY).toBe(APP_LEARNER_KEY)
    expect(SETTINGS_KEY).toBe(APP_SETTINGS_KEY)
  })

  it('every picked option is marked by the engine as the step expects (no answer is trusted unchecked)', () => {
    const questions = loadContent().content!.checks.questions
    const picks = ENTRIES.flatMap((e) => e.steps ?? []).filter((a) => 'pick' in a)
    expect(picks.length).toBeGreaterThan(0)
    for (const a of picks) {
      const q = questions.find((x) => x.id === a.question)!
      expect(markQuestion(q, { kind: 'option', id: a.pick }).verdict === 'right', `${a.question} option ${a.pick}`).toBe(a.expect === 'right')
    }
  })
})
