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
    color: 'text-steel-500',
    bgColor: 'bg-steel-50',
  },
  {
    id: 'medication',
    label: 'Medication',
    icon: Pill,
    color: 'text-amber-600',
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
        <h2 className="text-lg font-semibold text-sand-800 tracking-tight">Health Tracker</h2>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-white bg-steel-500 rounded-lg hover:bg-steel-600 transition-colors"
        >
          <Plus size={15} /> Add Record
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all whitespace-nowrap ${
            filter === 'all'
              ? 'bg-sand-800 text-white border-sand-800'
              : 'bg-white border-sand-200 text-sand-500 hover:border-sand-300'
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
                ? 'bg-sand-800 text-white border-sand-800'
                : 'bg-white border-sand-200 text-sand-500 hover:border-sand-300'
            }`}
          >
            {ht.label}
          </button>
        ))}
      </div>

      {/* Records */}
      {sorted.length === 0 ? (
        <div className="bg-white rounded-xl border border-sand-200/70 p-10 text-center">
          <Stethoscope className="mx-auto text-sand-300" size={34} />
          <p className="text-sand-400 mt-3 text-sm">No health records yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {sorted.map((record) => {
            const typeInfo = getTypeInfo(record.type);
            const Icon = typeInfo.icon;
            return (
              <div
                key={record.id}
                className="bg-white rounded-xl border border-sand-200/70 p-4 group"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-lg ${typeInfo.bgColor} ${typeInfo.color}`}
                  >
                    <Icon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-medium text-sand-800 text-sm">
                        {record.title}
                      </h4>
                      <span className="text-[10px] text-sand-400 bg-sand-100 px-1.5 py-0.5 rounded font-medium">
                        {typeInfo.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mt-0.5 text-xs text-sand-400">
                      <Calendar size={10} />
                      {new Date(
                        record.date + 'T12:00:00'
                      ).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </div>
                    {record.description && (
                      <p className="text-sm text-sand-600 mt-1.5 leading-relaxed">
                        {record.description}
                      </p>
                    )}
                    {record.notes && (
                      <p className="text-xs text-sand-400 mt-1 italic">
                        {record.notes}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => deleteHealthRecord(record.id)}
                    className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 p-1.5 text-sand-300 hover:text-rose-400 transition-all"
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
            <label className="block text-[11px] font-semibold text-sand-400 uppercase tracking-wide mb-2">
              Type
            </label>
            <div className="flex gap-2">
              {healthTypes.map((ht) => (
                <button
                  key={ht.id}
                  onClick={() => setType(ht.id)}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-medium border transition-all ${
                    type === ht.id
                      ? 'bg-steel-50 text-steel-600 border-steel-300'
                      : 'bg-white border-sand-200 text-sand-400 hover:border-sand-300'
                  }`}
                >
                  {ht.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-sand-400 uppercase tracking-wide mb-1.5">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2.5 border border-sand-200 rounded-lg text-sand-800 focus:outline-none focus:ring-2 focus:ring-steel-300 focus:border-steel-300 transition-colors"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-sand-400 uppercase tracking-wide mb-1.5">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., DHPP Vaccine, Annual Checkup..."
              className="w-full px-3 py-2.5 border border-sand-200 rounded-lg text-sand-800 placeholder:text-sand-300 focus:outline-none focus:ring-2 focus:ring-steel-300 focus:border-steel-300 transition-colors"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-sand-400 uppercase tracking-wide mb-1.5">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Details about the record..."
              rows={2}
              className="w-full px-3 py-2.5 border border-sand-200 rounded-lg text-sand-800 placeholder:text-sand-300 focus:outline-none focus:ring-2 focus:ring-steel-300 focus:border-steel-300 transition-colors resize-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-sand-400 uppercase tracking-wide mb-1.5">
              Notes (optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes..."
              className="w-full px-3 py-2.5 border border-sand-200 rounded-lg text-sand-800 placeholder:text-sand-300 focus:outline-none focus:ring-2 focus:ring-steel-300 focus:border-steel-300 transition-colors"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={!title.trim()}
            className={`w-full py-2.5 font-medium rounded-lg transition-colors ${
              title.trim()
                ? 'bg-steel-500 hover:bg-steel-600 text-white'
                : 'bg-sand-100 text-sand-300 cursor-not-allowed'
            }`}
          >
            Save Record
          </button>
        </div>
      </Modal>
    </div>
  );
}
