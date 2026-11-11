import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { screenCopy } from './content/screens'

/**
 * Every screen: set the browser title from its level-1 heading, and after an in-app
 * move put focus on that heading (WCAG 2.4.2, 2.4.3). React Router gives the first
 * entry the key "default", so a direct load keeps the skip link first in the tab order.
 */
export function useScreen(): void {
  const location = useLocation()
  useEffect(() => {
    const heading = document.querySelector<HTMLElement>('main h1')
    if (heading === null) return
    document.title = `${heading.textContent} · ${screenCopy.titleSuffix}`
    if (location.key !== 'default') heading.focus()
  }, [location])
}
