/**
 * The display theme for the session (add-dark-mode-toggle, design decision 6). Holds the theme,
 * keeps <html data-theme> in step and saves the choice through the settings storage. Components
 * rendered outside the provider (some unit tests) get null and show no switch.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Settings, SettingsStorage } from '../state/storage'
import { applyTextSize, applyTheme, type Theme } from './theme'

export interface ThemeSession {
  theme: Theme
  /** Change the theme; `save: false` skips storage (after reset the key is already gone). */
  setTheme: (theme: Theme, options?: { save?: boolean }) => void
  /** All display settings (display-settings). */
  settings: Settings
  setSetting: <K extends Exclude<keyof Settings, 'theme'>>(key: K, value: Settings[K]) => void
}


const Ctx = createContext<ThemeSession | null>(null)

export function ThemeProvider({ settings, initial, children }: { settings: SettingsStorage; initial: Theme; children?: ReactNode }) {
  const [all, setAll] = useState<Settings>(() => ({ ...settings.load(), theme: initial }))
  const theme = all.theme

  useEffect(() => applyTheme(theme), [theme])
  useEffect(() => applyTextSize(all.textSize), [all.textSize])

  const setTheme = useCallback(
    (next: Theme, options: { save?: boolean } = {}) => {
      setAll((current) => {
        const updated = { ...current, theme: next }
        if (options.save !== false) settings.save(updated)
        return updated
      })
      applyTheme(next) // at once, not after the next paint
    },
    [settings],
  )
  const setSetting = useCallback(
    <K extends Exclude<keyof Settings, 'theme'>>(key: K, value: Settings[K]) => {
      setAll((current) => {
        const updated = { ...current, [key]: value }
        settings.save(updated)
        return updated
      })
    },
    [settings],
  )

  const value = useMemo(() => ({ theme, setTheme, settings: all, setSetting }), [theme, setTheme, all, setSetting])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components -- the hook belongs with its provider
export function useTheme(): ThemeSession | null {
  return useContext(Ctx)
}
