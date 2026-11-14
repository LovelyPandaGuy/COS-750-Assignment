// The reading order (add-narration, design decision 3, D146): the text of the parts marked
// data-narrate, in document order, as shown. No words are added.

const SKIP = '[hidden], [aria-hidden="true"], button, [data-narrate-skip]'

function shown(el: Element, root: Element): boolean {
  for (let e: Element | null = el; e !== null && e !== root.parentElement; e = e.parentElement) {
    if (e.hasAttribute('hidden') || e.getAttribute('aria-hidden') === 'true') return false
  }
  // Layout check where the browser has one (display: none, visibility: hidden). Without it, the
  // hidden and aria-hidden checks above still apply.
  const check = (el as Element & { checkVisibility?: (o?: object) => boolean }).checkVisibility
  return typeof check === 'function' ? check.call(el, { visibilityProperty: true }) : true
}

function textOf(el: HTMLElement): string {
  const given = el.dataset.narrateText
  if (given !== undefined) return given.replace(/\s+/g, ' ').trim()
  const copy = el.cloneNode(true) as HTMLElement
  copy.querySelectorAll(SKIP).forEach((n) => n.remove())
  return (copy.textContent ?? '').replace(/\s+/g, ' ').trim()
}

export function collectNarration(root: Element): string[] {
  const out: string[] = []
  for (const el of Array.from(root.querySelectorAll<HTMLElement>('[data-narrate]'))) {
    const outer = el.parentElement?.closest('[data-narrate]')
    if (outer && root.contains(outer)) continue
    if (!shown(el, root)) continue
    const text = textOf(el)
    if (text !== '') out.push(text)
  }
  return out
}
