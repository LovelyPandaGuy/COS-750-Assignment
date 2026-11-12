import { replayCopy } from '../../content/replay'

export interface StepExplanationProps {
  sentence: string
  /** Nodes visited so far, for a search (FR-VIS-11). */
  visited?: number
}

/** The sentence for the current step in a polite live region (FR-VIS-07). Always mounted so the first change is announced. */
export function StepExplanation({ sentence, visited }: StepExplanationProps) {
  return (
    <div className="replay-explanation">
      {visited !== undefined && <p className="replay-visited">{replayCopy.visited(visited)}</p>}
      <p role="status" aria-live="polite" aria-label={replayCopy.explanationLabel}>
        {sentence}
      </p>
    </div>
  )
}
