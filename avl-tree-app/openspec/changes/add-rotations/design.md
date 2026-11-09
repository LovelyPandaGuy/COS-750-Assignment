# Design

## Context

`src/engine/` already has immutable `TreeNode`, `makeNode` (derives height), plain `insert`/`remove`/`search`, single `rotateLeft`/`rotateRight` (return the tree unchanged when not possible), `checkAvl` and the conventions module (`balanceFactor`, `REBALANCE_CASES`). Algorithm: SE §6.4. Motivation and scope: proposal.md.

## Goals / Non-Goals

**Goals:**
- AVL insert that is pure, immutable and reuses the existing primitives.
- A rebalance helper that delete (a later change) can reuse unchanged.

**Non-Goals:**
- Trace steps. The result carries just enough (`case`, `node`) for tests and answer marking.
- Delete-specific rules.

## Decisions

- **One recursive insert, rebalance on the way back up.** `avlInsert` recurses to the insertion point; on return each ancestor is rebuilt with `makeNode`, then `rebalance(node)` is applied. The first rebalance fixes the subtree to its pre-insert height, so ancestors see balance factors in range and the "at most one rebalance" property holds by construction. Alternative of recording the path and walking it back rejected: more state, same result, and the recursion gives parent reattachment for free.
- **`rebalance(node)` is a separate exported function**, `(tree) -> { tree, case: RebalanceCase | null }`. It reads the balance factor via the conventions module, picks the taller child, classifies, and applies rotations. Delete will call it per path node later.
- **Classification uses the sign of balance factors, not literals.** z leans left when `balanceFactor` is greater than 1 and right when less than -1; y's lean is the sign of its own balance factor. Case names are looked up from `REBALANCE_CASES` through small helper functions in `conventions.ts` (a `caseFor(zLeansLeft, yLeansLeft)` function), so the mapping lives in the conventions module and nothing else hard-codes names (FR-ENG-10, and the existing source scan).
- **Double rotation as two calls** to `rotateLeft`/`rotateRight` (child, then node), matching SE §6.4 and making a later trace step per rotation straightforward.
- **Result shape (open question 2):** `{ tree, inserted, rebalance: { case, node } | null }`. The `node` key is taken before rotating. Because it is additive, `add-operation-trace` can wrap it.
- **Duplicates:** return the same tree reference and `inserted: false`, as plain insert does.
- **Tests:** `tests/engine/avl.test.ts`, names prefixed `FR-ENG-04`, `FR-ENG-07`. Include hand-worked cases (3,2,1 etc.), deeper placements with the unbalanced node as left and right child of a parent, the 10..50,25 example, and a fast-check property using `checkAvl` and the existing helpers.

## Risks / Trade-offs

- [Lecturer changes case names or sign] → mapping is in `conventions.ts`; tests derive case names from `REBALANCE_CASES` except the one default-names scenario.
- [Result shape widens with traces] → keep the type in one place (`avl.ts`) and export it.
- [`conventions.ts` edit touches an already-built module] → additive only; existing tests must stay green.
