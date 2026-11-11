import { AaMenu } from './AaMenu'

export interface TopBarAction {
  label: string
  onClick: () => void
}

export interface TopBarProps {
  title: string
  breadcrumb?: string
  status?: string
  actions?: TopBarAction[]
}

export function TopBar({ title, breadcrumb, status, actions }: TopBarProps) {
  return (
    <div className="topbar">
      <span className="topbar-title">{title}</span>
      {breadcrumb && <span className="topbar-breadcrumb">{breadcrumb}</span>}
      <span className="topbar-spacer" />
      {status && (
        // Polite live region so a change, such as saving stopping mid-session, is announced (WCAG 4.1.3).
        <span className="topbar-status" aria-live="polite" aria-atomic="true">
          {status}
        </span>
      )}
      {actions && actions.length > 0 && (
        <div className="topbar-actions">
          {actions.map((a) => (
            <button key={a.label} type="button" className="topbar-action" onClick={a.onClick}>
              {a.label}
            </button>
          ))}
        </div>
      )}
      <AaMenu />
    </div>
  )
}
