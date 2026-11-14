// The display settings from lessons/c1.json (display-settings; ID 7.2 C1, ID 10.4): the same switches
// on C1's settings screen and in the Aa menu. Narration stays off until text-to-speech is built (D26).
import { lessonCopy } from '../content/lesson'
import { lessonById } from '../live/load'
import { SettingSwitch } from './SettingSwitch'
import { useTheme } from './ThemeContext'

interface SettingEntry {
  id: 'confetti' | 'narration' | 'textSize'
  label: string
}

export function DisplaySettings() {
  const session = useTheme()
  if (session === null) return null
  const screen = lessonById('c1')?.screens.find((s) => s.type === 'settings') as { settings?: SettingEntry[] } | undefined
  const entries = screen?.settings ?? []
  const { settings, setSetting } = session
  return (
    <div className="display-settings" role="group" aria-label={lessonCopy.settings.label}>
      {entries.map((e) =>
        e.id === 'confetti' ? (
          <SettingSwitch key={e.id} label={e.label} on={settings.confetti} onToggle={() => setSetting('confetti', !settings.confetti)} />
        ) : e.id === 'textSize' ? (
          <SettingSwitch key={e.id} label={e.label} on={settings.textSize === 'large'} onToggle={() => setSetting('textSize', settings.textSize === 'large' ? 'normal' : 'large')} />
        ) : (
          <SettingSwitch key={e.id} label={e.label} on={false} onToggle={() => undefined} disabled note={lessonCopy.settings.later} />
        ),
      )}
    </div>
  )
}
