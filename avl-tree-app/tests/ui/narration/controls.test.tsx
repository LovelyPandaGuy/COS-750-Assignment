import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRef } from 'react'
import { axe } from 'vitest-axe'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { NarrationControls } from '../../../src/ui/narration/NarrationControls'
import { NarrationProvider } from '../../../src/ui/narration/NarrationContext'
import type { SpeechEngine } from '../../../src/ui/narration/engine'
import { lessonCopy } from '../../../src/content/lesson'
import { narrationCopy } from '../../../src/content/narration'
import { LOCAL_EN, REMOTE_EN, fakeEngine } from './fake'
import { renderNarrated } from './render'

// Spec: add-narration / narration "Read aloud on every lesson screen when narration is on", "Pause,
// resume and stop", "On-device voices only", "Labels from content". ID 8.1, D145, D148, NFR-02, NFR-05.

const labels = { group: 'Example narration', readAloud: 'Example read aloud', pause: 'Example pause', resume: 'Example resume', stop: 'Example stop' }

function Screen() {
  const ref = useRef<HTMLElement>(null)
  return (
    <section ref={ref}>
      <h2 data-narrate>Example heading</h2>
      <NarrationControls getRoot={() => ref.current} labels={labels} />
      <p data-narrate>Example text</p>
    </section>
  )
}

function mount(engine: SpeechEngine | null, on = true) {
  const ui = (o: boolean) => (
    <NarrationProvider engine={engine} on={o}>
      <Screen />
    </NarrationProvider>
  )
  const r = render(ui(on))
  return { ...r, user: userEvent.setup(), turn: (o: boolean) => r.rerender(ui(o)) }
}
const btn = (name: string) => screen.getByRole('button', { name })

describe('ID 8.1 D145 shown only when narration is on and a voice exists', () => {
  it('on with an on-device voice: Read aloud, and nothing spoken yet', () => {
    const e = fakeEngine()
    mount(e)
    expect(btn(labels.readAloud)).toBeInTheDocument()
    expect(e.spoken).toEqual([])
  })
  it('off: no control', () => {
    mount(fakeEngine(), false)
    expect(screen.queryByRole('button')).toBeNull()
  })
  it('no engine, or only remote voices: no control', () => {
    const a = mount(null)
    expect(screen.queryByRole('button')).toBeNull()
    a.unmount()
    mount(fakeEngine([REMOTE_EN]))
    expect(screen.queryByRole('button')).toBeNull()
  })
  it('voices that load late make it available', () => {
    const e = fakeEngine([])
    mount(e)
    expect(screen.queryByRole('button')).toBeNull()
    act(() => e.setVoices([{ name: 'Late', lang: 'en-ZA', localService: true }]))
    expect(btn(labels.readAloud)).toBeInTheDocument()
  })
})

describe('D148 NFR-02 pause, resume and stop', () => {
  it('read, pause, resume, stop, with labels in words', async () => {
    const e = fakeEngine()
    const { user } = mount(e)
    await user.click(btn(labels.readAloud))
    expect(e.spoken).toEqual([['Example heading', 'Example text']])
    expect(e.voicesUsed[0]?.localService).toBe(true)
    await user.click(btn(labels.pause))
    expect(e.calls.pause).toBe(1)
    await user.click(btn(labels.resume))
    expect(e.calls.resume).toBe(1)
    expect(btn(labels.pause)).toBeInTheDocument()
    await user.click(btn(labels.stop))
    expect(e.calls.cancel).toBeGreaterThanOrEqual(1)
    expect(btn(labels.readAloud)).toBeInTheDocument()
  })
  it('the end of speech returns to Read aloud', async () => {
    const e = fakeEngine()
    const { user } = mount(e)
    await user.click(btn(labels.readAloud))
    act(() => e.finish())
    expect(btn(labels.readAloud)).toBeInTheDocument()
  })
  it('keyboard: Enter starts and Space pauses', async () => {
    const e = fakeEngine()
    const { user } = mount(e)
    await user.tab()
    expect(btn(labels.readAloud)).toHaveFocus()
    await user.keyboard('{Enter}')
    expect(e.spoken).toHaveLength(1)
    btn(labels.pause).focus()
    await user.keyboard(' ')
    expect(e.calls.pause).toBe(1)
  })
  it('turning narration off stops speech', async () => {
    const e = fakeEngine()
    const { user, turn } = mount(e)
    await user.click(btn(labels.readAloud))
    const before = e.calls.cancel
    turn(false)
    expect(e.calls.cancel).toBeGreaterThan(before)
  })
  it('a hidden page stops speech', async () => {
    const e = fakeEngine()
    const { user } = mount(e)
    await user.click(btn(labels.readAloud))
    const before = e.calls.cancel
    Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true })
    act(() => void document.dispatchEvent(new Event('visibilitychange')))
    expect(e.calls.cancel).toBeGreaterThan(before)
    Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true })
    expect(btn(labels.readAloud)).toBeInTheDocument()
  })
  it('the controls are a labelled group; axe while speaking', async () => {
    const e = fakeEngine()
    const { user, container } = mount(e)
    expect(screen.getByRole('group', { name: labels.group })).toBeInTheDocument()
    await user.click(btn(labels.readAloud))
    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('NFR-05 no network', () => {
  const fetchSpy = vi.fn()
  const xhrSpy = vi.fn()
  beforeEach(() => {
    vi.stubGlobal('fetch', fetchSpy)
    vi.stubGlobal('XMLHttpRequest', xhrSpy)
  })
  afterEach(() => vi.unstubAllGlobals())
  it('read, pause, resume and stop make no request', async () => {
    const { user } = mount(fakeEngine())
    for (const n of [labels.readAloud, labels.pause, labels.resume, labels.stop]) await user.click(btn(n))
    expect(fetchSpy).not.toHaveBeenCalled()
    expect(xhrSpy).not.toHaveBeenCalled()
  })
})

describe('D18 the component shows only given words', () => {
  it('no content import under src/ui/narration', async () => {
    const { files, read } = await import('../base/css-helpers')
    for (const p of files('src/ui/narration', /\.tsx?$/)) expect(read(p), p).not.toMatch(/from ['"][./]*(?:\.\.\/)*(content|live|live_content)\//)
  })
})

// Spec: fix-narration-late-voices / narration "On-device voices only". Chrome's first getVoices() is
// empty and voiceschanged fires once per page, so voices that load before the provider listens were lost.
// D174 (assumed): re-check every 250 ms for up to 3 s while no on-device voice is found.
describe('NFR-05 D147 D174 voices that load early or without an event are found', () => {
  const INTERVAL = 250
  const WINDOW = 3000
  const sw = () => within(screen.getByRole('group', { name: lessonCopy.settings.label })).getByRole('switch', { name: /Read text aloud/ })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('voices loaded before the app listens: Read aloud without any event', () => {
    mount(fakeEngine([LOCAL_EN], { emptyFirstRead: true }))
    expect(btn(labels.readAloud)).toBeInTheDocument()
  })

  it('voices loaded before the app listens: the narration switch is enabled', () => {
    renderNarrated({ screenId: 'c1-s05', engine: fakeEngine([LOCAL_EN], { emptyFirstRead: true }) })
    expect(sw()).toBeEnabled()
  })

  it('voices that appear without an event are found within one re-check interval', () => {
    vi.useFakeTimers()
    const e = fakeEngine([])
    mount(e)
    act(() => void vi.advanceTimersByTime(1000))
    expect(screen.queryByRole('button')).toBeNull()
    e.setVoicesSilently([LOCAL_EN])
    act(() => void vi.advanceTimersByTime(INTERVAL))
    expect(btn(labels.readAloud)).toBeInTheDocument()
  })

  it('re-checking stops after the window, and narration stays unavailable', () => {
    vi.useFakeTimers()
    const e = fakeEngine([REMOTE_EN])
    mount(e)
    act(() => void vi.advanceTimersByTime(WINDOW + INTERVAL))
    expect(e.reads).toBeGreaterThan(1)
    const after = e.reads
    act(() => void vi.advanceTimersByTime(WINDOW * 3))
    expect(e.reads).toBe(after)
    expect(vi.getTimerCount()).toBe(0)
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('re-checking stops: the switch shows the no built-in voice note', () => {
    vi.useFakeTimers()
    renderNarrated({ screenId: 'c1-s05', engine: fakeEngine([REMOTE_EN]) })
    act(() => void vi.advanceTimersByTime(WINDOW + INTERVAL))
    expect(sw()).toBeDisabled()
    expect(screen.getByText(narrationCopy.unavailable)).toBeInTheDocument()
  })

  it('no re-check after a voice is found', () => {
    vi.useFakeTimers()
    mount(fakeEngine([LOCAL_EN]))
    act(() => void vi.advanceTimersByTime(WINDOW + INTERVAL))
    expect(vi.getTimerCount()).toBe(0)
  })
})
