import { createElement, useId, useLayoutEffect, useRef, useState } from 'react'
import { replayCopy } from '../../content/replay'

export interface StepExplanationProps {
  /** The tree view's description of the tree at the current position (`describeTree`). */
  description: string
}

const HEADINGS = 'h1, h2, h3, h4, h5, h6, [role="heading"]'

/** The level of the last heading before `el` in the document, or null when there is none. */
function levelBefore(el: Element): number | null {
  let level: number | null = null
  for (const h of Array.from(el.ownerDocument.querySelectorAll(HEADINGS))) {
    if (el.contains(h) || !(h.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING)) continue
    const n = /^H([1-6])$/.exec(h.tagName)?.[1] ?? h.getAttribute('aria-level')
    if (n) level = Number(n)
  }
  return level
}

/**
 * The Text representation (FR-VIS-07, D105, wireframe 1f note 4): the whole tree in words, shown as a
 * visible paragraph. Not live (the caption announces each step) and not a disclosure (the tree view has
 * its own "Describe tree" button). The heading sits one level below the heading before it (h3 under a
 * module step's h2, h2 under the Sandbox's h1), so the page outline stays in order wherever the replay is.
 */
export function StepExplanation({ description }: StepExplanationProps) {
  const heading = useId()
  const section = useRef<HTMLElement>(null)
  const [level, setLevel] = useState(3)
  useLayoutEffect(() => {
    if (!section.current) return
    const before = levelBefore(section.current)
    const next = Math.min(6, (before ?? 1) + 1)
    if (next !== level) setLevel(next)
    // Re-checked on each step: the page around the replay can change between steps.
  }, [description, level])
  return (
    <section ref={section} className="replay-whole" aria-labelledby={heading}>
      {createElement(`h${level}`, { id: heading, className: 'replay-whole-heading' }, replayCopy.wholeTree)}
      <p>{description}</p>
    </section>
  )
}
