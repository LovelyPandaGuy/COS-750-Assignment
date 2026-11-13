import type { ModuleId } from '../state/learnerState'

// Route events (D28). Emitted to a sink that does nothing until change 26 adds the event log.
// Nothing here stores or sends anything.

export type RouteTarget = ModuleId | 'path'

export type RouteEvent =
  | { type: 'route_recommended'; from: ModuleId; recommended: RouteTarget; at: string }
  | { type: 'route_chosen'; from: ModuleId; recommended: RouteTarget; chosen: RouteTarget; at: string }

export type RouteEventSink = (event: RouteEvent) => void

const noopSink: RouteEventSink = () => {}
let sink: RouteEventSink = noopSink

export function emitRouteEvent(event: RouteEvent): void {
  sink(event)
}

/** Replaces the sink and returns a function that puts the previous one back. */
export function setRouteEventSink(next: RouteEventSink): () => void {
  const previous = sink
  sink = next
  return () => {
    sink = previous
  }
}
