# Design

## Context

- `src/ui/tokens.css` already holds the design system's tokens (light and dark) and the global `:focus-visible` rule. It is covered by `tests/tokens.contrast.test.ts`. This change wires it in; it does not change values.
- `src/main.tsx` imports only `index.css`, which is the Vite starter (its own palette, `--accent`, hard-coded hex). `App.tsx` is a placeholder `<main><h1>AVL Primer</h1></main>`, tested by `tests/app.test.tsx` (heading plus axe).
- The wireframes show one frame for every screen: `AppShell · TopBar`, with title "AVL Trees · pre-lecture primer", an optional breadcrumb, a status pill, action buttons and the Aa button at the right.
- The design docs live in `.claude/docs/` here, not `docs/` as CLAUDE.md says. I read them from there.

## Goals / Non-Goals

**Goals:** every later screen composes `AppShell` and `TopBar` and takes style only from tokens; keyboard, touch and pointer behave the same in the shell.

**Non-Goals:** see proposal "Out of scope".

## Decisions

1. **Plain CSS file with variables (`shell.css`), not a CSS-in-JS or utility library.** Tokens are CSS variables, no dependency is needed, and a stylesheet is easy to scan for hex colours and outline overrides in tests. Alternative: CSS modules; rejected for now as extra config with no benefit here.
2. **Pin light with the `data-theme="light"` attribute in `index.html`.** The attribute is set before first paint, so no flash, and it uses the selector already in `tokens.css`. Alternative: remove the dark blocks; rejected because the design owns them and dark returns later. `color-scheme: light dark` in `:root` is left alone; `[data-theme='light']` does not change it, so form controls and scrollbars could still go dark in a dark OS. I will set `color-scheme: light` in `shell.css` under `:root[data-theme='light']` so native controls match. That is a base style, not a token.
3. **Aa panel is an inline disclosure, not a modal dialog or `role="menu"`.** The panel will hold settings (toggles, a size control), which are not menu items, and a modal would trap focus for no reason. So: button with `aria-expanded` and `aria-controls`, a panel region labelled by the button, Escape and outside click close it, focus returns to the button. Alternative: native `popover` attribute; rejected until jsdom and target browsers are confirmed, and Escape-to-button focus needs handling anyway.
4. **Copy in `src/content/shell.ts`.** The Aa name and panel line are wording, so they follow the content rule (flagged, `content-author` only). Components import them.
5. **Slots by props.** `TopBar({ title, breadcrumb?, status?, actions? })`, where `actions` is `{ label, onClick }[]`. No screen names are typed in the shell.
6. **Focus ring stays in `tokens.css`.** One rule, one place. The test scans for overrides rather than testing computed style, because jsdom does not evaluate `:focus-visible`.
7. **Test limits.** jsdom has no layout, so 44 px targets, the 66ch column and wrapping are checked from stylesheet text (rule contains the variable), not measured. A real-browser check for those goes in the human review step (greyscale and keyboard-only run from the definition of done).

8. **Skip link.** A plain `<a href="#main-content">` placed before the banner, with `main` given `id="main-content"` and `tabIndex={-1}`. A click handler calls `main.focus()` as well, because a fragment link alone does not reliably move focus in every browser. It is positioned off-screen until `:focus` (not `display: none`, which would remove it from the tab order). It is not in the wireframes, so it is flagged for the user.

## Risks / Trade-offs

- Stylesheet-text tests are brittle if someone writes the same rule another way. They check the intent (variable used, no override) and the keyboard run backs them up.
- Changing `main`'s focus on skip-link use shows the focus ring on `main` too; the design says one style everywhere, so `main` uses the same ring and is not suppressed.
- The stub panel's one line of copy may be thrown away when the real settings arrive; it is isolated in one content file for that reason.
