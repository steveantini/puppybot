import { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { formatDate } from '../utils/helpers';
import { exportHealthPdf } from '../utils/pdfExport';
import Modal from '../components/Modal';
import {
  Syringe,
  Bug,
  Pill,
  Stethoscope,
  Plus,
  Minus,
  Trash2,
  Pencil,
  Calendar,
  Building2,
  ChevronDown,
  ChevronUp,
  FileDown,
  Filter,
  X,
  CheckSquare,
  Square,
} from 'lucide-react';

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

const CATEGORY_OPTIONS = [
  { value: 'all', label: 'All Categories' },
  ...healthCategories.map((c) => ({ value: c.id, label: c.label })),
];

const getCategoryInfo = (catId) =>
  healthCategories.find((c) => c.id === catId) || healthCategories[3];

export default function HealthTracker() {
  const { healthRecords, addHealthRecord, updateHealthRecord, deleteHealthRecord, puppy } = useData();

  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  const [expandedDate, setExpandedDate] = useState(null);
  const [expandAll, setExpandAll] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedDates, setSelectedDates] = useState(new Set());
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);

  // Form state
  const [type, setType] = useState('vaccination');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [clinicName, setClinicName] = useState('');

  const isFiltered = categoryFilter !== 'all';
  const filterLabel = CATEGORY_OPTIONS.find((o) => o.value === categoryFilter)?.label || 'All Categories';

  // Group records by date
  const filteredRecords = useMemo(() => {
    if (categoryFilter === 'all') return healthRecords;
    return healthRecords.filter((r) => r.type === categoryFilter);
  }, [healthRecords, categoryFilter]);

  const recordsByDate = useMemo(() => {
    const map = {};
    filteredRecords.forEach((r) => {
      if (!map[r.date]) map[r.date] = [];
      map[r.date].push(r);
    });
    return map;
  }, [filteredRecords]);

  const sortedDates = useMemo(() => {
    return Object.keys(recordsByDate).sort((a, b) => b.localeCompare(a));
  }, [recordsByDate]);

  // Form helpers
  const resetForm = () => {
    setType('vaccination');
    setDate(new Date().toISOString().split('T')[0]);
    setTitle('');
    setDescription('');
    setNotes('');
    setClinicName('');
    setEditingRecord(null);
  };

  const openAdd = () => { resetForm(); setShowModal(true); };

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

  const closeModal = () => { setShowModal(false); resetForm(); };

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
    if (confirm('Delete this health record?')) deleteHealthRecord(id);
  };

  // Select mode
  const toggleSelect = (d) => {
    setSelectedDates((prev) => {
      const next = new Set(prev);
      next.has(d) ? next.delete(d) : next.add(d);
      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelectedDates(
      selectedDates.size === sortedDates.length ? new Set() : new Set(sortedDates)
    );
  };

  const enterSelectMode = () => {
    setSelectMode(true);
    setSelectedDates(new Set(sortedDates));
  };

  const exitSelectMode = () => {
    setSelectMode(false);
    setSelectedDates(new Set());
  };

  const handleExport = async () => {
    if (selectedDates.size === 0) return;
    const pawPng = await new Promise((resolve) => {
      const svgStr = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#E8BF8E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="4" r="2"/><circle cx="18" cy="8" r="2"/><circle cx="20" cy="16" r="2"/><path d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z"/></svg>`;
      const img = new Image();
      img.onload = () => {
        const c = document.createElement('canvas');
        c.width = 128; c.height = 128;
        c.getContext('2d').drawImage(img, 0, 0, 128, 128);
        resolve(c.toDataURL('image/png'));
      };
      img.onerror = () => resolve(null);
      img.src = `data:image/svg+xml;base64,${btoa(svgStr)}`;
    });

    const selectedRecords = {};
    selectedDates.forEach((d) => {
      if (recordsByDate[d]) selectedRecords[d] = recordsByDate[d];
    });

    exportHealthPdf({
      recordsByDate: selectedRecords,
      puppyName: puppy?.name,
      categoryLabel: filterLabel,
      pawPng,
    });
    setSelectMode(false);
    setSelectedDates(new Set());
  };

  const activeCategory = getCategoryInfo(type);

  if (healthRecords.length === 0) {
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
        <div className="bg-white rounded-2xl border border-sand-200/80 shadow-sm p-12 text-center">
          <Stethoscope className="mx-auto text-sand-300" size={34} />
          <p className="text-sand-500 mt-3 text-sm">No health records yet.</p>
          <p className="text-sand-300 text-xs mt-1">Tap "Add Record" to get started!</p>
        </div>
        {renderFormModal()}
      </div>
    );
  }

  function renderFormModal() {
    return (
      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={editingRecord ? 'Edit Health Record' : 'Add Health Record'}
      >
        <div className="space-y-4">
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
            <label className="block text-xs font-semibold text-sand-500 uppercase tracking-widest mb-1.5">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-sand-200 rounded-xl text-sand-900 focus:outline-none focus:ring-2 focus:ring-steel-300 focus:border-steel-300 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-sand-500 uppercase tracking-widest mb-1.5">Title</label>
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
    );
  }

  return (
    <div className="space-y-3 pb-4">
      {/* Header row */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-xl font-bold text-sand-900">Health Tracker</h2>
        <div className="flex items-center gap-2">
          {/* Category filter dropdown */}
          <div className="relative">
            <button
              onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl border transition-colors shadow-sm ${
                isFiltered
                  ? 'bg-steel-50 text-steel-600 border-steel-200'
                  : 'bg-white text-sand-700 border-sand-200 hover:bg-sand-50'
              }`}
            >
              <Filter size={14} />
              {filterLabel}
              <ChevronDown size={14} className={`transition-transform ${filterDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {filterDropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setFilterDropdownOpen(false)} />
                <div className="absolute right-0 top-full mt-1 bg-white border border-sand-200 rounded-xl shadow-lg z-50 py-1 min-w-[200px]">
                  {CATEGORY_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setCategoryFilter(opt.value);
                        setFilterDropdownOpen(false);
                        setExpandedDate(null);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                        categoryFilter === opt.value
                          ? 'bg-steel-50 text-steel-600 font-semibold'
                          : 'text-sand-700 hover:bg-sand-50'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Add Record */}
          <button
            onClick={openAdd}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-steel-500 rounded-xl hover:bg-steel-600 transition-colors shadow-sm"
          >
            <Plus size={15} /> Add Record
          </button>

          {/* Export / Cancel */}
          {!selectMode ? (
            <button
              onClick={enterSelectMode}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-sand-700 bg-white border border-sand-200 rounded-xl hover:bg-sand-50 transition-colors shadow-sm"
            >
              <FileDown size={15} /> Export PDF
            </button>
          ) : (
            <button
              onClick={exitSelectMode}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-sand-600 bg-sand-100 rounded-xl hover:bg-sand-200 transition-colors"
            >
              <X size={15} /> Cancel
            </button>
          )}
        </div>
      </div>

      {/* Expand / Collapse All */}
      {!selectMode && sortedDates.length > 0 && (
        <div className="flex justify-end">
          <button
            onClick={() => { setExpandAll((prev) => !prev); setExpandedDate(null); }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-sand-600 bg-sand-100 border border-sand-200 rounded-xl hover:bg-sand-200 transition-colors"
          >
            {expandAll ? <Minus size={13} /> : <Plus size={13} />}
            {expandAll ? 'Collapse All' : 'Expand All'}
          </button>
        </div>
      )}

      {/* Active filter indicator */}
      {isFiltered && (
        <div className="text-xs text-sand-400 flex items-center gap-1.5">
          Showing {sortedDates.length} date{sortedDates.length !== 1 ? 's' : ''} with {filterLabel.toLowerCase()} records
          <button
            onClick={() => { setCategoryFilter('all'); setExpandedDate(null); }}
            className="text-steel-500 hover:text-steel-600 font-semibold underline ml-1"
          >
            Clear filter
          </button>
        </div>
      )}

      {/* Selection toolbar */}
      {selectMode && (
        <div className="bg-steel-50 border border-steel-200 rounded-2xl px-4 py-3 flex items-center justify-between flex-wrap gap-2 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSelectAll}
              className="flex items-center gap-1.5 text-sm font-semibold text-steel-700 hover:text-steel-800 transition-colors"
            >
              {selectedDates.size === sortedDates.length ? <CheckSquare size={16} /> : <Square size={16} />}
              {selectedDates.size === sortedDates.length ? 'Deselect All' : 'Select All'}
            </button>
            <span className="text-xs text-steel-500 font-medium">
              {selectedDates.size} of {sortedDates.length} selected
            </span>
          </div>
          <button
            onClick={handleExport}
            disabled={selectedDates.size === 0}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-semibold rounded-xl transition-colors ${
              selectedDates.size > 0
                ? 'bg-steel-500 text-white hover:bg-steel-600 shadow-sm'
                : 'bg-steel-200 text-steel-400 cursor-not-allowed'
            }`}
          >
            <FileDown size={14} /> Download PDF
          </button>
        </div>
      )}

      {/* Empty filtered state */}
      {sortedDates.length === 0 && isFiltered && (
        <div className="bg-white rounded-2xl border border-sand-200/80 shadow-sm p-10 text-center">
          <Stethoscope className="mx-auto text-sand-300" size={28} />
          <p className="text-sand-500 mt-3 text-sm">No records with {filterLabel.toLowerCase()} data.</p>
        </div>
      )}

      {/* Date-grouped records */}
      {sortedDates.map((d) => {
        const records = recordsByDate[d];
        const isExpanded = isFiltered || expandAll || expandedDate === d;
        const isSelected = selectedDates.has(d);
        const typeCounts = {};
        records.forEach((r) => {
          typeCounts[r.type] = (typeCounts[r.type] || 0) + 1;
        });

        return (
          <div
            key={d}
            className={`bg-white rounded-2xl border overflow-hidden transition-all shadow-sm ${
              selectMode && isSelected
                ? 'border-steel-300 ring-1 ring-steel-200'
                : 'border-sand-200/80'
            }`}
          >
            {/* Date header row */}
            <div className="flex items-center">
              {selectMode && (
                <button
                  onClick={() => toggleSelect(d)}
                  className="pl-4 pr-1 py-4 text-steel-500 hover:text-steel-600 transition-colors shrink-0"
                >
                  {isSelected ? <CheckSquare size={18} /> : <Square size={18} className="text-sand-300" />}
                </button>
              )}
              <button
                onClick={() => !selectMode && !isFiltered && !expandAll && setExpandedDate(isExpanded ? null : d)}
                className={`flex-1 px-5 py-4 flex items-center justify-between transition-colors ${
                  selectMode || isFiltered || expandAll ? 'cursor-default' : 'hover:bg-sand-50/50'
                } ${selectMode ? 'pl-2' : ''}`}
              >
                <div className="text-left">
                  <div className="font-semibold text-sand-900 text-sm">{formatDate(d)}</div>
                  {!isFiltered && (
                    <div className="flex gap-3 mt-1 text-xs text-sand-400 flex-wrap">
                      {Object.entries(typeCounts).map(([typeId, count]) => {
                        const cat = getCategoryInfo(typeId);
                        const Icon = cat.icon;
                        return (
                          <span key={typeId} className="flex items-center gap-1">
                            <Icon size={11} className={cat.color} /> {count}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
                {!selectMode && !isFiltered && !expandAll && (
                  isExpanded ? <ChevronUp size={16} className="text-sand-400" /> : <ChevronDown size={16} className="text-sand-400" />
                )}
              </button>
            </div>

            {/* Expanded content */}
            {isExpanded && !selectMode && (
              <div className="border-t border-sand-100 px-5 py-4 space-y-3">
                {records
                  .sort((a, b) => (a.title || '').localeCompare(b.title || ''))
                  .map((record) => {
                    const catInfo = getCategoryInfo(record.type);
                    const Icon = catInfo.icon;
                    return (
                      <div key={record.id} className="flex items-start gap-3 group">
                        <div className={`p-2 rounded-xl ${catInfo.bgColor} ${catInfo.color} shrink-0 mt-0.5`}>
                          <Icon size={14} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-sand-900 text-sm">{record.title}</span>
                            <span className="text-[10px] text-sand-500 bg-sand-100 px-2 py-0.5 rounded-md font-semibold uppercase tracking-wider">
                              {catInfo.label}
                            </span>
                          </div>
                          {record.clinic_name && (
                            <div className="flex items-center gap-1 mt-0.5 text-xs text-steel-500">
                              <Building2 size={10} /> {record.clinic_name}
                            </div>
                          )}
                          {record.description && (
                            <p className="text-sm text-sand-700 mt-1 leading-relaxed">{record.description}</p>
                          )}
                          {record.notes && (
                            <p className="text-xs text-sand-400 mt-0.5 italic">{record.notes}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-0.5 shrink-0">
                          <button
                            onClick={() => openEdit(record)}
                            className="p-1 text-sand-300 hover:text-steel-500 transition-colors"
                            title="Edit"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            onClick={() => handleDelete(record.id)}
                            className="p-1 text-sand-300 hover:text-rose-400 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        );
      })}

      {renderFormModal()}
    </div>
  );
}
