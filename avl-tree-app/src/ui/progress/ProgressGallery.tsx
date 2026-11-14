// Development-only gallery section (revamp-progress-and-hub, design decision 10): every state of the
// progress components with neutral fixture text. Developer text, not content: the pages get their words
// from src/content/ in the wiring change.
import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { paths } from '../../routes'
import { HubView } from './HubView'
import { LessonMenu } from './LessonMenu'
import { LessonProgress } from './LessonProgress'
import { ProgressMap } from './ProgressMap'
import { StartView } from './StartView'
import type { LessonItem, LessonState, PhaseLabels, StateLabels } from './types'

type ModuleId = Parameters<typeof paths.module>[0]
const IDS: ModuleId[] = ['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8', 'C9']
const labels: StateLabels = {
  words: { done: 'Example done', current: 'Example you are here', open: 'Example open', locked: 'Example not yet open' },
  symbols: { done: '✓', current: '▶', open: '○', locked: '◌' },
  optional: 'Example optional',
}
const phaseLabels: PhaseLabels = {
  words: { done: 'Example done', next: 'Example next', 'to-do': 'Example to do' },
  symbols: { done: '✓', next: '▶', 'to-do': '○' },
}
const lessons = (states: readonly LessonState[], mastery = false): LessonItem[] =>
  IDS.map((id, i) => {
    const common = { id, title: `Example lesson title ${i + 1}`, optional: id === 'C7' || undefined }
    const state = states[i]
    if (state === 'locked') return { ...common, state, reason: `Example: opens when ${IDS[i - 1]} is done` }
    return { ...common, state, href: paths.module(id), mastery: mastery && i === 0 ? 'secure' : mastery && i === 1 ? 'developing' : undefined }
  })
const MIXED: LessonState[] = ['done', 'done', 'current', 'open', 'locked', 'locked', 'locked', 'locked', 'locked']
const ALL_OPEN: LessonState[] = ['done', 'done', 'current', 'open', 'open', 'open', 'open', 'open', 'open']
const map = (states: readonly LessonState[], mastery = false) => ({
  label: 'Example your path',
  lessons: lessons(states, mastery),
  labels,
  summary: { label: 'Example readiness summary', href: paths.readiness() },
})
const noop = () => {}

function Cell({ title, children, ...data }: { title: string; children: ReactNode; [key: `data-${string}`]: string }) {
  return (
    <div className="learn-gallery-cell" {...data}>
      <p className="gallery-label">{title}</p>
      {children}
    </div>
  )
}

export function ProgressGallery() {
  return (
    <MemoryRouter>
      <section className="gallery-section learn-gallery" aria-labelledby="g-progress" data-progress-gallery="">
        <h2 id="g-progress">Progress components</h2>

        <h3>LessonProgress and LessonMenu</h3>
        <div className="learn-gallery-stack">
          <Cell title="Readout, 3 of 9 done">
            <LessonProgress label="Example lesson 4 of 9" completed={3} total={9} />
          </Cell>
          <Cell title="Menu (closed; opens in the page flow on a phone)" data-gallery-menu="">
            <LessonMenu buttonLabel="Example lessons" panelLabel="Example all lessons" lessons={lessons(MIXED)} labels={labels} />
          </Cell>
        </div>

        <h3>ProgressMap</h3>
        <div className="learn-gallery-stack">
          <Cell title="Done, current, open, not yet open (ID 8.2 rule)" data-gallery-map="mixed">
            <ProgressMap {...map(MIXED)} />
          </Cell>
          <Cell title="Nothing locked (D20 rule), with mastery under done lessons" data-gallery-map="open">
            <ProgressMap {...map(ALL_OPEN, true)} />
          </Cell>
        </div>

        <h3>HubView</h3>
        <HubView
          heading="Example your path"
          map={map(MIXED)}
          current={{
            card: { id: 'C3', title: 'Example lesson title 3', goal: 'Example one-line goal for this lesson.', time: 'Example about 6 min', state: 'current', labels },
            activities: {
              label: 'Example phases of this lesson',
              phases: [
                { id: 'problem', title: 'Example problem', state: 'done' },
                { id: 'learn', title: 'Example learn', state: 'next' },
                { id: 'check', title: 'Example check and summary', state: 'to-do' },
              ],
              labels: phaseLabels,
            },
            continueLabel: 'Example continue',
            continueHref: paths.module('C3'),
          }}
          sandbox={{ title: 'Example sandbox', text: 'Example: try your own keys.', suggestion: 'Example suggestion after C2.', openLabel: 'Example open sandbox', href: paths.sandbox() }}
          lectureQuestions={{ title: 'Example lecture questions', text: 'Example: 2 questions saved.', count: 2, linkLabel: 'Example view list', href: paths.readiness() }}
        />

        <h3>StartView</h3>
        <div className="learn-gallery-stack">
          <Cell title="First visit">
            <StartView
              panel={{ heading: 'Example start heading', intro: 'Example intro: about an hour, in nine short lessons.', points: ['Example point one', 'Example point two'], startLabel: 'Example start', onStart: noop }}
              privacy={{ text: 'Example: stored on this device only. Nothing is sent anywhere.' }}
              reset={{ label: 'Example reset my progress', dialog: { title: 'Example title', body: 'Example body', cancelLabel: 'Example cancel', confirmLabel: 'Example reset' }, onReset: noop }}
            />
          </Cell>
          <Cell title="Returning">
            <StartView
              panel={{ heading: 'Example start heading', intro: 'Example intro: about an hour, in nine short lessons.', startLabel: 'Example start', onStart: noop }}
              resume={{ heading: 'Example welcome back', line: 'Example: you stopped at C4.', resumeLabel: 'Example resume', onResume: noop }}
              privacy={{ text: 'Example: stored on this device only. Nothing is sent anywhere.' }}
              reset={{ label: 'Example reset my progress', dialog: { title: 'Example title', body: 'Example body', cancelLabel: 'Example cancel', confirmLabel: 'Example reset' }, onReset: noop }}
            />
          </Cell>
        </div>
      </section>
    </MemoryRouter>
  )
}
