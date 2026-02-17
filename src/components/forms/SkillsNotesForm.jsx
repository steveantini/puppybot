import { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { getTodayKey } from '../../utils/helpers';

export default function SkillsNotesForm({ onClose }) {
  const { getDayLogByDate, updateSkills, updateNotes, updateSnacks } = useData();
  const [date, setDate] = useState(getTodayKey());

  const dayLog = getDayLogByDate(date);
  const [snacks, setSnacks] = useState(dayLog.snacks || 0);
  const [skills, setSkills] = useState(dayLog.skills || '');
  const [notes, setNotes] = useState(dayLog.notes || '');

  useEffect(() => {
    const log = getDayLogByDate(date);
    setSnacks(log.snacks || 0);
    setSkills(log.skills || '');
    setNotes(log.notes || '');
  }, [date, getDayLogByDate]);

  const handleSave = () => {
    updateSnacks(Number(snacks) || 0, date);
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
        <label className="block text-xs font-semibold text-sand-500 uppercase tracking-widest mb-1.5">Treats</label>
        <div className="flex items-center gap-3">
          <input
            type="number"
            min="0"
            value={snacks}
            onChange={(e) => setSnacks(e.target.value)}
            placeholder="0"
            className="w-24 px-3.5 py-2.5 border border-sand-200 rounded-xl text-sand-900 text-center focus:outline-none focus:ring-2 focus:ring-steel-300 focus:border-steel-300 transition-colors"
          />
          <span className="text-xs text-sand-400">
            = {(Number(snacks) || 0) * 4} calories
          </span>
        </div>
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
