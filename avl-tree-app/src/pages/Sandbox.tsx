import { useReducer, useState } from 'react'
import { Link } from 'react-router-dom'
import '../ui/screens.css'
import '../ui/lesson/module.css'
import '../ui/sandbox/sandbox.css'
import { controlsCopy } from '../content/controls'
import { sandboxCopy as copy } from '../content/sandbox'
import { screenCopy } from '../content/screens'
import { createRng } from '../engine/random'
import { paths } from '../routes'
import { initialSandbox, sandboxReducer, sandboxStats } from '../sandbox/sandbox'
import { KeyboardHelp } from '../ui/controls/KeyboardHelp'
import { shortcutsFor } from '../ui/controls/shortcuts'
import { EventLog } from '../ui/sandbox/EventLog'
import { InsertControl } from '../ui/sandbox/InsertControl'
import { RebalanceSwitch } from '../ui/sandbox/RebalanceSwitch'
import { SandboxSection } from '../ui/sandbox/SandboxSection'
import { TreeStats } from '../ui/sandbox/TreeStats'
import { ReplayPlayer } from '../ui/replay/ReplayPlayer'
import { TreeView } from '../ui/tree/TreeView'

const HELP_KEYS = shortcutsFor('sandbox').map((s) => ({ keys: s.caps, action: s.action }))

/**
 * Screen 6, the sandbox (wireframe 1n, FR-VIS-08): insert and delete keys with rebalancing on or
 * off. State lives here only; nothing is saved (proposal item 7). Two columns from the tablet breakpoint, controls on
 * the left; tree first in the DOM and on a phone, with "What happened" right under the tree so each
 * result sits beside the change it describes (revamp-sandbox-layout, D140, D141).
 */
export function Sandbox() {
  const [state, dispatch] = useReducer(sandboxReducer, undefined, initialSandbox)
  const [value, setValue] = useState('')
  const [replayOpen, setReplayOpen] = useState(false)
  // Seeded once per visit; the reducer gets plain values, so it stays pure.
  const [rng] = useState(() => createRng(Date.now() >>> 0))
  const stats = sandboxStats(state.tree)
  const full = stats.nodes >= stats.max
  const selected = value.trim() === '' ? null : Number(value)

  const act = (action: Parameters<typeof dispatch>[0]) => {
    setReplayOpen(false)
    dispatch(action)
  }

  return (
    <div className="screen-stack sandbox">
      <h1 tabIndex={-1}>{screenCopy.headings.sandbox}</h1>
      <p>{copy.intro}</p>
      <div className="sandbox-layout">
        <div className="sandbox-tree-col">
          {state.tree === null ? (
            <p>{copy.emptyTree}</p>
          ) : (
            <TreeView
              tree={state.tree}
              interactive
              selectedKey={selected !== null && Number.isInteger(selected) ? selected : null}
              onSelect={(key) => setValue(String(key))}
              label={copy.treeLabel(state.rebalancing)}
            />
          )}
          <SandboxSection heading={copy.sections.log}>
            <EventLog entries={state.log} />
          </SandboxSection>
          {state.lastInsert === null ? (
            state.rebalancing ? null : <p>{copy.replayUnavailable}</p>
          ) : (
            <div className="sandbox-replay">
              <button
                type="button"
                className="module-button module-button-secondary"
                aria-expanded={replayOpen}
                onClick={() => setReplayOpen((o) => !o)}
              >
                {copy.replay}
              </button>
              {replayOpen && (
                <ReplayPlayer
                  key={`${state.lastInsert.key}-${state.log.length}`}
                  operation={{ kind: 'insert', tree: state.lastInsert.before, key: state.lastInsert.key }}
                  label={copy.replayLabel(state.lastInsert.key)}
                />
              )}
            </div>
          )}
        </div>
        <div className="sandbox-control-col">
          <SandboxSection heading={copy.sections.change}>
            <InsertControl
              value={value}
              onValue={setValue}
              full={full}
              notice={state.notice}
              onInsert={(key) => act({ type: 'insert', key })}
              onDelete={(key) => act({ type: 'delete', key })}
              onSorted={() => act({ type: 'sorted' })}
              onRandom={() => act({ type: 'random', value: rng.next() })}
              onClear={() => act({ type: 'clear' })}
            />
          </SandboxSection>
          <SandboxSection heading={copy.sections.rebalancing}>
            <RebalanceSwitch on={state.rebalancing} onToggle={() => act({ type: 'toggle' })} />
          </SandboxSection>
          <SandboxSection heading={copy.sections.numbers}>
            <TreeStats stats={stats} />
          </SandboxSection>
          <KeyboardHelp heading={controlsCopy.help.heading} keys={HELP_KEYS} />
        </div>
      </div>
      <Link className="screen-link" to={paths.hub()}>
        {screenCopy.links.backToPathSandbox}
      </Link>
    </div>
  )
}
