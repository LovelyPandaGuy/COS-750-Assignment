import { shellCopy } from '../content/shell'
import { useTheme } from './ThemeContext'

/**
 * The theme switch in the Aa panel (add-dark-mode-toggle, design decision 6). A native button with
 * role="switch", so Space and Enter work and the state is read from aria-checked. Rendered only
 * inside the ThemeProvider.
 */
export function ThemeSwitch() {
  const session = useTheme()
  if (session === null) return null
  const on = session.theme === 'dark'
  return (
    <button type="button" role="switch" aria-checked={on} className="theme-switch" onClick={() => session.setTheme(on ? 'light' : 'dark')}>
      <span>{shellCopy.darkTheme}</span>
      <span className="theme-switch-state" aria-hidden="true">
        {on ? shellCopy.switchOn : shellCopy.switchOff}
        <span className="theme-switch-track">
          <span className="theme-switch-knob" />
        </span>
      </span>
    </button>
  )
}
