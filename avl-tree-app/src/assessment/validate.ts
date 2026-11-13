// The bank validator (add-question-model-and-bank, design decision 8; FR-ASM-02, FR-ASM-03, D19).
// Pure and never throws: every problem is reported.
import { conventionsWording } from '../content/modules/conventionsWording'
import { MISCONCEPTIONS, type MisconceptionEntry } from '../content/questions/misconceptions'
import { OUTCOMES, type OutcomeEntry } from '../content/questions/outcomes'
import { GENERAL_HINTS, HINTS, type HintEntry } from '../content/questions/scaffolds'
import { SUB_SKILLS, type SubSkillEntry } from '../content/questions/subSkills'
import { BALANCE_RANGE, EMPTY_HEIGHT, LEAF_HEIGHT } from '../engine/conventions'
import { numbersIn, statesConvention, VALIDATION_WORDING, type Problem } from '../modules/validate'
import { MODULE_IDS, type ModuleId } from '../state/learnerState'
import { BLOOM_LEVELS, LO_IDS, OUTCOME_TAGS, type LoId, type OutcomeTag } from './ids'
import { instantiate } from './instantiate'
import { KINDS } from './kinds'
import type { BankItem, Instance, Kind, KindName } from './types'

export interface BankRecords {
  outcomes: Record<OutcomeTag, OutcomeEntry>
  subSkills: Record<string, SubSkillEntry>
  misconceptions: Record<string, MisconceptionEntry>
  /** Scaffold hints per misconception and per sub-skill (add-scaffold-ladder-and-retry-cap). */
  hints?: Record<string, HintEntry>
  generalHints?: Record<string, HintEntry>
}

export interface ValidateOptions {
  seeds?: readonly number[]
  kinds?: Record<KindName, Kind>
  records?: BankRecords
}

const DEFAULT_SEEDS = Array.from({ length: 100 }, (_, i) => i)
const DEFAULT_RECORDS: BankRecords = { outcomes: OUTCOMES, subSkills: SUB_SKILLS, misconceptions: MISCONCEPTIONS, hints: HINTS, generalHints: GENERAL_HINTS }
/** The text as whole words, any case: a short option such as a case name must not match inside another word. */
const wholeWords = (text: string) => new RegExp(`(?<![\\w])${text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\w])`, 'i')
/** A value left out of a rendered text. */
const PLACEHOLDER = /\b(?:undefined|NaN|null)\b/
/** D27: feedback never judges. */
const JUDGING = /\b(?:wrong|fail\w*|incorrect)\b/i
/** FR-ASM-01: modules with a check, and how many items each has. */
const CHECK_MODULES: readonly ModuleId[] = ['C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8']
const ITEMS_PER_CHECK = { min: 2, max: 3 }
/** C1's diagnostic: five items, or none when only the module checks are validated (FR-DIA-01). */
const DIAGNOSTIC_ITEMS = 5
/** D4: the only module whose check is optional. */
const OPTIONAL_MODULE: ModuleId = 'C7'

const isOneOf = <T extends string>(list: readonly T[], v: unknown): v is T => typeof v === 'string' && (list as readonly string[]).includes(v)

function tagProblems(item: BankItem, records: BankRecords, kinds: Record<KindName, Kind>): Problem[] {
  const out: Problem[] = []
  const tag = (name: string, detail: string) => out.push({ kind: 'tag', step: item.id, value: name, message: `${item.id}: ${name} ${detail}` })
  if (!isOneOf(MODULE_IDS, item.module)) tag('module', `"${String(item.module)}" is not a module`)
  if (!isOneOf(OUTCOME_TAGS, item.outcome)) tag('outcome', `"${String(item.outcome)}" is not LO1 to LO9 or PRE`)
  const skill = records.subSkills[item.subSkill]
  if (!item.subSkill || skill === undefined) tag('subSkill', `"${item.subSkill}" is missing or unknown`)
  else if (skill.outcome !== item.outcome) tag('subSkill', `"${item.subSkill}" belongs to ${skill.outcome}, not ${item.outcome}`)
  if (!isOneOf(BLOOM_LEVELS, item.level)) tag('level', `"${String(item.level)}" is not a Bloom level`)
  else if (isOneOf(OUTCOME_TAGS, item.outcome) && !records.outcomes[item.outcome].levels.includes(item.level)) {
    tag('level', `"${item.level}" is not a level the ID gives ${item.outcome}`)
  }
  if (kinds[item.kind] === undefined) tag('kind', `"${String(item.kind)}" is not a kind`)
  return out
}

function whyProblems(item: BankItem, kind: Kind, records: BankRecords): Problem[] {
  const out: Problem[] = []
  const add = (value: string, message: string) => out.push({ kind: 'misconception', step: item.id, value, message: `${item.id}: ${message}` })
  if (item.why.correct === undefined) add('correct', 'no explanation for the correct answer')
  if (kind.type !== 'choice' && item.why.other === undefined) add('other', 'no explanation for other answers')
  for (const m of kind.misconceptions) {
    if (records.misconceptions[m] === undefined) add(m, `${m} is not in the catalogue`)
    if (item.why[m] === undefined) add(m, `no explanation for ${m}, which its kind can produce`)
  }
  return out
}

/** Every text an instance shows. */
function textsOf(inst: Instance): string[] {
  return [
    inst.stem,
    inst.correctExplanation,
    inst.otherExplanation ?? '',
    ...(inst.options ?? []).flatMap((o) => [o.text, o.explanation]),
    ...(inst.known ?? []).map((k) => k.explanation),
  ].filter((t) => t !== '')
}

function instanceProblems(item: BankItem, inst: Instance, check: Instance, records: BankRecords): Problem[] {
  const out: Problem[] = []
  const add = (kind: Problem['kind'], message: string, value?: string | number) => {
    const p: Problem = { kind, step: item.id, message: `${item.id} seed ${inst.seed}: ${message}` }
    if (value !== undefined) p.value = value
    out.push(p)
  }

  if (inst.type === 'choice') {
    const opts = inst.options ?? []
    if (opts.length < 2) add('option', 'fewer than two options')
    if (new Set(opts.map((o) => o.text)).size !== opts.length) add('option', 'two options share a text')
    if (opts.filter((o) => o.correct).length !== 1) add('option', 'not exactly one correct option')
    for (const o of opts) {
      if (typeof o.value === 'string' && item.optionText === undefined) add('option', `option ${o.id} needs optionText`)
      if (o.explanation.trim() === '') add('option', `option ${o.id} has no explanation`)
      if (!o.correct && (o.misconceptionId === undefined || records.misconceptions[o.misconceptionId] === undefined)) {
        add('option', `option ${o.id} has no catalogue misconception`)
      }
    }
  } else {
    for (const k of inst.known ?? []) if (k.explanation.trim() === '') add('misconception', `no explanation for ${k.misconception}`)
  }

  const allowed = new Set<number>([LEAF_HEIGHT, EMPTY_HEIGHT, ...BALANCE_RANGE, ...inst.numbers])
  for (const o of inst.options ?? []) if (typeof o.value === 'number') allowed.add(o.value)
  for (const text of textsOf(check)) {
    if (statesConvention(text)) add('wording', `"${text}" states sign, lean or case wording (D19)`, text)
    if (JUDGING.test(text)) add('wording', `"${text}" uses judging words (D27)`, text)
    for (const n of numbersIn(text)) if (!allowed.has(n)) add('number', `${n} in "${text}" is not a fact of the instance`, n)
  }
  return out
}

/**
 * Every hint the ladder can show for an instance (its sub-skill's general hint and one per
 * misconception its kind produces), checked like the item's own text, plus: no placeholder and no
 * answer. Missing hints are reported by validateBank's coverage pass, not here.
 */
function hintProblems(item: BankItem, kind: Kind, inst: Instance, records: BankRecords): Problem[] {
  const out: Problem[] = []
  const add = (pk: Problem['kind'], label: string, message: string, value?: string | number) => {
    const p: Problem = { kind: pk, step: item.id, message: `${item.id} seed ${inst.seed} hint ${label}: ${message}` }
    if (value !== undefined) p.value = value
    out.push(p)
  }
  const hints = records.hints ?? HINTS
  const general = records.generalHints ?? GENERAL_HINTS
  const entries: [string, HintEntry | undefined][] = [[item.subSkill, general[item.subSkill]], ...kind.misconceptions.map((m): [string, HintEntry | undefined] => [m, hints[m]])]

  const allowed = new Set<number>([LEAF_HEIGHT, EMPTY_HEIGHT, ...BALANCE_RANGE, ...inst.numbers])
  const stemNumbers = new Set(numbersIn(inst.stem))
  const correct = inst.options?.find((o) => o.correct)
  for (const [label, entry] of entries) {
    if (entry === undefined) continue
    const text = entry.text(inst.facts, VALIDATION_WORDING)
    const plain = entry.text(inst.facts, conventionsWording())
    if (statesConvention(text)) add('wording', label, `"${text}" states sign, lean or case wording (D19)`, text)
    if (JUDGING.test(text)) add('wording', label, `"${text}" uses judging words (D27)`, text)
    if (PLACEHOLDER.test(plain)) add('wording', label, `"${plain}" has a placeholder`, plain)
    const numbers = numbersIn(text)
    for (const n of numbers) if (!allowed.has(n)) add('number', label, `${n} in "${text}" is not a fact of the instance`, n)
    // D27, guardrail: a hint says where to look, never what the answer is.
    if (typeof inst.answer === 'number' && numbers.includes(inst.answer) && !stemNumbers.has(inst.answer)) {
      add('answer', label, `"${plain}" states the answer ${inst.answer}`, label)
    }
    if (correct !== undefined && typeof correct.value === 'string' && !inst.stem.includes(correct.text) && wholeWords(correct.text).test(plain)) {
      add('answer', label, `"${plain}" contains the correct option "${correct.text}"`, label)
    }
  }
  return out
}

/** Item-level checks: tags, explanations, and every instance over the seeds. */
export function validateItems(items: readonly BankItem[], options: ValidateOptions = {}): Problem[] {
  const seeds = options.seeds ?? DEFAULT_SEEDS
  const kinds = options.kinds ?? KINDS
  const records = options.records ?? DEFAULT_RECORDS
  const problems: Problem[] = []
  const seen = new Set<string>()
  const push = (p: Problem) => {
    // One report per distinct problem, not one per seed.
    const key = `${p.kind}|${p.step}|${String(p.value ?? p.message)}`
    if (!seen.has(key)) {
      seen.add(key)
      problems.push(p)
    }
  }

  const ids = new Set<string>()
  for (const item of items) {
    if (ids.has(item.id)) push({ kind: 'bank', step: item.id, message: `duplicate item ID ${item.id}` })
    ids.add(item.id)
    tagProblems(item, records, kinds).forEach(push)
    const kind = kinds[item.kind]
    if (kind === undefined) continue
    whyProblems(item, kind, records).forEach(push)
    for (const seed of seeds) {
      try {
        const inst = instantiate(item, seed, 0, { kinds })
        const check = instantiate(item, seed, 0, { kinds, wording: VALIDATION_WORDING })
        instanceProblems(item, inst, check, records).forEach(push)
        hintProblems(item, kind, inst, records).forEach(push)
      } catch (e) {
        push({ kind: 'bank', step: item.id, value: seed, message: `${item.id} seed ${seed}: cannot be built (${(e as Error).message})` })
      }
    }
  }
  return problems
}


/** The whole bank: item checks, then per-module counts, optional flags and catalogue coverage. */
export function validateBank(items: readonly BankItem[], options: ValidateOptions = {}): Problem[] {
  const problems = validateItems(items, options)
  const records = options.records ?? DEFAULT_RECORDS
  for (const m of MODULE_IDS) {
    const n = items.filter((i) => i.module === m).length
    if (m === 'C1') {
      if (n !== 0 && n !== DIAGNOSTIC_ITEMS) problems.push({ kind: 'bank', value: m, message: `C1 has ${n} items; it needs ${DIAGNOSTIC_ITEMS}` })
      continue
    }
    const [min, max] = CHECK_MODULES.includes(m) ? [ITEMS_PER_CHECK.min, ITEMS_PER_CHECK.max] : [0, 0]
    if (n < min || n > max) problems.push({ kind: 'bank', value: m, message: `${m} has ${n} items; it needs ${min} to ${max}` })
  }
  for (const i of items) {
    // D4: C7's items are the only optional ones here; C9's items are in the readiness bank (D84).
    if ((i.optional === true) !== (i.module === OPTIONAL_MODULE)) {
      problems.push({ kind: 'bank', step: i.id, message: `${i.id}: only ${OPTIONAL_MODULE} items are optional` })
    }
  }
  const produced = new Set<string>()
  for (const item of items) {
    if ((options.kinds ?? KINDS)[item.kind] === undefined) continue
    for (const seed of options.seeds ?? DEFAULT_SEEDS) {
      try {
        const inst = instantiate(item, seed, 0, { kinds: options.kinds })
        for (const o of inst.options ?? []) if (o.misconceptionId) produced.add(o.misconceptionId)
        for (const k of inst.known ?? []) produced.add(k.misconception)
      } catch {
        // already reported by validateItems
      }
    }
  }
  for (const m of Object.keys(records.misconceptions)) {
    if (!produced.has(m)) problems.push({ kind: 'misconception', value: m, message: `${m} is never produced by any item` })
  }
  // FR-SCA-02: every misconception and every sub-skill has a scaffold.
  const hints = records.hints ?? HINTS
  const general = records.generalHints ?? GENERAL_HINTS
  for (const m of Object.keys(records.misconceptions)) {
    if (hints[m] === undefined) problems.push({ kind: 'scaffold', value: m, message: `${m} has no hint` })
  }
  for (const s of Object.keys(records.subSkills)) {
    if (general[s] === undefined) problems.push({ kind: 'scaffold', value: s, message: `sub-skill ${s} has no general hint` })
  }
  return problems
}

/** C9 (FR-ASM-06, add-readiness-c9): the outcomes the combined items count toward, build then search. */
const COMBINED_OUTCOMES: readonly LoId[] = ['LO7', 'LO4']
const READINESS_MODULE: ModuleId = 'C9'
/** D4: the outcome whose readiness item is optional. */
const OPTIONAL_OUTCOME: LoId = 'LO8'

/** The C9 readiness bank: the item checks, then one item per outcome, the two combined items, module and optional flags. */
export function validateReadinessBank(items: readonly BankItem[], options: ValidateOptions = {}): Problem[] {
  const problems = validateItems(items, options)
  for (const lo of LO_IDS) {
    const n = items.filter((i) => i.outcome === lo && i.combined !== true).length
    if (n !== 1) problems.push({ kind: 'bank', value: lo, message: `${lo} has ${n} readiness items; it needs exactly 1` })
  }
  const combined = items.filter((i) => i.combined === true).map((i) => i.outcome)
  if ([...combined].sort().join(',') !== [...COMBINED_OUTCOMES].sort().join(',')) {
    problems.push({ kind: 'bank', value: 'combined', message: `the combined items count toward ${combined.join(', ') || 'nothing'}; they need ${COMBINED_OUTCOMES.join(' and ')}` })
  }
  for (const i of items) {
    if (i.module !== READINESS_MODULE) problems.push({ kind: 'bank', step: i.id, value: i.id, message: `${i.id}: a readiness item belongs to ${READINESS_MODULE}` })
    const shouldBeOptional = i.outcome === OPTIONAL_OUTCOME && i.combined !== true
    if ((i.optional === true) !== shouldBeOptional) {
      problems.push({ kind: 'bank', step: i.id, value: i.id, message: `${i.id}: only the ${OPTIONAL_OUTCOME} readiness item is optional` })
    }
  }
  return problems
}
