import { MasteryBadge } from '../base'
import { Link } from 'react-router-dom'
import { levelTag } from './levelTag'
import type { ColumnLabels, ObjectiveRow, StatusLabels } from './types'
import './readiness.css'

export interface OutcomeStatusTableProps {
  rows: readonly ObjectiveRow[]
  labels: StatusLabels
  columns: ColumnLabels
}

/**
 * Frame 1o OutcomeStatusTable (FR-RDY-01): one row per objective with name, levels, status (symbol, word
 * and border), change note and a review link. A table from the tablet width; stacked cards below (design decision 3).
 */
export function OutcomeStatusTable({ rows, labels, columns }: OutcomeStatusTableProps) {
  // No row has a change note (no run history yet, proposal question 7): leave the column out, not empty.
  const hasNotes = rows.some((r) => r.note !== undefined)
  return (
    <table className="readiness-table">
      <caption className="readiness-caption">{columns.caption}</caption>
      <thead>
        <tr>
          <th scope="col">{columns.objective}</th>
          <th scope="col">{columns.level}</th>
          <th scope="col">{columns.status}</th>
          {hasNotes && <th scope="col">{columns.change}</th>}
          <th scope="col">{columns.review}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id} data-row-status={row.status}>
            <th scope="row" className="readiness-objective" data-label={columns.objective}>
              <span className="readiness-id">{row.id}</span> <span className="readiness-name">{row.name}</span>
              {row.optional && <> <span className="readiness-optional">{labels.optional}</span></>}
            </th>
            <td data-cell="level" data-label={columns.level}>
              <span className="readiness-levels">{row.levels.map(levelTag)}</span>
            </td>
            <td data-cell="status" data-label={columns.status}>
              <span className="readiness-status" data-status={row.status}>
                <span aria-hidden="true">{labels.symbols[row.status]}</span> {labels.words[row.status]}
              </span>
              {row.mastery !== undefined && (
                <span className="readiness-mastery">
                  <MasteryBadge state={row.mastery} compact />
                </span>
              )}
            </td>
            {hasNotes && (
              <td data-cell="change" data-label={columns.change}>
                {row.note !== undefined && <span className="readiness-note">{row.note}</span>}
              </td>
            )}
            <td data-cell="review" data-label={columns.review}>
              <Link className="readiness-review" to={row.review.href}>
                {row.review.label}
              </Link>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
