// Keys from the content (conventions.keys): integers, or capital letters compared alphabetically.
// The engine works on numbers, so a letter tree is encoded as char codes, which keeps the order,
// and gets a formatKey that turns them back into letters (D99).
import type { FormatKey } from '../engine/shape'
import type { Key } from '../engine/tree'

export type RawKey = number | string

export type KeyKind = 'integer' | 'letter'

const isLetter = (k: RawKey): k is string => typeof k === 'string' && /^[A-Z]$/.test(k)
const isInteger = (k: RawKey): k is number => typeof k === 'number' && Number.isInteger(k)

/** The kind of a list of keys, 'mixed' when they are not all one kind, 'invalid' for anything else. */
export function keyKind(keys: readonly RawKey[]): KeyKind | 'mixed' | 'invalid' | 'empty' {
  if (keys.length === 0) return 'empty'
  if (keys.every(isInteger)) return 'integer'
  if (keys.every(isLetter)) return 'letter'
  if (keys.every((k) => isInteger(k) || isLetter(k))) return 'mixed'
  return 'invalid'
}

export function encodeKey(k: RawKey): Key {
  return typeof k === 'string' ? k.charCodeAt(0) : k
}

export const formatInteger: FormatKey = (k) => String(k)
export const formatLetter: FormatKey = (k) => String.fromCharCode(k)

export function formatFor(kind: KeyKind): FormatKey {
  return kind === 'letter' ? formatLetter : formatInteger
}
