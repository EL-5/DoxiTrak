import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppProvider, useApp } from './store/AppContext'
import Sidebar from './components/Sidebar'
import Dashboard    from './pages/Dashboard'
import Transactions from './pages/Transactions'
import Analytics    from './pages/Analytics'
import Budget       from './pages/Budget'
import Goals        from './pages/Goals'
import Settings     from './pages/Settings'

function AppShell() {
  const { state } = useApp()
  const isDark = state.settings.theme === 'dark'

  return (
    <div className={`${isDark ? 'dark' : ''} flex min-h-screen`} style={{ background: 'var(--bg)' }}>
      <Sidebar />
      <main className="flex-1 min-w-0 p-5 lg:p-7 pt-16 lg:pt-7 overflow-x-hidden" style={{ background: 'var(--bg-sub)' }}>
        <div className="max-w-5xl mx-auto">
          <Routes>
            <Route path="/"             element={<Dashboard />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/analytics"    element={<Analytics />} />
            <Route path="/budget"       element={<Budget />} />
            <Route path="/goals"        element={<Goals />} />
            <Route path="/settings"     element={<Settings />} />
          </Routes>
        </div>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </AppProvider>
  )
}
