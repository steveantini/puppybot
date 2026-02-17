import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../utils/supabase';
import { ArrowLeft, Plus, Mail, Users, Crown, Edit, Trash2, Eye, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SharingManagement() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [puppies, setPuppies] = useState([]);
  const [selectedPuppy, setSelectedPuppy] = useState(null);
  const [members, setMembers] = useState([]);
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Invite form
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('viewer');
  const [inviteLoading, setInviteLoading] = useState(false);

  useEffect(() => {
    fetchOwnedPuppies();
  }, [user]);

  useEffect(() => {
    if (selectedPuppy) {
      fetchMembersAndInvites();
    }
  }, [selectedPuppy]);

  const fetchOwnedPuppies = async () => {
    try {
      const { data, error } = await supabase
        .from('puppies')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (error) throw error;

      setPuppies(data || []);
      if (data && data.length > 0) {
        setSelectedPuppy(data[0]);
      }
    } catch (error) {
      console.error('Error fetching puppies:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMembersAndInvites = async () => {
    if (!selectedPuppy) return;

    try {
      // Fetch members
      const { data: membersData, error: membersError } = await supabase
        .from('puppy_members')
        .select('*, invited_by_user:invited_by(email)')
        .eq('puppy_id', selectedPuppy.id);

      if (membersError) throw membersError;

      // Fetch user details for each member
      const membersWithDetails = await Promise.all(
        (membersData || []).map(async (member) => {
          const { data: userData } = await supabase
            .from('user_profiles')
            .select('full_name, email')
            .eq('id', member.user_id)
            .single();

          return {
            ...member,
            user_details: userData || { email: 'Unknown', full_name: 'Unknown User' },
          };
        })
      );

      setMembers(membersWithDetails);

      // Fetch pending invites
      const { data: invitesData, error: invitesError } = await supabase
        .from('puppy_invites')
        .select('*')
        .eq('puppy_id', selectedPuppy.id)
        .eq('status', 'pending');

      if (invitesError) throw invitesError;

      setInvites(invitesData || []);
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  const handleSendInvite = async (e) => {
    e.preventDefault();
    setInviteLoading(true);

    try {
      // Generate invite token
      const token = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

      const { error } = await supabase
        .from('puppy_invites')
        .insert({
          puppy_id: selectedPuppy.id,
          inviter_id: user.id,
          invitee_email: inviteEmail,
          role: inviteRole,
          token,
          expires_at: expiresAt.toISOString(),
        });

      if (error) throw error;

      alert(`Invitation sent to ${inviteEmail}! They'll receive an email with a link to accept.`);
      setInviteEmail('');
      setInviteRole('viewer');
      setShowInviteForm(false);
      fetchMembersAndInvites();
    } catch (error) {
      console.error('Invite error:', error);
      alert('Failed to send invite: ' + error.message);
    } finally {
      setInviteLoading(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!confirm('Remove this member from the puppy?')) return;

    try {
      const { error } = await supabase
        .from('puppy_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      fetchMembersAndInvites();
    } catch (error) {
      console.error('Remove error:', error);
      alert('Failed to remove member: ' + error.message);
    }
  };

  const handleCancelInvite = async (inviteId) => {
    try {
      const { error } = await supabase
        .from('puppy_invites')
        .update({ status: 'expired' })
        .eq('id', inviteId);

      if (error) throw error;

      fetchMembersAndInvites();
    } catch (error) {
      console.error('Cancel error:', error);
      alert('Failed to cancel invite: ' + error.message);
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'owner':
        return <Crown size={14} className="text-warm-500" />;
      case 'editor':
        return <Edit size={14} className="text-steel-500" />;
      case 'viewer':
        return <Eye size={14} className="text-sand-500" />;
      default:
        return null;
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'owner':
        return 'Owner';
      case 'editor':
        return 'Editor';
      case 'viewer':
        return 'Viewer';
      default:
        return role;
    }
  };

  if (puppies.length === 0) {
    return (
      <div className="space-y-6 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center text-sand-600 hover:bg-sand-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-xl font-bold text-sand-900">Family & Sharing</h2>
        </div>

        <div className="bg-white rounded-2xl border border-sand-200/80 shadow-sm p-12 text-center">
          <Dog className="mx-auto text-sand-300 mb-4" size={48} />
          <p className="text-sand-600 font-medium mb-2">No puppies yet</p>
          <p className="text-sand-400 text-sm mb-6">
            Add a puppy first before inviting family members
          </p>
          <button
            onClick={() => navigate('/settings/puppies/new')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-steel-500 text-white rounded-xl hover:bg-steel-600 transition-colors shadow-sm font-semibold"
          >
            <Plus size={18} />
            Add Puppy
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center text-sand-600 hover:bg-sand-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-xl font-bold text-sand-900">Family & Sharing</h2>
      </div>

      {/* Puppy Selector */}
      <div className="bg-white rounded-2xl border border-sand-200/80 shadow-sm p-4">
        <label className="block text-xs font-semibold text-sand-500 uppercase tracking-widest mb-2">
          Select Puppy
        </label>
        <select
          value={selectedPuppy?.id || ''}
          onChange={(e) => {
            const puppy = puppies.find(p => p.id === e.target.value);
            setSelectedPuppy(puppy);
          }}
          className="w-full px-3.5 py-2.5 border border-sand-200 rounded-xl text-sand-900 focus:outline-none focus:ring-2 focus:ring-steel-300 focus:border-steel-300 transition-colors"
        >
          {puppies.map((puppy) => (
            <option key={puppy.id} value={puppy.id}>
              {puppy.name} {puppy.breed ? `(${puppy.breed})` : ''}
            </option>
          ))}
        </select>
      </div>

      {selectedPuppy && (
        <>
          {/* Current Members */}
          <div className="bg-white rounded-2xl border border-sand-200/80 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Users className="text-steel-500" size={20} />
                <h3 className="text-lg font-bold text-sand-900">Current Members</h3>
              </div>
              <button
                onClick={() => setShowInviteForm(!showInviteForm)}
                className="flex items-center gap-2 px-4 py-2 bg-steel-500 text-white rounded-lg hover:bg-steel-600 transition-colors text-sm font-semibold"
              >
                <Plus size={16} />
                Invite
              </button>
            </div>

            {/* Invite Form */}
            {showInviteForm && (
              <form onSubmit={handleSendInvite} className="mb-6 p-4 bg-sand-50 rounded-xl space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-sand-500 uppercase tracking-widest mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="family@example.com"
                    required
                    className="w-full px-3.5 py-2.5 border border-sand-200 rounded-xl text-sand-900 placeholder:text-sand-300 focus:outline-none focus:ring-2 focus:ring-steel-300 focus:border-steel-300 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-sand-500 uppercase tracking-widest mb-1.5">
                    Access Level
                  </label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-sand-200 rounded-xl text-sand-900 focus:outline-none focus:ring-2 focus:ring-steel-300 focus:border-steel-300 transition-colors"
                  >
                    <option value="viewer">Viewer (Read-only)</option>
                    <option value="editor">Editor (Can log data)</option>
                  </select>
                  <p className="text-xs text-sand-400 mt-1">
                    {inviteRole === 'viewer' 
                      ? 'Can view all data but cannot make changes'
                      : 'Can view and log new data'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowInviteForm(false);
                      setInviteEmail('');
                    }}
                    className="flex-1 py-2 border border-sand-200 text-sand-700 rounded-lg hover:bg-sand-50 transition-colors font-semibold text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={inviteLoading || !inviteEmail}
                    className="flex-1 py-2 bg-steel-500 text-white rounded-lg hover:bg-steel-600 transition-colors font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {inviteLoading ? 'Sending...' : 'Send Invite'}
                  </button>
                </div>
              </form>
            )}

            {/* Members List */}
            <div className="space-y-2">
              {members.length === 0 ? (
                <p className="text-sm text-sand-400 text-center py-4">
                  No members yet. Invite family to start sharing!
                </p>
              ) : (
                members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 border border-sand-200 rounded-xl hover:bg-sand-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-steel-100 rounded-full flex items-center justify-center text-steel-700 font-bold text-sm">
                        {member.user_details.full_name?.charAt(0)?.toUpperCase() || 
                         member.user_details.email?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-sand-900">
                          {member.user_details.full_name || 'User'}
                          {member.user_id === user.id && (
                            <span className="ml-2 text-xs text-steel-500">(You)</span>
                          )}
                        </p>
                        <p className="text-xs text-sand-500">{member.user_details.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 px-2 py-1 bg-sand-100 rounded-lg text-xs font-medium text-sand-700">
                        {getRoleIcon(member.role)}
                        {getRoleLabel(member.role)}
                      </div>
                      {member.role !== 'owner' && member.user_id !== user.id && (
                        <button
                          onClick={() => handleRemoveMember(member.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove member"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Pending Invites */}
          {invites.length > 0 && (
            <div className="bg-white rounded-2xl border border-sand-200/80 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="text-sand-500" size={20} />
                <h3 className="text-lg font-bold text-sand-900">Pending Invitations</h3>
              </div>

              <div className="space-y-2">
                {invites.map((invite) => (
                  <div
                    key={invite.id}
                    className="flex items-center justify-between p-3 border border-amber-200 bg-amber-50/50 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <Mail className="text-amber-600" size={18} />
                      <div>
                        <p className="font-semibold text-sm text-sand-900">{invite.invitee_email}</p>
                        <p className="text-xs text-sand-500">
                          Invited {new Date(invite.created_at).toLocaleDateString()} · Expires {new Date(invite.expires_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 px-2 py-1 bg-sand-100 rounded-lg text-xs font-medium text-sand-700">
                        {getRoleIcon(invite.role)}
                        {getRoleLabel(invite.role)}
                      </div>
                      <button
                        onClick={() => handleCancelInvite(invite.id)}
                        className="p-1.5 text-sand-600 hover:bg-sand-100 rounded-lg transition-colors"
                        title="Cancel invitation"
                      >
                        <XCircle size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Role Explanations */}
          <div className="bg-steel-50 rounded-2xl border border-steel-200/80 p-6">
            <h3 className="text-sm font-bold text-steel-900 mb-3">Access Levels</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <Crown className="text-warm-500 flex-shrink-0 mt-0.5" size={16} />
                <div>
                  <p className="font-semibold text-sand-900">Owner</p>
                  <p className="text-xs text-sand-600">Full control: manage members, delete puppy, all features</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Edit size={16} className="text-steel-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sand-900">Editor</p>
                  <p className="text-xs text-sand-600">Can log data and view everything</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Eye size={16} className="text-sand-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sand-900">Viewer</p>
                  <p className="text-xs text-sand-600">Read-only access (great for vets, trainers, family)</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
