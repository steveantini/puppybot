import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase, setRememberMe } from '../utils/supabase';
import { PawPrint, Mail, Lock, AlertCircle, Eye } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMeState] = useState(true);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      setRememberMe(rememberMe);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Successful login - navigate to dashboard
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'Failed to login. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    const demoEmail = import.meta.env.VITE_DEMO_EMAIL;
    const demoPassword = import.meta.env.VITE_DEMO_PASSWORD;
    if (!demoEmail || !demoPassword) {
      setError('Demo account is not configured.');
      return;
    }
    setError('');
    setDemoLoading(true);
    try {
      setRememberMe(false);
      const { error } = await supabase.auth.signInWithPassword({
        email: demoEmail,
        password: demoPassword,
      });
      if (error) throw error;
      navigate('/');
    } catch (err) {
      console.error('Demo login error:', err);
      setError('Demo login failed. Please try again later.');
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-steel-50 via-sand-50 to-warm-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-2">
            <PawPrint className="text-warm-400" size={40} />
            <h1 className="text-4xl font-bold">
              <span className="text-steel-400">Puppy</span>
              <span className="text-steel-500">Bot</span>
            </h1>
          </div>
          <p className="text-sand-600 text-sm">Welcome back! Track your puppy's journey.</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl border border-sand-200/80 shadow-lg p-8">
          <h2 className="text-2xl font-bold text-sand-900 mb-6">Sign In</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={16} />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-sand-500 uppercase tracking-widest mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sand-400" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-11 pr-3.5 py-2.5 border border-sand-200 rounded-xl text-sand-900 placeholder:text-sand-300 focus:outline-none focus:ring-2 focus:ring-steel-300 focus:border-steel-300 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-sand-500 uppercase tracking-widest mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sand-400" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-11 pr-3.5 py-2.5 border border-sand-200 rounded-xl text-sand-900 placeholder:text-sand-300 focus:outline-none focus:ring-2 focus:ring-steel-300 focus:border-steel-300 transition-colors"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMeState(e.target.checked)}
                  className="rounded border-sand-300 text-steel-500 focus:ring-steel-300"
                />
                <span className="text-sand-600">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-steel-500 hover:text-steel-600 font-medium">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl font-semibold transition-colors shadow-sm ${
                loading
                  ? 'bg-sand-300 text-sand-500 cursor-not-allowed'
                  : 'bg-steel-500 hover:bg-steel-600 text-white'
              }`}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-sand-600">
              Don't have an account?{' '}
              <Link to="/signup" className="text-steel-500 hover:text-steel-600 font-semibold">
                Sign up
              </Link>
            </p>
          </div>

          {/* Demo Divider */}
          <div className="mt-5 flex items-center gap-3">
            <div className="flex-1 h-px bg-sand-200" />
            <span className="text-xs text-sand-400 font-medium">or</span>
            <div className="flex-1 h-px bg-sand-200" />
          </div>

          {/* Try Demo Button */}
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={demoLoading || loading}
            className="mt-4 w-full py-3 rounded-xl font-semibold transition-colors border border-sand-300 bg-sand-50 hover:bg-sand-100 text-sand-700 shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Eye size={18} />
            {demoLoading ? 'Loading demo...' : 'Try Demo'}
          </button>
          <p className="text-xs text-sand-400 text-center mt-2">Explore PuppyBot with sample data — no sign-up needed</p>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-sand-400">
          <p>© 2026 PuppyBot. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
