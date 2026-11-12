/**
 * The display theme for the session (add-dark-mode-toggle, design decision 6). Holds the theme,
 * keeps <html data-theme> in step and saves the choice through the settings storage. Components
 * rendered outside the provider (some unit tests) get null and show no switch.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { SettingsStorage } from '../state/storage'
import { applyTheme, type Theme } from './theme'

export interface ThemeSession {
  theme: Theme
  /** Change the theme; `save: false` skips storage (after reset the key is already gone). */
  setTheme: (theme: Theme, options?: { save?: boolean }) => void
}

const Ctx = createContext<ThemeSession | null>(null)

export function ThemeProvider({ settings, initial, children }: { settings: SettingsStorage; initial: Theme; children?: ReactNode }) {
  const [theme, setState] = useState<Theme>(initial)

  useEffect(() => applyTheme(theme), [theme])

  const setTheme = useCallback(
    (next: Theme, options: { save?: boolean } = {}) => {
      if (options.save !== false) settings.save({ theme: next })
      applyTheme(next) // at once, not after the next paint
      setState(next)
    },
    [settings],
  )

  const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components -- the hook belongs with its provider
export function useTheme(): ThemeSession | null {
  return useContext(Ctx)
}
