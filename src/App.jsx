import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DataProvider } from './context/DataContext';
import BottomNav from './components/BottomNav';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import Stats from './pages/Stats';
import PuppyProfile from './pages/PuppyProfile';
import HealthTracker from './pages/HealthTracker';

function App() {
  return (
    <DataProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-stone-50">
          {/* Header */}
          <header className="bg-white/90 backdrop-blur-sm border-b border-stone-100 sticky top-0 z-50">
            <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-center">
              <h1 className="text-lg font-bold text-stone-800 tracking-tight flex items-center gap-1.5">
                <span className="text-xl">🐾</span> PuppyBot
              </h1>
            </div>
          </header>

          {/* Page content */}
          <main className="max-w-lg mx-auto px-4 py-4 pb-24">
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
    </DataProvider>
  );
}

export default App;
