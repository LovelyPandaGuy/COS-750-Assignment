// Development-only gallery section (add-narration, design decision 9): the controls idle, speaking and
// paused. A stub engine; it never speaks. The unavailable switch needs the shell's styles, so it is
// checked in the app (critique) and by the display-settings unit tests, not here.
// Developer text, not content.
import type { ReactNode } from 'react'
import { NarrationControls } from './NarrationControls'
import { NarrationProvider, type NarrationState } from './NarrationContext'
import type { SpeechEngine } from './engine'

const silent: SpeechEngine = {
  voices: () => [{ name: 'Example voice', lang: 'en-GB', localService: true }],
  onVoicesChanged: () => () => {},
  speak: () => {},
  pause: () => {},
  resume: () => {},
  cancel: () => {},
}
const labels = { group: 'Example read this screen aloud', readAloud: 'Example read aloud', pause: 'Example pause', resume: 'Example resume', stop: 'Example stop' }

function Cell({ title, state, children }: { title: string; state: string; children: ReactNode }) {
  return (
    <div className="learn-gallery-cell" data-gallery-narration={state}>
      <p className="gallery-label">{title}</p>
      {children}
    </div>
  )
}

function Controls({ state }: { state: NarrationState }) {
  return (
    <NarrationProvider engine={silent} on initialState={state}>
      <h3>Example screen heading</h3>
      <NarrationControls getRoot={() => null} labels={labels} />
    </NarrationProvider>
  )
}

export function NarrationGallery() {
  return (
    <section className="gallery-section learn-gallery" aria-labelledby="g-narration" data-narration-gallery="">
      <h2 id="g-narration">Narration</h2>
      <div className="learn-gallery-stack">
        <Cell title="Idle" state="idle">
          <Controls state="idle" />
        </Cell>
        <Cell title="Speaking" state="speaking">
          <Controls state="speaking" />
        </Cell>
        <Cell title="Paused" state="paused">
          <Controls state="paused" />
        </Cell>
      </div>
    </section>
  )
}
