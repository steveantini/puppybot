import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import { PawPrint, Mail, Lock, User, AlertCircle, CheckCircle } from 'lucide-react';

export default function Signup() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) throw error;

      // Show success message
      setSuccess(true);
      
      // If email confirmation is disabled, redirect to dashboard
      if (data?.session) {
        setTimeout(() => navigate('/'), 2000);
      }
    } catch (error) {
      console.error('Signup error:', error);
      setError(error.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-steel-50 via-sand-50 to-warm-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl border border-sand-200/80 shadow-lg p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
              <CheckCircle className="text-emerald-600" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-sand-900 mb-2">Welcome to PuppyBot!</h2>
            <p className="text-sand-600 mb-6">
              Your account has been created successfully. You can now start tracking your puppy's journey!
            </p>
            <Link
              to="/"
              className="inline-block w-full py-3 bg-steel-500 hover:bg-steel-600 text-white font-semibold rounded-xl transition-colors shadow-sm"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
          <p className="text-sand-600 text-sm">Start tracking your puppy's journey today!</p>
        </div>

        {/* Signup Form */}
        <div className="bg-white rounded-2xl border border-sand-200/80 shadow-lg p-8">
          <h2 className="text-2xl font-bold text-sand-900 mb-6">Create Account</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={16} />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-sand-500 uppercase tracking-widest mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sand-400" size={18} />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  required
                  className="w-full pl-11 pr-3.5 py-2.5 border border-sand-200 rounded-xl text-sand-900 placeholder:text-sand-300 focus:outline-none focus:ring-2 focus:ring-steel-300 focus:border-steel-300 transition-colors"
                />
              </div>
            </div>

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
                  minLength={6}
                  className="w-full pl-11 pr-3.5 py-2.5 border border-sand-200 rounded-xl text-sand-900 placeholder:text-sand-300 focus:outline-none focus:ring-2 focus:ring-steel-300 focus:border-steel-300 transition-colors"
                />
              </div>
              <p className="text-xs text-sand-400 mt-1">Must be at least 6 characters</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-sand-500 uppercase tracking-widest mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sand-400" size={18} />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-11 pr-3.5 py-2.5 border border-sand-200 rounded-xl text-sand-900 placeholder:text-sand-300 focus:outline-none focus:ring-2 focus:ring-steel-300 focus:border-steel-300 transition-colors"
                />
              </div>
            </div>

            <div className="text-xs text-sand-500 leading-relaxed">
              By creating an account, you agree to our{' '}
              <Link to="/terms" className="text-steel-500 hover:text-steel-600 underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-steel-500 hover:text-steel-600 underline">
                Privacy Policy
              </Link>
              .
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
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-sand-600">
              Already have an account?{' '}
              <Link to="/login" className="text-steel-500 hover:text-steel-600 font-semibold">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-sand-400">
          <p>© 2026 PuppyBot. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
