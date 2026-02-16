import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DataProvider, useData } from './context/DataContext';
import BottomNav from './components/BottomNav';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import Stats from './pages/Stats';
import PuppyProfile from './pages/PuppyProfile';
import HealthTracker from './pages/HealthTracker';

function AppShell() {
  const { isLoading } = useData();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-sand-50 flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 rounded-full bg-steel-100 flex items-center justify-center animate-pulse">
          <span className="text-lg">🐾</span>
        </div>
        <p className="text-sand-500 text-sm font-medium tracking-wide">Loading...</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-sand-50">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-sand-200/60 sticky top-0 z-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-center">
            <h1 className="text-[15px] font-semibold text-sand-800 tracking-tight flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-steel-500 flex items-center justify-center text-white text-xs">
                🐾
              </span>
              PuppyBot
            </h1>
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
