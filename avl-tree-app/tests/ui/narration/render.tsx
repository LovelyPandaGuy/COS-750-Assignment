// Renders the whole app with a fake speech engine and stored settings (add-narration).
import { fireEvent, render, screen } from '@testing-library/react'
import App from '../../../src/App'
import { lessonCopy } from '../../../src/content/lesson'
import { lessonById } from '../../../src/live/load'
import type { Attempt } from '../../../src/state/learnerState'
import { createLearnerStorage, createSettingsStorage, LEARNER_KEY, SETTINGS_KEY, memoryBackend } from '../../../src/state/storage'
import { progressState } from '../learner-fixtures'
import type { SpeechEngine } from '../../../src/ui/narration/engine'

export function renderNarrated(opts: { lesson?: string; screenId?: string; engine: SpeechEngine | null; narration?: boolean; attempts?: Attempt[]; settingsRaw?: unknown }) {
  const backend = memoryBackend()
  backend.setItem(LEARNER_KEY, JSON.stringify(progressState({ attempts: opts.attempts ?? [] })))
  backend.setItem(SETTINGS_KEY, JSON.stringify(opts.settingsRaw ?? { theme: 'light', confetti: true, narration: opts.narration ?? true, textSize: 'normal' }))
  const lesson = opts.lesson ?? 'c1'
  window.location.hash = `#/module/${lesson.toUpperCase()}`
  const storage = createLearnerStorage(backend)
  const settings = createSettingsStorage(backend)
  const r = render(<App storage={storage} initial={storage.load()} settings={settings} initialTheme={settings.load().theme} speech={opts.engine} />)
  if (opts.screenId) {
    const n = lessonById(lesson)!.screens.findIndex((s) => s.id === opts.screenId)
    if (n === -1) throw new Error(`no screen ${opts.screenId}`)
    for (let i = 0; i < n; i++) fireEvent.click(screen.getByRole('button', { name: lessonCopy.controls.next }))
  }
  return { ...r, backend }
}
