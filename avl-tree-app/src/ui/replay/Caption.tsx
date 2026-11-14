import { replayCopy } from '../../content/replay'

export interface CaptionProps {
  /** The sentence for the current position (at most two sentences). */
  sentence: string
  /** Nodes visited so far, for a search (FR-VIS-11). */
  visited?: number
}

/**
 * The caption directly under the tree (D23, D105): the replay's only live region with text. Tree plus
 * caption is the FR-LRN-02 floor and is never hidden. Always mounted so the first change is announced.
 */
export function Caption({ sentence, visited }: CaptionProps) {
  return (
    <p className="replay-caption" role="status" aria-live="polite" aria-label={replayCopy.explanationLabel}>
      {sentence}
      {visited !== undefined && (
        <>
          {' '}
          <span className="replay-visited">{replayCopy.visited(visited)}</span>
        </>
      )}
    </p>
  )
}
