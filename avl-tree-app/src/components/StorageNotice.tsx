import { startCopy } from '../content/start'
import type { SessionStatus } from '../state/learnerReducer'

/**
 * Storage status messages (NFR-06). The live region is always present so later
 * changes are announced. Each line pairs a decorative icon with words.
 */
export function StorageNotice({ loadStatus, persistent }: { loadStatus: SessionStatus; persistent: boolean }) {
  const lines: string[] = []
  if (loadStatus === 'reset-by-user') lines.push(startCopy.resetDone)
  if (loadStatus === 'reset-corrupt') lines.push(startCopy.startedFresh)
  if (!persistent) lines.push(startCopy.notSaved)
  return (
    <div role="status" className="storage-notice">
      {lines.map((line) => (
        <p key={line} className="storage-notice-line">
          <span className="storage-notice-icon" aria-hidden="true">ℹ︎</span>
          <span>{line}</span>
        </p>
      ))}
    </div>
  )
}
