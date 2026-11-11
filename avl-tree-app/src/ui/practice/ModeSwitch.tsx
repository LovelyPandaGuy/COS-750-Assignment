import { useState, type ReactNode } from 'react'
import './practice.css'
import { practiceCopy } from '../../content/practice'
import type { Key, Tree } from '../../engine/tree'
import { DoItYourself } from './DoItYourself'

const copy = practiceCopy.mode

export interface ModeSwitchProps {
  /** The Watch content (step controls and replay live in another change). */
  watch: ReactNode
  base: Tree
  keyToInsert: Key
}

type Mode = 'watch' | 'do'

export function ModeSwitch({ watch, base, keyToInsert }: ModeSwitchProps) {
  const [mode, setMode] = useState<Mode>('watch')
  const name = 'practice-mode'
  const option = (value: Mode, label: string) => (
    <label className="practice-option">
      <input type="radio" name={name} checked={mode === value} onChange={() => setMode(value)} />
      {label}
    </label>
  )
  return (
    <div className="practice">
      <fieldset className="practice-group">
        <legend>{copy.legend}</legend>
        <div className="practice-row">
          {option('watch', copy.watch)}
          {option('do', copy.doIt)}
        </div>
      </fieldset>
      {/* Leaving Do it yourself unmounts it, so each entry starts fresh. */}
      {mode === 'watch' ? watch : <DoItYourself base={base} keyToInsert={keyToInsert} />}
    </div>
  )
}
