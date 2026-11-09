# Design

## Context

Engine today (`src/engine/`): immutable `TreeNode`, plain BST ops, single rotations, `avlInsert` with `{ tree, inserted, rebalance }`, `checkAvl` (balance only, lowest offender), conventions module with `caseFor`. SE §6.2 lists `generate.ts` ("seeded random trees and insert sequences"); FR-ASM-07 and D9 need seeded variants. Motivation and scope: proposal.md.

## Goals / Non-Goals

**Goals:**
- A report that says what is wrong with a tree, for feedback and for marking.
- Generators that are pure functions of `(seed, options)`.

**Non-Goals:**
- Retry caps, shuffling, storage of seeds, question content.
- Changing `checkAvl`'s result or behaviour.

## Decisions

- **Separate `analyseTree` function, `checkAvl` untouched.** Callers that only want the verdict keep the simple type; analysis returns `{ isBst, isAvl, orderViolations, balanceViolations, heightMismatches }`. `checkAvl` is not rebuilt on top of it, to keep the existing tests and the lowest-offender behaviour exactly as they are; a scenario ties the two together (first balance violation equals the `checkAvl` node).
- **One post-order walk** computes real heights and records balance and height findings; BST order is checked in the same walk by passing exclusive lower and upper bounds down from ancestors. Findings are listed in post-order, left before right, so the lowest offender comes first. Duplicates fail the exclusive bounds, so they are order violations.
- **Violation kind lives in `conventions.ts`:** a `leanOf(balanceFactor)` function returning `'left-heavy'` or `'right-heavy'` from the sign. Nothing else compares balance factors to zero for labelling, so the existing FR-ENG-10 scan stays clean.
- **PRNG: mulberry32**, 32-bit state, no dependency, tiny and well known. `createRng(seed)` returns `{ next(), int(min, max) }`; seeds are normalised to unsigned 32-bit integers. A test pins the first outputs for seed 12345 because seeds will be stored and replayed (open question 4). Alternative: `Math.random` with no seed rejected (not repeatable); a library such as seedrandom rejected (new dependency for 10 lines).
- **Insert sequences:** draw distinct keys by a seeded partial Fisher-Yates shuffle over the range (for small ranges) so that distinctness and uniformity are by construction. Reject when `count` exceeds the range size. Defaults: count 7, range 1 to 99.
- **Trees:** `generateTree(seed, { balanced })` builds from the sequence with `avlInsert` or plain `insert` and returns `{ keys, tree }`.
- **Case-targeted sequences:** build a base tree from `count - 1` seeded keys with AVL insert, list candidate keys in range not in the tree whose `avlInsert` reports the target case, pick one with the seeded source and append it. If there are no candidates, derive the next sub-seed and try again, up to a fixed attempt limit (100), then reject. Deterministic and self-checking, because the engine itself decides the case. Alternative of constructing trees by pattern rejected: more code and easy to get the deeper-placement cases wrong. Requests with `count` below 3 are rejected up front.
- **Retry seeds:** `variantSeed(base, attempt)` mixes both integers with an avalanche hash (multiply-xorshift) to unsigned 32 bits; attempt 0 is not special-cased, so all attempts go through the same path.
- **Files:** `random.ts`, `generate.ts`, `analyse.ts`; all exported from `index.ts`. Tests: `tests/engine/analyse.test.ts`, `random.test.ts`, `generate.test.ts`.

## Risks / Trade-offs

- [Case-targeting may fail for narrow ranges or short sequences] → bounded retries then a clear rejection; scenarios pin the default options for seeds 1 to 50.
- [Distinct-sequence scenario for retries is statistical] → deterministic for fixed seeds, so it either passes or not at test time; if it fails, the hash is changed, not the test.
- [PRNG change breaks stored seeds] → pinned-output test.
- [Overlap with `add-rotations`] → see open question 1; this change reads `avlInsert` but does not edit it.
