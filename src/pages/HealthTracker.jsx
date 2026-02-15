import { useState } from 'react';
import { useData } from '../context/DataContext';
import {
  Syringe,
  Stethoscope,
  Pill,
  Plus,
  Trash2,
  Calendar,
} from 'lucide-react';
import Modal from '../components/Modal';

const healthTypes = [
  {
    id: 'immunization',
    label: 'Immunization',
    icon: Syringe,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-50',
  },
  {
    id: 'vet_visit',
    label: 'Vet Visit',
    icon: Stethoscope,
    color: 'text-sky-500',
    bgColor: 'bg-sky-50',
  },
  {
    id: 'medication',
    label: 'Medication',
    icon: Pill,
    color: 'text-amber-500',
    bgColor: 'bg-amber-50',
  },
];

export default function HealthTracker() {
  const { healthRecords, addHealthRecord, deleteHealthRecord } = useData();
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('all');

  const [type, setType] = useState('immunization');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');

  const handleSave = () => {
    if (!title.trim()) return;
    addHealthRecord({
      type,
      date,
      title: title.trim(),
      description: description.trim(),
      notes: notes.trim(),
    });
    setTitle('');
    setDescription('');
    setNotes('');
    setShowModal(false);
  };

  const filtered =
    filter === 'all'
      ? healthRecords
      : healthRecords.filter((r) => r.type === filter);

  const sorted = [...filtered].sort((a, b) => b.date.localeCompare(a.date));

  const getTypeInfo = (typeId) =>
    healthTypes.find((t) => t.id === typeId) || healthTypes[0];

  return (
    <div className="space-y-4 pb-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-stone-800">Health Tracker</h2>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-sky-500 rounded-xl hover:bg-sky-600 transition-colors shadow-sm"
        >
          <Plus size={16} /> Add Record
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all whitespace-nowrap ${
            filter === 'all'
              ? 'bg-stone-800 text-white border-stone-800'
              : 'bg-white border-stone-200 text-stone-500'
          }`}
        >
          All
        </button>
        {healthTypes.map((ht) => (
          <button
            key={ht.id}
            onClick={() => setFilter(ht.id)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all whitespace-nowrap ${
              filter === ht.id
                ? 'bg-stone-800 text-white border-stone-800'
                : 'bg-white border-stone-200 text-stone-500'
            }`}
          >
            {ht.label}
          </button>
        ))}
      </div>

      {/* Records */}
      {sorted.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-8 text-center">
          <Stethoscope className="mx-auto text-stone-300" size={36} />
          <p className="text-stone-400 mt-3">No health records yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {sorted.map((record) => {
            const typeInfo = getTypeInfo(record.type);
            const Icon = typeInfo.icon;
            return (
              <div
                key={record.id}
                className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4 group"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-xl ${typeInfo.bgColor} ${typeInfo.color}`}
                  >
                    <Icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-stone-800 text-sm">
                        {record.title}
                      </h4>
                      <span className="text-[10px] text-stone-400 bg-stone-50 px-1.5 py-0.5 rounded">
                        {typeInfo.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mt-0.5 text-xs text-stone-400">
                      <Calendar size={11} />
                      {new Date(
                        record.date + 'T12:00:00'
                      ).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </div>
                    {record.description && (
                      <p className="text-sm text-stone-600 mt-1.5">
                        {record.description}
                      </p>
                    )}
                    {record.notes && (
                      <p className="text-xs text-stone-400 mt-1 italic">
                        {record.notes}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => deleteHealthRecord(record.id)}
                    className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 p-1.5 text-stone-300 hover:text-rose-400 transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Add Health Record"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1.5">
              Type
            </label>
            <div className="flex gap-2">
              {healthTypes.map((ht) => (
                <button
                  key={ht.id}
                  onClick={() => setType(ht.id)}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-medium border transition-all ${
                    type === ht.id
                      ? 'bg-sky-50 text-sky-600 border-sky-300'
                      : 'bg-white border-stone-200 text-stone-400'
                  }`}
                >
                  {ht.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:ring-2 focus:ring-sky-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., DHPP Vaccine, Annual Checkup..."
              className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-stone-800 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-sky-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Details about the record..."
              rows={2}
              className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-stone-800 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-sky-300 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1">
              Notes (optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes..."
              className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-stone-800 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-sky-300"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={!title.trim()}
            className={`w-full py-3 font-semibold rounded-xl transition-colors ${
              title.trim()
                ? 'bg-sky-500 hover:bg-sky-600 text-white'
                : 'bg-stone-100 text-stone-300 cursor-not-allowed'
            }`}
          >
            Save Record
          </button>
        </div>
      </Modal>
    </div>
  );
}
