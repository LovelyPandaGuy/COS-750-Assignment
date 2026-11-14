/**
 * The three layout widths (add-ui-foundation; D3, NFR-04, FR-VIS-10; docs/design/quality-bar.md check 4).
 * [OPEN] The design states no breakpoints; these come from the quality bar and are an assumed default (D18).
 * Mobile first: the phone layout needs no query; stylesheets use only `@media (min-width: 768px)` and
 * `@media (min-width: 1366px)`. The style lint's allow-list (.stylelintrc.json) must list the same two
 * widths; a test checks that they agree.
 */
export const BREAKPOINTS = { phone: 390, tablet: 768, desktop: 1366 } as const

/** The widths stylesheets may query with `min-width`, in px. */
export const MEDIA_MIN_WIDTHS = [BREAKPOINTS.tablet, BREAKPOINTS.desktop] as const
