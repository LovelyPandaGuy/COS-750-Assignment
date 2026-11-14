// One control per question type (lesson-questions "One component per question type"; ID 9.5).
// Controls are controlled: the question card holds the draft and builds the response.
import { useId } from 'react'
import { CONVENTIONS } from '../../../engine/conventions'
import type { FormatKey } from '../../../engine/shape'
import type { Key, Tree } from '../../../engine/tree'
import type { Option, ShowItem } from '../../../live/types'
import { lessonCopy } from '../../../content/lesson'
import { PseudocodePanel } from '../../replay/PseudocodePanel'
import { pseudocode } from '../../../content/pseudocode'
import { TreeEditor, type TreeEditorProps } from '../../editor/TreeEditor'
import { TreeView } from '../../tree/TreeView'

const copy = lessonCopy.questions
const labels = CONVENTIONS.labels as unknown as { found: string; notFound: string; none: string; confidence: { sure: string; unsure: string } }

/** A radio group of options (mcq, case-id, predict). */
export function ChoiceControl({ options, value, onChange, legend = copy.answerLegend, disabled }: { options: readonly Pick<Option, 'id' | 'text'>[]; value: string | null; onChange: (id: string) => void; legend?: string; disabled: boolean }) {
  const name = useId()
  return (
    <fieldset className="q-choices" disabled={disabled}>
      <legend>{legend}</legend>
      {options.map((o) => (
        <label key={o.id} className="q-choice">
          <input type="radio" name={name} value={o.id} checked={value === o.id} onChange={() => onChange(o.id)} />
          <span>{o.text}</span>
        </label>
      ))}
    </fieldset>
  )
}

/** Sure or Not sure (ID 9.2), with the words from conventions.labels.confidence. */
export function ConfidenceControl({ value, onChange, disabled }: { value: 'sure' | 'unsure' | null; onChange: (v: 'sure' | 'unsure') => void; disabled: boolean }) {
  return (
    <ChoiceControl
      legend={copy.confidenceLegend}
      options={[
        { id: 'sure', text: labels.confidence.sure },
        { id: 'unsure', text: labels.confidence.unsure },
      ]}
      value={value}
      onChange={(v) => onChange(v as 'sure' | 'unsure')}
      disabled={disabled}
    />
  )
}

export interface TreeShown {
  tree: Tree
  formatKey: FormatKey
  label: string
  show?: readonly ShowItem[]
  hideBalance?: boolean
}

/** Several or one node selected on the tree, with None where none is allowed (click-node, askUnbalanced). */
export function NodePicker({
  shown,
  selected,
  none,
  mode,
  onChange,
  disabled,
  legend = copy.nodesLabel,
}: {
  shown: TreeShown
  selected: readonly Key[]
  none: boolean
  mode: 'one' | 'one-or-none' | 'many-or-none'
  onChange: (selected: Key[], none: boolean) => void
  disabled: boolean
  legend?: string
}) {
  const pick = (k: Key) => {
    if (disabled) return
    if (mode === 'many-or-none') onChange(selected.includes(k) ? selected.filter((x) => x !== k) : [...selected, k], false)
    else onChange([k], false)
  }
  const words = selected.map(shown.formatKey).join(', ')
  return (
    <div className="q-picker" role="group" aria-label={legend}>
      <TreeView
        tree={shown.tree}
        formatKey={shown.formatKey}
        show={shown.show}
        hideBalance={shown.hideBalance ? {} : undefined}
        label={shown.label}
        interactive
        selectedKey={mode === 'many-or-none' ? null : (selected[0] ?? null)}
        selectedKeys={mode === 'many-or-none' ? selected : undefined}
        onSelect={pick}
      />
      <p className="q-status" aria-live="polite">
        {none ? `${labels.none}.` : copy.selected(words)}
      </p>
      <div className="q-row">
        {mode !== 'one' && (
          <button type="button" className="module-button module-button-secondary" aria-pressed={none} disabled={disabled} onClick={() => onChange([], !none)}>
            {labels.none}
          </button>
        )}
        <button type="button" className="module-button module-button-quiet" disabled={disabled || (selected.length === 0 && !none)} onClick={() => onChange([], false)}>
          {copy.clearSelection}
        </button>
      </div>
    </div>
  )
}

/** One labelled number field per target (enter-values). Text, so −4 and -4 both read (parseValue). */
export function ValuesControl({ fields, values, onChange, disabled }: { fields: { label: string }[]; values: string[]; onChange: (values: string[]) => void; disabled: boolean }) {
  const id = useId()
  return (
    <fieldset className="q-values" disabled={disabled}>
      <legend>{copy.answerLegend}</legend>
      {fields.map((f, i) => (
        <div key={i} className="q-value">
          <label htmlFor={`${id}-${i}`}>{f.label}</label>
          <input
            id={`${id}-${i}`}
            className="practice-input"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            value={values[i] ?? ''}
            onChange={(e) => onChange(values.map((v, j) => (j === i ? e.target.value : v)))}
          />
        </div>
      ))}
    </fieldset>
  )
}

/** Yes or No (askIsAvl). */
export function YesNoControl({ value, onChange, disabled }: { value: boolean | null; onChange: (v: boolean) => void; disabled: boolean }) {
  return (
    <ChoiceControl
      legend={copy.isAvlLegend}
      options={[
        { id: 'yes', text: copy.yes },
        { id: 'no', text: copy.no },
      ]}
      value={value === null ? null : value ? 'yes' : 'no'}
      onChange={(v) => onChange(v === 'yes')}
      disabled={disabled}
    />
  )
}

/** Nodes in the order visited, then Found or Not found (trace). Practice screens light the pseudocode. */
export function TracePicker({
  shown,
  path,
  found,
  onChange,
  disabled,
  listing,
  searchKey,
}: {
  shown: TreeShown
  path: readonly Key[]
  found: boolean | null
  onChange: (path: Key[], found: boolean | null) => void
  disabled: boolean
  listing?: 'search-loop' | 'search-recursive'
  searchKey: Key
}) {
  const lines = CONVENTIONS.pseudocode.lineForStep[listing ?? 'search-loop']
  const last = path.at(-1)
  const prev = path.at(-2)
  const line = last === undefined ? null : prev === undefined ? lines.compareEqual : last < prev ? lines.goLeft : lines.goRight
  return (
    <div className="q-picker" role="group" aria-label={copy.nodesLabel}>
      <TreeView tree={shown.tree} formatKey={shown.formatKey} show={shown.show} label={shown.label} interactive selectedKey={last ?? null} onSelect={(k) => !disabled && onChange([...path, k], k === searchKey ? true : found)} />
      <p className="q-status" aria-live="polite">
        {copy.visited(path.map(shown.formatKey).join(', '))} {listing !== undefined && copy.comparisons(path.length)}
      </p>
      <div className="q-row">
        <button type="button" className="module-button module-button-quiet" disabled={disabled || path.length === 0} onClick={() => onChange(path.slice(0, -1), null)}>
          {copy.removeLast}
        </button>
        <button type="button" className="module-button module-button-secondary" aria-pressed={found === true} disabled={disabled} onClick={() => onChange([...path], true)}>
          {labels.found}
        </button>
        <button type="button" className="module-button module-button-secondary" aria-pressed={found === false} disabled={disabled} onClick={() => onChange([...path], false)}>
          {labels.notFound}
        </button>
      </div>
      {listing !== undefined && (
        <PseudocodePanel name={lessonCopy.pseudocode[listing]} listing={listing === 'search-loop' ? pseudocode.searchLoop : pseudocode.searchRecursive} line={line} />
      )}
    </div>
  )
}

/** Build-tree and perform-rotation questions are answered in the tree editor (revamp-tree-editor, D132). */
export function TreeBuilder(props: TreeEditorProps) {
  return <TreeEditor {...props} />
}
