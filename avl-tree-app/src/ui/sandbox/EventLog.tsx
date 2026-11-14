import { sandboxCopy as copy } from '../../content/sandbox'
import type { LogEntry } from '../../sandbox/sandbox'


/** What happened, newest first, in a polite log region (wireframe 1n EventLog, D19). */
export function EventLog({ entries }: { entries: readonly LogEntry[] }) {
  return (
    <section role="log" aria-live="polite" aria-relevant="additions" aria-label={copy.logLabel} className="sandbox-log">
      <h2>{copy.logLabel}</h2>
      {entries.length === 0 ? (
        <p>{copy.logEmpty}</p>
      ) : (
        <ol>
          {entries.map((e, i) => (
            <li key={entries.length - i}>{copy.log(e)}</li>
          ))}
        </ol>
      )}
    </section>
  )
}
