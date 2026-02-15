import { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { getTodayKey } from '../../utils/helpers';

export default function SkillsNotesForm({ onClose }) {
  const { getDayLogByDate, updateSkills, updateNotes } = useData();
  const [date, setDate] = useState(getTodayKey());

  const dayLog = getDayLogByDate(date);
  const [skills, setSkills] = useState(dayLog.skills || '');
  const [notes, setNotes] = useState(dayLog.notes || '');

  // Update fields when date changes
  useEffect(() => {
    const log = getDayLogByDate(date);
    setSkills(log.skills || '');
    setNotes(log.notes || '');
  }, [date, getDayLogByDate]);

  const handleSave = () => {
    updateSkills(skills.trim(), date);
    updateNotes(notes.trim(), date);
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
        <label className="block text-sm font-medium text-stone-600 mb-1.5">Skills Practiced</label>
        <textarea
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
          placeholder="e.g., Sit, Stay, Come, Leash walking..."
          rows={3}
          className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-stone-800 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-sky-300 resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-600 mb-1.5">General Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Anything noteworthy about this day..."
          rows={3}
          className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-stone-800 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-sky-300 resize-none"
        />
      </div>

      <button
        onClick={handleSave}
        className="w-full py-3 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-xl transition-colors active:scale-[0.98] shadow-sm"
      >
        Save
      </button>
    </div>
  );
}
