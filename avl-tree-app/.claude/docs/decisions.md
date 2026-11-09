# Decision log

Status: **settled** = decided by the user; **default** = the recommended default from the development plan, open to veto until gate G0; **verify** = needs a check before use. Phase 0 closes when every row is settled and the user signs off (gate G0).

| # | Topic | Decision | Status |
| --- | --- | --- | --- |
| D1 | Modules | Adopt the ID structure and order: C1 Getting started and readiness check, C2 When BSTs go lopsided, C3 The AVL property, C4 Search, C5 Rotations, C6 Insertion with rebalancing, C7 Deletion, C8 Choosing a structure, C9 Am I ready. | settled (9 Nov) |
| D2 | Height convention | ID convention: leaf 0, empty tree -1, balance factor = height(left) - height(right). One conventions module. Wireframes are updated to match. Lecturer to confirm; confirm balance-factor sign and case names too. | settled (9 Nov); lecturer to confirm |
| D3 | Session and device | About one hour in nine resumable chunks. Phones get the full experience, including tree editing, with 44 px targets and tap-to-select then tap-to-place as an alternative to dragging. | settled (9 Nov) |
| D4 | Scope | Search (C4) and deletion (C7, LO8) are both built in v1.1. LO8 is shown on the readiness summary but never blocks Ready (the ID calls C7 optional). | settled (9 Nov); LO8 gating is a default |
| D5 | Search | New engine function with a trace, step counter, pseudocode panel (loop and recursive) and a "be the algorithm" mode. | default |
| D6 | Diagnostic | Five prerequisite questions in C1. Fewer than 4 of 5 correct routes to the BST refresher, followed by a short re-check, then C2. The student sees a per-skill list, not a score. | default |
| D7 | Where the diagnostic items live | In the assessment layer with the same question model, tags and storage as every other check. | default |
| D8 | Readiness output | Store three states (secure, developing, not yet) for routing and scaffolding. Show Ready or Revise per LO1 to LO9 on the summary. | default |
| D9 | Retries | Generated items give a new seeded variant on retry; multiple choice reshuffles; cap of 3 per question, then a lecture question is recorded and the student continues. | default |
| D10 | Gagné events | Hook, goals, recall and summary are fixed. Only content, worked example and practice may be reordered. | default |
| D11 | Sandbox | Always reachable from the progress map; suggested after C2. Insert and delete, rebalancing on or off. | default |
| D12 | Pseudocode | Generic pseudocode as in the ID. Ask the lecturer whether Java or Python is preferred. | default |
| D13 | Step-count claim | The ID says "at most 28 steps" for a million keys. Height of an AVL tree with n keys is at most about 1.44 log2 n, which is about 28.7, so height is at most 28 and a search can visit up to 29 nodes. Compute the figure in code and state it carefully. | verify |
| D14 | C9 mechanics | Missed outcomes return once. The student must write one question for the lecture. The summary can be printed, saved or copied. | default |
| D15 | Checks per module | The ID lists checks only for C2, C3 and C6. Add short checks (2 or 3 items) to C4, C5 and C8 so scaffolding can help before C9. | default |
| D16 | Storage | localStorage behind a StorageAdapter for progress and settings. SQLite (sqlite-wasm, in the browser, no server) for the event log only, exportable as a .sqlite file. JSON export is the fallback if the browser cannot run it. Spike S3 confirms browser support. | settled (9 Nov) |

## Open questions for the lecturer

1. Does the course count height in edges (leaf 0, empty -1) and define balance factor as height(left) - height(right)? Which case names does it use?
2. Is generic pseudocode acceptable, or should the app use Java or Python?
3. Which AVL deletion cases does the lecture cover?
4. Does the lecture state the bound of about 1.44 log2 n, and how does it count search steps for a million keys?
