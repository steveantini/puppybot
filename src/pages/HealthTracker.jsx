import { useState } from 'react';
import { useData } from '../context/DataContext';
import {
  Syringe,
  Bug,
  Pill,
  Stethoscope,
  Plus,
  Trash2,
  Pencil,
  Calendar,
  Building2,
} from 'lucide-react';
import Modal from '../components/Modal';

const healthCategories = [
  {
    id: 'vaccination',
    label: 'Vaccination',
    icon: Syringe,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-300',
    activeText: 'text-emerald-600',
    activeBg: 'bg-emerald-50',
    placeholder: 'e.g., DHPP #2, Rabies, Bordetella...',
  },
  {
    id: 'parasite_prevention',
    label: 'Parasite Prevention',
    icon: Bug,
    color: 'text-amber-500',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-300',
    activeText: 'text-amber-600',
    activeBg: 'bg-amber-50',
    placeholder: 'e.g., Heartgard, NexGard, Panacur...',
  },
  {
    id: 'medication',
    label: 'Medication',
    icon: Pill,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-300',
    activeText: 'text-blue-600',
    activeBg: 'bg-blue-50',
    placeholder: 'e.g., Amoxicillin, Metronidazole...',
  },
  {
    id: 'general',
    label: 'General',
    icon: Stethoscope,
    color: 'text-steel-500',
    bgColor: 'bg-steel-50',
    borderColor: 'border-steel-300',
    activeText: 'text-steel-600',
    activeBg: 'bg-steel-50',
    placeholder: 'e.g., Annual checkup, Weight check...',
  },
];

export default function HealthTracker() {
  const { healthRecords, addHealthRecord, updateHealthRecord, deleteHealthRecord } = useData();
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [filter, setFilter] = useState('all');

  const [type, setType] = useState('vaccination');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [clinicName, setClinicName] = useState('');

  const resetForm = () => {
    setType('vaccination');
    setDate(new Date().toISOString().split('T')[0]);
    setTitle('');
    setDescription('');
    setNotes('');
    setClinicName('');
    setEditingRecord(null);
  };

  const openAdd = () => {
    resetForm();
    setShowModal(true);
  };

  const openEdit = (record) => {
    setEditingRecord(record);
    setType(record.type);
    setDate(record.date);
    setTitle(record.title);
    setDescription(record.description || '');
    setNotes(record.notes || '');
    setClinicName(record.clinic_name || '');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleSave = () => {
    if (!title.trim()) return;
    const data = {
      type,
      date,
      title: title.trim(),
      description: description.trim(),
      notes: notes.trim(),
      clinic_name: clinicName.trim(),
    };
    if (editingRecord) {
      updateHealthRecord(editingRecord.id, data);
    } else {
      addHealthRecord(data);
    }
    closeModal();
  };

  const handleDelete = (id) => {
    if (confirm('Delete this health record?')) {
      deleteHealthRecord(id);
    }
  };

  const filtered =
    filter === 'all'
      ? healthRecords
      : healthRecords.filter((r) => r.type === filter);

  const sorted = [...filtered].sort((a, b) => b.date.localeCompare(a.date));

  const getCategoryInfo = (catId) =>
    healthCategories.find((c) => c.id === catId) || healthCategories[3];

  const activeCategory = getCategoryInfo(type);

  return (
    <div className="space-y-4 pb-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-sand-900">Health Tracker</h2>
        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-steel-500 rounded-xl hover:bg-steel-600 transition-colors shadow-sm"
        >
          <Plus size={15} /> Add Record
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all whitespace-nowrap ${
            filter === 'all'
              ? 'bg-sand-900 text-white border-sand-900'
              : 'bg-white border-sand-200 text-sand-500 hover:border-sand-300'
          }`}
        >
          All
        </button>
        {healthCategories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setFilter(cat.id)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all whitespace-nowrap ${
              filter === cat.id
                ? 'bg-sand-900 text-white border-sand-900'
                : 'bg-white border-sand-200 text-sand-500 hover:border-sand-300'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Records */}
      {sorted.length === 0 ? (
        <div className="bg-white rounded-2xl border border-sand-200/80 shadow-sm p-12 text-center">
          <Stethoscope className="mx-auto text-sand-300" size={34} />
          <p className="text-sand-500 mt-3 text-sm">No health records yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {sorted.map((record) => {
            const catInfo = getCategoryInfo(record.type);
            const Icon = catInfo.icon;
            return (
              <div
                key={record.id}
                className="bg-white rounded-2xl border border-sand-200/80 shadow-sm p-4 group hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2.5 rounded-xl ${catInfo.bgColor} ${catInfo.color}`}
                  >
                    <Icon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-sand-900 text-sm">
                        {record.title}
                      </h4>
                      <span className="text-[10px] text-sand-500 bg-sand-100 px-2 py-0.5 rounded-md font-semibold uppercase tracking-wider">
                        {catInfo.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-xs text-sand-400">
                      <Calendar size={10} />
                      {new Date(
                        record.date + 'T12:00:00'
                      ).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </div>
                    {record.clinic_name && (
                      <div className="flex items-center gap-1 mt-1 text-xs text-steel-500">
                        <Building2 size={10} />
                        {record.clinic_name}
                      </div>
                    )}
                    {record.description && (
                      <p className="text-sm text-sand-700 mt-1.5 leading-relaxed">
                        {record.description}
                      </p>
                    )}
                    {record.notes && (
                      <p className="text-xs text-sand-400 mt-1 italic">
                        {record.notes}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-0.5 shrink-0">
                    <button
                      onClick={() => openEdit(record)}
                      className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 p-1.5 text-sand-300 hover:text-steel-500 transition-all"
                      title="Edit"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(record.id)}
                      className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 p-1.5 text-sand-300 hover:text-rose-400 transition-all"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={editingRecord ? 'Edit Health Record' : 'Add Health Record'}
      >
        <div className="space-y-4">
          {/* Category selector */}
          <div>
            <label className="block text-xs font-semibold text-sand-500 uppercase tracking-widest mb-2">
              Category
            </label>
            <div className="grid grid-cols-2 gap-2">
              {healthCategories.map((cat) => {
                const CatIcon = cat.icon;
                const isActive = type === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setType(cat.id)}
                    className={`flex items-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all ${
                      isActive
                        ? `${cat.activeBg} ${cat.activeText} ${cat.borderColor}`
                        : 'bg-white border-sand-200 text-sand-400 hover:border-sand-300'
                    }`}
                  >
                    <CatIcon size={14} />
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-sand-500 uppercase tracking-widest mb-1.5">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-sand-200 rounded-xl text-sand-900 focus:outline-none focus:ring-2 focus:ring-steel-300 focus:border-steel-300 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-sand-500 uppercase tracking-widest mb-1.5">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={activeCategory.placeholder}
              className="w-full px-3.5 py-2.5 border border-sand-200 rounded-xl text-sand-900 placeholder:text-sand-300 focus:outline-none focus:ring-2 focus:ring-steel-300 focus:border-steel-300 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-sand-500 uppercase tracking-widest mb-1.5">
              Clinic / Vet Name
              <span className="ml-1 text-sand-300 normal-case tracking-normal">(optional)</span>
            </label>
            <div className="relative">
              <Building2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-sand-300" />
              <input
                type="text"
                value={clinicName}
                onChange={(e) => setClinicName(e.target.value)}
                placeholder="e.g., Happy Paws Vet Clinic"
                className="w-full pl-9 pr-3.5 py-2.5 border border-sand-200 rounded-xl text-sand-900 placeholder:text-sand-300 focus:outline-none focus:ring-2 focus:ring-steel-300 focus:border-steel-300 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-sand-500 uppercase tracking-widest mb-1.5">
              Description
              <span className="ml-1 text-sand-300 normal-case tracking-normal">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Details about the record..."
              rows={2}
              className="w-full px-3.5 py-2.5 border border-sand-200 rounded-xl text-sand-900 placeholder:text-sand-300 focus:outline-none focus:ring-2 focus:ring-steel-300 focus:border-steel-300 transition-colors resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-sand-500 uppercase tracking-widest mb-1.5">
              Notes
              <span className="ml-1 text-sand-300 normal-case tracking-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes..."
              className="w-full px-3.5 py-2.5 border border-sand-200 rounded-xl text-sand-900 placeholder:text-sand-300 focus:outline-none focus:ring-2 focus:ring-steel-300 focus:border-steel-300 transition-colors"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={!title.trim()}
            className={`w-full py-3 font-semibold rounded-xl transition-colors ${
              title.trim()
                ? 'bg-steel-500 hover:bg-steel-600 text-white shadow-sm'
                : 'bg-sand-100 text-sand-300 cursor-not-allowed'
            }`}
          >
            {editingRecord ? 'Update Record' : 'Save Record'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
