import { useMemo } from 'react';
import { useData } from '../context/DataContext';
import { getLastNDays, formatShortDate } from '../utils/helpers';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { TrendingUp, BarChart3 } from 'lucide-react';

export default function Stats() {
  const { allLogs } = useData();

  const last7Days = useMemo(() => getLastNDays(7).reverse(), []);

  const pottyData = useMemo(() => {
    return last7Days.map((date) => {
      const log = allLogs[date];
      const breaks = log?.pottyBreaks || [];
      return {
        date: formatShortDate(date),
        good: breaks.filter((p) => p.pee === 'good' || p.poop === 'good').length,
        accidents: breaks.filter((p) => p.pee === 'accident').length,
        total: breaks.length,
      };
    });
  }, [allLogs, last7Days]);

  const mealData = useMemo(() => {
    return last7Days.map((date) => {
      const log = allLogs[date];
      const meals = log?.meals || [];
      return {
        date: formatShortDate(date),
        meals: meals.length,
        fullyEaten: meals.filter((m) =>
          m.foodEaten?.toLowerCase()?.includes('all')
        ).length,
      };
    });
  }, [allLogs, last7Days]);

  const napData = useMemo(() => {
    return last7Days.map((date) => {
      const log = allLogs[date];
      const naps = log?.naps || [];
      return {
        date: formatShortDate(date),
        naps: naps.length,
      };
    });
  }, [allLogs, last7Days]);

  const totalPotty7d = pottyData.reduce((sum, d) => sum + d.total, 0);
  const totalAccidents7d = pottyData.reduce((sum, d) => sum + d.accidents, 0);
  const successRate =
    totalPotty7d > 0
      ? Math.round(((totalPotty7d - totalAccidents7d) / totalPotty7d) * 100)
      : 0;

  const hasData = Object.keys(allLogs).length > 0;

  return (
    <div className="space-y-4 pb-4">
      <h2 className="text-xl font-bold text-stone-800">Stats & Trends</h2>

      {!hasData ? (
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-8 text-center">
          <BarChart3 className="mx-auto text-stone-300" size={40} />
          <p className="text-stone-400 mt-3">No data yet.</p>
          <p className="text-stone-400 text-sm mt-1">
            Start logging to see trends!
          </p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-2xl p-4 text-center border border-stone-100 shadow-sm">
              <div className="text-3xl font-bold text-emerald-600">
                {successRate}%
              </div>
              <div className="text-xs text-stone-500 mt-1">
                Potty Success (7d)
              </div>
            </div>
            <div className="bg-white rounded-2xl p-4 text-center border border-stone-100 shadow-sm">
              <div className="text-3xl font-bold text-sky-600">
                {totalPotty7d}
              </div>
              <div className="text-xs text-stone-500 mt-1">
                Total Potty (7d)
              </div>
            </div>
            <div className="bg-white rounded-2xl p-4 text-center border border-stone-100 shadow-sm">
              <div className="text-3xl font-bold text-rose-500">
                {totalAccidents7d}
              </div>
              <div className="text-xs text-stone-500 mt-1">Accidents (7d)</div>
            </div>
          </div>

          {/* Charts grid - side by side on desktop */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Potty Chart */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4 sm:p-6">
            <h3 className="font-semibold text-stone-800 mb-3 flex items-center gap-2">
              <TrendingUp size={16} className="text-stone-400" />
              Potty Breaks (7 Days)
            </h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={pottyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10 }}
                  stroke="#a8a29e"
                />
                <YAxis
                  tick={{ fontSize: 10 }}
                  stroke="#a8a29e"
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #e7e5e4',
                    fontSize: '12px',
                  }}
                />
                <Bar
                  dataKey="good"
                  fill="#34d399"
                  name="Good"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="accidents"
                  fill="#fb7185"
                  name="Accidents"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Meals Chart */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4 sm:p-6">
            <h3 className="font-semibold text-stone-800 mb-3 flex items-center gap-2">
              <TrendingUp size={16} className="text-stone-400" />
              Meals (7 Days)
            </h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={mealData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10 }}
                  stroke="#a8a29e"
                />
                <YAxis
                  tick={{ fontSize: 10 }}
                  stroke="#a8a29e"
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #e7e5e4',
                    fontSize: '12px',
                  }}
                />
                <Bar
                  dataKey="meals"
                  fill="#fbbf24"
                  name="Meals"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="fullyEaten"
                  fill="#34d399"
                  name="Fully Eaten"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          </div>{/* end charts grid */}

          {/* Naps Chart - full width */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4 sm:p-6">
            <h3 className="font-semibold text-stone-800 mb-3 flex items-center gap-2">
              <TrendingUp size={16} className="text-stone-400" />
              Naps (7 Days)
            </h3>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={napData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11 }}
                  stroke="#a8a29e"
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  stroke="#a8a29e"
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #e7e5e4',
                    fontSize: '12px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="naps"
                  stroke="#818cf8"
                  strokeWidth={2}
                  dot={{ fill: '#818cf8', r: 4 }}
                  name="Naps"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}
