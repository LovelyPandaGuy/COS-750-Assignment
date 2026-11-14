import { useId, useState } from 'react'
import { lessonCopy } from '../../content/lesson'
import type { Lesson } from '../../live/types'
import { BREAKPOINTS } from '../breakpoints'
import { useMinWidth } from '../useMinWidth'
import { isOpen, outlineOf } from './outline'

/**
 * The lesson's screens, grouped by phase, with where the student has been, is and can go (lesson-outline;
 * ID 8.2, 8.3, 11.1, D20, D154). Beside the frame from the desktop width; below it, a disclosure, closed
 * by default, so the tree keeps the width on a phone. Marks are words; the glyph beside each is decorative.
 */
export function LessonOutline({
  screens,
  current,
  seen,
  blocking,
  onChoose,
}: {
  screens: Lesson['screens']
  current: number
  seen: ReadonlySet<number>
  /** The first unfinished check or question-set screen, or -1. */
  blocking: number
  onChoose: (index: number) => void
}) {
  const o = lessonCopy.outline
  const wide = useMinWidth(BREAKPOINTS.desktop)
  const [open, setOpen] = useState(false)
  const base = useId()
  const groups = outlineOf(screens, (p) => lessonCopy.phase[p])

  const list = (
    <ol className="lesson-outline-groups">
      {groups.map((g, gi) => (
        <li key={`${g.phase}-${gi}`} className="lesson-outline-group">
          <span id={`${base}-g${gi}`} className="lesson-outline-phase">
            {g.label}
          </span>
          <ol className="lesson-outline-list" aria-labelledby={`${base}-g${gi}`}>
            {g.entries.map((e) => {
              const here = e.index === current
              const reachable = isOpen(e.index, current, blocking)
              const state = here ? 'current' : !reachable ? 'closed' : seen.has(e.index) ? 'done' : 'open'
              const mark = { current: o.here, closed: o.closed, done: o.done, open: undefined }[state]
              const glyph = { current: '●', closed: '○', done: '✓', open: undefined }[state]
              return (
                <li key={e.id}>
                  <button
                    type="button"
                    className="lesson-outline-entry"
                    data-state={state}
                    aria-current={here ? 'step' : undefined}
                    disabled={!reachable}
                    onClick={() => {
                      onChoose(e.index)
                      if (!wide) setOpen(false)
                    }}
                  >
                    <span className="lesson-outline-title">{e.title}</span>{' '}
                    {mark !== undefined && (
                      <span className="lesson-outline-mark">
                        <span className="lesson-outline-glyph" aria-hidden="true">
                          {glyph}
                        </span>
                        {mark}
                      </span>
                    )}
                  </button>
                </li>
              )
            })}
          </ol>
        </li>
      ))}
    </ol>
  )

  return (
    <nav className="lesson-outline" aria-label={o.label}>
      {wide ? (
        list
      ) : (
        // React owns `open`: the summary's click (Enter and Space click it too) toggles the state, and the
        // native toggle is prevented so the two never disagree (`toggle` events arrive late, in a task).
        <details className="lesson-outline-disclosure" open={open}>
          <summary
            className="lesson-outline-summary"
            onClick={(ev) => {
              ev.preventDefault()
              setOpen((v) => !v)
            }}
          >
            {o.summary(screens.length)}
          </summary>
          {open && list}
        </details>
      )}
    </nav>
  )
}
