import type { ReactNode } from 'react'
import './shell.css'
import { MAIN_ID, SkipLink } from './SkipLink'
import { TopBar, type TopBarProps } from './TopBar'

/** The frame of every screen: skip link, banner, then the Lessons sidebar (revamp-navigation, D155) and main. */
export function AppShell({ children, sidebar, ...topBar }: TopBarProps & { children?: ReactNode; sidebar?: ReactNode }) {
  return (
    <>
      <SkipLink />
      <header>
        <TopBar {...topBar} />
      </header>
      <div className="app-body">
        {sidebar}
        <main id={MAIN_ID} className="app-main" tabIndex={-1}>
          {children}
        </main>
      </div>
    </>
  )
}
