import { useEffect, useState } from 'react'
import type { Key } from '../../engine/tree'
import type { Layout } from './layout'

/**
 * How long a node takes to move to its new place when the tree changes (NFR-03, D32).
 * Assumed (revamp-tree-view, proposal question 4, D100): a quarter of the 1× replay step (D29).
 * The design and tokens.css give no duration. Screens may override it; 0 snaps.
 */
export const TREE_TRANSITION_MS = 300

/** True when the user asks for reduced motion. Read at each change, so a later switch applies next time. */
export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

type Point = { x: number; y: number }

interface Motion {
  /** The layout being moved to. */
  target: Layout
  /** Where kept nodes start; null when nothing is moving. */
  from: Map<Key, Point> | null
  /** Drawing size while moving: the larger of the old and new sizes, so nothing is clipped. */
  width: number
  height: number
  /** 0 to 1, linear in time. */
  progress: number
}

/** Ease in and out (cubic): strictly between 0 and 1 for any progress strictly between 0 and 1. */
function ease(p: number): number {
  return p < 0.5 ? 4 * p * p * p : 1 - (-2 * p + 2) ** 3 / 2
}

/** The layout drawn for a motion state: kept nodes interpolated, new nodes at their place. */
function frameOf(m: Motion): Layout {
  const { from, target } = m
  if (from === null) return target
  const p = ease(m.progress)
  return {
    width: Math.max(m.width, target.width),
    height: Math.max(m.height, target.height),
    nodes: target.nodes.map((n) => {
      const f = from.get(n.key)
      return f ? { ...n, x: f.x + (n.x - f.x) * p, y: f.y + (n.y - f.y) * p } : n
    }),
  }
}

const settled = (target: Layout): Motion => ({ target, from: null, width: target.width, height: target.height, progress: 1 })

/** The motion that starts when `target` replaces what `current` draws now. */
function begin(current: Motion, target: Layout, ms: number): Motion {
  const snap = ms <= 0 || prefersReducedMotion() || typeof requestAnimationFrame !== 'function'
  if (snap) return settled(target)
  const drawn = frameOf(current)
  const from = new Map(drawn.nodes.map((n) => [n.key, { x: n.x, y: n.y }]))
  const moves = target.nodes.some((n) => {
    const f = from.get(n.key)
    return f !== undefined && (f.x !== n.x || f.y !== n.y)
  })
  if (!moves) return settled(target)
  return { target, from, width: Math.max(drawn.width, target.width), height: Math.max(drawn.height, target.height), progress: 0 }
}

/**
 * The layout to draw while the tree view moves from what is drawn now to `target` (NFR-03).
 * Nodes in both trees move; a node only in the target is drawn at its place at once; a node only in the
 * old tree is not drawn. `target` must keep its identity while the tree is unchanged (memoise it).
 */
export function useTweenedLayout(target: Layout, ms: number): Layout {
  const [motion, setMotion] = useState<Motion>(() => settled(target))

  // A new target is taken in during render (React's "adjust state when a prop changes"), so the first
  // frame after the change already shows the start of the move, never one frame of the end state.
  let current = motion
  if (motion.target !== target) {
    current = begin(motion, target, ms)
    setMotion(current)
  }

  const moving = current.from
  useEffect(() => {
    if (moving === null) return
    const start = performance.now()
    let id = 0
    const step = (now: number) => {
      const progress = Math.min(1, (now - start) / ms)
      setMotion((m) => (m.from !== moving ? m : progress >= 1 ? settled(m.target) : { ...m, progress }))
      if (progress < 1) id = requestAnimationFrame(step)
    }
    id = requestAnimationFrame(step)
    return () => cancelAnimationFrame(id)
  }, [moving, ms])

  return frameOf(current)
}
