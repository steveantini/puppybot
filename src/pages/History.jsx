import { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { formatDate, formatTime } from '../utils/helpers';
import { exportHistoryPdf } from '../utils/pdfExport';
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
} from 'lucide-react';

export default function History() {
  const { allLogs, puppy } = useData();
  const [expandedDate, setExpandedDate] = useState(null);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedDates, setSelectedDates] = useState(new Set());

  const sortedDates = useMemo(() => {
    return Object.keys(allLogs).sort((a, b) => b.localeCompare(a));
  }, [allLogs]);

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
    setSelectedDates(new Set(sortedDates)); // default: select all
  };

  const exitSelectMode = () => {
    setSelectMode(false);
    setSelectedDates(new Set());
  };

  if (sortedDates.length === 0) {
    return (
      <div className="space-y-4 pb-4">
        <h2 className="text-xl font-bold text-stone-800">History</h2>
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-8 text-center">
          <CalendarDays className="mx-auto text-stone-300" size={40} />
          <p className="text-stone-400 mt-3">No logs recorded yet.</p>
          <p className="text-stone-400 text-sm mt-1">
            Start logging on the Dashboard!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 pb-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-stone-800">History</h2>
        {!selectMode ? (
          <button
            onClick={enterSelectMode}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-sky-500 rounded-xl hover:bg-sky-600 transition-colors shadow-sm"
          >
            <FileDown size={16} /> Export PDF
          </button>
        ) : (
          <button
            onClick={exitSelectMode}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-stone-600 bg-stone-100 rounded-xl hover:bg-stone-200 transition-colors"
          >
            <X size={16} /> Cancel
          </button>
        )}
      </div>

      {/* Selection toolbar */}
      {selectMode && (
        <div className="bg-sky-50 border border-sky-200 rounded-xl px-4 py-3 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSelectAll}
              className="flex items-center gap-1.5 text-sm font-medium text-sky-700 hover:text-sky-800 transition-colors"
            >
              {selectedDates.size === sortedDates.length ? (
                <CheckSquare size={16} />
              ) : (
                <Square size={16} />
              )}
              {selectedDates.size === sortedDates.length ? 'Deselect All' : 'Select All'}
            </button>
            <span className="text-xs text-sky-600">
              {selectedDates.size} of {sortedDates.length} selected
            </span>
          </div>
          <button
            onClick={handleExport}
            disabled={selectedDates.size === 0}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              selectedDates.size > 0
                ? 'bg-sky-500 text-white hover:bg-sky-600'
                : 'bg-sky-200 text-sky-400 cursor-not-allowed'
            }`}
          >
            <FileDown size={14} /> Download PDF
          </button>
        </div>
      )}

      {sortedDates.map((date) => {
        const log = allLogs[date];
        const isExpanded = expandedDate === date;
        const isSelected = selectedDates.has(date);
        const pottyCount = log.pottyBreaks?.length || 0;
        const mealCount = log.meals?.length || 0;
        const napCount = log.naps?.length || 0;

        return (
          <div
            key={date}
            className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-colors ${
              selectMode && isSelected
                ? 'border-sky-300 bg-sky-50/30'
                : 'border-stone-100'
            }`}
          >
            <div className="flex items-center">
              {/* Checkbox */}
              {selectMode && (
                <button
                  onClick={() => toggleSelect(date)}
                  className="pl-4 pr-1 py-4 text-sky-500 hover:text-sky-600 transition-colors shrink-0"
                >
                  {isSelected ? (
                    <CheckSquare size={20} />
                  ) : (
                    <Square size={20} className="text-stone-300" />
                  )}
                </button>
              )}

              {/* Date row */}
              <button
                onClick={() => !selectMode && setExpandedDate(isExpanded ? null : date)}
                className={`flex-1 px-4 sm:px-6 py-4 flex items-center justify-between transition-colors ${
                  selectMode ? 'cursor-default' : 'hover:bg-stone-50/50'
                } ${selectMode ? 'pl-2' : ''}`}
              >
                <div className="text-left">
                  <div className="font-semibold text-stone-800 text-sm">
                    {formatDate(date)}
                  </div>
                  <div className="flex gap-3 mt-1 text-xs text-stone-400">
                    <span className="flex items-center gap-1">
                      <Droplets size={12} /> {pottyCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <UtensilsCrossed size={12} /> {mealCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <Moon size={12} /> {napCount}
                    </span>
                  </div>
                </div>
                {!selectMode && (
                  isExpanded ? (
                    <ChevronUp size={18} className="text-stone-400" />
                  ) : (
                    <ChevronDown size={18} className="text-stone-400" />
                  )
                )}
              </button>
            </div>

            {isExpanded && !selectMode && (
              <div className="border-t border-stone-100 px-4 sm:px-6 py-4 space-y-4">
                {/* Wake/Bed Times */}
                {(log.wakeUpTimes?.length > 0 || log.bedTime) && (
                  <div>
                    <h4 className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-2">
                      Schedule
                    </h4>
                    {log.wakeUpTimes?.map((w, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 text-sm text-stone-700 mb-1"
                      >
                        <Sun size={14} className="text-orange-400" />
                        Wake Up: {formatTime(w.time)}
                      </div>
                    ))}
                    {log.bedTime && (
                      <div className="flex items-center gap-2 text-sm text-stone-700">
                        <BedDouble size={14} className="text-indigo-400" />
                        Bed Time: {formatTime(log.bedTime)}
                      </div>
                    )}
                  </div>
                )}

                {/* Potty */}
                {log.pottyBreaks?.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-2">
                      Potty Breaks
                    </h4>
                    <div className="space-y-1.5">
                      {log.pottyBreaks.map((p, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 text-sm flex-wrap"
                        >
                          <Droplets size={14} className="text-sky-400" />
                          <span className="text-stone-500 w-16 shrink-0">
                            {formatTime(p.time)}
                          </span>
                          {p.pee === 'good' && (
                            <span className="text-emerald-600 text-xs bg-emerald-50 px-1.5 py-0.5 rounded">
                              Pee ✓
                            </span>
                          )}
                          {p.pee === 'accident' && (
                            <span className="text-rose-500 text-xs bg-rose-50 px-1.5 py-0.5 rounded">
                              Pee ✗
                            </span>
                          )}
                          {p.poop === 'good' && (
                            <span className="text-emerald-600 text-xs bg-emerald-50 px-1.5 py-0.5 rounded">
                              Poop ✓
                            </span>
                          )}
                          {p.poop === 'accident' && (
                            <span className="text-rose-500 text-xs bg-rose-50 px-1.5 py-0.5 rounded">
                              Poop ✗
                            </span>
                          )}
                          {p.ringBell && (
                            <span className="text-sky-500 text-xs bg-sky-50 px-1.5 py-0.5 rounded">
                              Bell 🔔
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Meals */}
                {log.meals?.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-2">
                      Meals
                    </h4>
                    <div className="space-y-1.5">
                      {log.meals.map((m, i) => (
                        <div key={i} className="text-sm text-stone-700">
                          <div className="flex items-center gap-2">
                            <UtensilsCrossed
                              size={14}
                              className="text-amber-400"
                            />
                            <span className="text-stone-500 w-16 shrink-0">
                              {formatTime(m.time)}
                            </span>
                            <span>
                              {m.foodGiven}
                              {m.foodEaten ? ` → ${m.foodEaten}` : ''}
                            </span>
                          </div>
                          {m.notes && (
                            <p className="text-xs text-stone-400 ml-8 italic">
                              {m.notes}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Naps */}
                {log.naps?.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-2">
                      Naps
                    </h4>
                    <div className="space-y-1.5">
                      {log.naps.map((n, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 text-sm text-stone-700"
                        >
                          <Moon size={14} className="text-indigo-400" />
                          {formatTime(n.startTime)} – {formatTime(n.endTime)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skills & Notes */}
                {log.skills && (
                  <div>
                    <h4 className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1">
                      Skills
                    </h4>
                    <p className="text-sm text-stone-700">{log.skills}</p>
                  </div>
                )}
                {log.notes && (
                  <div>
                    <h4 className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1">
                      Notes
                    </h4>
                    <p className="text-sm text-stone-700">{log.notes}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
