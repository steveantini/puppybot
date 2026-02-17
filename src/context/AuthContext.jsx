import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    }).catch((err) => {
      console.error('Auth session error:', err);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.warn('Profile fetch warning:', error.message);
      }
      if (data) {
        setProfile(data);
      }

      // Auto-accept any pending invites for this user's email
      await acceptPendingInvites(userId);
    } catch (error) {
      console.warn('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const acceptPendingInvites = async (userId) => {
    try {
      // Get the user's email from auth
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser?.email) return;

      // Find pending invites for this email
      const { data: pendingInvites, error: invErr } = await supabase
        .from('puppy_invites')
        .select('*')
        .eq('invitee_email', authUser.email)
        .eq('status', 'pending');

      if (invErr || !pendingInvites || pendingInvites.length === 0) return;

      for (const invite of pendingInvites) {
        // Check if invite hasn't expired
        if (new Date(invite.expires_at) < new Date()) {
          await supabase
            .from('puppy_invites')
            .update({ status: 'expired' })
            .eq('id', invite.id);
          continue;
        }

        // Check if already a member (avoid duplicates)
        const { data: existingMember } = await supabase
          .from('puppy_members')
          .select('id')
          .eq('puppy_id', invite.puppy_id)
          .eq('user_id', userId)
          .maybeSingle();

        if (existingMember) {
          // Already a member, just mark invite as accepted
          await supabase
            .from('puppy_invites')
            .update({ status: 'accepted' })
            .eq('id', invite.id);
          continue;
        }

        // Add as member
        const { error: memberErr } = await supabase
          .from('puppy_members')
          .insert({
            puppy_id: invite.puppy_id,
            user_id: userId,
            role: invite.role,
            invited_by: invite.inviter_id,
            accepted_at: new Date().toISOString(),
          });

        if (!memberErr) {
          // Mark invite as accepted
          await supabase
            .from('puppy_invites')
            .update({ status: 'accepted' })
            .eq('id', invite.id);
        }
      }
    } catch (err) {
      console.warn('Auto-accept invites error:', err);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  const value = {
    user,
    profile,
    loading,
    signOut,
    isAuthenticated: !!user,
    isPremium: profile?.subscription_tier === 'premium' && profile?.subscription_status === 'active',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Protected Route Component
export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-sand-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-steel-500 mx-auto mb-4"></div>
          <p className="text-sand-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return children;
}
