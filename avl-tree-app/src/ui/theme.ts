// The display theme (add-dark-mode-toggle, design decision 1). The theme names and the default
// live here only, so a team vote changes one place (D18). One attribute on <html> picks the theme:
// every colour comes from tokens.css, keyed on [data-theme].

export const THEMES = ['light', 'dark'] as const
export type Theme = (typeof THEMES)[number]

/** Light until the learner turns the dark theme on (proposal item 2). */
export const DEFAULT_THEME: Theme = 'light'

/** A known theme, or the default for anything else (a stored value may be damaged). */
export function parseTheme(value: unknown): Theme {
  return THEMES.includes(value as Theme) ? (value as Theme) : DEFAULT_THEME
}

/** Apply a theme to the whole document. */
export function applyTheme(theme: Theme, root: HTMLElement = document.documentElement): void {
  root.dataset.theme = theme
}

/** Larger text scales the root font size; every rem-based type token grows with it (display-settings). */
export function applyTextSize(size: 'normal' | 'large', root: HTMLElement = document.documentElement): void {
  if (size === 'large') root.dataset.textSize = 'large'
  else delete root.dataset.textSize
}
