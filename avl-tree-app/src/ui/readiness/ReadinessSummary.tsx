import { useId } from 'react'
import { ConfidenceFlags } from './ConfidenceFlags'
import { ExportActions, type ExportActionsProps } from './ExportActions'
import { buildExportText } from './exportText'
import { LectureQuestionsList, type LectureQuestionsListProps } from './LectureQuestionsList'
import { OutcomeStatusTable, type OutcomeStatusTableProps } from './OutcomeStatusTable'
import type { FlagItem, Headline } from './types'
import './readiness.css'

export interface ReadinessSummaryProps {
  /** The headline's level; its sections use the next level down (design decision 12). */
  headingLevel?: 1 | 2 | 3
  headline: Headline
  table: OutcomeStatusTableProps
  flags: { heading: string; symbol: string; items: readonly FlagItem[] }
  listen: { heading: string; points: readonly string[] }
  questions: LectureQuestionsListProps
  exports: Omit<ExportActionsProps, 'text'>
}

/**
 * Frame 1o composed (design decision 12): the headline (the given overall result, the title's words and
 * message, never a rank or share), the objective table, the confidence flags, the listen-for points, the
 * lecture questions and the exports. Shows results; computes none (FR-RDY-01, FR-MOT-04).
 */
export function ReadinessSummary(props: ReadinessSummaryProps) {
  const { headingLevel = 2, headline, table, flags, listen, questions, exports } = props
  const listenId = useId()
  const H = `h${headingLevel}` as 'h1' | 'h2' | 'h3'
  const sub = (headingLevel + 1) as 2 | 3 | 4
  const S = `h${sub}` as 'h2' | 'h3' | 'h4'
  const text = buildExportText({ headline, table, flags, listen, questions })
  return (
    <div className="readiness-summary">
      <section className="readiness-headline" data-overall={headline.status}>
        <H className="readiness-headline-heading">{headline.heading}</H>
        {headline.line !== undefined && <p className="readiness-headline-line">{headline.line}</p>}
        {headline.title !== undefined && (
          <p className="readiness-title">
            <span className="readiness-title-words">{headline.title.words}</span>
            <span className="readiness-headline-line">{headline.title.message}</span>
          </p>
        )}
      </section>
      <OutcomeStatusTable {...table} />
      <ConfidenceFlags {...flags} headingLevel={sub} />
      {listen.points.length > 0 && (
        <section className="readiness-block" aria-labelledby={listenId}>
          <S id={listenId} className="readiness-block-heading">
            {listen.heading}
          </S>
          <ul className="readiness-points">
            {listen.points.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </section>
      )}
      <LectureQuestionsList {...questions} headingLevel={sub} />
      <ExportActions {...exports} text={text} />
    </div>
  )
}
