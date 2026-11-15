// "How the app works" as an animated mini-screen (lesson-blocks "How the app works is a walkthrough";
// add-lesson-walkthroughs design 1, D170). A picture of a lesson screen (one labelled image; its parts are not
// controls), stepped with the replay's own controls. Step n captions the screen's n-th point, word for word,
// and lights the parts that point is about (a thick accent ring and "▶ here", not colour alone).
import './walkthrough.css'
import { useEffect, useId, useReducer, useState, type KeyboardEvent, type ReactNode } from 'react'
import { replayCopy } from '../../content/replay'
import { walkthroughCopy as copy, walkthroughs, type WalkthroughPart } from '../../content/walkthrough'
import { initReplay, replayReducer } from '../../replay/replay'
import { StepControls } from '../replay/StepControls'

export function AppWalkthrough({ screenId, points }: { screenId: string; points: readonly string[] }) {
  const map = walkthroughs[screenId] ?? []
  const [state, dispatch] = useReducer(replayReducer, points.length, (n) => initReplay(n))
  const [listOpen, setListOpen] = useState(false)
  const listId = useId()

  useEffect(() => {
    if (!state.playing) return
    const t = setInterval(() => dispatch({ type: 'tick' }), replayCopy.baseMs / state.speed)
    return () => clearInterval(t)
  }, [state.playing, state.speed])

  const p = state.position
  const lit: readonly WalkthroughPart[] = p === 0 ? [] : (map[p - 1] ?? [])
  const caption = p === 0 ? copy.start : points[p - 1]

  // The replay's keys while focus is inside the walkthrough (WCAG 2.1.4), as in a tree replay.
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.ctrlKey || e.altKey || e.metaKey) return
    const action = e.key === ' ' ? 'toggle' : e.key === 'ArrowLeft' ? 'back' : e.key === 'ArrowRight' ? 'step' : e.key === '[' ? 'slower' : e.key === ']' ? 'faster' : null
    if (action === null) return
    e.preventDefault()
    dispatch({ type: action })
  }

  const part = (id: WalkthroughPart, children?: ReactNode, cls = '') => {
    const on = lit.includes(id)
    return (
      <div className={`walkthrough-part ${cls}`.trim()} data-part={id} data-lit={on ? '' : undefined}>
        {children ?? copy.parts[id]}
        {on && <span className="walkthrough-here">{copy.here}</span>}
      </div>
    )
  }

  return (
    <div className="walkthrough" onKeyDown={onKeyDown}>
      <div className="walkthrough-screen" role="img" aria-label={copy.imageName}>
        {part('lessons', <><span>{copy.parts.lessons}</span><span className="walkthrough-bar" /><span className="walkthrough-bar" /><span className="walkthrough-bar" /></>, 'walkthrough-side')}
        <div className="walkthrough-main">
          {part('title-bar', undefined, 'walkthrough-title-bar')}
          {part('tree', <span className="walkthrough-tree"><span /><span /><span /></span>, 'walkthrough-tree-part')}
          <div className="walkthrough-row">
            {part('back')}
            {part('replay')}
            {part('rule')}
            {part('hint')}
            {part('next')}
          </div>
          <div className="walkthrough-row">
            {part('confidence')}
            {part('check')}
            {part('title', undefined, 'walkthrough-badge')}
          </div>
        </div>
      </div>
      <p className="walkthrough-caption" aria-live="polite" data-narrate>
        {caption}
      </p>
      <StepControls
        position={p}
        length={state.length}
        playing={state.playing}
        speed={state.speed}
        held={false}
        onBack={() => dispatch({ type: 'back' })}
        onToggle={() => dispatch({ type: 'toggle' })}
        onStep={() => dispatch({ type: 'step' })}
        onSpeed={(speed) => dispatch({ type: 'setSpeed', speed })}
      />
      <button type="button" className="module-button module-button-quiet walkthrough-list-toggle" aria-expanded={listOpen} aria-controls={listId} onClick={() => setListOpen((o) => !o)}>
        {copy.showList}
      </button>
      <ol id={listId} className="walkthrough-list" hidden={!listOpen}>
        {points.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ol>
    </div>
  )
}
