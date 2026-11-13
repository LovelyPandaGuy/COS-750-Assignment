# Next steps (Phase 3: learning content)

Phases 1 and 2 are built. Three changes are still open and should be finished and archived first: `add-avl-insert-trace` (8/9 tasks), `add-predict-and-do-it-yourself` (8/9) and `add-routing-and-screen-skeleton` (6/8). Plan: `.claude/docs/design/development_plan_(v1.1).md`.

Work with unknowns per D18: assume, record the assumption in `decisions.md`, keep it in one place, and keep going.

## Phase 3 changes, in order

| # | Change | Carry in from the 12 Nov consolidation |
| --- | --- | --- |
| 12 | `add-module-framework` | Step schema typed by Gagné event (D10) with `skippable` (content and worked example only), `primary` and `supporting` representations (D22). One entry-policy function: guided default, never locked, soft prerequisite note (D20). Recommend-and-choose after a check. Control strip layout (D23). No-op event sink emitting `route_recommended` and `route_chosen` (D28). Content validator also rejects sign, lean and case-name wording in content (D19). |
| 13 | `add-modules-c2-c3` | Needs 12. All formula, sign and case wording from the conventions module (D19). C2's "height 2" and step counts come from the engine. |
| 14 | `add-module-c4-search` | Step count and the million-key figure computed by the engine (D13). |
| 15 | `add-modules-c5-c6` | Split three ways (D49). This change: C5 and rotate-it-yourself practice. Case and rotation names from the conventions module (D19). Practice hints and retries per D21. Archived 13 Nov. |
| 15b | `add-insert-replay` | The step player for insert traces, so C6 can show an insert step by step (FR-VIS-03, FR-VIS-04). |
| 15c | `add-module-c6-insertion` | Needs 15b. C6 outline, worked examples that fade from done for you to on your own, seeded keys (LO7). Case names from the conventions module (D19). |
| 16 | `add-sandbox` | No changes from the consolidation. |
| 17 | `add-module-c8-choosing` | Wording per D19 and D27. |
| 18 | `add-module-c7-delete` | Wording per D19; check optional (D4). |

## Later phases touched by the consolidation

- 19 `add-question-model-and-bank`: attempt policy differs for practice and checks; record hints used (D21).
- 20 `add-checks-and-feedback`: four-part feedback, "Not quite yet", no cross glyph (D27).
- 21 `add-scaffold-ladder-and-retry-cap`: `RETRY_CAP` and `PRACTICE_HINTS` in one config; review offered when practice hints run out (D9, D21).
- 22 `add-diagnostic-c1-and-routing`: emit route events (D28).
- 24 `add-accessibility-settings-and-audit`: read-aloud is stretch (D26); add the colour-vision emulation check (D25).
- 26 `add-event-log-and-export`: persist route events (D28).

## Waiting on others

- Lecturer: balance-factor sign, case and rotation names, pseudocode language, deletion cases, the height bound (`decisions.md`).
- Presentation draft's author: the slide evidence for the sign (`decisions.md`).
- Team: read-aloud as stretch, routing cut-offs, badges.

## Not yet done

- Wireframes and the Claude Design artifact to D2, C1 to C9 and the fixes listed in `design/INDEX.md` (items 1 to 14).
- `.claude/agents/`: the six subagents named in `CLAUDE.md` are not defined in this repo.
- Regenerate the SE document from the specs; `npm run validate:content`.
