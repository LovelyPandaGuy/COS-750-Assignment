import type { ReactNode } from 'react'
import { AaMenu } from './AaMenu'

/**
 * An action is a button that calls its handler, or, with an `href`, a link. A link can also
 * take `onNavigate`, called instead of following the address on a plain click, so a router
 * can handle it while "open in new tab" still works.
 */
export type TopBarAction =
  | { label: string; onClick: () => void }
  | { label: string; href: string; onNavigate?: () => void }

/**
 * The progress area (add-ui-foundation). [OPEN] The design does not show what it holds ("revealed
 * structure"); a screen passes the content and the label that names it, and the TopBar adds no text.
 */
type ProgressSlot =
  | { progress?: undefined; progressLabel?: undefined }
  | { progress: ReactNode; progressLabel: string }

export type TopBarProps = {
  title: string
  breadcrumb?: string
  status?: string
  actions?: TopBarAction[]
} & ProgressSlot

export function TopBar({ title, breadcrumb, progress, progressLabel, status, actions }: TopBarProps) {
  return (
    <div className="topbar">
      <span className="topbar-title">{title}</span>
      {breadcrumb && <span className="topbar-breadcrumb">{breadcrumb}</span>}
      {progress !== undefined && progress !== null && (
        <nav className="topbar-progress" aria-label={progressLabel}>
          {progress}
        </nav>
      )}
      <span className="topbar-spacer" />
      {status && (
        // Polite live region so a change, such as saving stopping mid-session, is announced (WCAG 4.1.3).
        <span className="topbar-status" aria-live="polite" aria-atomic="true">
          {status}
        </span>
      )}
      {actions && actions.length > 0 && (
        <div className="topbar-actions">
          {actions.map((a) =>
            'href' in a ? (
              <a
                key={a.label}
                className="topbar-action"
                href={a.href}
                onClick={(e) => {
                  const plain = e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey
                  if (a.onNavigate && plain) {
                    e.preventDefault()
                    a.onNavigate()
                  }
                }}
              >
                {a.label}
              </a>
            ) : (
              <button key={a.label} type="button" className="topbar-action" onClick={a.onClick}>
                {a.label}
              </button>
            ),
          )}
        </div>
      )}
      <AaMenu />
    </div>
  )
}
