import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { getCurrentTime, getTodayKey, formatTime } from '../../utils/helpers';
import { Trash2, Sun, Moon, BedDouble, Plus } from 'lucide-react';

export default function WakeUpForm({ onClose }) {
  const { updateDayLog, getDayLogByDate, deleteWakeUpTime } = useData();
  const [date, setDate] = useState(getTodayKey());

  const [morningTime, setMorningTime] = useState('');
  const [nightEntries, setNightEntries] = useState([]);
  const [bedTime, setBedTimeVal] = useState('');

  const dayLog = getDayLogByDate(date);

  const addNightEntry = () => {
    setNightEntries((prev) => [
      ...prev,
      { id: Date.now(), time: getCurrentTime(), notes: '' },
    ]);
  };

  const updateNightEntry = (id, field, value) => {
    setNightEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, [field]: value } : e))
    );
  };

  const removeNightEntry = (id) => {
    setNightEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const hasSomething = morningTime || nightEntries.length > 0 || bedTime;

  const handleSave = () => {
    const targetDate = date || getTodayKey();
    updateDayLog(targetDate, (prev) => {
      const newWakes = [...(prev.wakeUpTimes || [])];

      if (morningTime) {
        newWakes.push({
          id: crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          time: morningTime,
          label: 'Morning Wake',
        });
      }

      nightEntries.forEach((entry) => {
        if (entry.time) {
          newWakes.push({
            id: crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
            time: entry.time,
            label: 'Night Wake',
            notes: entry.notes.trim() || undefined,
          });
        }
      });

      return {
        ...prev,
        wakeUpTimes: newWakes,
        bedTime: bedTime || prev.bedTime,
      };
    });
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

      {/* Morning Wake */}
      <div className="bg-warm-50/50 border border-warm-200/60 rounded-xl p-4 space-y-2">
        <div className="flex items-center gap-2 text-warm-700 font-semibold text-sm">
          <Sun size={15} /> Morning Wake
        </div>
        <input
          type="time"
          value={morningTime}
          onChange={(e) => setMorningTime(e.target.value)}
          placeholder="Select time..."
          className="w-full px-3.5 py-2.5 border border-sand-200 rounded-xl text-sand-900 bg-white focus:outline-none focus:ring-2 focus:ring-warm-300 focus:border-warm-300 transition-colors"
        />
      </div>

      {/* Night Wakes */}
      <div className="bg-steel-50/50 border border-steel-200/60 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-steel-600 font-semibold text-sm">
            <Moon size={15} /> Night Wakes
          </div>
          <button
            onClick={addNightEntry}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-steel-600 bg-white border border-steel-200 rounded-lg hover:bg-steel-50 transition-colors"
          >
            <Plus size={12} /> Add
          </button>
        </div>

        {nightEntries.length === 0 && (
          <p className="text-xs text-sand-400 italic">No night wakes to log. Tap "Add" if needed.</p>
        )}

        {nightEntries.map((entry) => (
          <div key={entry.id} className="flex gap-2 items-start">
            <div className="flex-1 space-y-1.5">
              <input
                type="time"
                value={entry.time}
                onChange={(e) => updateNightEntry(entry.id, 'time', e.target.value)}
                className="w-full px-3 py-2 border border-sand-200 rounded-lg text-sm text-sand-900 bg-white focus:outline-none focus:ring-2 focus:ring-steel-300 focus:border-steel-300 transition-colors"
              />
              <input
                type="text"
                value={entry.notes}
                onChange={(e) => updateNightEntry(entry.id, 'notes', e.target.value)}
                placeholder="Notes (optional)..."
                className="w-full px-3 py-1.5 border border-sand-200 rounded-lg text-xs text-sand-900 bg-white placeholder:text-sand-300 focus:outline-none focus:ring-2 focus:ring-steel-300 focus:border-steel-300 transition-colors"
              />
            </div>
            <button
              onClick={() => removeNightEntry(entry.id)}
              className="mt-2 p-1.5 text-sand-300 hover:text-rose-400 transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Bed Time */}
      <div className="bg-steel-50/30 border border-steel-200/60 rounded-xl p-4 space-y-2">
        <div className="flex items-center gap-2 text-steel-700 font-semibold text-sm">
          <BedDouble size={15} /> Bed Time
        </div>
        <input
          type="time"
          value={bedTime}
          onChange={(e) => setBedTimeVal(e.target.value)}
          className="w-full px-3.5 py-2.5 border border-sand-200 rounded-xl text-sand-900 bg-white focus:outline-none focus:ring-2 focus:ring-steel-300 focus:border-steel-300 transition-colors"
        />
      </div>

      <button
        onClick={handleSave}
        disabled={!hasSomething}
        className={`w-full py-3 font-semibold rounded-xl transition-colors active:scale-[0.98] shadow-sm ${
          hasSomething
            ? 'bg-steel-500 hover:bg-steel-600 text-white'
            : 'bg-sand-200 text-sand-400 cursor-not-allowed'
        }`}
      >
        Save Schedule
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
