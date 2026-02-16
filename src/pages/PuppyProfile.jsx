import { useState } from 'react';
import { useData } from '../context/DataContext';
import { Camera, Plus, Scale, Dog } from 'lucide-react';
import Modal from '../components/Modal';

export default function PuppyProfile() {
  const { puppy, updatePuppy, addWeightEntry } = useData();
  const [isEditing, setIsEditing] = useState(!puppy?.name);
  const [showWeightModal, setShowWeightModal] = useState(false);

  const [name, setName] = useState(puppy?.name || '');
  const [breed, setBreed] = useState(puppy?.breed || '');
  const [birthday, setBirthday] = useState(puppy?.birthday || '');
  const [photoUrl, setPhotoUrl] = useState(puppy?.photoUrl || '');

  const [weightDate, setWeightDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [weightValue, setWeightValue] = useState('');

  const handleSaveProfile = () => {
    updatePuppy({ name, breed, birthday, photoUrl });
    setIsEditing(false);
  };

  const handleAddWeight = () => {
    if (!weightValue) return;
    addWeightEntry({ date: weightDate, weight: parseFloat(weightValue) });
    setWeightValue('');
    setShowWeightModal(false);
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result);
        if (!isEditing) {
          updatePuppy({ ...puppy, photoUrl: reader.result });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const calculateAge = (bday) => {
    if (!bday) return '';
    const birth = new Date(bday + 'T12:00:00');
    const now = new Date();
    const months =
      (now.getFullYear() - birth.getFullYear()) * 12 +
      (now.getMonth() - birth.getMonth());
    if (months < 1) {
      const days = Math.floor((now - birth) / (1000 * 60 * 60 * 24));
      return `${days} day${days !== 1 ? 's' : ''} old`;
    }
    if (months < 12)
      return `${months} month${months !== 1 ? 's' : ''} old`;
    const years = Math.floor(months / 12);
    const rem = months % 12;
    return `${years} yr${years !== 1 ? 's' : ''}${rem > 0 ? ` ${rem} mo` : ''} old`;
  };

  const sortedWeights = [...(puppy?.weightLog || [])].sort((a, b) =>
    a.date.localeCompare(b.date)
  );

  return (
    <div className="space-y-4 pb-4">
      <h2 className="text-xl font-bold text-sand-900">Puppy Profile</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Photo & Basic Info */}
        <div className="bg-white rounded-2xl border border-sand-200/80 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-br from-steel-50 to-sand-100 p-8 flex flex-col items-center">
            <div className="relative">
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt={name}
                  className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-lg"
                />
              ) : (
                <div className="w-28 h-28 rounded-full bg-white border-4 border-white shadow-lg flex items-center justify-center">
                  <Dog size={38} className="text-sand-300" />
                </div>
              )}
              <label className="absolute bottom-0 right-0 w-9 h-9 bg-steel-500 rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:bg-steel-600 transition-colors">
                <Camera size={14} className="text-white" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
            </div>
            {!isEditing && puppy?.name && (
              <div className="mt-4 text-center">
                <h3 className="text-2xl font-bold text-sand-900">
                  {puppy.name}
                </h3>
                {puppy.breed && (
                  <p className="text-sm text-sand-600 mt-0.5">{puppy.breed}</p>
                )}
                {puppy.birthday && (
                  <p className="text-xs text-sand-400 mt-1">
                    {calculateAge(puppy.birthday)}
                  </p>
                )}
              </div>
            )}
          </div>

          {isEditing ? (
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-sand-500 uppercase tracking-widest mb-1.5">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Puppy's name"
                  className="w-full px-3.5 py-2.5 border border-sand-200 rounded-xl text-sand-900 placeholder:text-sand-300 focus:outline-none focus:ring-2 focus:ring-steel-300 focus:border-steel-300 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-sand-500 uppercase tracking-widest mb-1.5">
                  Breed
                </label>
                <input
                  type="text"
                  value={breed}
                  onChange={(e) => setBreed(e.target.value)}
                  placeholder="e.g., Golden Retriever"
                  className="w-full px-3.5 py-2.5 border border-sand-200 rounded-xl text-sand-900 placeholder:text-sand-300 focus:outline-none focus:ring-2 focus:ring-steel-300 focus:border-steel-300 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-sand-500 uppercase tracking-widest mb-1.5">
                  Birthday
                </label>
                <input
                  type="date"
                  value={birthday}
                  onChange={(e) => setBirthday(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-sand-200 rounded-xl text-sand-900 focus:outline-none focus:ring-2 focus:ring-steel-300 focus:border-steel-300 transition-colors"
                />
              </div>
              <button
                onClick={handleSaveProfile}
                className="w-full py-3 bg-steel-500 hover:bg-steel-600 text-white font-semibold rounded-xl transition-colors shadow-sm"
              >
                Save Profile
              </button>
            </div>
          ) : (
            <div className="p-5">
              <button
                onClick={() => setIsEditing(true)}
                className="w-full py-2.5 border border-sand-200 text-sand-700 font-semibold rounded-xl hover:bg-sand-50 transition-colors text-sm"
              >
                Edit Profile
              </button>
            </div>
          )}
        </div>

        {/* Weight Log */}
        <div className="bg-white rounded-2xl border border-sand-200/80 shadow-sm overflow-hidden h-fit">
          <div className="px-5 py-3.5 border-b border-sand-100 flex items-center justify-between">
            <h3 className="text-xs font-semibold text-sand-500 flex items-center gap-2 uppercase tracking-widest">
              <Scale size={14} className="text-sand-400" />
              Weight Log
            </h3>
            <button
              onClick={() => setShowWeightModal(true)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-steel-600 bg-steel-50 rounded-lg hover:bg-steel-100 transition-colors"
            >
              <Plus size={13} /> Add
            </button>
          </div>

          {sortedWeights.length === 0 ? (
            <div className="p-10 text-center text-sand-400 text-sm">
              No weight entries yet.
            </div>
          ) : (
            <div className="divide-y divide-sand-100">
              {[...sortedWeights].reverse().map((entry) => (
                <div
                  key={entry.id}
                  className="px-5 py-3.5 flex items-center justify-between hover:bg-sand-50/50 transition-colors"
                >
                  <span className="text-sm text-sand-500">
                    {new Date(entry.date + 'T12:00:00').toLocaleDateString(
                      'en-US',
                      {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      }
                    )}
                  </span>
                  <span className="font-semibold text-sand-900">
                    {entry.weight} lbs
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={showWeightModal}
        onClose={() => setShowWeightModal(false)}
        title="Add Weight Entry"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-sand-500 uppercase tracking-widest mb-1.5">
              Date
            </label>
            <input
              type="date"
              value={weightDate}
              onChange={(e) => setWeightDate(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-sand-200 rounded-xl text-sand-900 focus:outline-none focus:ring-2 focus:ring-steel-300 focus:border-steel-300 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-sand-500 uppercase tracking-widest mb-1.5">
              Weight (lbs)
            </label>
            <input
              type="number"
              step="0.1"
              value={weightValue}
              onChange={(e) => setWeightValue(e.target.value)}
              placeholder="e.g., 12.5"
              className="w-full px-3.5 py-2.5 border border-sand-200 rounded-xl text-sand-900 placeholder:text-sand-300 focus:outline-none focus:ring-2 focus:ring-steel-300 focus:border-steel-300 transition-colors"
            />
          </div>
          <button
            onClick={handleAddWeight}
            disabled={!weightValue}
            className={`w-full py-3 font-semibold rounded-xl transition-colors ${
              weightValue
                ? 'bg-steel-500 hover:bg-steel-600 text-white shadow-sm'
                : 'bg-sand-100 text-sand-300 cursor-not-allowed'
            }`}
          >
            Save Weight
          </button>
        </div>
      </Modal>
    </div>
  );
}
