# Design

## Context

See proposal.md for why and the assumptions. The engine already has `avlInsertTrace` (steps with `before` and `after` snapshots, the case on imbalance and rotation steps), `rotateLeft`/`rotateRight` on a subtree root, `analyseTree`, `isOutOfBalance`, `caseFor` and `leanOf`. `TreeView` is controlled: `interactive`, `roles`, `selectedKey`, `onSelect`. It owns its own focus (roving tabindex) and has no focus method. `add-avl-insert-trace` is still open on `avl-engine`, so this change adds files and edits none of the engine, tree view or shell files.

## Goals / Non-Goals

**Goals:**
- Every answer, option list and message number comes from the engine; the wording around them comes from `src/content/practice.ts`.
- Pure logic with no React, so property tests can cover it; thin components over it.
- Works by pointer, touch and keyboard with no drag (D3, FR-VIS-10).

**Non-Goals:**
- Step controls, replay, pseudocode, the screen that places these parts, storage, readiness, redo, generated examples.

## Decisions

1. **New folder `src/practice/` for logic, `src/ui/practice/` for components.** Alternative: add to `src/engine/`. Rejected for now: `engine/index.ts`, `avl.ts` and `tree.ts` belong to the open `avl-engine` change. Moving the files into the engine later is a rename.

2. **Prediction model (`predict.ts`).** `predictionFor(tree, key, kind)` returns `{ options, answer, stepIndex, explain }` data, not strings:
   - `kind` is `'node' | 'case' | 'root'`; `choice` and `answer` are a key, a case name or `'none'`.
   - It calls `avlInsertTrace(tree, key)`. z, the case and the step index come from the imbalance step; the new root is `nodes[1]` of the last rotation step (the pivot for a single rotation, the grandchild for a double one). No imbalance step gives `'none'` and no step index (the reveal then points at the last update-height step).
   - Options for `node` and `root`: keys on the compare steps in order (the insertion path), then `'none'`. For `case`: `REBALANCE_CASES` then `'none'`.
   - Balance factors for the reveal are read with `balanceFactorOf` from the imbalance step's `before` snapshot (what the student saw while replaying) or, with no imbalance, from the last step's `after`. Alternative: recompute true heights. Rejected: the reveal must match the drawn numbers.
   - `compare(prediction, result)` returns a tagged result (`match`, `in-range`, `also-unbalanced-higher`, `none-but-unbalanced`, `unbalanced-none-expected`, `case-mismatch`, `root-mismatch`) carrying the numbers; the component turns it into words with templates. A table test covers every tag.

3. **Rotation model (`rotate.ts`).**
   - `startTree(base, key)`: `insert` from `bst.ts` (plain BST, true heights). Rotations needed come from `avlInsertTrace`: 1 or 2 by case, none with no imbalance.
   - `rotateAt(tree, key, dir)` returns `{ ok: true, tree } | { ok: false, reason: 'no-node' | 'no-child', node, side }`. It rebuilds the path from the root with `makeNode`, so ancestors get correct heights (not `replaceAt`, which keeps stale ones). A refusal returns the input tree object.
   - `rotationFeedback(before, key, after)` returns `balanced | flipped | unbalanced` with the key and balance factor, from `analyseTree(after)`. The flipped test compares the bf of the node at the root of the rotated subtree with the rotated node's bf before; it only applies when that earlier bf was out of range.
   - `inOrder(tree)` returns keys; used by the strip and the property tests.

4. **Practice state is a reducer over an immutable history** (`{ start, history: Tree[], tree, selected, feedback }`). Undo pops; reset returns the start tree; a refused rotation changes only the message. Snapshots are immutable, so no undo logic is needed (SE §6, "immutable nodes with snapshots").

5. **Components.** `PredictPrompt` and `PredictionReveal` are separate and stateless where possible: the screen owns when to show each, and `PredictPrompt` takes `key` from the screen so a new replay remounts it with nothing chosen. `ModeSwitch` is a fieldset with two native radios. `DoItYourself` composes `TaskPrompt`, `TreeView` (interactive), `RotationMenu`, `InOrderStrip`, `FeedbackPanel`, Undo and Reset and the key help. Wording and glyphs (↻ ↺ ↶) live in `content/practice.ts`; every glyph is paired with words.

6. **Keyboard scope.** One `onKeyDown` on the practice container (events bubble from the tree and buttons), so R, L, Esc and Ctrl/Cmd+Z only fire while focus is inside it, which satisfies WCAG 2.1.4 (character key shortcuts) without a global handler. Keys with Ctrl, Alt or Meta are ignored, except Ctrl/Cmd+Z.

7. **Focus after actions.** After a rotation the menu unmounts, so focus moves to the feedback panel (`tabIndex={-1}`, a polite live region). After Cancel or Esc, focus returns to the tree's tab stop (found in the DOM inside the practice container, as `TreeView` has no focus method). Assumed; the a11y-checker should confirm.

8. **Initial roles.** Only the inserted key gets the `new` role. Marking z and y would give away the task. No "balanced" role is set; the feedback panel says it in words.

9. **Choosing in the tree for prediction.** The prompt renders its own interactive `TreeView` selection through props, so selecting a node sets the choice; a node outside the option list shows as "Your pick: Node n" and is submitted as the choice. Only meaningful for the `node` and `root` kinds; for `case` the tree is read-only.

## Risks / Trade-offs

- **Prediction not stored** (proposal, question 1): FR-VIS-05's "stored" is met only after the storage change; the callback payload is the contract it will consume.
- **Wording is new content.** Prompt, reveal and feedback strings are not in the ID and are flagged for the user; they sit in one file so changing them touches no logic.
- **Reveal numbers match the drawing, not the "true" heights.** At the imbalance step a node above z can show a balance factor from a stale stored height of its own but fresh child heights. The reveal states what the replay showed; this is why scenario "also out of balance but higher" exists.
- **Any rotation that leaves an AVL tree counts as Balanced**, even if it is not the textbook one at z (for example rotating at 40, not 20, in the five-node example). That is true to the property and avoids marking a valid answer as "not yet", but a lecturer may want the textbook one named. Ask in the review.
- **Tab order.** The menu comes after the tree in the DOM, so a keyboard user presses R or L without tabbing; tabbing from the tree reaches the menu, then the in-order strip, Undo and Reset.
