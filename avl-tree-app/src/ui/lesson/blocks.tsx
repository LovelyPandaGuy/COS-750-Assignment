// One component per content screen type (lesson-blocks). Each returns the frame's regions, so every
// lesson lays out the same way: main representation, caption under it, supporting text (ID 8.1, 8.3).
import type { ReactNode } from 'react'
import { lessonCopy } from '../../content/lesson'
import { pseudocode } from '../../content/pseudocode'
import type {
  AnimationScreen,
  DiagramScreen,
  Lesson,
  ObjectivesScreen,
  PseudocodeScreen,
  RuleScreen,
  Screen,
  SummaryScreen,
} from '../../live/types'
import { PseudocodePanel } from '../replay/PseudocodePanel'
import { InOrderCheck, LessonAnimation } from './LessonAnimation'
import { CheckRunner, type CheckNav } from './questions/CheckRunner'
import { Certificate, OwnQuestion, QuestionSet, ReadinessReportView, RouteResult } from './c1c9'
import { DisplaySettings } from '../DisplaySettings'
import { PredictBlock } from './questions/Predict'
import { QuestionCard } from './questions/QuestionCard'
import { LessonTree } from './LessonTree'
import { treeLabel } from './labels'
import { CaseChart, Points, Text, WhatChanged, WorkedExample } from './parts'

export interface Regions {
  main: ReactNode
  /** Caption directly under the main representation (ID 8.3); null when the screen has none. */
  caption: string | null
  support?: ReactNode
}

export interface BlockContext {
  lesson: Lesson
  /** Animation screens report their current caption and whether they reached the end. */
  animationCaption: string | null
  onCaption: (text: string) => void
  atEnd: boolean
  onEnd: (atEnd: boolean) => void
  /** Bumped by the control strip's Replay step. */
  replayNonce: number
  /** Hints opened for a question (ID 9.4). */
  hintsUsedFor: (questionId: string) => number
  /** Review: {concept} moves to the concept's screen (check-feedback). */
  onReview: (screenId: string) => void
  /** A check screen reports what Next may do (lesson-checks). */
  onCheckNav: (nav: CheckNav | null) => void
  /** Moves to the next screen (a practice question's Continue). */
  goNext: () => void
}

function objectives(s: ObjectivesScreen): Regions {
  return {
    main: (
      <div className="lesson-objectives">
        <h3>{lessonCopy.objectivesHeading}</h3>
        <Text text={s.text} />
        <Points points={s.objectives} />
        <Points points={s.points} />
      </div>
    ),
    caption: null,
  }
}

function rule(s: RuleScreen): Regions {
  const tree = s.tree === undefined ? null : <LessonTree raw={s.tree} show={s.show} label={treeLabel(s.title)} />
  if (s.representation === 'static-diagram' && s.chart === undefined && tree !== null) {
    return { main: tree, caption: s.caption ?? null, support: <><Text text={s.text} /><Points points={s.points} /></> }
  }
  return {
    main: (
      <div className="lesson-rule">
        <Text text={s.text} />
        {s.chart === 'cases' && <CaseChart />}
        <Points points={s.points} />
      </div>
    ),
    caption: tree === null ? (s.caption ?? null) : null,
    support: tree === null ? undefined : <figure className="lesson-figure">{tree}{s.caption !== undefined && <figcaption>{s.caption}</figcaption>}</figure>,
  }
}

function diagram(s: DiagramScreen): Regions {
  const one = s.tree === undefined ? null : <LessonTree raw={s.tree} show={s.show} label={treeLabel(s.title, s.compareWith ? lessonCopy.diagram.first : undefined)} />
  const two = s.compareWith === undefined ? null : <LessonTree raw={s.compareWith.tree} show={s.show} label={treeLabel(s.title, lessonCopy.diagram.second)} />
  return {
    main: two === null ? one : <div className="lesson-pair">{one}{two}</div>,
    caption: s.caption ?? null,
    support: <Text text={s.text} />,
  }
}

function animation(s: AnimationScreen, ctx: BlockContext): Regions {
  const compare = s.compareWith?.operation === undefined ? null : s.compareWith
  const main = (
    <div className="lesson-animation-block">
      <div className={compare === null ? undefined : 'lesson-pair'}>
        <LessonAnimation
          replayNonce={ctx.replayNonce}
          tree={s.tree}
          operation={s.operation}
          show={s.show}
          label={treeLabel(s.title, compare === null ? undefined : lessonCopy.animation.first)}
          startCaption={s.caption}
          pseudocode={s.pseudocode}
          onCaption={ctx.onCaption}
          onEnd={ctx.onEnd}
          guided={s.guided}
        />
        {compare !== null && (
          <LessonAnimation tree={compare.tree} operation={compare.operation!} show={s.show} label={treeLabel(s.title, lessonCopy.animation.second)} />
        )}
      </div>
      {s.roleSteps !== undefined && (
        <section className="lesson-role-steps" aria-label={lessonCopy.animation.roleStepsLabel}>
          <ol>
            {s.roleSteps.map((r, i) => (
              <li key={i}>{r.replace(/^\d+\.\s*/, '')}</li>
            ))}
          </ol>
        </section>
      )}
      {s.inorderCheck === true && ctx.atEnd && <InOrderCheck tree={s.tree} operation={s.operation} />}
      {ctx.atEnd && s.caption !== undefined && <WhatChanged key={s.id} answer={s.caption} />}
    </div>
  )
  return { main, caption: ctx.animationCaption, support: <Text text={s.text} /> }
}

function pseudocodeBlock(s: PseudocodeScreen): Regions {
  return {
    main: (
      <div className="module-listings lesson-listings">
        {s.pseudocode.map((name) => (
          <section key={name} className="lesson-listing" aria-labelledby={`${s.id}-${name}`}>
            <h3 id={`${s.id}-${name}`}>{lessonCopy.pseudocode[name]}</h3>
            <PseudocodePanel name={lessonCopy.pseudocode[name]} listing={name === 'search-loop' ? pseudocode.searchLoop : pseudocode.searchRecursive} line={null} />
          </section>
        ))}
      </div>
    ),
    caption: null,
    support: <Text text={s.text} />,
  }
}

/** The lesson's objectives in the words of its objectives screen (lesson-player "The summary recaps the objectives"). */
export function objectivesOf(lesson: Lesson): string[] {
  const o = lesson.screens.find((s): s is ObjectivesScreen => s.type === 'objectives')
  if (o === undefined) return []
  return [...(o.text !== undefined ? [o.text] : []), ...(o.objectives ?? [])]
}

function summary(s: SummaryScreen, ctx: BlockContext): Regions {
  return {
    main: (
      <div className="lesson-summary">
        <div className={s.format === 'short-box' ? 'lesson-box' : undefined}>
          <Points points={s.points} />
        </div>
        {s.transfer !== undefined && (
          <QuestionCard q={s.transfer} mode="practice" attemptsAllowed={Infinity} hintsUsed={ctx.hintsUsedFor(s.transfer.id)} onReview={ctx.onReview} label={treeLabel(s.title)} />
        )}
        <section className="lesson-recap" aria-labelledby={`${s.id}-recap`}>
          <h3 id={`${s.id}-recap`}>{lessonCopy.recapHeading}</h3>
          <Points points={objectivesOf(ctx.lesson)} />
        </section>
      </div>
    ),
    caption: null,
  }
}

/** Interactive screens until add-live-lesson-questions (proposal item 9): title and text, no answer. */
function pending(s: Screen): Regions {
  const task = (s as { task?: { stem?: string } }).task
  return {
    main: (
      <div className="lesson-pending">
        <Text text={s.text} />
        {task?.stem !== undefined && <p>{task.stem}</p>}
        <p className="lesson-pending-note">{lessonCopy.pending}</p>
      </div>
    ),
    caption: null,
  }
}

/** The regions of a screen. A new screen type is a type error here until it has a component. */
export function regionsFor(s: Screen, ctx: BlockContext): Regions {
  switch (s.type) {
    case 'objectives':
      return objectives(s)
    case 'rule':
      return rule(s)
    case 'diagram':
      return diagram(s)
    case 'worked-example':
      return { main: <WorkedExample key={s.id} s={s} />, caption: null }
    case 'animation':
      return animation(s, ctx)
    case 'pseudocode':
      return pseudocodeBlock(s)
    case 'summary':
      return summary(s, ctx)
    case 'predict':
      return {
        main: (
          <div className="lesson-question">
            <Text text={s.text} />
            {s.tree !== undefined && <LessonTree raw={s.tree} show={s.show} label={treeLabel(s.title)} />}
            <PredictBlock key={s.id} s={s} />
          </div>
        ),
        caption: null,
      }
    case 'recall':
    case 'task':
    case 'practice': {
      if (s.task === undefined) return pending(s)
      return {
        main: (
          <div className="lesson-question">
            <QuestionCard
              key={s.task.id}
              q={s.task}
              mode="practice"
              attemptsAllowed={Infinity}
              hintsUsed={ctx.hintsUsedFor(s.task.id)}
              show={s.show}
              listing={(s as { pseudocode?: 'search-loop' | 'search-recursive' }).pseudocode}
              onReview={ctx.onReview}
              onContinue={ctx.goNext}
              label={treeLabel(s.title)}
            />
          </div>
        ),
        caption: null,
        support: <Text text={s.text} />,
      }
    }
    case 'check':
      return {
        main: (
          <div className="lesson-question">
            <Text text={s.text} />
            {s.checkId !== undefined && <CheckRunner key={s.checkId} checkId={s.checkId} lessonId={ctx.lesson.id} hintsUsedFor={ctx.hintsUsedFor} onReview={ctx.onReview} onNav={ctx.onCheckNav} />}
          </div>
        ),
        caption: null,
      }
    case 'intro':
    case 'info':
      return { main: <div className="lesson-rule"><Text text={s.text} /><Points points={s.points as string[] | undefined} /></div>, caption: null }
    case 'conventions':
      return {
        main: s.tree === undefined ? <Points points={s.points as string[] | undefined} /> : <LessonTree raw={s.tree} show={s.show} label={treeLabel(s.title)} />,
        caption: s.caption ?? null,
        support: (
          <>
            <Text text={s.text} />
            {s.tree !== undefined && <Points points={s.points as string[] | undefined} />}
          </>
        ),
      }
    case 'settings':
      return { main: <DisplaySettings />, caption: null, support: <><Text text={s.text} /><Points points={s.points as string[] | undefined} /></> }
    case 'question-set':
      return {
        main: (
          <div className="lesson-question">
            <Text text={s.text} />
            <QuestionSet key={s.id} set={s.questionSet as 'diagnostic' | 'recheck' | 'readiness'} hintsUsedFor={ctx.hintsUsedFor} onReview={ctx.onReview} onNav={ctx.onCheckNav} />
          </div>
        ),
        caption: null,
      }
    case 'route':
      return { main: <RouteResult route={s.route as { passMessage: string; failMessage: string }} />, caption: null, support: <Text text={s.text} /> }
    case 'report':
      return { main: <ReadinessReportView />, caption: null, support: <Text text={s.text} /> }
    case 'free-text':
      return { main: <><Text text={s.text} /><OwnQuestion /></>, caption: null }
    case 'certificate':
      return { main: <><Text text={s.text} /><Certificate /></>, caption: null }
    default:
      return pending(s)
  }
}

