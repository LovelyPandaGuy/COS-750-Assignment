# Design

## Context

See proposal.md for why. Current state that shapes the approach:

- `src/routes.ts` holds paths and `ACTIVITIES_BY_MODULE`; `MODULE_IDS` (guided order) is in `src/state/learnerState.ts`. Learner state has `completedModules` and `currentModule`, read through `useLearner()`.
- `src/pages/Module.tsx` renders the heading, `ActivityList` and "Back to path". Its wording is in `src/content/screens.ts` and `src/content/modules.ts`.
- The framework core (decisions 1 to 5) is on `main` and plays C2, C3, C5 and C8 (registry). On the last step of the last activity, Next navigates to `paths.hub()`. The control strip has one primary button (Next).
- `add-modules-c2-c3` and `add-modules-c5-c6` build on this change and are merged but not archived; this change archives first.
- There is no event log yet (change 26) and nothing emits events.

## Goals / Non-Goals

**Goals:**
- A data model for modules that later modules (C4 to C9) extend without reshaping.
- One pure function decides entry and one decides the recommendation, so locking and result-based routing are each a one-function change.
- The panel and note are additions; no existing control moves.

**Non-Goals:**
- A general content-authoring language. Steps are TypeScript records with text functions.
- A general event bus. The sink takes route events only; change 26 widens it.

## Decisions

Decisions 1 to 5 are the framework core, moved from `add-modules-c2-c3` and already built. Decisions 6 to 10 are new.

### 1. Module content is typed data with text functions

```
ModuleContent = { id: ModuleId, steps: Step[], allowances?: ... }
Step = {
  id, event: GagneEvent, heading: string,
  primary: 'diagram' | 'text',          // D22; 'pseudocode' and 'animation' reserved
  figures?: FigureSpec[]                 // 0 to 2 trees, drawn side by side
  bounds?: number[]                      // sizes for best/worst search bounds
  text: (f: StepFacts) => string[]       // paragraphs
  rule?: (w: ConventionsWording, f: StepFacts) => string   // supporting, on demand
  claims?: Claim[]                       // checked by the validator
  allow?: { value: number, reason: string }[]
  practice?: 'fill-in-bf' | 'spot-the-problem'
}
FigureSpec = { id, source: { kind: 'bst' | 'avl', keys } | { kind: 'generated', generator, seed }, searchKey?, label }
```

The activity is not stored on the step: it is derived from the event through one table, `EVENT_ACTIVITY` (proposal item 2), so content cannot put a step in the wrong place and the validator checks order only.

*Alternative:* Markdown files with placeholders. Rejected: typed functions give the compiler a check on every fact name and need no parser.

### 2. Facts are computed once per step, outside content

`computeFacts(step, seed)` in `src/modules/facts.ts` builds each figure's tree with `insert` or `avlInsert` (or a generator), then returns per figure: `tree, keys, height, nodeCount, rootKey, searchSteps?, isAvl, isPerfect, violations`, and per bound size: `best = floor(log2 n) + 1`, `worst = n`. Content receives `StepFacts` and only formats. `isPerfect` (every leaf at the same depth and every internal node with two children) and `searchBounds` live in `src/modules/facts.ts` because `avl-engine` is in flight; they move into the engine when convenient.

### 3. The validator is a pure function plus one test that runs it on all module content

`validateModule(content) -> Problem[]` in `src/modules/validate.ts`, with problem kinds `order`, `activity`, `claim`, `number`, `wording`. A Vitest test runs it over every registered module and expects an empty list (this is `npm run validate:content` in effect). Numbers: render `text` and `rule` with the computed facts, drop `log2`, match `-?\d[\d,]*(\.\d+)?` and `−\d` (the minus sign used in display), normalise, and accept facts, keys, search keys, conventions values (`LEAF_HEIGHT`, `EMPTY_HEIGHT`, the range) and the step's `allow` list. Wording: the D19 patterns from the spec, case-insensitive, on rendered text excluding the conventions wording itself (the `rule` output of a step that returns exactly the wording is exempt by identity).

*Alternative:* lint rule on source files. Rejected: numbers only exist after rendering with facts.

### 4. Step player owns position, not routes

`ModulePlayer({ module, activity })` in `src/ui/module/` filters the module's steps by activity and keeps `index` in state; `Activity.tsx` renders it when `MODULE_CONTENT[module]` exists, with `key={module + activity}` so state resets between activities. Next on the last step navigates with `paths.activity(module, nextActivity)` or `paths.hub()`; Back on the first step navigates to `paths.module(module)`. Practice answers are kept in a per-activity map in the player, so Back and Next within the activity keep them (FR-LRN-04). Focus goes to the step `h2` after each index change (not on first mount, so the routing focus rule for `h1` still holds).

*Alternative:* a step segment in the URL. Rejected for now (proposal item 3): the routes belong to the in-flight routing change.

### 5. Control strip and aids

One `ControlStrip` component: left group Back, Next and, on content or example steps, "I know this, skip"; right group "Show the rule" (`aria-expanded`, when the step has `rule`) and, on practice steps, "Hint (n)". Practice state (hints used, answers) sits in the player so the strip can show the count. `PRACTICE_HINTS` is in `src/modules/config.ts`.

### 6. Policy module, pure and state-free

`src/navigation/policy.ts`:

```
PREREQUISITE: Record<ModuleId, ModuleId | null>   // C1 null, C8 -> C6
entryPolicy(module, learner) -> { enter: true, prerequisite: ModuleId | null }
recommendRoute(module) -> ModuleId | null          // next in MODULE_IDS; null after C9
```

`enter` is typed `true` for now, so a later lock widens the type and the compiler finds every caller. `recommendRoute` takes only the module; change 20 adds the check result as a second parameter.

*Alternative:* derive the prerequisite on the fly from `MODULE_IDS` and an optional set. Rejected: a table is the one place a lecturer's answer changes, and the test reads it directly.

### 7. Route events through a swappable sink

`src/navigation/routeEvents.ts`:

```
type RouteTarget = ModuleId | 'path'
type RouteEvent =
  | { type: 'route_recommended', from: ModuleId, recommended: RouteTarget, at: string }
  | { type: 'route_chosen', from: ModuleId, recommended: RouteTarget, chosen: RouteTarget, at: string }
emitRouteEvent(e); setRouteEventSink(sink) -> restore()
```

The default sink is a no-op. Tests install a recording sink and restore it after. Change 26 installs the event-log sink at boot.

*Alternative:* React context for the sink. Rejected: a module-level sink is simpler to replace from boot and from tests, and there is one sink per app.

### 8. Note component on the module screen

`PrerequisiteNote({ module })` in `src/components/` reads `useLearner()`, calls `entryPolicy`, and renders nothing or a `<p>` with a link (`screen-link`). Plain paragraph with an "i" symbol and text, no landmark (avoids axe landmark nesting), styled with `--bg-surface`, a border and `--text-primary` from tokens; not a warning colour.

### 9. Panel rendered by the player

`RouteChoice({ module, onChoose })` in `src/ui/module/` shows the heading and two `module-button-secondary` buttons; the suggested one starts with the word "Suggested". It emits `route_recommended` in an effect guarded by a ref so it fires once per mount. The player renders it when `activity === 'check'` and the step is the last, and wraps its Next on that step to emit `route_chosen` with `chosen: 'path'` before navigating. When `recommendRoute` returns null, no panel is shown.

### 10. Wording

`src/content/navigation.ts` (content-author): `prerequisiteNote(label)`, `prerequisiteLink(label)`, `whereNext`, `suggested(label)`, `lookAgain(label)`. All flagged as beyond the ID.

## Risks / Trade-offs

- [Later changes reshape the schema] → The schema is small and keyed by Gagné event; the path-mode toggle and reordering add fields (reorderable flag) rather than replacing these.
- [Number validator false positives, e.g. "C3", "LO1", "1,000,000"] → Strip module and objective IDs before matching; normalise thousands separators; allowances need a reason, so each exception is visible in review.
- [Text functions could still compute a number in content, e.g. `f.height + 1`] → The validator only sees rendered output, so `height + 1` passes if it equals a fact. Search step counts and bounds are facts, so content has no reason to add; the reviewer checks text functions do no arithmetic.
- [Note shows on almost every module until checks complete modules] → Calm wording, never blocks; resolves itself when change 20 marks completion.
- [StrictMode double-mount emits `route_recommended` twice in development] → Ref guard covers re-render; double mount is dev-only and the sink is a no-op until change 26, which can de-duplicate.
- [Player change breaks the module tests] → Only a render slot and a wrapped Next on one step; every existing module-player, C3, C5 and C8 test must stay green.

## Migration Plan

No data migration. Roll back by reverting the change.
