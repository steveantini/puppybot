import { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { formatDate, formatTime } from '../utils/helpers';
import {
  ChevronDown,
  ChevronUp,
  Droplets,
  UtensilsCrossed,
  Moon,
  Sun,
  BedDouble,
  CalendarDays,
} from 'lucide-react';

export default function History() {
  const { allLogs } = useData();
  const [expandedDate, setExpandedDate] = useState(null);

  const sortedDates = useMemo(() => {
    return Object.keys(allLogs).sort((a, b) => b.localeCompare(a));
  }, [allLogs]);

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
      <h2 className="text-xl font-bold text-stone-800">History</h2>

      {sortedDates.map((date) => {
        const log = allLogs[date];
        const isExpanded = expandedDate === date;
        const pottyCount = log.pottyBreaks?.length || 0;
        const mealCount = log.meals?.length || 0;
        const napCount = log.naps?.length || 0;

        return (
          <div
            key={date}
            className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden"
          >
            <button
              onClick={() => setExpandedDate(isExpanded ? null : date)}
              className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-stone-50/50 transition-colors"
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
              {isExpanded ? (
                <ChevronUp size={18} className="text-stone-400" />
              ) : (
                <ChevronDown size={18} className="text-stone-400" />
              )}
            </button>

            {isExpanded && (
              <div className="border-t border-stone-100 px-4 py-3 space-y-4">
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
