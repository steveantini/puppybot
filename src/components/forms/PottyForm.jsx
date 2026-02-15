import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { getCurrentTime, getTodayKey } from '../../utils/helpers';

export default function PottyForm({ onClose }) {
  const { addPottyBreak } = useData();
  const [date, setDate] = useState(getTodayKey());
  const [time, setTime] = useState(getCurrentTime());
  const [pee, setPee] = useState(null);
  const [poop, setPoop] = useState(null);
  const [ringBell, setRingBell] = useState(false);
  const [notes, setNotes] = useState('');

  const handleSave = () => {
    addPottyBreak({ time, pee, poop, ringBell, notes: notes.trim() || undefined }, date);
    onClose();
  };

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-stone-600 mb-1.5">Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:ring-2 focus:ring-sky-300"
        />
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

      <div>
        <label className="block text-sm font-medium text-stone-600 mb-1.5">Pee</label>
        <div className="flex gap-2">
          <button
            onClick={() => setPee(pee === 'good' ? null : 'good')}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition-all flex-1 ${
              pee === 'good'
                ? 'bg-emerald-50 text-emerald-600 border-emerald-300'
                : 'bg-white border-stone-200 text-stone-400'
            }`}
          >
            Good
          </button>
          <button
            onClick={() => setPee(pee === 'accident' ? null : 'accident')}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition-all flex-1 ${
              pee === 'accident'
                ? 'bg-rose-50 text-rose-500 border-rose-300'
                : 'bg-white border-stone-200 text-stone-400'
            }`}
          >
            Accident
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-600 mb-1.5">Poop</label>
        <div className="flex gap-2">
          <button
            onClick={() => setPoop(poop === 'good' ? null : 'good')}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition-all flex-1 ${
              poop === 'good'
                ? 'bg-emerald-50 text-emerald-600 border-emerald-300'
                : 'bg-white border-stone-200 text-stone-400'
            }`}
          >
            Good
          </button>
          <button
            onClick={() => setPoop(poop === 'accident' ? null : 'accident')}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition-all flex-1 ${
              poop === 'accident'
                ? 'bg-rose-50 text-rose-500 border-rose-300'
                : 'bg-white border-stone-200 text-stone-400'
            }`}
          >
            Accident
          </button>
        </div>
      </div>

      <div>
        <label className="flex items-center gap-2.5 cursor-pointer">
          <div
            onClick={() => setRingBell(!ringBell)}
            className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all cursor-pointer ${
              ringBell
                ? 'bg-sky-500 border-sky-500 text-white'
                : 'border-stone-300 bg-white'
            }`}
          >
            {ringBell && (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3 7L6 10L11 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
          <span className="text-sm font-medium text-stone-600">Rang the bell</span>
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-600 mb-1.5">Notes (optional)</label>
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any details..."
          className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-stone-800 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-sky-300"
        />
      </div>

      <button
        onClick={handleSave}
        className="w-full py-3 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-xl transition-colors active:scale-[0.98] shadow-sm"
      >
        Save Potty Break
      </button>
    </div>
  );
}
