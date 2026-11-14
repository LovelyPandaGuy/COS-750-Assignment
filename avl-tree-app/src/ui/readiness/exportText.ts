// The plain text that Copy and Save export (design decision 6): built from the summary's own props, so
// it always holds what the screen shows. Pure; no wording of its own beyond punctuation.
import type { ColumnLabels, FlagItem, Headline, ObjectiveRow, QuestionItem, QuestionLabels, StatusLabels } from './types'

export interface ExportSource {
  headline: Headline
  table: { rows: readonly ObjectiveRow[]; labels: StatusLabels; columns: ColumnLabels }
  flags: { heading: string; items: readonly FlagItem[] }
  listen: { heading: string; points: readonly string[] }
  questions: { questions: readonly QuestionItem[]; labels: QuestionLabels }
}

export function buildExportText({ headline, table, flags, listen, questions }: ExportSource): string {
  const out: string[] = [headline.heading]
  if (headline.line) out.push(headline.line)
  if (headline.title) out.push(`${headline.title.words}. ${headline.title.message}`)
  out.push('', table.columns.caption)
  for (const r of table.rows) {
    const optional = r.optional ? ` (${table.labels.optional})` : ''
    const note = r.note ? ` (${r.note})` : ''
    out.push(`${r.id} ${r.name}${optional}: ${table.labels.words[r.status]}${note}`)
  }
  if (flags.items.length > 0) {
    out.push('', flags.heading)
    for (const f of flags.items) out.push(`- ${f.id} ${f.text}`)
  }
  out.push('', questions.labels.heading)
  if (questions.questions.length === 0) out.push(questions.labels.empty)
  questions.questions.forEach((q, i) => out.push(`${i + 1}. ${q.text}`))
  if (listen.points.length > 0) {
    out.push('', listen.heading)
    for (const p of listen.points) out.push(`- ${p}`)
  }
  return out.join('\n') + '\n'
}
