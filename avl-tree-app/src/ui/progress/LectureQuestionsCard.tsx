import { useId } from 'react'
import { Link } from 'react-router-dom'
import './progress.css'

export interface LectureQuestionsCardProps {
  title: string
  /** Already worded for the count ("2 questions saved", or the empty line). */
  text: string
  count: number
  linkLabel: string
  href: string
}

/** Frame 1e LectureQuestionsCard: the questions saved for the lecture so far (D82). */
export function LectureQuestionsCard({ title, text, count, linkLabel, href }: LectureQuestionsCardProps) {
  const headingId = useId()
  return (
    <section className="progress-card" data-count={count} aria-labelledby={headingId}>
      <h2 id={headingId} className="progress-card-title">
        {title}
      </h2>
      <p className="progress-card-text">{text}</p>
      <Link className="btn btn-quiet progress-card-link" to={href}>
        {linkLabel}
      </Link>
    </section>
  )
}
