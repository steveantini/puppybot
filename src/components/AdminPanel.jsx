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

  const menuItems = [
    { icon: User, label: 'Account Settings', desc: 'Profile, email, password', path: '/settings/account' },
    { icon: Dog, label: 'My Puppies', desc: 'Add, edit, manage puppies', path: '/settings/puppies' },
    { icon: Users, label: 'Family & Sharing', desc: 'Invite family, manage access', path: '/settings/sharing' },
    { divider: true },
    { icon: CreditCard, label: 'Subscription & Billing', desc: profile?.subscription_tier === 'premium' ? 'Premium Plan' : 'Free Plan', path: '/settings/billing' },
    { icon: Lock, label: 'Security', desc: '2FA, sessions', path: '/settings/security' },
    { icon: Bell, label: 'Notifications', desc: 'Email, reminders', path: '/settings/notifications' },
    { icon: SettingsIcon, label: 'Preferences', desc: 'Timezone, units', path: '/settings/preferences' },
    { divider: true },
    { icon: HelpCircle, label: 'Help & Support', desc: 'Docs, contact', path: '/settings/help' },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-white shadow-2xl z-50 overflow-hidden">
        {/* Header - compact */}
        <div className="bg-gradient-to-r from-steel-500 to-steel-600 px-5 py-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold text-white">Settings</h2>
            <button
              onClick={onClose}
              className="text-white hover:bg-steel-400 p-1.5 rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-steel-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {profile?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              <p className="text-white font-semibold text-sm">{profile?.full_name || 'User'}</p>
              <p className="text-steel-100 text-xs">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Menu Items - compact */}
        <div className="px-3 py-2">
          {menuItems.map((item, i) => {
            if (item.divider) {
              return <div key={`d-${i}`} className="h-px bg-sand-200 my-1.5"></div>;
            }
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sand-700 hover:bg-sand-50 rounded-lg transition-colors text-left"
              >
                <Icon size={17} className="text-steel-500 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="font-semibold text-xs">{item.label}</p>
                  <p className="text-[10px] text-sand-500 leading-tight">{item.desc}</p>
                </div>
              </button>
            );
          })}

          {/* Divider before sign out */}
          <div className="h-px bg-sand-200 my-1.5"></div>

          {/* Sign Out */}
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-semibold text-xs"
          >
            <LogOut size={17} />
            Sign Out
          </button>
        </div>
      </div>
    </>
  );
}
