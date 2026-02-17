import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../utils/supabase';
import { ArrowLeft, Plus, Dog, Edit2, Trash2, Users, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PuppyManagement() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [puppies, setPuppies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPuppy, setSelectedPuppy] = useState(null);

  useEffect(() => {
    fetchPuppies();
  }, [user]);

  const fetchPuppies = async () => {
    try {
      // Fetch puppies owned by user
      const { data: ownedPuppies, error: ownedError } = await supabase
        .from('puppies')
        .select('*, puppy_members(*)')
        .eq('user_id', user.id);

      if (ownedError) throw ownedError;

      // Fetch puppies shared with user
      const { data: sharedPuppies, error: sharedError } = await supabase
        .from('puppy_members')
        .select('*, puppies(*)')
        .eq('user_id', user.id)
        .neq('role', 'owner'); // Don't include puppies they own (already fetched)

      if (sharedError) throw sharedError;

      // Combine and format
      const allPuppies = [
        ...(ownedPuppies || []).map(p => ({
          ...p,
          isOwner: true,
          role: 'owner',
          memberCount: p.puppy_members?.length || 0,
        })),
        ...(sharedPuppies || []).map(m => ({
          ...m.puppies,
          isOwner: false,
          role: m.role,
          memberCount: 0, // Shared users don't see member count
        })),
      ];

      setPuppies(allPuppies);
    } catch (error) {
      console.error('Error fetching puppies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePuppy = async (puppyId) => {
    if (!confirm('Are you sure? This will permanently delete all data for this puppy.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('puppies')
        .delete()
        .eq('id', puppyId);

      if (error) throw error;

      // Refresh list
      fetchPuppies();
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete puppy: ' + error.message);
    }
  };

  const handleSetActive = (puppy) => {
    // Store selected puppy in localStorage for now
    // (Later this will be more sophisticated)
    localStorage.setItem('activePuppyId', puppy.id);
    navigate('/');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Dog className="animate-pulse text-sand-300 mx-auto mb-3" size={32} />
          <p className="text-sand-500 text-sm">Loading puppies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center text-sand-600 hover:bg-sand-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-xl font-bold text-sand-900">My Puppies</h2>
        </div>
        <button
          onClick={() => navigate('/settings/puppies/new')}
          className="flex items-center gap-2 px-4 py-2 bg-steel-500 text-white rounded-xl hover:bg-steel-600 transition-colors shadow-sm font-semibold text-sm"
        >
          <Plus size={18} />
          Add Puppy
        </button>
      </div>

      {puppies.length === 0 ? (
        <div className="bg-white rounded-2xl border border-sand-200/80 shadow-sm p-12 text-center">
          <Dog className="mx-auto text-sand-300 mb-4" size={48} />
          <p className="text-sand-600 font-medium mb-2">No puppies yet</p>
          <p className="text-sand-400 text-sm mb-6">
            Add your first puppy to start tracking their journey
          </p>
          <button
            onClick={() => navigate('/settings/puppies/new')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-steel-500 text-white rounded-xl hover:bg-steel-600 transition-colors shadow-sm font-semibold"
          >
            <Plus size={18} />
            Add Puppy
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {puppies.map((puppy) => (
            <div
              key={puppy.id}
              className="bg-white rounded-2xl border border-sand-200/80 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Puppy Card Header */}
              <div className="bg-gradient-to-br from-steel-50 to-sand-100 p-6 flex flex-col items-center relative">
                {puppy.isOwner && (
                  <div className="absolute top-3 right-3 flex items-center gap-1 bg-warm-100 text-warm-700 px-2 py-1 rounded-full text-[10px] font-bold">
                    <Crown size={10} />
                    OWNER
                  </div>
                )}
                {!puppy.isOwner && (
                  <div className="absolute top-3 right-3 flex items-center gap-1 bg-steel-100 text-steel-700 px-2 py-1 rounded-full text-[10px] font-bold uppercase">
                    {puppy.role}
                  </div>
                )}
                
                {puppy.photo_url ? (
                  <img
                    src={puppy.photo_url}
                    alt={puppy.name}
                    className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-white border-4 border-white shadow-lg flex items-center justify-center">
                    <Dog size={32} className="text-sand-300" />
                  </div>
                )}
                <h3 className="text-xl font-bold text-sand-900 mt-3">{puppy.name}</h3>
                {puppy.breed && (
                  <p className="text-sm text-sand-600">{puppy.breed}</p>
                )}
              </div>

              {/* Puppy Card Body */}
              <div className="p-4 space-y-3">
                {puppy.isOwner && puppy.memberCount > 0 && (
                  <div className="flex items-center gap-2 text-xs text-sand-500">
                    <Users size={14} />
                    <span>{puppy.memberCount} {puppy.memberCount === 1 ? 'member' : 'members'} shared</span>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => handleSetActive(puppy)}
                    className="flex-1 py-2 bg-steel-500 text-white rounded-lg hover:bg-steel-600 transition-colors font-semibold text-sm"
                  >
                    View Dashboard
                  </button>
                  {puppy.isOwner && (
                    <button
                      onClick={() => navigate(`/settings/puppies/edit/${puppy.id}`)}
                      className="px-3 py-2 border border-sand-200 text-sand-700 rounded-lg hover:bg-sand-50 transition-colors"
                      title="Edit puppy"
                    >
                      <Edit2 size={16} />
                    </button>
                  )}
                </div>

                {puppy.isOwner && (
                  <button
                    onClick={() => handleDeletePuppy(puppy.id)}
                    className="w-full py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-semibold text-sm"
                  >
                    Delete Puppy
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
