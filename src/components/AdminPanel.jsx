import { useState } from 'react';
import { X, User, Dog, Users, CreditCard, Lock, Bell, Settings as SettingsIcon, HelpCircle, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function AdminPanel({ isOpen, onClose }) {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
    onClose();
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-2xl z-50 transform transition-transform relative">
        {/* Header */}
        <div className="bg-gradient-to-r from-steel-500 to-steel-600 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Settings</h2>
            <button
              onClick={onClose}
              className="text-white hover:bg-steel-400 p-2 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-steel-400 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {profile?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              <p className="text-white font-semibold">{profile?.full_name || 'User'}</p>
              <p className="text-steel-100 text-sm">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="overflow-y-auto h-[calc(100vh-240px)]">
          <div className="p-4 pb-6 space-y-1">
            {/* Account Settings */}
            <button
              onClick={() => handleNavigation('/settings/account')}
              className="w-full flex items-center gap-3 px-4 py-3 text-sand-700 hover:bg-sand-50 rounded-xl transition-colors text-left"
            >
              <User size={20} className="text-steel-500" />
              <div>
                <p className="font-semibold text-sm">Account Settings</p>
                <p className="text-xs text-sand-500">Profile, email, password</p>
              </div>
            </button>

            {/* My Puppies */}
            <button
              onClick={() => handleNavigation('/settings/puppies')}
              className="w-full flex items-center gap-3 px-4 py-3 text-sand-700 hover:bg-sand-50 rounded-xl transition-colors text-left"
            >
              <Dog size={20} className="text-steel-500" />
              <div>
                <p className="font-semibold text-sm">My Puppies</p>
                <p className="text-xs text-sand-500">Add, edit, manage puppies</p>
              </div>
            </button>

            {/* Family & Sharing */}
            <button
              onClick={() => handleNavigation('/settings/sharing')}
              className="w-full flex items-center gap-3 px-4 py-3 text-sand-700 hover:bg-sand-50 rounded-xl transition-colors text-left"
            >
              <Users size={20} className="text-steel-500" />
              <div>
                <p className="font-semibold text-sm">Family & Sharing</p>
                <p className="text-xs text-sand-500">Invite family, manage access</p>
              </div>
            </button>

            {/* Divider */}
            <div className="h-px bg-sand-200 my-2"></div>

            {/* Subscription & Billing */}
            <button
              onClick={() => handleNavigation('/settings/billing')}
              className="w-full flex items-center gap-3 px-4 py-3 text-sand-700 hover:bg-sand-50 rounded-xl transition-colors text-left"
            >
              <CreditCard size={20} className="text-steel-500" />
              <div className="flex items-center justify-between flex-1">
                <div>
                  <p className="font-semibold text-sm">Subscription & Billing</p>
                  <p className="text-xs text-sand-500">
                    {profile?.subscription_tier === 'premium' ? 'Premium Plan' : 'Free Plan'}
                  </p>
                </div>
                {profile?.subscription_tier === 'free' && (
                  <span className="text-xs bg-warm-100 text-warm-700 px-2 py-1 rounded-full font-medium">
                    Upgrade
                  </span>
                )}
              </div>
            </button>

            {/* Security */}
            <button
              onClick={() => handleNavigation('/settings/security')}
              className="w-full flex items-center gap-3 px-4 py-3 text-sand-700 hover:bg-sand-50 rounded-xl transition-colors text-left"
            >
              <Lock size={20} className="text-steel-500" />
              <div>
                <p className="font-semibold text-sm">Security</p>
                <p className="text-xs text-sand-500">2FA, sessions, login history</p>
              </div>
            </button>

            {/* Notifications */}
            <button
              onClick={() => handleNavigation('/settings/notifications')}
              className="w-full flex items-center gap-3 px-4 py-3 text-sand-700 hover:bg-sand-50 rounded-xl transition-colors text-left"
            >
              <Bell size={20} className="text-steel-500" />
              <div>
                <p className="font-semibold text-sm">Notifications</p>
                <p className="text-xs text-sand-500">Email preferences, reminders</p>
              </div>
            </button>

            {/* Preferences */}
            <button
              onClick={() => handleNavigation('/settings/preferences')}
              className="w-full flex items-center gap-3 px-4 py-3 text-sand-700 hover:bg-sand-50 rounded-xl transition-colors text-left"
            >
              <SettingsIcon size={20} className="text-steel-500" />
              <div>
                <p className="font-semibold text-sm">Preferences</p>
                <p className="text-xs text-sand-500">Timezone, units, display</p>
              </div>
            </button>

            {/* Divider */}
            <div className="h-px bg-sand-200 my-2"></div>

            {/* Help & Support */}
            <button
              onClick={() => handleNavigation('/settings/help')}
              className="w-full flex items-center gap-3 px-4 py-3 text-sand-700 hover:bg-sand-50 rounded-xl transition-colors text-left"
            >
              <HelpCircle size={20} className="text-steel-500" />
              <div>
                <p className="font-semibold text-sm">Help & Support</p>
                <p className="text-xs text-sand-500">Docs, contact, feedback</p>
              </div>
            </button>
          </div>
        </div>

        {/* Footer - Sign Out */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-sand-200 bg-white">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors font-semibold"
          >
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      </div>
    </>
  );
}
