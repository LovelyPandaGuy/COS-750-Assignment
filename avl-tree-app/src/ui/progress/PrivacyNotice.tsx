import './progress.css'

export interface PrivacyNoticeProps {
  text: string
}

/** Frame 1b note 3: always visible on Start, never behind a link (NFR-05). */
export function PrivacyNotice({ text }: PrivacyNoticeProps) {
  return <p className="privacy-notice">{text}</p>
}
