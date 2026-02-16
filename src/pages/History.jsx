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
    setSelectedDates(new Set(sortedDates));
  };

  const exitSelectMode = () => {
    setSelectMode(false);
    setSelectedDates(new Set());
  };

  if (sortedDates.length === 0) {
    return (
      <div className="space-y-4 pb-4">
        <h2 className="text-lg font-semibold text-sand-800 tracking-tight">History</h2>
        <div className="bg-white rounded-xl border border-sand-200/70 p-10 text-center">
          <CalendarDays className="mx-auto text-sand-300" size={36} />
          <p className="text-sand-400 mt-3 text-sm">No logs recorded yet.</p>
          <p className="text-sand-300 text-xs mt-1">
            Start logging on the Dashboard!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 pb-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-sand-800 tracking-tight">History</h2>
        {!selectMode ? (
          <button
            onClick={enterSelectMode}
            className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-white bg-steel-500 rounded-lg hover:bg-steel-600 transition-colors"
          >
            <FileDown size={15} /> Export PDF
          </button>
        ) : (
          <button
            onClick={exitSelectMode}
            className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-sand-600 bg-sand-100 rounded-lg hover:bg-sand-200 transition-colors"
          >
            <X size={15} /> Cancel
          </button>
        )}
      </div>

      {/* Selection toolbar */}
      {selectMode && (
        <div className="bg-steel-50 border border-steel-200 rounded-xl px-4 py-3 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSelectAll}
              className="flex items-center gap-1.5 text-sm font-medium text-steel-700 hover:text-steel-800 transition-colors"
            >
              {selectedDates.size === sortedDates.length ? (
                <CheckSquare size={16} />
              ) : (
                <Square size={16} />
              )}
              {selectedDates.size === sortedDates.length ? 'Deselect All' : 'Select All'}
            </button>
            <span className="text-xs text-steel-500">
              {selectedDates.size} of {sortedDates.length} selected
            </span>
          </div>
          <button
            onClick={handleExport}
            disabled={selectedDates.size === 0}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              selectedDates.size > 0
                ? 'bg-steel-500 text-white hover:bg-steel-600'
                : 'bg-steel-200 text-steel-400 cursor-not-allowed'
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
            className={`bg-white rounded-xl border overflow-hidden transition-colors ${
              selectMode && isSelected
                ? 'border-steel-300 bg-steel-50/20'
                : 'border-sand-200/70'
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
                onClick={() => !selectMode && setExpandedDate(isExpanded ? null : date)}
                className={`flex-1 px-4 sm:px-5 py-4 flex items-center justify-between transition-colors ${
                  selectMode ? 'cursor-default' : 'hover:bg-sand-50/50'
                } ${selectMode ? 'pl-2' : ''}`}
              >
                <div className="text-left">
                  <div className="font-medium text-sand-800 text-sm">
                    {formatDate(date)}
                  </div>
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
                </div>
                {!selectMode && (
                  isExpanded ? (
                    <ChevronUp size={16} className="text-sand-400" />
                  ) : (
                    <ChevronDown size={16} className="text-sand-400" />
                  )
                )}
              </button>
            </div>

            {isExpanded && !selectMode && (
              <div className="border-t border-sand-100 px-4 sm:px-5 py-4 space-y-4">
                {(log.wakeUpTimes?.length > 0 || log.bedTime) && (
                  <div>
                    <h4 className="text-[11px] font-semibold text-sand-400 uppercase tracking-wide mb-2">
                      Schedule
                    </h4>
                    {log.wakeUpTimes?.map((w, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 text-sm text-sand-700 mb-1"
                      >
                        <Sun size={13} className="text-orange-400" />
                        Wake Up: {formatTime(w.time)}
                      </div>
                    ))}
                    {log.bedTime && (
                      <div className="flex items-center gap-2 text-sm text-sand-700">
                        <BedDouble size={13} className="text-indigo-400" />
                        Bed Time: {formatTime(log.bedTime)}
                      </div>
                    )}
                  </div>
                )}

                {log.pottyBreaks?.length > 0 && (
                  <div>
                    <h4 className="text-[11px] font-semibold text-sand-400 uppercase tracking-wide mb-2">
                      Potty Breaks
                    </h4>
                    <div className="space-y-1.5">
                      {log.pottyBreaks.map((p, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 text-sm flex-wrap"
                        >
                          <Droplets size={13} className="text-steel-400" />
                          <span className="text-sand-500 w-16 shrink-0">
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
                            <span className="text-steel-500 text-xs bg-steel-50 px-1.5 py-0.5 rounded">
                              Bell 🔔
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {log.meals?.length > 0 && (
                  <div>
                    <h4 className="text-[11px] font-semibold text-sand-400 uppercase tracking-wide mb-2">
                      Meals
                    </h4>
                    <div className="space-y-1.5">
                      {log.meals.map((m, i) => (
                        <div key={i} className="text-sm text-sand-700">
                          <div className="flex items-center gap-2">
                            <UtensilsCrossed
                              size={13}
                              className="text-amber-400"
                            />
                            <span className="text-sand-500 w-16 shrink-0">
                              {formatTime(m.time)}
                            </span>
                            <span>
                              {m.foodGiven}
                              {m.foodEaten ? ` → ${m.foodEaten}` : ''}
                            </span>
                          </div>
                          {m.notes && (
                            <p className="text-xs text-sand-400 ml-8 italic">
                              {m.notes}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {log.naps?.length > 0 && (
                  <div>
                    <h4 className="text-[11px] font-semibold text-sand-400 uppercase tracking-wide mb-2">
                      Naps
                    </h4>
                    <div className="space-y-1.5">
                      {log.naps.map((n, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 text-sm text-sand-700"
                        >
                          <Moon size={13} className="text-indigo-400" />
                          {formatTime(n.startTime)} – {formatTime(n.endTime)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {log.skills && (
                  <div>
                    <h4 className="text-[11px] font-semibold text-sand-400 uppercase tracking-wide mb-1">
                      Skills
                    </h4>
                    <p className="text-sm text-sand-700">{log.skills}</p>
                  </div>
                )}
                {log.notes && (
                  <div>
                    <h4 className="text-[11px] font-semibold text-sand-400 uppercase tracking-wide mb-1">
                      Notes
                    </h4>
                    <p className="text-sm text-sand-700">{log.notes}</p>
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
