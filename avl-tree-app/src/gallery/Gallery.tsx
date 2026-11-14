// Development-only gallery (add-ui-foundation, design decision 7): every base-component state.
// The labels here are developer text, not student content.
import { useState } from 'react'
import { Button, CHIP_LEVELS, MasteryBadge, OutcomeChip, type ButtonVariant, type MasteryState } from '../ui/base'
import { LearnGallery } from '../ui/learn/LearnGallery'
import { ProgressGallery } from '../ui/progress/ProgressGallery'

const VARIANTS: ButtonVariant[] = ['primary', 'secondary', 'quiet']
const STATES = ['default', 'hover', 'focus', 'pressed', 'disabled'] as const
const MASTERY: MasteryState[] = ['secure', 'developing', 'not-yet']
const OUTCOME = 'Fix an LR imbalance with two rotations'

export function Gallery() {
  const [count, setCount] = useState(0)
  return (
    <main className="gallery" data-gallery-ready>
      <h1>Base components</h1>

      <section className="gallery-section" aria-labelledby="g-type">
        <h2 id="g-type">Type</h2>
        <p className="gallery-body">Body text, 16 px: a search follows one path down the tree.</p>
        <p className="gallery-label">Label, 14 px: metadata only</p>
        <pre className="gallery-mono">insert(node, key)</pre>
      </section>

      <section className="gallery-section" aria-labelledby="g-buttons">
        <h2 id="g-buttons">Button</h2>
        {VARIANTS.map((variant) => (
          <div key={variant} className="gallery-grid" role="group" aria-label={variant}>
            {STATES.map((state) => (
              <div key={state} className="gallery-cell">
                <span className="gallery-label">
                  {variant}, {state}
                </span>
                <Button
                  variant={variant}
                  data-variant={variant}
                  data-state={state}
                  data-force={state === 'default' || state === 'disabled' ? undefined : state}
                  disabled={state === 'disabled'}
                  disabledReason={state === 'disabled' ? 'Answer first to see the replay' : undefined}
                >
                  {variant === 'quiet' ? 'Skip, just watch' : variant === 'primary' ? 'Continue' : 'Replay'}
                </Button>
              </div>
            ))}
          </div>
        ))}
        <div className="gallery-stack">
          <Button variant="primary" data-testid="activation-target" onClick={() => setCount((n) => n + 1)}>
            Count activations
          </Button>
          <output data-testid="activation-count">{count}</output>
        </div>
      </section>

      <section className="gallery-section" aria-labelledby="g-chips">
        <h2 id="g-chips">OutcomeChip</h2>
        <div className="gallery-grid">
          {CHIP_LEVELS.map((level) => (
            <div key={level} className="gallery-cell">
              <span className="gallery-label">{level}: static, link, hover, button, disabled</span>
              <OutcomeChip level={level} text={OUTCOME} />
              <OutcomeChip level={level} text={OUTCOME} href="#outcome" />
              <span data-force="hover" className="gallery-stack">
                <OutcomeChip level={level} text={OUTCOME} href="#outcome-hover" />
              </span>
              <OutcomeChip level={level} text={OUTCOME} onSelect={() => {}} />
              <OutcomeChip level={level} text={OUTCOME} onSelect={() => {}} disabled />
            </div>
          ))}
        </div>
      </section>

      <section className="gallery-section" aria-labelledby="g-badges">
        <h2 id="g-badges">MasteryBadge</h2>
        <div className="gallery-grid">
          {MASTERY.map((state) => (
            <div key={state} className="gallery-cell">
              <span className="gallery-label">{state}</span>
              <MasteryBadge state={state} />
              <MasteryBadge state={state} compact />
            </div>
          ))}
          <div className="gallery-cell">
            <span className="gallery-label">with a change</span>
            <MasteryBadge state="developing" before="not-yet" />
            <MasteryBadge state="secure" before="developing" compact />
          </div>
        </div>
      </section>
      <LearnGallery />
      <ProgressGallery />
    </main>
  )
}

