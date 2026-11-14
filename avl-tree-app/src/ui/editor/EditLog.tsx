// Wireframe 1m EditLog (tree-editor "The edit log"; D134): the text equivalent of the edited tree.
import { useId } from 'react'

export interface EditLogOwnProps {
  heading: string
  entries: readonly string[]
  emptyText: string
}

export function EditLog({ heading, entries, emptyText }: EditLogOwnProps) {
  const id = useId()
  return (
    <div className="editor-log">
      <p className="editor-log-heading" id={id}>
        {heading}
      </p>
      {entries.length === 0 ? (
        <p className="q-status">{emptyText}</p>
      ) : (
        <ol aria-labelledby={id}>
          {entries.map((e, i) => (
            <li key={i}>{e}</li>
          ))}
        </ol>
      )}
    </div>
  )
}
