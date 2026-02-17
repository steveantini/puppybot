import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { PawPrint } from 'lucide-react';
import { AuthProvider, ProtectedRoute } from './context/AuthContext';
import { DataProvider, useData } from './context/DataContext';
import BottomNav from './components/BottomNav';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import Stats from './pages/Stats';
import PuppyProfile from './pages/PuppyProfile';
import HealthTracker from './pages/HealthTracker';
import Login from './pages/Login';
import Signup from './pages/Signup';

function AppShell() {
  const { isLoading, puppy } = useData();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-sand-50 flex flex-col items-center justify-center gap-4">
        <PawPrint size={40} className="text-warm-200 animate-pulse-soft" />
        <p className="text-sand-500 text-sm font-medium tracking-wide">Loading PuppyBot…</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* Protected routes */}
        <Route path="/*" element={
          <ProtectedRoute>
            <div className="min-h-screen bg-sand-50">
              {/* Header */}
              <header className="bg-white border-b border-sand-200/80 sticky top-0 z-50 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
                  <div className="w-[62px]" />
                  <h1 className="text-5xl font-bold tracking-tight flex items-center gap-3">
                    <PawPrint size={36} className="text-warm-200" />
                    <span><span className="text-steel-400">Puppy</span><span className="text-steel-500">Bot</span></span>
                  </h1>
                  <Link to="/profile" className="shrink-0">
                    {puppy?.photoUrl ? (
                      <img
                        src={puppy.photoUrl}
                        alt={puppy.name || 'Puppy'}
                        className="w-[62px] h-[62px] rounded-full object-cover border-2 border-sand-200 shadow-sm hover:border-steel-300 transition-colors"
                      />
                    ) : (
                      <div className="w-[62px] h-[62px] rounded-full bg-sand-100 border-2 border-sand-200 flex items-center justify-center text-2xl hover:border-steel-300 transition-colors">
                        🐶
                      </div>
                    )}
                  </Link>
                </div>
              </header>

              {/* Page content */}
              <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
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
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <AppShell />
      </DataProvider>
    </AuthProvider>
  );
}

export default App;
