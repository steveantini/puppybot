import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { getCurrentTime, getTodayKey } from '../../utils/helpers';

const foodAmounts = ['1/4 cup', '1/3 cup', '1/2 cup', '3/4 cup', '1 cup'];
const eatenAmounts = ['None', '1/4 of it', '1/2 of it', '3/4 of it', 'All of it'];

export default function MealForm({ onClose, editData, editDate }) {
  const { addMeal, updateMeal } = useData();
  const isEdit = !!editData;
  const [date, setDate] = useState(editDate || getTodayKey());
  const [time, setTime] = useState(editData?.time || getCurrentTime());
  const [foodGiven, setFoodGiven] = useState(editData?.foodGiven || '');
  const [foodEaten, setFoodEaten] = useState(editData?.foodEaten || '');
  const [notes, setNotes] = useState(editData?.notes || '');

  const handleSave = () => {
    const entry = { time, foodGiven, foodEaten, notes: notes.trim() || undefined };
    if (isEdit) {
      updateMeal(editData.id, entry, date);
    } else {
      addMeal(entry, date);
    }
    onClose();
  };

  return (
    <div className="space-y-5">
      {!isEdit && (
        <div>
          <label className="block text-xs font-semibold text-sand-500 uppercase tracking-widest mb-1.5">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3.5 py-2.5 border border-sand-200 rounded-xl text-sand-900 focus:outline-none focus:ring-2 focus:ring-steel-300 focus:border-steel-300 transition-colors"
          />
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-sand-500 uppercase tracking-widest mb-1.5">Time</label>
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="w-full px-3.5 py-2.5 border border-sand-200 rounded-xl text-sand-900 focus:outline-none focus:ring-2 focus:ring-steel-300 focus:border-steel-300 transition-colors"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-sand-500 uppercase tracking-widest mb-1.5">Food Given</label>
        <div className="flex flex-wrap gap-2">
          {foodAmounts.map((amt) => (
            <button
              key={amt}
              onClick={() => setFoodGiven(amt)}
              className={`px-3 py-1.5 rounded-xl text-sm font-semibold border transition-all ${
                foodGiven === amt
                  ? 'bg-warm-50 text-warm-700 border-warm-300'
                  : 'bg-white border-sand-200 text-sand-500 hover:border-sand-300'
              }`}
            >
              {amt}
            </button>
          ))}
        </div>
        <input
          type="text"
          value={foodGiven}
          onChange={(e) => setFoodGiven(e.target.value)}
          placeholder="Or type custom amount..."
          className="w-full mt-2 px-3.5 py-2 border border-sand-200 rounded-xl text-sm text-sand-900 placeholder:text-sand-300 focus:outline-none focus:ring-2 focus:ring-steel-300 focus:border-steel-300 transition-colors"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-sand-500 uppercase tracking-widest mb-1.5">Food Eaten</label>
        <div className="flex flex-wrap gap-2">
          {eatenAmounts.map((amt) => (
            <button
              key={amt}
              onClick={() => setFoodEaten(amt)}
              className={`px-3 py-1.5 rounded-xl text-sm font-semibold border transition-all ${
                foodEaten === amt
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-300'
                  : 'bg-white border-sand-200 text-sand-500 hover:border-sand-300'
              }`}
            >
              {amt}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-sand-500 uppercase tracking-widest mb-1.5">Notes (optional)</label>
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g., Hand fed, added topper..."
          className="w-full px-3.5 py-2.5 border border-sand-200 rounded-xl text-sand-900 placeholder:text-sand-300 focus:outline-none focus:ring-2 focus:ring-steel-300 focus:border-steel-300 transition-colors"
        />
      </div>

      <button
        onClick={handleSave}
        className="w-full py-3 bg-steel-500 hover:bg-steel-600 text-white font-semibold rounded-xl transition-colors active:scale-[0.98] shadow-sm"
      >
        {isEdit ? 'Update Meal' : 'Save Meal'}
      </button>
    </div>
  );
}
