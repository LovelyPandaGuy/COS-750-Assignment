import { PrivacyNotice, type PrivacyNoticeProps } from './PrivacyNotice'
import { ResetProgressLink, type ResetProgressLinkProps } from './ResetProgressLink'
import { ResumeCard, type ResumeCardProps } from './ResumeCard'
import { StartPanel, type StartPanelProps } from './StartPanel'
import './progress.css'

export interface StartViewProps {
  panel: StartPanelProps
  /** Saved progress; without it there is no ResumeCard (first visit). */
  resume?: ResumeCardProps
  privacy: PrivacyNoticeProps
  reset: ResetProgressLinkProps
}

/** Frame 1b composed (design decision 8): the panel, the ResumeCard when given, privacy and reset. */
export function StartView({ panel, resume, privacy, reset }: StartViewProps) {
  return (
    <div className="start-view">
      <StartPanel {...panel} />
      <div className="start-side">
        {resume !== undefined && <ResumeCard {...resume} />}
        <PrivacyNotice {...privacy} />
        <ResetProgressLink {...reset} />
      </div>
    </div>
  )
}
