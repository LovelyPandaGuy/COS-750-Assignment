# Proposal

## Open questions

Resolve or accept these at the human skim. Items marked [OPEN] block only the piece of work they name.

1. **[OPEN] Rotation primitives (FR-ENG-02) — this change or `add-avl-rebalancing`? (D1 scope, `docs/next-steps.md`).** `next-steps.md` lists FR-ENG-01..03, 05 here (which includes FR-ENG-02) but describes the next change as "rotations, LL/RR/LR/RL". Drafted here as *single* `rotateLeft` / `rotateRight` primitives only. Case selection (LL/RR/LR/RL) stays in `add-avl-rebalancing`. Confirm, or move the rotation requirement out.
2. **[OPEN] Return shape before traces exist (FR-ENG-06, spike S2).** SE §6.3 gives `OperationResult { tree, trace, inserted? }`, but the trace contract is the third change. Drafted here as `{ tree, inserted }` / `{ tree, deleted }` with no `trace`, widened by `add-operation-trace`. Confirm.
3. **[OPEN] "First node that breaks the rule" (FR-ENG-05).** When several nodes are unbalanced, "first" is not defined. Recommended: the *lowest* offender found by a post-order walk, left before right, so the reported node is the root cause rather than a symptom. The single-violation scenarios are unambiguous; the multi-violation tie-break scenario is marked [OPEN] in the spec.
4. **D2 (lecturer to confirm).** Convention and balance-factor sign are settled; the lecturer confirmation and the case names are not. The conventions module holds them so a change is a one-line edit (FR-ENG-10). The case names LL/RR/LR/RL come from SE §6.3 and are held but unused here.
5. **Assumptions, not blocking (recorded in the specs):** deleting a missing key returns the tree unchanged with `deleted: false` (SE 7.2 lists "missing key" but not the outcome); the two-children delete uses the in-order successor (SE §6.4, settled by the SE); duplicate insert is a no-op (SE §6.4).

## Why

Every later capability (AVL insert, delete, traces, tree view, answer marking) rests on one tree type, one set of height and balance conventions, and plain BST operations. D2 says the conventions live in one module and nothing else hard-codes them; building that first means changing the lecturer's convention later is a one-line edit.

## What Changes

- Add `src/engine/conventions.ts`: leaf height, empty-tree height, balance-factor definition, case names.
- Add the immutable `TreeNode` type and pure functions: BST insert, search, delete (leaf, one child, two children).
- Add height and balance-factor computation read from the conventions module.
- Add left and right rotation primitives that preserve in-order order.
- Add the AVL validity check that reports the first node breaking the rule.
- Add the test toolchain the project lacks (Vitest, fast-check, `npm test`) and an engine-must-not-import-UI lint rule (NFR-07).

No UI. No rebalancing, no traces, no search trace (FR-ENG-09).

## Capabilities

### New Capabilities
- `engine-conventions`: the single source for height convention, balance-factor definition and case names, plus height and balance-factor computation (FR-ENG-03, FR-ENG-10).
- `bst-engine`: immutable BST insert, search and delete, rotation primitives and the AVL validity check (FR-ENG-01, FR-ENG-02, FR-ENG-05; NFR-07, NFR-08 in part).

### Modified Capabilities
None. `openspec/specs/` is empty.

## Out of scope

AVL insert and delete with rebalancing and case selection (FR-ENG-04, 08, `add-avl-rebalancing`); traces and search with trace, step counts, loop and recursive forms (FR-ENG-06, 07, 09, `add-operation-trace`); the D13 step-count figure; all UI, content and storage. LOs are not served directly; this is engine groundwork for LO1 to LO6.

## Impact

- New: `src/engine/` (`conventions.ts`, tree type, BST, rotations, validity), `tests/engine/`.
- Changed: `package.json` (devDependencies `vitest`, `fast-check`; scripts `test`, `typecheck`), `eslint.config.js` (engine import restriction).
- Not touched: `src/App.tsx` and other UI files.
