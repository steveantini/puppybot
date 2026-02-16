import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { getCurrentTime, getTodayKey, formatTime } from '../../utils/helpers';
import { Trash2, Sun, Moon, BedDouble } from 'lucide-react';

export default function WakeUpForm({ onClose }) {
  const { setWakeUpTime, setBedTime, getDayLogByDate, deleteWakeUpTime, updateDayLog } = useData();
  const [date, setDate] = useState(getTodayKey());
  const [mode, setMode] = useState('wake');
  const [time, setTime] = useState(getCurrentTime());
  const [notes, setNotes] = useState('');

  const dayLog = getDayLogByDate(date);

  const handleSave = () => {
    if (mode === 'bed') {
      setBedTime(time, date);
    } else {
      const label = mode === 'night' ? 'Night Wake' : 'Morning Wake';
      const targetDate = date || getTodayKey();
      updateDayLog(targetDate, (prev) => ({
        ...prev,
        wakeUpTimes: [
          ...(prev.wakeUpTimes || []),
          {
            id: crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
            time,
            label,
            notes: notes.trim() || undefined,
          },
        ],
      }));
    }
    onClose();
  };

  const handleDeleteWake = (id) => {
    if (date === getTodayKey()) {
      deleteWakeUpTime(id);
    } else {
      updateDayLog(date, (prev) => ({
        ...prev,
        wakeUpTimes: prev.wakeUpTimes.filter((w) => w.id !== id),
      }));
    }
  };

  const handleClearBed = () => {
    updateDayLog(date, (prev) => ({
      ...prev,
      bedTime: null,
    }));
  };

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-xs font-semibold text-sand-500 uppercase tracking-widest mb-1.5">Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full px-3.5 py-2.5 border border-sand-200 rounded-xl text-sand-900 focus:outline-none focus:ring-2 focus:ring-steel-300 focus:border-steel-300 transition-colors"
        />
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setMode('wake')}
          className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all flex items-center justify-center gap-1.5 ${
            mode === 'wake'
              ? 'bg-warm-50 text-warm-700 border-warm-300'
              : 'bg-white border-sand-200 text-sand-400 hover:border-sand-300'
          }`}
        >
          <Sun size={14} /> Morning
        </button>
        <button
          onClick={() => setMode('night')}
          className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all flex items-center justify-center gap-1.5 ${
            mode === 'night'
              ? 'bg-steel-50 text-steel-600 border-steel-300'
              : 'bg-white border-sand-200 text-sand-400 hover:border-sand-300'
          }`}
        >
          <Moon size={14} /> Night Wake
        </button>
        <button
          onClick={() => setMode('bed')}
          className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all flex items-center justify-center gap-1.5 ${
            mode === 'bed'
              ? 'bg-steel-50 text-steel-700 border-steel-300'
              : 'bg-white border-sand-200 text-sand-400 hover:border-sand-300'
          }`}
        >
          <BedDouble size={14} /> Bed
        </button>
      </div>

      <div>
        <label className="block text-xs font-semibold text-sand-500 uppercase tracking-widest mb-1.5">Time</label>
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="w-full px-3.5 py-2.5 border border-sand-200 rounded-xl text-sand-900 focus:outline-none focus:ring-2 focus:ring-steel-300 focus:border-steel-300 transition-colors"
        />
      </div>

      {mode !== 'bed' && (
        <div>
          <label className="block text-xs font-semibold text-sand-500 uppercase tracking-widest mb-1.5">Notes (optional)</label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g., Woke up crying, needed potty..."
            className="w-full px-3.5 py-2.5 border border-sand-200 rounded-xl text-sand-900 placeholder:text-sand-300 focus:outline-none focus:ring-2 focus:ring-steel-300 focus:border-steel-300 transition-colors"
          />
        </div>
      )}

      <button
        onClick={handleSave}
        className="w-full py-3 bg-steel-500 hover:bg-steel-600 text-white font-semibold rounded-xl transition-colors active:scale-[0.98] shadow-sm"
      >
        Save {mode === 'wake' ? 'Morning Wake' : mode === 'night' ? 'Night Wake' : 'Bed Time'}
      </button>

      {/* Existing entries for this date */}
      {(dayLog.wakeUpTimes?.length > 0 || dayLog.bedTime) && (
        <div className="border-t border-sand-100 pt-4 space-y-2">
          <h4 className="text-xs font-semibold text-sand-500 uppercase tracking-widest">
            Logged for {date === getTodayKey() ? 'Today' : new Date(date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </h4>

          {dayLog.wakeUpTimes?.map((w) => (
            <div key={w.id} className="flex items-center justify-between py-2 px-3 bg-sand-50 rounded-lg group">
              <div className="flex items-center gap-2">
                {w.label === 'Night Wake' ? (
                  <Moon size={13} className="text-steel-500" />
                ) : (
                  <Sun size={13} className="text-warm-500" />
                )}
                <span className="text-sm text-sand-800 font-medium">
                  {w.label || 'Wake Up'} — {formatTime(w.time)}
                </span>
                {w.notes && (
                  <span className="text-xs text-sand-400 italic">{w.notes}</span>
                )}
              </div>
              <button
                onClick={() => handleDeleteWake(w.id)}
                className="p-1 text-sand-300 hover:text-rose-400 transition-colors"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}

          {dayLog.bedTime && (
            <div className="flex items-center justify-between py-2 px-3 bg-sand-50 rounded-lg group">
              <div className="flex items-center gap-2">
                <BedDouble size={13} className="text-steel-500" />
                <span className="text-sm text-sand-800 font-medium">
                  Bed Time — {formatTime(dayLog.bedTime)}
                </span>
              </div>
              <button
                onClick={handleClearBed}
                className="p-1 text-sand-300 hover:text-rose-400 transition-colors"
              >
                <Trash2 size={13} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
