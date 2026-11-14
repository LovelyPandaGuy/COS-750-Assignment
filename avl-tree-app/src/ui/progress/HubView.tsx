import { Link } from 'react-router-dom'
import { ActivityList, type ActivityListProps } from './ActivityList'
import { LectureQuestionsCard, type LectureQuestionsCardProps } from './LectureQuestionsCard'
import { ProgressMap, type ProgressMapProps } from './ProgressMap'
import { SandboxCard, type SandboxCardProps } from './SandboxCard'
import { UnitCard, type UnitCardProps } from './UnitCard'
import './progress.css'

export interface HubViewProps {
  heading: string
  map: ProgressMapProps
  current: {
    card: Omit<UnitCardProps, 'children'>
    activities: ActivityListProps
    continueLabel: string
    continueHref: string
  }
  sandbox: SandboxCardProps
  lectureQuestions: LectureQuestionsCardProps
}

/**
 * Frame 1e composed (design decision 8): map, the current lesson's card with its phases and the one
 * primary action, then the sandbox and lecture-question cards. No points, streaks or comparison (FR-MOT-04).
 */
export function HubView({ heading, map, current, sandbox, lectureQuestions }: HubViewProps) {
  return (
    <div className="hub-view">
      <h1 className="hub-heading">{heading}</h1>
      <ProgressMap {...map} />
      <div className="hub-grid">
        <UnitCard {...current.card}>
          <ActivityList {...current.activities} />
          <Link className="btn btn-primary hub-continue" to={current.continueHref}>
            {current.continueLabel}
          </Link>
        </UnitCard>
        <div className="hub-side">
          <SandboxCard {...sandbox} />
          <LectureQuestionsCard {...lectureQuestions} />
        </div>
      </div>
    </div>
  )
}
