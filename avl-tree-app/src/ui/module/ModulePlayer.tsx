import { useEffect, useId, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './module.css'
import { playerCopy } from '../../content/modules/player'
import { activityLabel } from '../../content/screens'
import { variantSeed } from '../../engine/generate'
import type { Key } from '../../engine/tree'
import { PRACTICE_HINTS } from '../../modules/config'
import { computeFacts } from '../../modules/facts'
import type { StructureId } from '../../modules/compare'
import { pickScenario, practiceProblem } from '../../modules/generators'
import { renderStep } from '../../modules/render'
import { recommendRoute } from '../../navigation/policy'
import { drawSearchPractice } from '../../modules/searchPractice'
import { drawDeletePractice } from '../../modules/deletePractice'
import { pseudocode } from '../../content/pseudocode'
import { replayCopy } from '../../content/replay'
import { ReplayPlayer } from '../replay/ReplayPlayer'
import { PseudocodePanel } from '../replay/PseudocodePanel'
import { emitRouteEvent } from '../../navigation/routeEvents'
import { SKIPPABLE_EVENTS, stepsFor, type ModuleContent, type Step, type StepActivity } from '../../modules/schema'
import { ACTIVITIES_BY_MODULE, paths } from '../../routes'
import { TreeView } from '../tree/TreeView'
import { ArrayView } from './ArrayView'
import { ComparisonTable } from './ComparisonTable'
import { ControlStrip } from './ControlStrip'
import { RouteChoice } from './RouteChoice'
import { BalanceFactorFill } from './practice/BalanceFactorFill'
import { BeTheAlgorithm } from './practice/BeTheAlgorithm'
import { FindAfterDelete } from './practice/FindAfterDelete'
import { RotatePractice } from './practice/RotatePractice'
import { ScenarioPractice } from './practice/ScenarioPractice'
import { SpotTheProblem } from './practice/SpotTheProblem'

interface PracticeState {
  regen: number
  answered: Key[]
  solved: boolean
  hintsUsed: number
  /** Scenario practice: the structure chosen, and the one checked (add-module-c8-choosing). */
  choice?: StructureId
  checked?: StructureId
  /** The scenario showing before New scenario, so the next pick differs. */
  avoid?: string
}
const FRESH: PracticeState = { regen: 0, answered: [], solved: false, hintsUsed: 0, choice: undefined, checked: undefined, avoid: undefined }

export interface ModulePlayerProps {
  content: ModuleContent
  activity: StepActivity
}

/**
 * One activity of a module, one step at a time (design decision 6). The step index and practice
 * answers live here, so Back and Next within the activity keep them; nothing is stored.
 */
export function ModulePlayer({ content, activity }: ModulePlayerProps) {
  const navigate = useNavigate()
  const steps = stepsFor(content, activity)
  const [index, setIndex] = useState(0)
  const [ruleOpen, setRuleOpen] = useState(false)
  const [practice, setPractice] = useState<Record<string, PracticeState>>({})
  const [baseSeed] = useState(() => Date.now() >>> 0)
  /** Rotation practice steps the student has left; they stay mounted (hidden) so Back keeps them. */
  const [kept, setKept] = useState<string[]>([])
  const heading = useRef<HTMLHeadingElement>(null)
  const shown = useRef(index)
  const ruleId = useId()

  const step = steps[index]
  const stateOf = (s: Step) => practice[s.id] ?? FRESH
  const seedOf = (s: Step) => variantSeed(baseSeed, steps.indexOf(s) * 1000 + stateOf(s).regen)
  const p = stateOf(step)
  const seed = seedOf(step)
  const r = renderStep(step, seed, computeFacts(step, seed))
  const facts = r.facts

  // Focus the step heading when the step changes, not on first mount (the route focuses h1).
  useEffect(() => {
    if (shown.current !== index) heading.current?.focus()
    shown.current = index
  }, [index])

  const go = (i: number) => {
    if (step.practice === 'rotate') setKept((k) => (k.includes(step.id) ? k : [...k, step.id]))
    setRuleOpen(false)
    setIndex(i)
  }
  const nextActivity = () => {
    const list = ACTIVITIES_BY_MODULE[content.id]
    const after = list[list.indexOf(activity) + 1]
    navigate(after === undefined ? paths.hub() : paths.activity(content.id, after))
  }
  // The last step of the Check activity offers a route (D20); Next there counts as choosing the path (D28).
  const recommended = activity === 'check' && index === steps.length - 1 ? recommendRoute(content.id) : null
  const onNext = () => {
    if (index + 1 < steps.length) return go(index + 1)
    if (recommended !== null) {
      emitRouteEvent({ type: 'route_chosen', from: content.id, recommended, chosen: 'path', at: new Date().toISOString() })
    }
    nextActivity()
  }
  const onBack = () => (index > 0 ? go(index - 1) : navigate(paths.module(content.id)))
  const onSkip = () => {
    const j = steps.findIndex((s, i) => i > index && !SKIPPABLE_EVENTS.includes(s.event))
    if (j === -1) nextActivity()
    else go(j)
  }
  const update = (change: Partial<PracticeState>) => setPractice((all) => ({ ...all, [step.id]: { ...p, ...change } }))
  const review = () => setRuleOpen(true)

  const tree = Object.values(facts.figures)[0]?.tree ?? null
  const label = step.figures?.[0]?.label
  const rotateSteps = steps.filter((s) => s.practice === 'rotate' && (s.id === step.id || kept.includes(s.id)))

  return (
    <div className="screen-stack module-player">
      <h1 tabIndex={-1}>{activityLabel(content.id, activity)}</h1>
      <p className="module-place">{playerCopy.stepOf(index + 1, steps.length)}</p>
      <section className="module-step" aria-labelledby={`${ruleId}-h`}>
        <h2 id={`${ruleId}-h`} ref={heading} tabIndex={-1}>
          {r.heading}
        </h2>
        {step.replay !== undefined &&
          (() => {
            const f = facts.figures[step.replay.figure]
            const spec = step.figures?.find((x) => x.id === step.replay?.figure)
            if (f === undefined || f.searchKey === undefined) return null
            // Keyed on the step, so the replay starts again each time the step is shown.
            return <ReplayPlayer key={step.id} operation={{ kind: 'search', tree: f.tree, key: f.searchKey }} label={spec?.label ?? ''} />
          })()}
        {(step.listings?.length ?? 0) > 0 && (
          <div className="module-listings">
            {(step.listings ?? []).map((name) => (
              <PseudocodePanel key={name} name={replayCopy.panel[name]} listing={pseudocode[name]} line={null} />
            ))}
          </div>
        )}
        {step.practice === undefined && step.replay === undefined && (step.figures?.length ?? 0) > 0 && (
          <div className="module-figures">
            {(step.figures ?? []).map((f) => (
              <TreeView key={f.id} tree={facts.figures[f.id].tree} label={f.label} />
            ))}
          </div>
        )}
        {(step.arrays?.length ?? 0) > 0 && (
          <div className="module-figures">
            {(step.arrays ?? []).map((a) => (
              <ArrayView key={a.id} keys={facts.arrays[a.id].sorted} probes={facts.arrays[a.id].probes} label={a.label} />
            ))}
          </div>
        )}
        {step.table === 'structures' && <ComparisonTable />}
        {r.paragraphs.map((text, i) => (
          <p key={i}>{text}</p>
        ))}
        {r.rule !== null && (
          <div id={ruleId} className="module-rule" hidden={!ruleOpen}>
            <p>
              <strong>{playerCopy.ruleLabel}: </strong>
              {r.rule}
            </p>
          </div>
        )}
        {step.practice === 'fill-in-bf' && (
          <BalanceFactorFill
            key={seed}
            tree={tree}
            label={label}
            answered={p.answered}
            onAnswered={(k) => update({ answered: [...p.answered, k] })}
            hintsUsed={p.hintsUsed}
            onReview={review}
            onNewTree={() => update({ ...FRESH, regen: p.regen + 1 })}
          />
        )}
        {step.practice === 'scenario' &&
          (() => {
            const pick = pickScenario(step, seed, p.avoid)
            return (
              <ScenarioPractice
                key={seed}
                scenario={pick.scenario}
                order={pick.order}
                choice={p.choice}
                checked={p.checked}
                onChoose={(choice) => update({ choice, checked: undefined })}
                onCheck={(checked) => update({ checked })}
                onTryAgain={() => update({ checked: undefined })}
                onNew={() => update({ ...FRESH, regen: p.regen + 1, avoid: pick.scenario })}
                onReview={review}
                hintsUsed={p.hintsUsed}
              />
            )
          })()}
        {step.practice === 'trace-search' &&
          (() => {
            const problem = drawSearchPractice(seed, step.searchPractice ?? 'found')
            return (
              <BeTheAlgorithm
                key={seed}
                tree={problem.tree}
                searchKey={problem.key}
                path={p.answered}
                onPath={(answered) => update({ answered })}
                solved={p.solved}
                onSolved={() => update({ solved: true })}
                hintsUsed={p.hintsUsed}
                onReview={review}
                onNewTree={() => update({ ...FRESH, regen: p.regen + 1 })}
              />
            )
          })()}
        {step.practice === 'after-delete' &&
          (() => {
            const problem = drawDeletePractice(seed)
            return (
              <FindAfterDelete
                key={seed}
                before={problem.before}
                deletedKey={problem.key}
                after={problem.after}
                solved={p.solved}
                onSolved={() => update({ solved: true })}
                hintsUsed={p.hintsUsed}
                onReview={review}
                onNewTree={() => update({ ...FRESH, regen: p.regen + 1 })}
              />
            )
          })()}
        {step.practice === 'spot-the-problem' && (
          <SpotTheProblem
            key={seed}
            tree={tree}
            label={label}
            solved={p.solved}
            onSolved={() => update({ solved: true })}
            hintsUsed={p.hintsUsed}
            onReview={review}
            onNewTree={() => update({ ...FRESH, regen: p.regen + 1 })}
          />
        )}
      </section>
      {rotateSteps.map((s) => {
        const problem = practiceProblem(s.figures?.[0]?.source ?? { kind: 'none' }, seedOf(s))
        if (problem === null) return null
        return (
          <div key={`${s.id}-${seedOf(s)}`} hidden={s.id !== step.id}>
            <RotatePractice
              base={problem.base}
              keyToInsert={problem.key}
              hintsUsed={stateOf(s).hintsUsed}
              onNewTree={() => update({ ...FRESH, regen: p.regen + 1 })}
            />
          </div>
        )
      })}
      {recommended !== null && (
        <RouteChoice
          key={step.id}
          module={content.id}
          recommended={recommended}
          onChoose={(m) => navigate(paths.module(m))}
        />
      )}
      <ControlStrip
        onBack={onBack}
        onNext={onNext}
        onSkip={SKIPPABLE_EVENTS.includes(step.event) ? onSkip : undefined}
        rule={r.rule === null ? undefined : { open: ruleOpen, controls: ruleId, onToggle: () => setRuleOpen((o) => !o) }}
        hint={
          step.practice === undefined
            ? undefined
            : { left: PRACTICE_HINTS - p.hintsUsed, onHint: () => update({ hintsUsed: p.hintsUsed + 1 }), onReview: review }
        }
      />
    </div>
  )
}

