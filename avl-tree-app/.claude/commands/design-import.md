---
description: Import a design (Claude Design link, published artifact, or exported folder) into docs/design/ without losing its intent, and report what changed since the last import.
argument-hint: <design link or folder>
---

Import the design at `$ARGUMENTS` into this repo. Do these in order and stop at the first failure.

1. **Fetch.** If the argument is a claude.ai link, read it with whatever artifact-reading tool this session has (list its files, then read each page). If no such tool exists, or the argument is a folder, use the folder. If neither works, stop and ask the user to export the design from Claude Design (Share, then Export) into `docs/design/incoming/`.
2. **Copy** each page unchanged into `docs/design/source/`. Never edit the copies.
3. **Write one spec per screen** at `docs/design/screens/<frame id>.md` with: the screen name; the component tree using the exact tag names from the design; every state shown; links to other screens; the numbered notes word for word; keyboard and accessibility rules; the FR-VIS and LO IDs it serves, or `[OPEN]` where unsure. Do not paraphrase notes and do not invent behaviour.
4. **Tokens.** Compare the design system's values with `src/ui/tokens.css`. Update the file only where the design changed; leave a comment for any value the design does not state. Run `npm test` (the contrast test must pass).
5. **Manifest.** Write `docs/design/manifest.json`: source link, exported or fetched date, and a sha256 per source file. If a manifest exists, list which files and screens changed.
6. **Index.** Update `docs/design/INDEX.md` (screens table, and the "What must change" list: tick off what the design now fixes).
7. **Conflicts.** Check the design against `docs/decisions.md`. Add every conflict to INDEX.md. Do not fix the design yourself and do not guess.
8. **Report.** Print what changed, which open OpenSpec changes cite a changed screen (`grep -r "docs/design/screens" openspec/changes`), and what needs a human decision.

Do not run `/opsx:*` commands and do not commit.
