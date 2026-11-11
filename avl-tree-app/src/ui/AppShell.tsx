import type { ReactNode } from 'react'
import './shell.css'
import { MAIN_ID, SkipLink } from './SkipLink'
import { TopBar, type TopBarProps } from './TopBar'

export function AppShell({ children, ...topBar }: TopBarProps & { children?: ReactNode }) {
  return (
    <>
      <SkipLink />
      <header>
        <TopBar {...topBar} />
      </header>
      <main id={MAIN_ID} className="app-main" tabIndex={-1}>
        {children}
      </main>
    </>
  )
}
