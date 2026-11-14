// The display settings from lessons/c1.json (display-settings; ID 7.2 C1, ID 10.4): the same switches
// on C1's settings screen and in the Aa menu. Narration works where an on-device voice exists (add-narration).
import { lessonCopy } from '../content/lesson'
import { narrationCopy } from '../content/narration'
import { lessonById } from '../live/load'
import { SettingSwitch } from './SettingSwitch'
import { useNarration } from './narration/NarrationContext'
import { useTheme } from './ThemeContext'

interface SettingEntry {
  id: 'confetti' | 'narration' | 'textSize'
  label: string
}

export function DisplaySettings() {
  const session = useTheme()
  const narration = useNarration()
  if (session === null) return null
  const canSpeak = narration?.available ?? false
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
          canSpeak ? (
            <SettingSwitch key={e.id} label={e.label} on={settings.narration} onToggle={() => setSetting('narration', !settings.narration)} />
          ) : (
            <SettingSwitch key={e.id} label={e.label} on={false} onToggle={() => undefined} disabled note={narrationCopy.unavailable} />
          )
        ),
      )}
    </div>
  )
}
