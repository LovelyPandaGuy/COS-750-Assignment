import { AppShell } from './ui/AppShell'
import { shellCopy } from './content/shell'

export function App() {
  return (
    <AppShell title={shellCopy.appTitle}>
      <h1>AVL Primer</h1>
    </AppShell>
  )
}

export default App
