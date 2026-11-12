// Scenario choice for C8 (add-question-model-and-bank, design decision 5). The answer comes from the
// comparison record through answersOf; each other structure is tagged with the need it misses.
import { SCENARIOS } from '../../content/modules/structures'
import { createRng } from '../../engine/random'
import { answersOf, NEED_IDS, reasonOf, STRUCTURE_IDS } from '../../modules/compare'
import { numbersIn } from '../../modules/validate'
import { needMisconception } from '../ids'
import type { Kind, WrongValue } from '../types'

export const scenarioChoice: Kind = {
  type: 'choice',
  misconceptions: NEED_IDS.map(needMisconception),
  build(seed, params) {
    const ids = params?.scenarios ?? Object.keys(SCENARIOS)
    const id = ids[createRng(seed).int(0, ids.length - 1)]
    const scenario = SCENARIOS[id]
    if (scenario === undefined) throw new RangeError(`unknown scenario ${id}`)
    const [answer] = answersOf(scenario)
    const wrong = STRUCTURE_IDS.filter((s) => s !== answer).map(
      (s): WrongValue => ({ value: s, misconception: needMisconception(reasonOf(scenario, s)!) }),
    )
    return {
      facts: { tree: null, keys: [], scenario, values: {} },
      numbers: numbersIn(scenario.text),
      signature: scenario.id,
      answer,
      wrong,
    }
  },
}
