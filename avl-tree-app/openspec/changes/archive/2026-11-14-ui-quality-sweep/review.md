# Review: ui-quality-sweep

## Archived with open tasks (14 Nov 2026)

The user chose "Sync now, then archive" with 8 of 16 tasks open. The 18 added requirements (ui-foundation State matrix and Quality bar 1 to 10, plus one state-matrix requirement in each of 7 component capabilities) were synced to the main specs.

Open at archive:
- **2.3:** the reviewer and a11y-checker review has not run (no agent files). Its manual passes are not done either: Safari and Firefox, a screen-reader listen, Windows high contrast.
- **4.1:** the triage decisions in `findings.md` are assumed defaults (accept fixable rows, defer `[OPEN]` rows, reject harness errors). The user has not confirmed them, and the deferred rows' checks are not marked `test.fixme`.
- **5.1, 6.1, 7.1:** fixes F-008 to F-013 and F-016 to F-020 and F-023 are in the working tree, uncommitted. `npm test`, typecheck, lint and build pass. `npm run test:visual` does not:
  - 6 learn-gallery screenshots differ: the feedback-link shift is expected, a tree change is unexplained;
  - 3 tree-view chain screenshots were already failing before these changes.
- **8.1:** the `[OPEN]` rows are not yet listed in `.claude/docs/design/INDEX.md`.
- **9.1, 9.2:** no final re-run, no score table, and the matrix baselines have not been regenerated.

Deferred findings for follow-up changes:
- F-002, the WCAG 2.5.3 tree node names;
- F-005, F-006 and F-007, the fold and the phone top bar;
- F-014 and F-015, the Evaluate badge and the hub summary row;
- F-021, F-022, F-024 and F-025;
- F-001, the gallery landmarks (dev only).

Main-spec strict validation: 9 specs fail, the same 9 before and after the sync, so this change introduced none.
