import { conventionsWording } from '../../content/modules/conventionsWording'
import { sandboxCopy as copy } from '../../content/sandbox'
import type { LogEntry } from '../../sandbox/sandbox'

const w = conventionsWording()

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
            <li key={entries.length - i}>{copy.log(e, w)}</li>
          ))}
        </ol>
      )}
    </section>
  )
}
