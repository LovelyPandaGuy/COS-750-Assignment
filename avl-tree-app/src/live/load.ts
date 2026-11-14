// The one loader for src/live_content/ (live-content; ID 12 "the app imports the files at build
// time"; D94). Files are bundled by Vite at build time, ordered by manifest.json, and validated once.
import { validate, type Validated } from './validate'
import type { Content, Lesson, Problem } from './types'

const FOLDER = '../live_content/'

const modules = import.meta.glob<unknown>('../live_content/**/*.json', { eager: true, import: 'default' })

/** Every JSON file under src/live_content/, by its path relative to that folder. */
export function bundledFiles(): Record<string, unknown> {
  return Object.fromEntries(Object.entries(modules).map(([path, value]) => [path.slice(FOLDER.length), value]))
}

export type Loaded = { content: Content; problems: [] } | { content?: undefined; problems: Problem[] }

let cached: Loaded | null = null

/** Validate a set of files (the bundled ones, or a test's fixtures). */
export function loadFrom(files: Record<string, unknown>): Loaded {
  const r: Validated = validate({ manifest: files['manifest.json'], files })
  return r.content !== undefined ? { content: r.content, problems: [] } : { problems: r.problems }
}

/** The app's content, loaded and validated once. */
export function loadContent(): Loaded {
  cached ??= loadFrom(bundledFiles())
  return cached
}

/** The lesson with this id (c1 to c9), or undefined when the content has problems or no such lesson. */
export function lessonById(id: string): Lesson | undefined {
  return loadContent().content?.lessons.find((l) => l.id === id)
}

/** "Lesson n of 9": the lesson's place in manifest order, from 1. */
export function lessonPosition(id: string): { index: number; total: number } {
  const lessons = loadContent().content?.lessons ?? []
  return { index: lessons.findIndex((l) => l.id === id) + 1, total: lessons.length }
}
