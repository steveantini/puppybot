import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { getCurrentTime, formatTime } from '../../utils/helpers';

export default function WakeUpForm({ onClose }) {
  const { setWakeUpTime, setBedTime, todayLog } = useData();
  const [mode, setMode] = useState('wake');
  const [time, setTime] = useState(getCurrentTime());

  const handleSave = () => {
    if (mode === 'wake') {
      setWakeUpTime(time);
    } else {
      setBedTime(time);
    }
    onClose();
  };

  return (
    <div className="space-y-5">
      <div className="flex gap-2">
        <button
          onClick={() => setMode('wake')}
          className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${
            mode === 'wake'
              ? 'bg-orange-50 text-orange-600 border-orange-300'
              : 'bg-white border-stone-200 text-stone-400'
          }`}
        >
          Wake Up
        </button>
        <button
          onClick={() => setMode('bed')}
          className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${
            mode === 'bed'
              ? 'bg-indigo-50 text-indigo-600 border-indigo-300'
              : 'bg-white border-stone-200 text-stone-400'
          }`}
        >
          Bed Time
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-600 mb-1.5">Time</label>
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:ring-2 focus:ring-sky-300"
        />
      </div>

      {todayLog.wakeUpTimes?.length > 0 && mode === 'wake' && (
        <div className="text-xs text-stone-400">
          Already logged: {todayLog.wakeUpTimes.map((w) => formatTime(w.time)).join(', ')}
        </div>
      )}

      {todayLog.bedTime && mode === 'bed' && (
        <div className="text-xs text-stone-400">
          Current bed time: {formatTime(todayLog.bedTime)} (will be replaced)
        </div>
      )}

      <button
        onClick={handleSave}
        className="w-full py-3 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-xl transition-colors active:scale-[0.98] shadow-sm"
      >
        Save {mode === 'wake' ? 'Wake Up' : 'Bed'} Time
      </button>
    </div>
  );
}
