// Seeded instantiation, variants and option order (add-question-model-and-bank, design decision 3).
import { conventionsWording, type ConventionsWording } from '../content/modules/conventionsWording'
import { variantSeed } from '../engine/generate'
import { createRng } from '../engine/random'
import type { Tree } from '../engine/tree'
import { KINDS } from './kinds'
import { isTreeValue, shapeKey } from './shape'
import type { BankItem, Built, Instance, Kind, KindName, KnownWrong, Option, OptionValue } from './types'

/** Extra variant seeds tried when a retry would repeat the problem before it. */
const RETRY_TRIES = 10
/** Keeps the option shuffle independent of the problem's own draws from the same seed. */
const SHUFFLE_SALT = 0x5bd1e995

export interface InstantiateOptions {
  wording?: ConventionsWording
  kinds?: Record<KindName, Kind>
}

interface Variant {
  variant: number
  built: Built
  /** Choice items: option values in shown order. */
  order: OptionValue[]
}

const valueKey = (v: OptionValue | Tree): string => (isTreeValue(v) ? shapeKey(v) : `${typeof v}:${String(v)}`)

/** Answer first, then each distinct wrong value that is not the answer; the first misconception wins. */
function distinctWrong(built: Built): Built['wrong'] {
  const seen = new Set([valueKey(built.answer)])
  return built.wrong.filter((w) => {
    const k = valueKey(w.value)
    if (seen.has(k)) return false
    seen.add(k)
    return true
  })
}

function shuffled(values: OptionValue[], variant: number): OptionValue[] {
  const out = [...values]
  const rng = createRng((variant ^ SHUFFLE_SALT) | 0)
  for (let i = out.length - 1; i > 0; i--) {
    const j = rng.int(0, i)
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

function variantOf(item: BankItem, kind: Kind, seed: number, attempt: number): Variant {
  const make = (variant: number): Variant => {
    const built = kind.build(variant, item.params)
    const values = [built.answer as OptionValue, ...distinctWrong(built).map((w) => w.value as OptionValue)]
    return { variant, built, order: kind.type === 'choice' ? shuffled(values, variant) : [] }
  }
  if (attempt === 0) return make(seed)

  const prev = variantOf(item, kind, seed, attempt - 1)
  let next = make(variantSeed(seed, attempt))
  for (let k = 1; k <= RETRY_TRIES && next.built.signature === prev.built.signature; k++) {
    next = make(variantSeed(seed, attempt + 1000 * k))
  }
  // D9: a retry reshuffles; make sure the correct option moves.
  const at = (v: Variant) => v.order.findIndex((o) => valueKey(o) === valueKey(v.built.answer))
  if (next.order.length > 1 && prev.order.length > 0 && at(next) === at(prev)) next.order.push(next.order.shift()!)
  return next
}

/** Build attempt `attempt` of an item from a seed. The same arguments always give an equal instance. */
export function instantiate(item: BankItem, seed: number, attempt = 0, options: InstantiateOptions = {}): Instance {
  const kinds = options.kinds ?? KINDS
  const w = options.wording ?? conventionsWording()
  const kind = kinds[item.kind]
  if (kind === undefined) throw new RangeError(`unknown kind ${String(item.kind)}`)
  const { variant, built, order } = variantOf(item, kind, seed, attempt)
  const f = built.facts
  const why = (key: string, value?: OptionValue) => item.why[key]?.(f, w, value) ?? ''
  const wrong = distinctWrong(built)

  const inst: Instance = {
    itemId: item.id,
    seed,
    attempt,
    variant,
    type: kind.type,
    stem: item.stem(f, w),
    facts: f,
    signature: built.signature,
    answer: built.answer,
    correctExplanation: why('correct', isTreeValue(built.answer) ? undefined : built.answer),
    numbers: built.numbers,
  }
  if (built.trace !== undefined) inst.trace = built.trace

  if (kind.type === 'choice') {
    const misOf = new Map(wrong.map((x) => [valueKey(x.value), x.misconception]))
    inst.options = order.map((value): Option => {
      const correct = valueKey(value) === valueKey(built.answer)
      const misconceptionId = misOf.get(valueKey(value))
      const text = item.optionText !== undefined ? item.optionText(f, w, value) : String(value)
      const option: Option = { id: `opt-${String(value)}`, value, text, correct, explanation: why(correct ? 'correct' : misconceptionId ?? '', value) }
      if (!correct && misconceptionId !== undefined) option.misconceptionId = misconceptionId
      return option
    })
  } else {
    inst.known = wrong.map(
      (x): KnownWrong => ({
        value: x.value as number | Tree,
        misconception: x.misconception,
        explanation: why(x.misconception, isTreeValue(x.value) ? undefined : (x.value as OptionValue)),
      }),
    )
    inst.otherExplanation = why('other')
  }
  return inst
}
