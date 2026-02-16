import { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { getTodayKey } from '../../utils/helpers';

export default function SkillsNotesForm({ onClose }) {
  const { getDayLogByDate, updateSkills, updateNotes } = useData();
  const [date, setDate] = useState(getTodayKey());

  const dayLog = getDayLogByDate(date);
  const [skills, setSkills] = useState(dayLog.skills || '');
  const [notes, setNotes] = useState(dayLog.notes || '');

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
        <label className="block text-xs font-semibold text-sand-500 uppercase tracking-widest mb-1.5">Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full px-3.5 py-2.5 border border-sand-200 rounded-xl text-sand-900 focus:outline-none focus:ring-2 focus:ring-steel-300 focus:border-steel-300 transition-colors"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-sand-500 uppercase tracking-widest mb-1.5">Skills Practiced</label>
        <textarea
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
          placeholder="e.g., Sit, Stay, Come, Leash walking..."
          rows={3}
          className="w-full px-3.5 py-2.5 border border-sand-200 rounded-xl text-sand-900 placeholder:text-sand-300 focus:outline-none focus:ring-2 focus:ring-steel-300 focus:border-steel-300 transition-colors resize-none"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-sand-500 uppercase tracking-widest mb-1.5">General Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Anything noteworthy about this day..."
          rows={3}
          className="w-full px-3.5 py-2.5 border border-sand-200 rounded-xl text-sand-900 placeholder:text-sand-300 focus:outline-none focus:ring-2 focus:ring-steel-300 focus:border-steel-300 transition-colors resize-none"
        />
      </div>

      <button
        onClick={handleSave}
        className="w-full py-3 bg-steel-500 hover:bg-steel-600 text-white font-semibold rounded-xl transition-colors active:scale-[0.98] shadow-sm"
      >
        Save
      </button>
    </div>
  );
}
