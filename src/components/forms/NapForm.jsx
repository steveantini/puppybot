import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { getCurrentTime, getTodayKey } from '../../utils/helpers';

export default function NapForm({ onClose }) {
  const { addNap } = useData();
  const [date, setDate] = useState(getTodayKey());
  const [startTime, setStartTime] = useState(getCurrentTime());
  const [endTime, setEndTime] = useState('');
  const [notes, setNotes] = useState('');

  const handleSave = () => {
    addNap({ startTime, endTime, notes: notes.trim() || undefined }, date);
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

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-stone-600 mb-1.5">Start Time</label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:ring-2 focus:ring-sky-300"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-600 mb-1.5">End Time</label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:ring-2 focus:ring-sky-300"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-600 mb-1.5">Notes (optional)</label>
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any details about the nap..."
          className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-stone-800 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-sky-300"
        />
      </div>

      <button
        onClick={handleSave}
        className="w-full py-3 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-xl transition-colors active:scale-[0.98] shadow-sm"
      >
        Save Nap
      </button>
    </div>
  );
}
