import { sandboxCopy as copy } from '../../content/sandbox'
import type { SandboxStats } from '../../sandbox/sandbox'

/** Descriptive statistics from the engine (FR-VIS-08, FR-MOT-04): no points, no scores. */
export function TreeStats({ stats }: { stats: SandboxStats }) {
  const s = copy.stats
  return (
    <section className="sandbox-stats" aria-label={copy.statsLabel}>
      <ul>
        <li>{s.nodes(stats.nodes, stats.max)}</li>
        <li>{s.height(stats.height)}</li>
        <li>{s.shortest(stats.shortest)}</li>
        <li>{s.unbalanced(stats.unbalanced)}</li>
        <li>{stats.deepest === null ? s.noSearch : s.deepest(stats.deepest.key, stats.deepest.visits)}</li>
      </ul>
    </section>
  )
}
