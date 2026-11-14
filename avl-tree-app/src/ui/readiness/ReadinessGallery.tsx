// Development-only gallery section (revamp-readiness, design decision 11): the summary's states with
// neutral fixture text. Developer text, not content. Editing a question and the export fallback are
// interactive states; the unit tests and the critique drive them.
import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { paths } from '../../routes'
import { ReadinessSummary, type ReadinessSummaryProps } from './ReadinessSummary'
import type { ObjectiveRow, ReadinessStatus } from './types'

type ModuleId = Parameters<typeof paths.module>[0]
const LESSON: Record<string, ModuleId> = { LO1: 'C2', LO2: 'C3', LO3: 'C4', LO4: 'C5', LO5: 'C6', LO6: 'C8', LO7: 'C7' }
const LEVELS: Record<string, { level: string; word: string }[]> = {
  LO1: [{ level: 'understand', word: 'Understand' }],
  LO3: [{ level: 'apply', word: 'Apply' }, { level: 'understand', word: 'Understand' }],
  LO6: [{ level: 'evaluate', word: 'Example evaluate' }],
}
const rows = (statuses: Partial<Record<string, ReadinessStatus>>, notes = true): ObjectiveRow[] =>
  Object.keys(LESSON).map((id) => ({
    id,
    name: `Example objective statement for ${id}, long enough to wrap on a phone`,
    levels: LEVELS[id] ?? [{ level: 'apply', word: 'Apply' }],
    status: statuses[id] ?? 'ready',
    note: notes ? (statuses[id] === 'revise' ? 'Example: first try' : 'Example: up from Revise') : undefined,
    optional: id === 'LO7' || undefined,
    review: { href: paths.module(LESSON[id]), label: `Example review ${LESSON[id]}` },
  }))

const noop = () => {}
const base = (status: ReadinessStatus, over: Partial<ReadinessSummaryProps> = {}): ReadinessSummaryProps => ({
  headingLevel: 3,
  headline: {
    status,
    heading: status === 'ready' ? 'Example: ready for the lecture' : 'Example: a little to revise first',
    line: 'Example headline line.',
    title: { words: 'Example title words', message: 'Example title message.' },
  },
  table: {
    rows: rows(status === 'ready' ? { LO7: 'revise' } : { LO2: 'revise', LO4: 'revise' }),
    labels: { words: { ready: 'Example ready', revise: 'Example revise' }, symbols: { ready: '✓', revise: '↻' }, optional: 'Example optional' },
    columns: { caption: 'Example objectives', objective: 'Example objective', level: 'Example level', status: 'Example status', change: 'Example change', review: 'Example review' },
  },
  flags: {
    heading: 'Example: you were sure, but it did not match',
    symbol: '⚑',
    items: [{ id: 'LO2', text: 'Example: worth a second look.', link: { href: paths.module('C3'), label: 'Example see why' } }],
  },
  listen: { heading: 'Example listen for', points: ['Example point one.', 'Example point two.', 'Example point three.'] },
  questions: {
    questions: [
      { id: 's1', text: 'Example suggested question from a misconception?' },
      { id: 'o1', text: 'Example own question, editable and removable?', editable: true, removable: true },
    ],
    labels: { heading: 'Example bring these', empty: 'Example: nothing to bring this time.', edit: 'Example edit', remove: 'Example remove', save: 'Example save', cancel: 'Example cancel', field: 'Example your question' },
    onEdit: noop,
    onRemove: noop,
  },
  exports: {
    fileName: 'example.txt',
    labels: { group: 'Example export', print: 'Example print', copy: 'Example copy', save: 'Example save file', copied: 'Example copied', saved: 'Example saved', fallback: 'Example: copy the text below', fallbackLabel: 'Example summary text' },
    onPrint: noop,
  },
  ...over,
})

function Cell({ title, children, ...data }: { title: string; children: ReactNode; [key: `data-${string}`]: string }) {
  return (
    <div className="learn-gallery-cell" {...data}>
      <p className="gallery-label">{title}</p>
      {children}
    </div>
  )
}

export function ReadinessGallery() {
  const ready = base('ready')
  return (
    <MemoryRouter>
      <section className="gallery-section learn-gallery" aria-labelledby="g-readiness" data-readiness-gallery="">
        <h2 id="g-readiness">Readiness components</h2>
        <div className="learn-gallery-stack">
          <Cell title="Overall ready, LO7 (optional) revise, flags, questions" data-gallery-summary="ready">
            <ReadinessSummary {...ready} />
          </Cell>
          <Cell title="Overall revise, no notes, no flags, no questions" data-gallery-summary="revise">
            <ReadinessSummary
              {...base('revise', {
                flags: { ...ready.flags, items: [] },
                questions: { ...ready.questions, questions: [] },
              })}
              table={{ ...ready.table, rows: rows({ LO2: 'revise', LO4: 'revise' }, false) }}
            />
          </Cell>
        </div>
      </section>
    </MemoryRouter>
  )
}
