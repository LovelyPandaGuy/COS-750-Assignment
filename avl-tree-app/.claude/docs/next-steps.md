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
| 15b | `add-insert-replay` | Built 13 Nov (D65 to D68): a module step can play an AVL insert, with predict-first and the Watch or Do it yourself switch, from the existing replay components. No student-visible change until C6 uses it. |
| 15c | `add-module-c6-insertion` | Built 13 Nov as `add-module-c6-insertion-and-rebalancing` (D69 to D74): C6 outline, worked examples that fade (done for you, guided by node, guided by case) and a seeded name-the-case-then-rotate practice (LO7). Case names from the conventions module (D19). |
| 16 | `add-sandbox` | No changes from the consolidation. |
| 17 | `add-module-c8-choosing` | Wording per D19 and D27. |
| 18 | `add-module-c7-delete` | Wording per D19; check optional (D4). |

## Later phases touched by the consolidation

- 19 `add-question-model-and-bank`: attempt policy differs for practice and checks; record hints used (D21).
- 20 `add-checks-and-feedback`: built 13 Nov (D75 to D79). Checks are shown, marked and stored; modules complete through them; the route follows the result. Four-part feedback, "Not quite yet", no cross glyph (D27). The retry cap and ladder are change 21.
- 21 `add-scaffold-ladder-and-retry-cap`: built 13 Nov (D80 to D83). Ladder, cap of 3, lecture questions, mastery status. Practice-step review and fading (FR-SCA-04, FR-SCA-05) are not done; `RETRY_CAP` and `PRACTICE_HINTS` stay in one config (D9, D21).
- 22 `add-diagnostic-c1-and-routing`: built 13 Nov (D84 to D86). Warm-up, result, routing, re-check and refresher. Route events go to the no-op sink (D28). The accessibility settings beside the conventions card wait for change 24.
- 23 `add-readiness-c9`: built 13 Nov (D87 to D89). The C9 check with a return step, and the readiness summary with the lecture list, own question and print, save or copy. No skeleton screens are left.
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
