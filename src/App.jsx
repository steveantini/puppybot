import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { DataProvider, useData } from './context/DataContext';
import BottomNav from './components/BottomNav';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import Stats from './pages/Stats';
import PuppyProfile from './pages/PuppyProfile';
import HealthTracker from './pages/HealthTracker';

function AppShell() {
  const { isLoading, puppy } = useData();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-sand-50 flex flex-col items-center justify-center gap-4">
        <span className="text-4xl animate-pulse-soft">🐾</span>
        <p className="text-sand-500 text-sm font-medium tracking-wide">Loading PuppyBot…</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-sand-50">
        {/* Header */}
        <header className="bg-white border-b border-sand-200/80 sticky top-0 z-50 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
            <div className="w-[50px]" />
            <h1 className="text-4xl font-bold tracking-tight flex items-center gap-2.5">
              <span className="text-warm-400">🐾</span>
              <span><span className="text-steel-400">Puppy</span><span className="text-steel-500">Bot</span></span>
            </h1>
            <Link to="/profile" className="shrink-0">
              {puppy?.photoUrl ? (
                <img
                  src={puppy.photoUrl}
                  alt={puppy.name || 'Puppy'}
                  className="w-[50px] h-[50px] rounded-full object-cover border-2 border-sand-200 shadow-sm hover:border-steel-300 transition-colors"
                />
              ) : (
                <div className="w-[50px] h-[50px] rounded-full bg-sand-100 border-2 border-sand-200 flex items-center justify-center text-xl hover:border-steel-300 transition-colors">
                  🐶
                </div>
              )}
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/history" element={<History />} />
            <Route path="/stats" element={<Stats />} />
            <Route path="/profile" element={<PuppyProfile />} />
            <Route path="/health" element={<HealthTracker />} />
          </Routes>
        </main>

        <BottomNav />
      </div>
    </BrowserRouter>
  );
}

function App() {
  return (
    <DataProvider>
      <AppShell />
    </DataProvider>
  );
}

export default App;
