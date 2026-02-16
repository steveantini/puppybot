import { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { formatShortDate } from '../utils/helpers';
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
import { TrendingUp, BarChart3, FileDown, ChevronDown } from 'lucide-react';

const RANGE_OPTIONS = [
  { value: 'all', label: 'All Time' },
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: 'ytd', label: 'Year to Date' },
];

function getDateRange(range, allLogDates) {
  const today = new Date();
  today.setHours(12, 0, 0, 0);

  let startDate;

  if (range === '7d') {
    startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 6);
  } else if (range === '30d') {
    startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 29);
  } else if (range === 'ytd') {
    startDate = new Date(today.getFullYear(), 0, 1, 12, 0, 0);
  } else {
    if (allLogDates.length === 0) return [];
    const sorted = [...allLogDates].sort();
    startDate = new Date(sorted[0] + 'T12:00:00');
  }

  const dates = [];
  const current = new Date(startDate);
  while (current <= today) {
    dates.push(current.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

function getRangeLabel(range) {
  const opt = RANGE_OPTIONS.find((o) => o.value === range);
  return opt ? opt.label : 'All Time';
}

export default function Stats() {
  const { allLogs } = useData();
  const [range, setRange] = useState('all');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const allLogDates = useMemo(() => Object.keys(allLogs), [allLogs]);

  const dateRange = useMemo(
    () => getDateRange(range, allLogDates),
    [range, allLogDates]
  );

  const pottyData = useMemo(() => {
    return dateRange.map((date) => {
      const log = allLogs[date];
      const breaks = log?.pottyBreaks || [];
      return {
        date: formatShortDate(date),
        good: breaks.filter((p) => p.pee === 'good' || p.poop === 'good').length,
        accidents: breaks.filter((p) => p.pee === 'accident' || p.poop === 'accident').length,
        total: breaks.length,
      };
    });
  }, [allLogs, dateRange]);

  const mealData = useMemo(() => {
    return dateRange.map((date) => {
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
  }, [allLogs, dateRange]);

  const napData = useMemo(() => {
    return dateRange.map((date) => {
      const log = allLogs[date];
      const naps = log?.naps || [];
      return {
        date: formatShortDate(date),
        naps: naps.length,
      };
    });
  }, [allLogs, dateRange]);

  const wakeData = useMemo(() => {
    return dateRange.map((date) => {
      const log = allLogs[date];
      const wakes = log?.wakeUpTimes || [];
      return {
        date: formatShortDate(date),
        morning: wakes.filter((w) => w.label !== 'Night Wake').length,
        night: wakes.filter((w) => w.label === 'Night Wake').length,
        total: wakes.length,
      };
    });
  }, [allLogs, dateRange]);

  const totalPotty = pottyData.reduce((sum, d) => sum + d.total, 0);
  const totalAccidents = pottyData.reduce((sum, d) => sum + d.accidents, 0);
  const successRate =
    totalPotty > 0
      ? Math.round(((totalPotty - totalAccidents) / totalPotty) * 100)
      : 0;

  const totalNightWakes = wakeData.reduce((sum, d) => sum + d.night, 0);
  const totalMorningWakes = wakeData.reduce((sum, d) => sum + d.morning, 0);
  const daysWithNightWakes = wakeData.filter((d) => d.night > 0).length;

  const hasData = Object.keys(allLogs).length > 0;
  const rangeLabel = getRangeLabel(range);
  const dayCount = dateRange.length;

  const handleExportPdf = () => {
    exportStatsPdf(pottyData, mealData, napData, {
      successRate,
      totalPotty,
      totalAccidents,
    });
  };

  const tooltipStyle = {
    borderRadius: '12px',
    border: '1px solid #EBE6DE',
    fontSize: '12px',
    fontFamily: 'DM Sans, system-ui, sans-serif',
    boxShadow: '0 4px 16px rgba(42, 35, 29, 0.08)',
  };

  const showEveryNthTick = dayCount > 14 ? Math.ceil(dayCount / 10) : undefined;

  const xAxisProps = {
    dataKey: 'date',
    tick: { fontSize: 10, fill: '#918272' },
    stroke: '#D9D1C5',
    interval: showEveryNthTick ? showEveryNthTick - 1 : 0,
    angle: dayCount > 14 ? -45 : 0,
    textAnchor: dayCount > 14 ? 'end' : 'middle',
    height: dayCount > 14 ? 60 : 30,
  };

  const yAxisProps = {
    tick: { fontSize: 10, fill: '#918272' },
    stroke: '#D9D1C5',
    allowDecimals: false,
  };

  return (
    <div className="space-y-4 pb-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-xl font-bold text-sand-900">Stats & Trends</h2>
        {hasData && (
          <div className="flex items-center gap-2">
            {/* Range dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-sand-700 bg-white border border-sand-200 rounded-xl hover:bg-sand-50 transition-colors shadow-sm"
              >
                {rangeLabel}
                <ChevronDown size={14} className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {dropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                  <div className="absolute right-0 top-full mt-1 bg-white border border-sand-200 rounded-xl shadow-lg z-50 py-1 min-w-[160px]">
                    {RANGE_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => {
                          setRange(opt.value);
                          setDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                          range === opt.value
                            ? 'bg-steel-50 text-steel-600 font-semibold'
                            : 'text-sand-700 hover:bg-sand-50'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <button
              onClick={handleExportPdf}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-steel-500 rounded-xl hover:bg-steel-600 transition-colors shadow-sm"
            >
              <FileDown size={15} /> Export PDF
            </button>
          </div>
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
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white rounded-2xl p-4 text-center border border-sand-200/80 shadow-sm">
              <div className="text-3xl font-bold text-emerald-600">
                {successRate}%
              </div>
              <div className="text-[11px] text-sand-500 font-medium mt-1">
                Potty Success
              </div>
            </div>
            <div className="bg-white rounded-2xl p-4 text-center border border-sand-200/80 shadow-sm">
              <div className="text-3xl font-bold text-steel-600">
                {totalPotty}
              </div>
              <div className="text-[11px] text-sand-500 font-medium mt-1">
                Total Potty
              </div>
            </div>
            <div className="bg-white rounded-2xl p-4 text-center border border-sand-200/80 shadow-sm">
              <div className="text-3xl font-bold text-rose-500">
                {totalAccidents}
              </div>
              <div className="text-[11px] text-sand-500 font-medium mt-1">Accidents</div>
            </div>
            <div className="bg-white rounded-2xl p-4 text-center border border-sand-200/80 shadow-sm">
              <div className="text-3xl font-bold text-warm-600">
                {totalNightWakes}
              </div>
              <div className="text-[11px] text-sand-500 font-medium mt-1">Night Wakes</div>
            </div>
          </div>

          {/* Charts grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-sand-200/80 shadow-sm p-5">
              <h3 className="text-xs font-semibold text-sand-500 mb-4 flex items-center gap-2 uppercase tracking-widest">
                <TrendingUp size={14} className="text-sand-400" />
                Potty Breaks ({dayCount}d)
              </h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={pottyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EBE6DE" />
                  <XAxis {...xAxisProps} />
                  <YAxis {...yAxisProps} />
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
                Meals ({dayCount}d)
              </h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={mealData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EBE6DE" />
                  <XAxis {...xAxisProps} />
                  <YAxis {...yAxisProps} />
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

          {/* Second row of charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Naps Chart */}
            <div className="bg-white rounded-2xl border border-sand-200/80 shadow-sm p-5">
              <h3 className="text-xs font-semibold text-sand-500 mb-4 flex items-center gap-2 uppercase tracking-widest">
                <TrendingUp size={14} className="text-sand-400" />
                Naps ({dayCount}d)
              </h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={napData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EBE6DE" />
                  <XAxis {...xAxisProps} tick={{ fontSize: 11, fill: '#918272' }} />
                  <YAxis {...yAxisProps} tick={{ fontSize: 11, fill: '#918272' }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Line
                    type="monotone"
                    dataKey="naps"
                    stroke="#48778F"
                    strokeWidth={2.5}
                    dot={dayCount <= 31 ? { fill: '#48778F', r: 3.5, strokeWidth: 0 } : false}
                    name="Naps"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Wake Schedule Chart */}
            <div className="bg-white rounded-2xl border border-sand-200/80 shadow-sm p-5">
              <h3 className="text-xs font-semibold text-sand-500 mb-4 flex items-center gap-2 uppercase tracking-widest">
                <TrendingUp size={14} className="text-sand-400" />
                Wake-Ups ({dayCount}d)
              </h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={wakeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EBE6DE" />
                  <XAxis {...xAxisProps} />
                  <YAxis {...yAxisProps} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar
                    dataKey="morning"
                    stackId="wakes"
                    fill="#9F8362"
                    name="Morning Wake"
                    radius={[0, 0, 0, 0]}
                  />
                  <Bar
                    dataKey="night"
                    stackId="wakes"
                    fill="#3B6179"
                    name="Night Wake"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Wake summary row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-2xl p-4 text-center border border-sand-200/80 shadow-sm">
              <div className="text-2xl font-bold text-warm-600">{totalMorningWakes}</div>
              <div className="text-[11px] text-sand-500 font-medium mt-1">Morning Wakes</div>
            </div>
            <div className="bg-white rounded-2xl p-4 text-center border border-sand-200/80 shadow-sm">
              <div className="text-2xl font-bold text-steel-700">{totalNightWakes}</div>
              <div className="text-[11px] text-sand-500 font-medium mt-1">Night Wakes</div>
            </div>
            <div className="bg-white rounded-2xl p-4 text-center border border-sand-200/80 shadow-sm">
              <div className="text-2xl font-bold text-sand-700">{daysWithNightWakes}</div>
              <div className="text-[11px] text-sand-500 font-medium mt-1">Days w/ Night Wakes</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
