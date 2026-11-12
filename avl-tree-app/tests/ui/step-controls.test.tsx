import { render, screen, fireEvent } from '@testing-library/react'
import { readFileSync } from 'node:fs'
import { describe, it, expect, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { StepControls, type StepControlsProps } from '../../src/ui/replay/StepControls'

// Spec: add-replay-and-pseudocode / step-replay. Requirement IDs: FR-VIS-03, FR-VIS-10, NFR-02.

const props = (over: Partial<StepControlsProps> = {}): StepControlsProps => ({
  position: 0,
  length: 9,
  playing: false,
  speed: 1,
  held: false,
  onBack: vi.fn(),
  onToggle: vi.fn(),
  onStep: vi.fn(),
  onSpeed: vi.fn(),
  ...over,
})
const btn = (name: string | RegExp) => screen.getByRole('button', { name })
const stripComments = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, '')

describe('FR-VIS-03 controls work by touch and pointer', () => {
  it('has text names for every button and the selected speed is pressed', () => {
    render(<StepControls {...props()} />)
    for (const n of ['Back', 'Play', 'Step', '0.5×', '1×', '2×']) expect(btn(n)).toBeTruthy()
    expect(btn('1×')).toHaveAttribute('aria-pressed', 'true')
    expect(btn('0.5×')).toHaveAttribute('aria-pressed', 'false')
    expect(btn('2×')).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByRole('group', { name: 'Speed' })).toBeTruthy()
  })

  it('glyphs are hidden from the accessible name', () => {
    render(<StepControls {...props()} />)
    for (const b of screen.getAllByRole('button')) {
      for (const g of b.querySelectorAll('[aria-hidden="true"]')) expect(g.textContent).toMatch(/[⏮⏭▶⏸]/)
    }
  })

  it('reads Pause while playing', () => {
    render(<StepControls {...props({ playing: true })} />)
    expect(btn('Pause')).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Play' })).toBeNull()
  })

  it('calls back on each control', () => {
    const p = props({ position: 3 })
    render(<StepControls {...p} />)
    fireEvent.click(btn('Back'))
    fireEvent.click(btn('Play'))
    fireEvent.click(btn('Step'))
    fireEvent.click(btn('2×'))
    expect(p.onBack).toHaveBeenCalledOnce()
    expect(p.onToggle).toHaveBeenCalledOnce()
    expect(p.onStep).toHaveBeenCalledOnce()
    expect(p.onSpeed).toHaveBeenCalledWith(2)
  })

  it('44 px targets in the stylesheet', () => {
    const css = stripComments(readFileSync('src/ui/replay/replay.css', 'utf8'))
    expect(css).toMatch(/\.replay-button[^{]*\{[^}]*min-height:\s*var\(--target-min\)/)
    expect(css).toMatch(/\.replay-button[^{]*\{[^}]*min-width:\s*var\(--target-min\)/)
    for (const b of ['Back', 'Play', 'Step', '0.5×', '1×', '2×']) {
      render(<StepControls {...props()} />)
      expect(screen.getAllByRole('button', { name: b })[0]).toHaveClass('replay-button')
    }
  })

  it('has no axe violations', async () => {
    const { container } = render(<StepControls {...props({ position: 3 })} />)
    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('FR-VIS-03 bounds', () => {
  it('at 0: Back disabled, Step enabled', () => {
    render(<StepControls {...props({ position: 0 })} />)
    expect(btn('Back')).toBeDisabled()
    expect(btn('Step')).toBeEnabled()
  })

  it('at n: Step disabled, Back enabled', () => {
    render(<StepControls {...props({ position: 9 })} />)
    expect(btn('Step')).toBeDisabled()
    expect(btn('Back')).toBeEnabled()
  })

  it('held: Play and Step disabled, with a note', () => {
    render(<StepControls {...props({ held: true })} />)
    expect(btn('Play')).toBeDisabled()
    expect(btn('Step')).toBeDisabled()
    expect(screen.getByText(/predict/i)).toBeTruthy()
  })
})

describe('FR-VIS-03 step counter and progress', () => {
  it('shows Step p / n and a named progress bar', () => {
    render(<StepControls {...props({ position: 3 })} />)
    expect(screen.getByText('Step 3 / 9')).toBeTruthy()
    const bar = screen.getByRole('progressbar', { name: /progress/i })
    expect(bar).toHaveAttribute('value', '3')
    expect(bar).toHaveAttribute('max', '9')
  })
})

describe('NFR-02 replay stylesheet uses tokens only', () => {
  const css = stripComments(readFileSync('src/ui/replay/replay.css', 'utf8'))

  it('has no raw colours', () => {
    expect(css).not.toMatch(/#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(/)
  })

  it('sizes and radii come from tokens', () => {
    for (const m of css.matchAll(/(?:^|[;{\s])(gap|padding[a-z-]*|margin[a-z-]*|border-radius|font-size|min-height|min-width)\s*:\s*([^;}]+)/g)) {
      expect(m[2].trim(), `${m[1]}: ${m[2]}`).toMatch(/^(0|auto|(var\(--[a-z0-9-]+\)\s*)+)$/)
    }
  })

  it('does not override the focus style', () => {
    expect(css).not.toMatch(/:focus/)
  })
})
