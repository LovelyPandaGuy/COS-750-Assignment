// A named section of the sandbox's control column (sandbox "Named sections in the control column"; D141):
// a region labelled by its level-2 heading, so readers and screen readers can jump between sections.
import { useId, type ReactNode } from 'react'

export function SandboxSection({ heading, children }: { heading: string; children: ReactNode }) {
  const id = useId()
  return (
    <section aria-labelledby={id} className="sandbox-section">
      <h2 id={id}>{heading}</h2>
      {children}
    </section>
  )
}
