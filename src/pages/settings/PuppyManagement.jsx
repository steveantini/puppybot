import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { supabase } from '../../utils/supabase';
import { ArrowLeft, Plus, Dog, Edit2, Trash2, Users, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PuppyManagement() {
  const { user } = useAuth();
  const { puppy: activePuppy } = useData();
  const navigate = useNavigate();
  
  const [puppies, setPuppies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchPuppies();
  }, [user]);

  const fetchPuppies = async () => {
    try {
      // Fetch puppies - try user_id filter first, fallback to all
      let data = [];
      
      if (user?.id) {
        const { data: userPuppies, error } = await supabase
          .from('puppies')
          .select('*')
          .eq('user_id', user.id)
          .order('name');

        if (!error && userPuppies && userPuppies.length > 0) {
          data = userPuppies;
        }
      }

      // Fallback: get all puppies if user_id filter returned nothing
      if (data.length === 0) {
        const { data: allPuppies, error } = await supabase
          .from('puppies')
          .select('*')
          .order('name');

        if (!error) {
          data = allPuppies || [];
        }
      }

      const formatted = data.map(p => ({
        ...p,
        isOwner: true,
        role: 'owner',
      }));

      setPuppies(formatted);
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
      fetchPuppies();
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete puppy: ' + error.message);
    }
  };

  const handleSetActive = (puppy) => {
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
      </div>

      {puppies.length === 0 ? (
        <div className="bg-white rounded-2xl border border-sand-200/80 shadow-sm p-12 text-center">
          <Dog className="mx-auto text-sand-300 mb-4" size={48} />
          <p className="text-sand-600 font-medium mb-2">No puppies yet</p>
          <p className="text-sand-400 text-sm mb-6">
            Add your first puppy to start tracking their journey
          </p>
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
                <div className="absolute top-3 right-3 flex items-center gap-1 bg-warm-100 text-warm-700 px-2 py-1 rounded-full text-[10px] font-bold">
                  <Crown size={10} />
                  OWNER
                </div>
                
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
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSetActive(puppy)}
                    className="flex-1 py-2 bg-steel-500 text-white rounded-lg hover:bg-steel-600 transition-colors font-semibold text-sm"
                  >
                    View Dashboard
                  </button>
                  <button
                    onClick={() => navigate('/profile')}
                    className="px-3 py-2 border border-sand-200 text-sand-700 rounded-lg hover:bg-sand-50 transition-colors"
                    title="Edit puppy"
                  >
                    <Edit2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
