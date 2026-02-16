import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { getCurrentTime, getTodayKey, formatTime } from '../../utils/helpers';

export default function WakeUpForm({ onClose }) {
  const { setWakeUpTime, setBedTime, getDayLogByDate } = useData();
  const [date, setDate] = useState(getTodayKey());
  const [mode, setMode] = useState('wake');
  const [time, setTime] = useState(getCurrentTime());

  const dayLog = getDayLogByDate(date);

  const handleSave = () => {
    if (mode === 'wake') {
      setWakeUpTime(time, date);
    } else {
      setBedTime(time, date);
    }
    onClose();
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
          className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
            mode === 'wake'
              ? 'bg-warm-50 text-warm-700 border-warm-300'
              : 'bg-white border-sand-200 text-sand-400 hover:border-sand-300'
          }`}
        >
          Wake Up
        </button>
        <button
          onClick={() => setMode('bed')}
          className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
            mode === 'bed'
              ? 'bg-steel-50 text-steel-600 border-steel-300'
              : 'bg-white border-sand-200 text-sand-400 hover:border-sand-300'
          }`}
        >
          Bed Time
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

      {dayLog.wakeUpTimes?.length > 0 && mode === 'wake' && (
        <div className="text-xs text-sand-400">
          Already logged: {dayLog.wakeUpTimes.map((w) => formatTime(w.time)).join(', ')}
        </div>
      )}

      {dayLog.bedTime && mode === 'bed' && (
        <div className="text-xs text-sand-400">
          Current bed time: {formatTime(dayLog.bedTime)} (will be replaced)
        </div>
      )}

      <button
        onClick={handleSave}
        className="w-full py-3 bg-steel-500 hover:bg-steel-600 text-white font-semibold rounded-xl transition-colors active:scale-[0.98] shadow-sm"
      >
        Save {mode === 'wake' ? 'Wake Up' : 'Bed'} Time
      </button>
    </div>
  );
}
