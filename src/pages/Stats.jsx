import { useMemo } from 'react';
import { useData } from '../context/DataContext';
import { getLastNDays, formatShortDate } from '../utils/helpers';
import { exportStatsPdf } from '../utils/pdfExport';
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
import { TrendingUp, BarChart3, FileDown } from 'lucide-react';

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
        accidents: breaks.filter((p) => p.pee === 'accident' || p.poop === 'accident').length,
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

  const handleExportPdf = () => {
    exportStatsPdf(pottyData, mealData, napData, {
      successRate,
      totalPotty: totalPotty7d,
      totalAccidents: totalAccidents7d,
    });
  };

  const tooltipStyle = {
    borderRadius: '12px',
    border: '1px solid #EBE6DE',
    fontSize: '12px',
    fontFamily: 'DM Sans, system-ui, sans-serif',
    boxShadow: '0 4px 16px rgba(42, 35, 29, 0.08)',
  };

  return (
    <div className="space-y-4 pb-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-sand-900">Stats & Trends</h2>
        {hasData && (
          <button
            onClick={handleExportPdf}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-steel-500 rounded-xl hover:bg-steel-600 transition-colors shadow-sm"
          >
            <FileDown size={15} /> Export PDF
          </button>
        )}
      </div>

      {!hasData ? (
        <div className="bg-white rounded-2xl border border-sand-200/80 shadow-sm p-12 text-center">
          <BarChart3 className="mx-auto text-sand-300" size={36} />
          <p className="text-sand-500 mt-3 text-sm">No data yet.</p>
          <p className="text-sand-300 text-xs mt-1">
            Start logging to see trends!
          </p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-2xl p-4 text-center border border-sand-200/80 shadow-sm">
              <div className="text-3xl font-bold text-emerald-600">
                {successRate}%
              </div>
              <div className="text-[11px] text-sand-500 font-medium mt-1">
                Potty Success (7d)
              </div>
            </div>
            <div className="bg-white rounded-2xl p-4 text-center border border-sand-200/80 shadow-sm">
              <div className="text-3xl font-bold text-steel-600">
                {totalPotty7d}
              </div>
              <div className="text-[11px] text-sand-500 font-medium mt-1">
                Total Potty (7d)
              </div>
            </div>
            <div className="bg-white rounded-2xl p-4 text-center border border-sand-200/80 shadow-sm">
              <div className="text-3xl font-bold text-rose-500">
                {totalAccidents7d}
              </div>
              <div className="text-[11px] text-sand-500 font-medium mt-1">Accidents (7d)</div>
            </div>
          </div>

          {/* Charts grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-sand-200/80 shadow-sm p-5">
              <h3 className="text-xs font-semibold text-sand-500 mb-4 flex items-center gap-2 uppercase tracking-widest">
                <TrendingUp size={14} className="text-sand-400" />
                Potty Breaks (7 Days)
              </h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={pottyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EBE6DE" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: '#918272' }}
                    stroke="#D9D1C5"
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: '#918272' }}
                    stroke="#D9D1C5"
                    allowDecimals={false}
                  />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar
                    dataKey="good"
                    fill="#5BA87A"
                    name="Good"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="accidents"
                    fill="#D4726A"
                    name="Accidents"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-2xl border border-sand-200/80 shadow-sm p-5">
              <h3 className="text-xs font-semibold text-sand-500 mb-4 flex items-center gap-2 uppercase tracking-widest">
                <TrendingUp size={14} className="text-sand-400" />
                Meals (7 Days)
              </h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={mealData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EBE6DE" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: '#918272' }}
                    stroke="#D9D1C5"
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: '#918272' }}
                    stroke="#D9D1C5"
                    allowDecimals={false}
                  />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar
                    dataKey="meals"
                    fill="#9F8362"
                    name="Meals"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="fullyEaten"
                    fill="#5BA87A"
                    name="Fully Eaten"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Naps Chart */}
          <div className="bg-white rounded-2xl border border-sand-200/80 shadow-sm p-5">
            <h3 className="text-xs font-semibold text-sand-500 mb-4 flex items-center gap-2 uppercase tracking-widest">
              <TrendingUp size={14} className="text-sand-400" />
              Naps (7 Days)
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={napData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EBE6DE" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: '#918272' }}
                  stroke="#D9D1C5"
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#918272' }}
                  stroke="#D9D1C5"
                  allowDecimals={false}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Line
                  type="monotone"
                  dataKey="naps"
                  stroke="#48778F"
                  strokeWidth={2.5}
                  dot={{ fill: '#48778F', r: 4, strokeWidth: 0 }}
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
