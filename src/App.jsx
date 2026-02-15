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
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center gap-4">
        <div className="text-4xl animate-bounce">🐾</div>
        <p className="text-stone-500 font-medium">Loading PuppyBot…</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-stone-50">
        {/* Header */}
        <header className="bg-white/90 backdrop-blur-sm border-b border-stone-100 sticky top-0 z-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-center">
            <h1 className="text-lg font-bold text-stone-800 tracking-tight flex items-center gap-1.5">
              <span className="text-xl">🐾</span> PuppyBot
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

        {/* Bottom Navigation */}
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
