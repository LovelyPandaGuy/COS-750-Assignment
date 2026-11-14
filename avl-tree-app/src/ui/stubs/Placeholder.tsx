import './stubs.css'

/** What every stub renders: its component name in a labelled box, and no student-facing content. */
export function Placeholder({ name }: { name: string }) {
  return (
    <div role="group" className="stub" data-stub={name} aria-label={`${name} (placeholder)`}>
      {name}
    </div>
  )
}
