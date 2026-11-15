import { sandboxCopy as copy } from '../../content/sandbox'
import type { LogEntry } from '../../sandbox/sandbox'

/**
 * What happened, newest first, in a polite log region (wireframe 1n EventLog, D19). Its heading is the
 * section's (D141). It scrolls in its own focusable box, so a long log never pushes the rest of the page
 * down. Each insert or delete shows a heading and every step in the lessons' captions (D161); with
 * rebalancing off, a last line says no rotation is made.
 */
export function EventLog({ entries }: { entries: readonly LogEntry[] }) {
  return (
    <div role="log" aria-live="polite" aria-relevant="additions" aria-label={copy.logLabel} className="sandbox-log" tabIndex={0}>
      {entries.length === 0 ? (
        <p>{copy.logEmpty}</p>
      ) : (
        <ol reversed className="sandbox-log-entries">
          {entries.map((e, i) => (
            <li key={entries.length - i}>
              <p className="sandbox-log-heading">{copy.heading(e)}</p>
              {'steps' in e && (
                <ul className="sandbox-log-steps">
                  {e.steps.map((t, j) => (
                    <li key={j}>{t}</li>
                  ))}
                  {!e.rebalancing && <li>{copy.noRotation}</li>}
                </ul>
              )}
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
