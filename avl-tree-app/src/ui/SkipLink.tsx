import { shellCopy } from '../content/shell'

export const MAIN_ID = 'main-content'

export function SkipLink() {
  return (
    <a
      className="skip-link"
      href={`#${MAIN_ID}`}
      onClick={(e) => {
        // A fragment link alone does not reliably move focus in every browser.
        e.preventDefault()
        document.getElementById(MAIN_ID)?.focus()
      }}
    >
      {shellCopy.skipLinkLabel}
    </a>
  )
}
