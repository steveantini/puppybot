import { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { formatDate, formatTime } from '../utils/helpers';
import { exportHistoryPdf } from '../utils/pdfExport';
import Modal from '../components/Modal';
import PottyForm from '../components/forms/PottyForm';
import MealForm from '../components/forms/MealForm';
import NapForm from '../components/forms/NapForm';
import SkillsNotesForm from '../components/forms/SkillsNotesForm';
import {
  ChevronDown,
  ChevronUp,
  Droplets,
  UtensilsCrossed,
  Moon,
  Sun,
  BedDouble,
  CalendarDays,
  FileDown,
  X,
  CheckSquare,
  Square,
  PenLine,
  Filter,
  Plus,
  Minus,
  Trash2,
  Pencil,
} from 'lucide-react';

const CATEGORY_OPTIONS = [
  { value: 'all', label: 'All Categories' },
  { value: 'schedule', label: 'Schedule' },
  { value: 'potty', label: 'Potty Breaks' },
  { value: 'meals', label: 'Meals' },
  { value: 'naps', label: 'Naps' },
  { value: 'skills', label: 'Skills' },
  { value: 'notes', label: 'Notes' },
];

function dateHasCategory(log, category) {
  if (!log) return false;
  switch (category) {
    case 'schedule':
      return (log.wakeUpTimes?.length > 0) || !!log.bedTime;
    case 'potty':
      return log.pottyBreaks?.length > 0;
    case 'meals':
      return log.meals?.length > 0;
    case 'naps':
      return log.naps?.length > 0;
    case 'skills':
      return !!log.skills;
    case 'notes':
      return !!log.notes;
    default:
      return true;
  }
}

function DeleteBtn({ onClick }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className="p-1 text-sand-300 hover:text-rose-400 transition-colors shrink-0"
      title="Delete"
    >
      <Trash2 size={13} />
    </button>
  );
}

function EditBtn({ onClick }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className="p-1 text-sand-300 hover:text-steel-500 transition-colors shrink-0"
      title="Edit"
    >
      <Pencil size={13} />
    </button>
  );
}

export default function History() {
  const {
    allLogs, puppy,
    deletePottyBreak, deleteMeal, deleteNap, deleteWakeUpTime, clearBedTime,
    updateDayLog,
  } = useData();

  const [expandedDate, setExpandedDate] = useState(null);
  const [expandAll, setExpandAll] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedDates, setSelectedDates] = useState(new Set());
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);

  // Edit modal state
  const [editModal, setEditModal] = useState(null);

  const openEdit = (type, data, date) => setEditModal({ type, data, date });
  const closeEdit = () => setEditModal(null);

  const allSortedDates = useMemo(() => {
    return Object.keys(allLogs).sort((a, b) => b.localeCompare(a));
  }, [allLogs]);

  const sortedDates = useMemo(() => {
    if (categoryFilter === 'all') return allSortedDates;
    return allSortedDates.filter((date) => dateHasCategory(allLogs[date], categoryFilter));
  }, [allSortedDates, allLogs, categoryFilter]);

  const isFiltered = categoryFilter !== 'all';
  const filterLabel = CATEGORY_OPTIONS.find((o) => o.value === categoryFilter)?.label || 'All Categories';

  const toggleSelect = (date) => {
    setSelectedDates((prev) => {
      const next = new Set(prev);
      if (next.has(date)) {
        next.delete(date);
      } else {
        next.add(date);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedDates.size === sortedDates.length) {
      setSelectedDates(new Set());
    } else {
      setSelectedDates(new Set(sortedDates));
    }
  };

  const handleExport = () => {
    if (selectedDates.size === 0) return;
    exportHistoryPdf(allLogs, selectedDates, puppy?.name);
    setSelectMode(false);
    setSelectedDates(new Set());
  };

  const enterSelectMode = () => {
    setSelectMode(true);
    setSelectedDates(new Set(sortedDates));
  };

  const exitSelectMode = () => {
    setSelectMode(false);
    setSelectedDates(new Set());
  };

  const handleDeleteConfirm = (action) => {
    if (confirm('Delete this entry?')) action();
  };

  if (allSortedDates.length === 0) {
    return (
      <div className="space-y-4 pb-4">
        <h2 className="text-xl font-bold text-sand-900">History</h2>
        <div className="bg-white rounded-2xl border border-sand-200/80 shadow-sm p-12 text-center">
          <CalendarDays className="mx-auto text-sand-300" size={36} />
          <p className="text-sand-500 mt-3 text-sm">No logs recorded yet.</p>
          <p className="text-sand-300 text-xs mt-1">
            Start logging on the Dashboard!
          </p>
        </div>
      </div>
    );
  }

  const renderSchedule = (log, date) => {
    if (!log.wakeUpTimes?.length && !log.bedTime) return null;
    return (
      <div>
        <h4 className="text-xs font-semibold text-sand-500 uppercase tracking-widest mb-2">Schedule</h4>
        {log.wakeUpTimes?.map((w, i) => (
          <div key={i} className="flex items-center gap-2 text-sm text-sand-800 mb-1 group">
            {w.label === 'Night Wake' ? (
              <Moon size={13} className="text-steel-500" />
            ) : (
              <Sun size={13} className="text-warm-500" />
            )}
            <span className="flex-1">
              {w.label || 'Wake Up'}: {formatTime(w.time)}
              {w.notes && <span className="text-xs text-sand-400 italic ml-1">— {w.notes}</span>}
            </span>
            <DeleteBtn onClick={() => handleDeleteConfirm(() => deleteWakeUpTime(w.id, date))} />
          </div>
        ))}
        {log.bedTime && (
          <div className="flex items-center gap-2 text-sm text-sand-800 group">
            <BedDouble size={13} className="text-steel-500" />
            <span className="flex-1">Bed Time: {formatTime(log.bedTime)}</span>
            <DeleteBtn onClick={() => handleDeleteConfirm(() => clearBedTime(date))} />
          </div>
        )}
      </div>
    );
  };

  const renderPotty = (log, date) => {
    if (!log.pottyBreaks?.length) return null;
    return (
      <div>
        <h4 className="text-xs font-semibold text-sand-500 uppercase tracking-widest mb-2">Potty Breaks</h4>
        <div className="space-y-1.5">
          {log.pottyBreaks.map((p, i) => (
            <div key={i} className="flex items-center gap-2 text-sm flex-wrap group">
              <Droplets size={13} className="text-steel-400" />
              <span className="text-sand-500 w-16 shrink-0">{formatTime(p.time)}</span>
              {p.pee === 'good' && <span className="text-emerald-600 text-xs bg-emerald-50 px-1.5 py-0.5 rounded-md font-medium">Pee ✓</span>}
              {p.pee === 'accident' && <span className="text-rose-500 text-xs bg-rose-50 px-1.5 py-0.5 rounded-md font-medium">Pee ✗</span>}
              {p.poop === 'good' && <span className="text-emerald-600 text-xs bg-emerald-50 px-1.5 py-0.5 rounded-md font-medium">Poop ✓</span>}
              {p.poop === 'accident' && <span className="text-rose-500 text-xs bg-rose-50 px-1.5 py-0.5 rounded-md font-medium">Poop ✗</span>}
              {p.ringBell && <span className="text-steel-500 text-xs bg-steel-50 px-1.5 py-0.5 rounded-md font-medium">Bell 🔔</span>}
              <span className="ml-auto flex items-center gap-0.5">
                <EditBtn onClick={() => openEdit('potty', p, date)} />
                <DeleteBtn onClick={() => handleDeleteConfirm(() => deletePottyBreak(p.id, date))} />
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderMeals = (log, date) => {
    if (!log.meals?.length) return null;
    return (
      <div>
        <h4 className="text-xs font-semibold text-sand-500 uppercase tracking-widest mb-2">Meals</h4>
        <div className="space-y-1.5">
          {log.meals.map((m, i) => (
            <div key={i} className="text-sm text-sand-800 group">
              <div className="flex items-center gap-2">
                <UtensilsCrossed size={13} className="text-warm-500" />
                <span className="text-sand-500 w-16 shrink-0">{formatTime(m.time)}</span>
                <span className="flex-1">{m.foodGiven}{m.foodEaten ? ` → ${m.foodEaten}` : ''}</span>
                <span className="flex items-center gap-0.5">
                  <EditBtn onClick={() => openEdit('meal', m, date)} />
                  <DeleteBtn onClick={() => handleDeleteConfirm(() => deleteMeal(m.id, date))} />
                </span>
              </div>
              {m.notes && <p className="text-xs text-sand-400 ml-8 italic">{m.notes}</p>}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderNaps = (log, date) => {
    if (!log.naps?.length) return null;
    return (
      <div>
        <h4 className="text-xs font-semibold text-sand-500 uppercase tracking-widest mb-2">Naps</h4>
        <div className="space-y-1.5">
          {log.naps.map((n, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-sand-800 group">
              <Moon size={13} className="text-steel-500" />
              <span className="flex-1">{formatTime(n.startTime)} – {formatTime(n.endTime)}</span>
              <span className="flex items-center gap-0.5">
                <EditBtn onClick={() => openEdit('nap', n, date)} />
                <DeleteBtn onClick={() => handleDeleteConfirm(() => deleteNap(n.id, date))} />
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderSkills = (log, date) => {
    if (!log.skills) return null;
    return (
      <div>
        <div className="flex items-center justify-between mb-1">
          <h4 className="text-xs font-semibold text-sand-500 uppercase tracking-widest">Skills</h4>
          <span className="flex items-center gap-0.5">
            <EditBtn onClick={() => openEdit('skills', null, date)} />
            <DeleteBtn onClick={() => handleDeleteConfirm(() => updateDayLog(date, (prev) => ({ ...prev, skills: '' })))} />
          </span>
        </div>
        <p className="text-sm text-sand-800">{log.skills}</p>
      </div>
    );
  };

  const renderNotes = (log, date) => {
    if (!log.notes) return null;
    return (
      <div>
        <div className="flex items-center justify-between mb-1">
          <h4 className="text-xs font-semibold text-sand-500 uppercase tracking-widest">Notes</h4>
          <span className="flex items-center gap-0.5">
            <EditBtn onClick={() => openEdit('skills', null, date)} />
            <DeleteBtn onClick={() => handleDeleteConfirm(() => updateDayLog(date, (prev) => ({ ...prev, notes: '' })))} />
          </span>
        </div>
        <p className="text-sm text-sand-800">{log.notes}</p>
      </div>
    );
  };

  const renderExpandedContent = (log, date) => {
    if (isFiltered) {
      switch (categoryFilter) {
        case 'schedule': return renderSchedule(log, date);
        case 'potty': return renderPotty(log, date);
        case 'meals': return renderMeals(log, date);
        case 'naps': return renderNaps(log, date);
        case 'skills': return renderSkills(log, date);
        case 'notes': return renderNotes(log, date);
        default: return null;
      }
    }

    return (
      <>
        {renderSchedule(log, date)}
        {renderPotty(log, date)}
        {renderMeals(log, date)}
        {renderNaps(log, date)}
        {renderSkills(log, date)}
        {renderNotes(log, date)}
      </>
    );
  };

  const editModalTitle = editModal?.type === 'potty' ? 'Edit Potty Break'
    : editModal?.type === 'meal' ? 'Edit Meal'
    : editModal?.type === 'nap' ? 'Edit Nap'
    : editModal?.type === 'skills' ? 'Edit Skills & Notes'
    : '';

  return (
    <div className="space-y-3 pb-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-xl font-bold text-sand-900">History</h2>
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
                <div className="absolute right-0 top-full mt-1 bg-white border border-sand-200 rounded-xl shadow-lg z-50 py-1 min-w-[180px]">
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

          {!selectMode ? (
            <button
              onClick={enterSelectMode}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-steel-500 rounded-xl hover:bg-steel-600 transition-colors shadow-sm"
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
          Showing {sortedDates.length} day{sortedDates.length !== 1 ? 's' : ''} with {filterLabel.toLowerCase()} data
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
              {selectedDates.size === sortedDates.length ? (
                <CheckSquare size={16} />
              ) : (
                <Square size={16} />
              )}
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

      {sortedDates.length === 0 && isFiltered && (
        <div className="bg-white rounded-2xl border border-sand-200/80 shadow-sm p-10 text-center">
          <PenLine className="mx-auto text-sand-300" size={28} />
          <p className="text-sand-500 mt-3 text-sm">No days with {filterLabel.toLowerCase()} data.</p>
        </div>
      )}

      {sortedDates.map((date) => {
        const log = allLogs[date];
        const isExpanded = isFiltered || expandAll || expandedDate === date;
        const isSelected = selectedDates.has(date);
        const pottyCount = log.pottyBreaks?.length || 0;
        const mealCount = log.meals?.length || 0;
        const napCount = log.naps?.length || 0;

        return (
          <div
            key={date}
            className={`bg-white rounded-2xl border overflow-hidden transition-all shadow-sm ${
              selectMode && isSelected
                ? 'border-steel-300 ring-1 ring-steel-200'
                : 'border-sand-200/80'
            }`}
          >
            <div className="flex items-center">
              {selectMode && (
                <button
                  onClick={() => toggleSelect(date)}
                  className="pl-4 pr-1 py-4 text-steel-500 hover:text-steel-600 transition-colors shrink-0"
                >
                  {isSelected ? (
                    <CheckSquare size={18} />
                  ) : (
                    <Square size={18} className="text-sand-300" />
                  )}
                </button>
              )}

              <button
                onClick={() => !selectMode && !isFiltered && !expandAll && setExpandedDate(isExpanded ? null : date)}
                className={`flex-1 px-5 py-4 flex items-center justify-between transition-colors ${
                  selectMode || isFiltered || expandAll ? 'cursor-default' : 'hover:bg-sand-50/50'
                } ${selectMode ? 'pl-2' : ''}`}
              >
                <div className="text-left">
                  <div className="font-semibold text-sand-900 text-sm">
                    {formatDate(date)}
                  </div>
                  {!isFiltered && (
                    <div className="flex gap-3 mt-1 text-xs text-sand-400">
                      <span className="flex items-center gap-1">
                        <Droplets size={11} /> {pottyCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <UtensilsCrossed size={11} /> {mealCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <Moon size={11} /> {napCount}
                      </span>
                    </div>
                  )}
                </div>
                {!selectMode && !isFiltered && !expandAll && (
                  isExpanded ? (
                    <ChevronUp size={16} className="text-sand-400" />
                  ) : (
                    <ChevronDown size={16} className="text-sand-400" />
                  )
                )}
              </button>
            </div>

            {isExpanded && !selectMode && (
              <div className="border-t border-sand-100 px-5 py-4 space-y-4">
                {renderExpandedContent(log, date)}
              </div>
            )}
          </div>
        );
      })}

      {/* Edit Modals */}
      <Modal isOpen={editModal?.type === 'potty'} onClose={closeEdit} title={editModalTitle}>
        {editModal?.type === 'potty' && (
          <PottyForm onClose={closeEdit} editData={editModal.data} editDate={editModal.date} />
        )}
      </Modal>

      <Modal isOpen={editModal?.type === 'meal'} onClose={closeEdit} title={editModalTitle}>
        {editModal?.type === 'meal' && (
          <MealForm onClose={closeEdit} editData={editModal.data} editDate={editModal.date} />
        )}
      </Modal>

      <Modal isOpen={editModal?.type === 'nap'} onClose={closeEdit} title={editModalTitle}>
        {editModal?.type === 'nap' && (
          <NapForm onClose={closeEdit} editData={editModal.data} editDate={editModal.date} />
        )}
      </Modal>

      <Modal isOpen={editModal?.type === 'skills'} onClose={closeEdit} title={editModalTitle}>
        {editModal?.type === 'skills' && (
          <SkillsNotesForm onClose={closeEdit} editDate={editModal.date} />
        )}
      </Modal>
    </div>
  );
}
