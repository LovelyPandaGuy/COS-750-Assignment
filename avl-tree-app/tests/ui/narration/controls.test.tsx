import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRef } from 'react'
import { axe } from 'vitest-axe'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { NarrationControls } from '../../../src/ui/narration/NarrationControls'
import { NarrationProvider } from '../../../src/ui/narration/NarrationContext'
import type { SpeechEngine } from '../../../src/ui/narration/engine'
import { REMOTE_EN, fakeEngine } from './fake'

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
