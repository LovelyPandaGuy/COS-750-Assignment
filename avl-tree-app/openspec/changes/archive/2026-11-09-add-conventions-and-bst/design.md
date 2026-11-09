# Design

## Context

Greenfield engine: `src/` holds only the Vite starter (`App.tsx`, `main.tsx`). `package.json` has no test runner, fast-check or `typecheck` script. Sources: SE §6.3 (types), §6.4 (algorithms), §7.2 (engine tests to write first), D2. Motivation: see proposal.md.

## Goals / Non-Goals

**Goals:**
- A pure TypeScript engine with no React or DOM imports (NFR-07).
- Conventions in one module; swapping them needs no other edit (FR-ENG-10).

**Non-Goals:**
- Rebalancing, trace steps, step counting, pseudocode line numbers. The types leave room: `TraceStep` and `OperationResult.trace` arrive in `add-operation-trace`.

## Decisions

- **Files:** `src/engine/conventions.ts`, `tree.ts` (type, height, balance factor, in-order helper), `bst.ts` (insert, search, delete), `rotations.ts`, `validity.ts`, `index.ts` barrel. Tests in `tests/engine/`. Alternative of a single file rejected: later changes extend each area separately.
- **Conventions as named exports** (`LEAF_HEIGHT`, `EMPTY_HEIGHT`, `balanceFactor(leftH, rightH)`, `REBALANCE_CASES`). Leaf height is derived as `EMPTY_HEIGHT + 1`; node height is `max(children) + 1`. Tests for "change the constant" use `vi.mock` / module override, so the module must read its constants at call time through exported functions, not copy them into other modules.
- **Immutable nodes** with `Object.freeze` in development builds only if cheap; the main guarantee is by construction (every operation builds new nodes, shares untouched subtrees). Matches SE §6.4 snapshots.
- **Node shape** per SE §6.3: `{ key, height, left, right }`, stored height maintained by a single `makeNode(key, left, right)` helper, so height is never set elsewhere.
- **Result shape (open question 2):** `insert` returns `{ tree, inserted }`, `delete` returns `{ tree, deleted }`, `search` returns a boolean-like `{ found }`. Widening with `trace` later is additive.
- **Delete, two children:** replace with in-order successor key, then delete the successor from the right subtree (SE §6.4). Predecessor rejected: the SE specifies the successor.
- **Validity check** computes heights recursively from the actual shape and ignores stored heights, so it can mark hand-built or student-built trees. It also does not check BST ordering (FR-ENG-05 is about balance). Returns `{ valid: true } | { valid: false, node: Key }`.
- **Test tooling:** add `vitest` and `fast-check`; `npm test` runs `vitest run`; add `typecheck` (`tsc -b --noEmit`). ESLint `no-restricted-imports` blocks `react`, `react-dom` and DOM-only modules under `src/engine/`.
- **Naming:** each test named after its FR (e.g. `FR-ENG-01: delete node with two children`).

## Risks / Trade-offs

- [Rotation scope unsettled] → rotations are a small separate file; moving it to `add-avl-rebalancing` is a deletion of one task and one spec requirement.
- [Return shape later widens] → keep result types in one file so `add-operation-trace` edits one place.
- [Lecturer changes sign or heights] → conventions module is the only edit; tests derive expectations from it, not literals, except the default-value scenario.
- [Library versions] → latest Vitest and fast-check at install; Vite is v8 in `package.json`, so check Vitest compatibility when installing.
