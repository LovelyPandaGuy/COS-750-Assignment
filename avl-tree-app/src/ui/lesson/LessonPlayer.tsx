import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import './lesson.css'
import './module.css'
import '../replay/replay.css'
import { narrationCopy } from '../../content/narration'
import { NarrationControls } from '../narration/NarrationControls'
import { useNarration } from '../narration/NarrationContext'
import { lessonCopy } from '../../content/lesson'
import { lessonPosition } from '../../live/load'
import type { Lesson, Question } from '../../live/types'
import type { ModuleId } from '../../state/learnerState'
import { paths, afterLesson, parseModuleId } from '../../routes'
import { regionsFor } from './blocks'
import type { CheckNav } from './questions/CheckRunner'
import { LessonControls } from './LessonControls'

/**
 * Plays a lesson's screens one at a time, in the order of its lesson file, in one frame
 * (lesson-player; ID 3.2, 8.2, 8.3). The screen index lives in component state (D35).
 */
export interface LessonPlayerProps {
  lesson: Lesson
  /** Play these screens under this title instead of the lesson's own (the C1 refresher). */
  sequence?: { title: string; screens: Lesson['screens'] }
  /** Shown under the top region: the soft prerequisite note (D20). */
  note?: ReactNode
  /** Shown on the last screen, above the controls (the refresher's way on). */
  endPanel?: ReactNode
  /** Where Next goes from the last screen; the path by default. */
  finishTo?: string
}

/** A lesson file's id ("c3") as its module ID ("C3"). */
const moduleOf = (lessonId: string): ModuleId => parseModuleId(lessonId.toUpperCase()) ?? 'C1'

export function LessonPlayer({ lesson, sequence, note, endPanel, finishTo }: LessonPlayerProps) {
  const navigate = useNavigate()
  const [index, setIndex] = useState(0)
  const [ruleOpen, setRuleOpen] = useState(false)
  const [hintOpen, setHintOpen] = useState(false)
  const [caption, setCaption] = useState<string | null>(null)
  const [atEnd, setAtEnd] = useState(false)
  const heading = useRef<HTMLHeadingElement>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const stopNarration = useNarration()?.stop
  const [replayNonce, setReplayNonce] = useState(0)
  const [checkNav, setCheckNav] = useState<CheckNav | null>(null)
  // Questions whose hint was opened (ID 9.4: hintsUsed in the attempt record).
  const [hinted, setHinted] = useState<ReadonlySet<string>>(() => new Set())
  const first = useRef(true)
  const ruleId = useId()
  const hintId = useId()

  const screens = sequence?.screens ?? lesson.screens
  const screen = screens[index]
  const { index: place, total } = lessonPosition(lesson.id)

  // One move function for Next, Back, Skip ahead and the review link: the same reset and focus on the
  // screen heading every way (FR-LRN-04, NFR-02). The lesson outline is retired (revamp-navigation, D155).
  // Choosing the screen already shown only moves focus to its heading again.
  const [refocus, setRefocus] = useState(0)
  const goTo = (to: number) => {
    if (to === index) {
      setRefocus((n) => n + 1)
      return
    }
    setIndex(to)
    setRuleOpen(false)
    setHintOpen(false)
    setCaption(null)
    setAtEnd(false)
  }

  useEffect(() => {
    // Focus moves to each new screen's heading, not on the first render (FR-LRN-04, NFR-02).
    if (first.current) {
      first.current = false
      return
    }
    heading.current?.focus()
  }, [index, refocus])

  // A screen change (or leaving the lesson) stops speech; the new screen starts idle (D148).
  useEffect(() => () => stopNarration?.(), [screen.id, stopNarration])

  const onCaption = useCallback((t: string) => setCaption(t), [])
  const onEnd = useCallback((e: boolean) => setAtEnd(e), [])
  const onCheckNav = useCallback((nav: CheckNav | null) => setCheckNav(nav), [])

  // The question on this screen, for the Hint control (lesson-player "Hint follows the screen's question").
  const extra = screen as { task?: Question; transfer?: Question }
  const gated = screen.type === 'check' || screen.type === 'question-set'
  const question = gated ? checkNav?.question : (extra.task ?? extra.transfer)
  const hint = screen.hint ?? question?.hint
  const hintsUsedFor = (id: string) => (hinted.has(id) ? 1 : 0)
  const toggleHint = () => {
    if (!hintOpen && question !== undefined) setHinted((h) => new Set(h).add(question.id))
    setHintOpen((o) => !o)
  }
  // Review: {concept}: the concept's screen in this lesson, or that lesson (check-feedback).
  const onReview = (screenId: string) => {
    const at = screens.findIndex((x) => x.id === screenId)
    if (at !== -1) return goTo(at)
    const [lessonId, part] = screenId.split('-')
    const module = lessonId.toUpperCase() as ModuleId
    navigate(part.startsWith('r') ? paths.activity(module, 'refresher') : paths.module(module))
  }

  const regions = regionsFor(screen, {
    lesson,
    animationCaption: caption,
    onCaption,
    atEnd,
    onEnd,
    replayNonce,
    hintsUsedFor,
    onReview,
    onCheckNav,
    goNext: () => (index === screens.length - 1 ? navigate(finishTo ?? afterLesson(moduleOf(lesson.id))) : goTo(index + 1)),
  })
  const last = index === screens.length - 1
  // Skip ahead on explanation screens only, to the next screen that is not one (ID 8.2, D20).
  const nextOther = screens.findIndex((s, i) => i > index && s.merrillPhase !== 'demonstration')
  const canSkip = screen.merrillPhase === 'demonstration' && nextOther !== -1 && nextOther > index + 1

  return (
    <div className="lesson">
        <div className="lesson-top">
          <h1 tabIndex={-1}>{sequence?.title ?? lesson.title}</h1>
          <p className="lesson-position" aria-label={lessonCopy.positionLabel}>
            <span>{lessonCopy.progress(place, total)}</span>
            <span>{lessonCopy.screenOf(index + 1, screens.length)}</span>
            <span className="lesson-phase">{lessonCopy.phase[screen.merrillPhase]}</span>
          </p>
        </div>
        {note}
        <section ref={sectionRef} className="lesson-screen" aria-labelledby={`${screen.id}-h`} key={screen.id}>
          <h2 id={`${screen.id}-h`} ref={heading} tabIndex={-1} data-narrate>
            {screen.title}
          </h2>
          <NarrationControls getRoot={() => sectionRef.current} labels={narrationCopy} />
          <div className="lesson-main">{regions.main}</div>
          <p className="lesson-caption" aria-live={screen.type === 'animation' ? 'polite' : undefined} data-narrate>
            {regions.caption ?? ''}
          </p>
          {screen.showRule !== undefined && (
            <div id={ruleId} className="module-rule lesson-rule-panel" hidden={!ruleOpen} data-narrate>
              <strong>{lessonCopy.ruleLabel}: </strong>
              {screen.showRule}
            </div>
          )}
          {hint !== undefined && (
            <div id={hintId} className="module-rule lesson-hint-panel" hidden={!hintOpen} data-narrate>
              <strong>{lessonCopy.hintLabel}: </strong>
              {hint}
            </div>
          )}
          {regions.support !== undefined && <div className="lesson-support">{regions.support}</div>}
        </section>
        {last && endPanel}
        <LessonControls
          backDisabled={index === 0}
          onBack={() => index > 0 && goTo(index - 1)}
          nextDisabled={gated && (checkNav === null || !checkNav.canNext)}
          onNext={() => {
            // On a check, Next moves through its questions first (lesson-checks "A check is never skipped").
            if (gated && checkNav !== null && checkNav.next()) return
            if (last) navigate(finishTo ?? afterLesson(moduleOf(lesson.id)))
            else goTo(index + 1)
          }}
          onSkip={canSkip ? () => goTo(nextOther) : undefined}
          onReplay={screen.type === 'animation' ? () => setReplayNonce((n) => n + 1) : undefined}
          rule={screen.showRule !== undefined ? { open: ruleOpen, controls: ruleId, onToggle: () => setRuleOpen((o) => !o) } : undefined}
          hint={hint !== undefined ? { open: hintOpen, controls: hintId, onToggle: toggleHint } : undefined}
        />
    </div>
  )
}
