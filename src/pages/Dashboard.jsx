import { Link } from 'react-router-dom'

const quickStats = [
  { label: 'Meals Today', value: '0', icon: '🍖' },
  { label: 'Potty Breaks', value: '0', icon: '🚽' },
  { label: 'Walks', value: '0', icon: '🦮' },
  { label: 'Training', value: '0', icon: '🎾' },
]

function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-white rounded-2xl p-6 border border-amber-200 shadow-sm">
        <h2 className="text-2xl font-bold text-amber-900">Good morning! 🐶</h2>
        <p className="text-amber-700 mt-1">
          Track your puppy&apos;s day — meals, walks, potty breaks, and training sessions.
        </p>
        <Link
          to="/log"
          className="inline-block mt-4 px-5 py-2.5 bg-amber-500 text-white font-semibold rounded-xl hover:bg-amber-600 transition-colors shadow-sm"
        >
          + Log New Entry
        </Link>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {quickStats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl p-4 border border-amber-100 text-center shadow-sm"
          >
            <div className="text-2xl">{stat.icon}</div>
            <div className="text-2xl font-bold text-amber-900 mt-1">{stat.value}</div>
            <div className="text-xs text-amber-600 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Recent activity placeholder */}
      <div className="bg-white rounded-2xl p-6 border border-amber-200 shadow-sm">
        <h3 className="text-lg font-semibold text-amber-900 mb-3">Recent Activity</h3>
        <div className="text-amber-500 text-sm text-center py-8">
          No entries yet. Start logging your puppy&apos;s day!
        </div>
      </div>
    </div>
  )
}

export default Dashboard
