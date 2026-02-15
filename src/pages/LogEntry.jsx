import { useState } from 'react'

const categories = [
  { id: 'meal', label: 'Meal', icon: '🍖' },
  { id: 'potty', label: 'Potty Break', icon: '🚽' },
  { id: 'walk', label: 'Walk', icon: '🦮' },
  { id: 'training', label: 'Training', icon: '🎾' },
  { id: 'play', label: 'Play Time', icon: '🎉' },
  { id: 'sleep', label: 'Sleep', icon: '😴' },
  { id: 'vet', label: 'Vet Visit', icon: '🏥' },
  { id: 'other', label: 'Other', icon: '📝' },
]

function LogEntry() {
  const [selected, setSelected] = useState(null)
  const [notes, setNotes] = useState('')
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    if (!selected) return
    // For now, just show a success message
    // Later this will save to a database
    setSaved(true)
    setTimeout(() => {
      setSaved(false)
      setSelected(null)
      setNotes('')
    }, 2000)
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-amber-200 shadow-sm">
        <h2 className="text-xl font-bold text-amber-900 mb-4">Log an Entry</h2>

        {/* Category selector */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelected(cat.id)}
              className={`p-3 rounded-xl border-2 text-center transition-all ${
                selected === cat.id
                  ? 'border-amber-500 bg-amber-50 shadow-sm'
                  : 'border-amber-100 hover:border-amber-300 bg-white'
              }`}
            >
              <div className="text-2xl">{cat.icon}</div>
              <div className="text-xs font-medium text-amber-800 mt-1">{cat.label}</div>
            </button>
          ))}
        </div>

        {/* Notes */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-amber-800 mb-1">
            Notes (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="How was it? Any details to remember..."
            rows={3}
            className="w-full px-3 py-2 border border-amber-200 rounded-xl text-amber-900 placeholder:text-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none"
          />
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={!selected}
          className={`w-full py-3 rounded-xl font-semibold text-white transition-all ${
            selected
              ? 'bg-amber-500 hover:bg-amber-600 shadow-sm cursor-pointer'
              : 'bg-amber-200 cursor-not-allowed'
          }`}
        >
          {saved ? '✓ Saved!' : 'Save Entry'}
        </button>
      </div>
    </div>
  )
}

export default LogEntry
