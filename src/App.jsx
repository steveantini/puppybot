import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import LogEntry from './pages/LogEntry'
import History from './pages/History'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-amber-50">
        {/* Navigation */}
        <nav className="bg-white border-b border-amber-200 shadow-sm">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
            <h1 className="text-xl font-bold text-amber-800 tracking-tight">
              🐾 PuppyBot
            </h1>
            <div className="flex gap-1">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-amber-100 text-amber-900'
                      : 'text-amber-700 hover:bg-amber-50'
                  }`
                }
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/log"
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-amber-100 text-amber-900'
                      : 'text-amber-700 hover:bg-amber-50'
                  }`
                }
              >
                Log Entry
              </NavLink>
              <NavLink
                to="/history"
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-amber-100 text-amber-900'
                      : 'text-amber-700 hover:bg-amber-50'
                  }`
                }
              >
                History
              </NavLink>
            </div>
          </div>
        </nav>

        {/* Page content */}
        <main className="max-w-4xl mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/log" element={<LogEntry />} />
            <Route path="/history" element={<History />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
