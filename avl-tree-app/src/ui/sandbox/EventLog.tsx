import { sandboxCopy as copy } from '../../content/sandbox'
import type { LogEntry } from '../../sandbox/sandbox'

/** What happened, newest first, in a polite log region (wireframe 1n EventLog, D19). Its heading is the section's (D141). It scrolls
 * in its own focusable box, so a long log never pushes the rest of the page down. */
export function EventLog({ entries }: { entries: readonly LogEntry[] }) {
  return (
    <div role="log" aria-live="polite" aria-relevant="additions" aria-label={copy.logLabel} className="sandbox-log" tabIndex={0}>
      {entries.length === 0 ? (
        <p>{copy.logEmpty}</p>
      ) : (
        <ol>
          {entries.map((e, i) => (
            <li key={entries.length - i}>{copy.log(e)}</li>
          ))}
        </ol>
      )}
    </div>
  )
}
