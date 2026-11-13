import { afterEach, describe, it, expect, vi } from 'vitest'
import { emitRouteEvent, setRouteEventSink, type RouteEvent } from '../../src/navigation/routeEvents'

// Spec: add-module-framework / route-choice, "Route events are emitted". Requirement IDs: D28.

const recommended: RouteEvent = { type: 'route_recommended', from: 'C2', recommended: 'C3', at: '2026-11-13T10:00:00.000Z' }
const chosen: RouteEvent = { type: 'route_chosen', from: 'C2', recommended: 'C3', chosen: 'path', at: '2026-11-13T10:00:01.000Z' }

let restore: (() => void) | undefined
afterEach(() => {
  restore?.()
  restore = undefined
  vi.restoreAllMocks()
})

describe('D28 route event sink', () => {
  it('the default sink does nothing: no storage write, no error', () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem')
    expect(() => {
      emitRouteEvent(recommended)
      emitRouteEvent(chosen)
    }).not.toThrow()
    expect(setItem).not.toHaveBeenCalled()
  })

  it('a swapped sink receives each event once, in order', () => {
    const got: RouteEvent[] = []
    restore = setRouteEventSink((e) => got.push(e))
    emitRouteEvent(recommended)
    emitRouteEvent(chosen)
    expect(got).toEqual([recommended, chosen])
  })

  it('restoring puts the previous sink back', () => {
    const got: RouteEvent[] = []
    const undo = setRouteEventSink((e) => got.push(e))
    undo()
    emitRouteEvent(recommended)
    expect(got).toEqual([])
  })
})
