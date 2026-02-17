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
  Legend,
} from 'recharts';
import { TrendingUp, BarChart3, FileDown, ChevronDown } from 'lucide-react';

const RANGE_OPTIONS = [
  { value: 'all', label: 'All Time' },
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: 'ytd', label: 'Year to Date' },
];

const CAL_PER_CUP = 367;
const CAL_PER_SNACK = 4;

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

function timeToMinutes(timeStr) {
  if (!timeStr) return null;
  const parts = timeStr.split(':');
  if (parts.length < 2) return null;
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  if (isNaN(h) || isNaN(m)) return null;
  return h * 60 + m;
}

function minutesToTimeLabel(minutes) {
  if (minutes == null) return '';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
}

function minutesToShortLabel(minutes) {
  const h = Math.floor(minutes / 60);
  const ampm = h >= 12 ? 'p' : 'a';
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}${ampm}`;
}

function parseCups(foodGiven) {
  if (!foodGiven) return 0;
  const s = foodGiven.toLowerCase().replace('cup', '').trim();
  if (s.includes('/')) {
    const [num, den] = s.split('/').map(Number);
    if (num && den) return num / den;
  }
  const n = parseFloat(s);
  return isNaN(n) ? 0 : n;
}

function parseEatenFraction(foodEaten) {
  if (!foodEaten) return 0;
  const lower = foodEaten.toLowerCase();
  if (lower.includes('all')) return 1;
  if (lower.includes('none')) return 0;
  const match = lower.match(/(\d+)\s*\/\s*(\d+)/);
  if (match) return parseInt(match[1], 10) / parseInt(match[2], 10);
  return 0;
}

function ScheduleTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const items = payload.filter((p) => p.value != null);
  if (items.length === 0) return null;
  return (
    <div style={{ borderRadius: '12px', border: '1px solid #EBE6DE', fontSize: '12px', fontFamily: 'DM Sans, system-ui, sans-serif', boxShadow: '0 4px 16px rgba(42, 35, 29, 0.08)', background: '#fff', padding: '10px 14px' }}>
      <div style={{ fontWeight: 600, marginBottom: 4, color: '#4A3F35' }}>{label}</div>
      {items.map((item, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: item.stroke || item.color, display: 'inline-block' }} />
          <span style={{ color: '#6B5D4F' }}>{item.name}: <strong>{minutesToTimeLabel(item.value)}</strong></span>
        </div>
      ))}
    </div>
  );
}

function PeeTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const good = payload.find((p) => p.dataKey === 'peeGood')?.value || 0;
  const accident = payload.find((p) => p.dataKey === 'peeAccident')?.value || 0;
  const total = good + accident;
  const pct = total > 0 ? Math.round((good / total) * 100) : 0;
  return (
    <div style={{ borderRadius: '12px', border: '1px solid #DDD2C2', fontSize: '12px', fontFamily: 'DM Sans, system-ui, sans-serif', boxShadow: '0 4px 16px rgba(33, 26, 14, 0.10)', background: '#fff', padding: '10px 14px' }}>
      <div style={{ fontWeight: 600, marginBottom: 6, color: '#3E2F1E' }}>{label}</div>
      <div style={{ color: '#6F5C48' }}>Total Pee: <strong>{total}</strong></div>
      <div style={{ color: '#D4726A', marginTop: 2 }}>Accidents: <strong>{accident}</strong></div>
      <div style={{ color: '#2B6AAF', marginTop: 3, fontWeight: 600 }}>Success: {pct}%</div>
    </div>
  );
}

function PoopTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const good = payload.find((p) => p.dataKey === 'poopGood')?.value || 0;
  const accident = payload.find((p) => p.dataKey === 'poopAccident')?.value || 0;
  const total = good + accident;
  const pct = total > 0 ? Math.round((good / total) * 100) : 0;
  return (
    <div style={{ borderRadius: '12px', border: '1px solid #DDD2C2', fontSize: '12px', fontFamily: 'DM Sans, system-ui, sans-serif', boxShadow: '0 4px 16px rgba(33, 26, 14, 0.10)', background: '#fff', padding: '10px 14px' }}>
      <div style={{ fontWeight: 600, marginBottom: 6, color: '#3E2F1E' }}>{label}</div>
      <div style={{ color: '#6F5C48' }}>Total Poop: <strong>{total}</strong></div>
      <div style={{ color: '#D4726A', marginTop: 2 }}>Accidents: <strong>{accident}</strong></div>
      <div style={{ color: '#2B6AAF', marginTop: 3, fontWeight: 600 }}>Success: {pct}%</div>
    </div>
  );
}

function SuccessComboTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload || {};
  const good = row.good || 0;
  const accidents = row.accidents || 0;
  const pct = row.successPct;
  const total = good + accidents;
  return (
    <div style={{ borderRadius: '12px', border: '1px solid #DDD2C2', fontSize: '12px', fontFamily: 'DM Sans, system-ui, sans-serif', boxShadow: '0 4px 16px rgba(33, 26, 14, 0.10)', background: '#fff', padding: '10px 14px' }}>
      <div style={{ fontWeight: 600, marginBottom: 6, color: '#3E2F1E' }}>{label}</div>
      <div style={{ color: '#6F5C48' }}>Total: <strong>{total}</strong> ({good} good, {accidents} accident{accidents !== 1 ? 's' : ''})</div>
      {pct != null && <div style={{ color: '#2B6AAF', marginTop: 3, fontWeight: 600 }}>Success rate: {pct}%</div>}
    </div>
  );
}

function CaloriesTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const food = payload.find((p) => p.dataKey === 'foodCal')?.value || 0;
  const snack = payload.find((p) => p.dataKey === 'snackCal')?.value || 0;
  return (
    <div style={{ borderRadius: '12px', border: '1px solid #EBE6DE', fontSize: '12px', fontFamily: 'DM Sans, system-ui, sans-serif', boxShadow: '0 4px 16px rgba(42, 35, 29, 0.08)', background: '#fff', padding: '10px 14px' }}>
      <div style={{ fontWeight: 600, marginBottom: 6, color: '#4A3F35' }}>{label}</div>
      <div style={{ color: '#6B5D4F' }}>Food: <strong>{Math.round(food)} cal</strong></div>
      <div style={{ color: '#6B5D4F', marginTop: 2 }}>Snacks: <strong>{Math.round(snack)} cal</strong></div>
      <div style={{ color: '#4A3F35', marginTop: 4, fontWeight: 600, borderTop: '1px solid #EBE6DE', paddingTop: 4 }}>Total: {Math.round(food + snack)} cal</div>
    </div>
  );
}

const NAP_START = 360;
const NAP_END = 1260;
const NAP_SPAN = NAP_END - NAP_START;

const HOUR_TICKS = [];
for (let m = NAP_START; m <= NAP_END; m += 60) {
  HOUR_TICKS.push(m);
}

function NapHeatmap({ dateRange, allLogs }) {
  const [hoveredNap, setHoveredNap] = useState(null);

  const napRows = useMemo(() => {
    const dates = [...dateRange].sort((a, b) => b.localeCompare(a));
    return dates.map((date) => {
      const log = allLogs[date];
      const naps = (log?.naps || []).map((n) => {
        const start = timeToMinutes(n.startTime);
        const end = timeToMinutes(n.endTime);
        if (start == null || end == null || end <= start) return null;
        const clippedStart = Math.max(start, NAP_START);
        const clippedEnd = Math.min(end, NAP_END);
        if (clippedStart >= clippedEnd) return null;
        const durationMin = end - start;
        return { startMin: start, endMin: end, clippedStart, clippedEnd, durationMin, leftPct: ((clippedStart - NAP_START) / NAP_SPAN) * 100, widthPct: ((clippedEnd - clippedStart) / NAP_SPAN) * 100 };
      }).filter(Boolean);

      const totalMin = naps.reduce((sum, n) => sum + n.durationMin, 0);
      const totalHrs = Math.round((totalMin / 60) * 10) / 10;
      const dateLabel = new Date(date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return { date, dateLabel, naps, totalMin, totalHrs };
    });
  }, [dateRange, allLogs]);

  if (napRows.length === 0) return <p className="text-sm text-sand-400 italic text-center py-6">No data in range.</p>;

  return (
    <div className="overflow-x-auto">
      <div style={{ minWidth: 600 }}>
        <div className="flex items-end mb-1">
          <div className="shrink-0" style={{ width: 70 }} />
          <div className="flex-1 relative" style={{ height: 20 }}>
            {HOUR_TICKS.map((m) => {
              const pct = ((m - NAP_START) / NAP_SPAN) * 100;
              return <span key={m} className="absolute text-[10px] text-sand-400 font-medium" style={{ left: `${pct}%`, transform: 'translateX(-50%)' }}>{minutesToShortLabel(m)}</span>;
            })}
          </div>
          <div className="shrink-0 text-[10px] text-sand-400 font-semibold text-right uppercase tracking-wider" style={{ width: 56 }}>Total</div>
        </div>

        {napRows.map((row) => (
          <div key={row.date} className="flex items-center group" style={{ height: 28 }}>
            <div className="shrink-0 text-[11px] text-sand-600 font-medium truncate pr-2" style={{ width: 70 }}>{row.dateLabel}</div>
            <div className="flex-1 relative bg-sand-100/60 rounded-sm" style={{ height: 18 }}>
              {HOUR_TICKS.map((m) => <div key={m} className="absolute top-0 bottom-0" style={{ left: `${((m - NAP_START) / NAP_SPAN) * 100}%`, width: 1, background: 'rgba(209, 199, 186, 0.4)' }} />)}
              {row.naps.map((nap, i) => (
                <div key={i} className="absolute top-0 bottom-0 rounded-sm cursor-default" style={{ left: `${nap.leftPct}%`, width: `${nap.widthPct}%`, background: '#5F9ACB', opacity: 0.85, minWidth: 2 }}
                  onMouseEnter={(e) => { const rect = e.currentTarget.getBoundingClientRect(); setHoveredNap({ startLabel: minutesToTimeLabel(nap.startMin), endLabel: minutesToTimeLabel(nap.endMin), duration: nap.durationMin, x: rect.left + rect.width / 2, y: rect.top }); }}
                  onMouseLeave={() => setHoveredNap(null)}
                />
              ))}
            </div>
            <div className="shrink-0 text-[11px] font-semibold text-sand-700 text-right pl-2" style={{ width: 56 }}>{row.totalHrs > 0 ? `${row.totalHrs} hr${row.totalHrs !== 1 ? 's' : ''}` : '—'}</div>
          </div>
        ))}
      </div>

      {hoveredNap && (
        <div className="fixed z-50 pointer-events-none" style={{ left: hoveredNap.x, top: hoveredNap.y - 8, transform: 'translate(-50%, -100%)' }}>
          <div style={{ borderRadius: '10px', border: '1px solid #EBE6DE', fontSize: '11px', fontFamily: 'DM Sans, system-ui, sans-serif', boxShadow: '0 4px 16px rgba(42, 35, 29, 0.12)', background: '#fff', padding: '8px 12px', whiteSpace: 'nowrap' }}>
            <div style={{ fontWeight: 600, color: '#4A3F35' }}>{hoveredNap.startLabel} – {hoveredNap.endLabel}</div>
            <div style={{ color: '#918272', marginTop: 2 }}>{hoveredNap.duration >= 60 ? `${Math.floor(hoveredNap.duration / 60)}h ${hoveredNap.duration % 60}m` : `${hoveredNap.duration}m`}</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Stats() {
  const { allLogs } = useData();
  const [range, setRange] = useState('all');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const allLogDates = useMemo(() => Object.keys(allLogs), [allLogs]);
  const dateRange = useMemo(() => getDateRange(range, allLogDates), [range, allLogDates]);

  const pottyData = useMemo(() => {
    return dateRange.map((date) => {
      const log = allLogs[date];
      const breaks = log?.pottyBreaks || [];
      return {
        date: formatShortDate(date),
        peeGood: breaks.filter((p) => p.pee === 'good').length,
        peeAccident: breaks.filter((p) => p.pee === 'accident').length,
        poopGood: breaks.filter((p) => p.poop === 'good').length,
        poopAccident: breaks.filter((p) => p.poop === 'accident').length,
      };
    });
  }, [allLogs, dateRange]);

  const pottyComboData = useMemo(() => {
    return dateRange.map((date) => {
      const log = allLogs[date];
      const breaks = log?.pottyBreaks || [];
      let totalOutcomes = 0;
      let accidentOutcomes = 0;
      breaks.forEach((p) => {
        if (p.pee === 'good') totalOutcomes++;
        if (p.pee === 'accident') { totalOutcomes++; accidentOutcomes++; }
        if (p.poop === 'good') totalOutcomes++;
        if (p.poop === 'accident') { totalOutcomes++; accidentOutcomes++; }
      });
      const goodCount = totalOutcomes - accidentOutcomes;
      const pct = totalOutcomes > 0 ? Math.round((goodCount / totalOutcomes) * 100) : null;
      return {
        date: formatShortDate(date),
        good: goodCount,
        accidents: accidentOutcomes,
        successPct: pct,
      };
    });
  }, [allLogs, dateRange]);

  const calorieData = useMemo(() => {
    return dateRange.map((date) => {
      const log = allLogs[date];
      const meals = log?.meals || [];
      let totalCups = 0;
      meals.forEach((m) => {
        const given = parseCups(m.foodGiven);
        const eaten = parseEatenFraction(m.foodEaten);
        totalCups += given * eaten;
      });
      const foodCal = Math.round(totalCups * CAL_PER_CUP);
      const snackCal = (log?.snacks || 0) * CAL_PER_SNACK;
      return { date: formatShortDate(date), foodCal, snackCal };
    });
  }, [allLogs, dateRange]);

  const scheduleData = useMemo(() => {
    return dateRange.map((date) => {
      const log = allLogs[date];
      const wakes = log?.wakeUpTimes || [];
      const morningWakes = wakes.filter((w) => w.label !== 'Night Wake');
      const nightWakes = wakes.filter((w) => w.label === 'Night Wake');
      return {
        date: formatShortDate(date),
        morning: morningWakes.length > 0 ? timeToMinutes(morningWakes[0].time) : null,
        nightWake: nightWakes.length > 0 ? timeToMinutes(nightWakes[0].time) : null,
        bed: log?.bedTime ? timeToMinutes(log.bedTime) : null,
      };
    });
  }, [allLogs, dateRange]);

  const scheduleDomain = useMemo(() => {
    const allMinutes = scheduleData.flatMap((d) => [d.morning, d.nightWake, d.bed].filter((v) => v != null));
    if (allMinutes.length === 0) return [0, 1440];
    const min = Math.min(...allMinutes);
    const max = Math.max(...allMinutes);
    return [Math.max(0, Math.floor(min / 60) * 60 - 60), Math.min(1440, Math.ceil(max / 60) * 60 + 60)];
  }, [scheduleData]);

  const scheduleTicks = useMemo(() => {
    const ticks = [];
    for (let m = scheduleDomain[0]; m <= scheduleDomain[1]; m += 120) ticks.push(m);
    return ticks;
  }, [scheduleDomain]);

  const totalPee = pottyData.reduce((sum, d) => sum + d.peeGood + d.peeAccident, 0);
  const totalPoop = pottyData.reduce((sum, d) => sum + d.poopGood + d.poopAccident, 0);
  const totalPeeAccidents = pottyData.reduce((sum, d) => sum + d.peeAccident, 0);
  const totalPoopAccidents = pottyData.reduce((sum, d) => sum + d.poopAccident, 0);
  const totalPotty = totalPee + totalPoop;
  const totalAccidents = totalPeeAccidents + totalPoopAccidents;
  const successRate = totalPotty > 0 ? Math.round(((totalPotty - totalAccidents) / totalPotty) * 100) : 0;

  const hasData = Object.keys(allLogs).length > 0;
  const rangeLabel = getRangeLabel(range);
  const dayCount = dateRange.length;

  const handleExportPdf = () => {
    exportStatsPdf(pottyData, calorieData, [], { successRate, totalPotty, totalAccidents });
  };

  const tooltipStyle = {
    borderRadius: '12px', border: '1px solid #EBE6DE', fontSize: '12px',
    fontFamily: 'DM Sans, system-ui, sans-serif', boxShadow: '0 4px 16px rgba(42, 35, 29, 0.08)',
  };

  const xAxisProps = {
    dataKey: 'date',
    tick: { fontSize: dayCount > 20 ? 7 : 8, fill: '#918272' },
    stroke: '#D9D1C5',
    interval: 0,
    angle: -45,
    textAnchor: 'end',
    height: 60,
  };

  const yAxisProps = {
    tick: { fontSize: 10, fill: '#918272' },
    stroke: '#D9D1C5',
    allowDecimals: false,
  };

  return (
    <div className="space-y-5 pb-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-xl font-bold text-sand-900">Stats & Trends</h2>
        {hasData && (
          <div className="flex items-center gap-2">
            <div className="relative">
              <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-sand-700 bg-white border border-sand-200 rounded-xl hover:bg-sand-50 transition-colors shadow-sm">
                {rangeLabel}
                <ChevronDown size={14} className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {dropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                  <div className="absolute right-0 top-full mt-1 bg-white border border-sand-200 rounded-xl shadow-lg z-50 py-1 min-w-[160px]">
                    {RANGE_OPTIONS.map((opt) => (
                      <button key={opt.value} onClick={() => { setRange(opt.value); setDropdownOpen(false); }}
                        className={`w-full text-left px-4 py-2 text-sm transition-colors ${range === opt.value ? 'bg-steel-50 text-steel-600 font-semibold' : 'text-sand-700 hover:bg-sand-50'}`}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
            <button onClick={handleExportPdf} className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-steel-500 rounded-xl hover:bg-steel-600 transition-colors shadow-sm">
              <FileDown size={15} /> Export PDF
            </button>
          </div>
        )}
      </div>

      {!hasData ? (
        <div className="bg-white rounded-2xl border border-sand-200/80 shadow-sm p-12 text-center">
          <BarChart3 className="mx-auto text-sand-300" size={36} />
          <p className="text-sand-500 mt-3 text-sm">No data yet.</p>
          <p className="text-sand-300 text-xs mt-1">Start logging to see trends!</p>
        </div>
      ) : (
        <>
          {/* Summary Card — Success Rate only */}
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-2 bg-white rounded-xl px-5 py-2.5 border border-sand-200/80 shadow-sm">
              <span className="text-xl font-bold text-emerald-600">{successRate}%</span>
              <span className="text-[10px] text-sand-500 font-medium">Potty Success Rate</span>
            </div>
          </div>

          {/* Potty Success Rate — Line Chart */}
          <div className="bg-white rounded-2xl border border-sand-200/80 shadow-sm p-5">
            <h3 className="text-xs font-semibold text-sand-500 mb-4 flex items-center gap-2 uppercase tracking-widest">
              <TrendingUp size={14} className="text-sand-400" />
              Potty Success Rate ({dayCount}d)
            </h3>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={pottyComboData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#DDD2C2" />
                <XAxis {...xAxisProps} />
                <YAxis {...yAxisProps} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                <Tooltip content={<SuccessComboTooltip />} />
                <Line type="monotone" dataKey="successPct" stroke="#2B6AAF" strokeWidth={2.5} dot={{ fill: '#2B6AAF', r: 4, strokeWidth: 0 }} name="Success %" connectNulls activeDot={{ r: 6, fill: '#2B6AAF', strokeWidth: 2, stroke: '#fff' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Pee Chart */}
          <div className="bg-white rounded-2xl border border-sand-200/80 shadow-sm p-5">
            <h3 className="text-xs font-semibold text-sand-500 mb-4 flex items-center gap-2 uppercase tracking-widest">
              <TrendingUp size={14} className="text-sand-400" />
              Pee ({dayCount}d)
            </h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={pottyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#DDD2C2" />
                <XAxis {...xAxisProps} />
                <YAxis {...yAxisProps} />
                <Tooltip content={<PeeTooltip />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px', color: '#9A8568' }} />
                <Bar dataKey="peeGood" stackId="pee" fill="#E2B735" name="Pee (Good)" radius={[0, 0, 0, 0]} />
                <Bar dataKey="peeAccident" stackId="pee" fill="#D4726A" name="Pee (Accident)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Poop Chart */}
          <div className="bg-white rounded-2xl border border-sand-200/80 shadow-sm p-5">
            <h3 className="text-xs font-semibold text-sand-500 mb-4 flex items-center gap-2 uppercase tracking-widest">
              <TrendingUp size={14} className="text-sand-400" />
              Poop ({dayCount}d)
            </h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={pottyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#DDD2C2" />
                <XAxis {...xAxisProps} />
                <YAxis {...yAxisProps} />
                <Tooltip content={<PoopTooltip />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px', color: '#9A8568' }} />
                <Bar dataKey="poopGood" stackId="poop" fill="#926940" name="Poop (Good)" radius={[0, 0, 0, 0]} />
                <Bar dataKey="poopAccident" stackId="poop" fill="#D4726A" name="Poop (Accident)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Calories Chart */}
          <div className="bg-white rounded-2xl border border-sand-200/80 shadow-sm p-5">
            <h3 className="text-xs font-semibold text-sand-500 mb-4 flex items-center gap-2 uppercase tracking-widest">
              <TrendingUp size={14} className="text-sand-400" />
              Calories Eaten ({dayCount}d)
            </h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={calorieData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EBE6DE" />
                <XAxis {...xAxisProps} />
                <YAxis {...yAxisProps} allowDecimals={false} />
                <Tooltip content={<CaloriesTooltip />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px', color: '#918272' }} />
                <Bar dataKey="foodCal" stackId="cal" fill="#2B6AAF" name="Food" radius={[0, 0, 0, 0]} />
                <Bar dataKey="snackCal" stackId="cal" fill="#96BDE0" name="Snacks" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Nap Heatmap */}
          <div className="bg-white rounded-2xl border border-sand-200/80 shadow-sm p-5">
            <h3 className="text-xs font-semibold text-sand-500 mb-4 flex items-center gap-2 uppercase tracking-widest">
              <TrendingUp size={14} className="text-sand-400" />
              Nap Schedule ({dayCount}d)
            </h3>
            <NapHeatmap dateRange={dateRange} allLogs={allLogs} />
          </div>

          {/* Sleep Schedule Chart */}
          <div className="bg-white rounded-2xl border border-sand-200/80 shadow-sm p-5">
            <h3 className="text-xs font-semibold text-sand-500 mb-4 flex items-center gap-2 uppercase tracking-widest">
              <TrendingUp size={14} className="text-sand-400" />
              Sleep Schedule ({dayCount}d)
            </h3>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={scheduleData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EBE6DE" />
                <XAxis {...xAxisProps} />
                <YAxis {...yAxisProps} domain={scheduleDomain} ticks={scheduleTicks} tickFormatter={minutesToTimeLabel} width={62} />
                <Tooltip content={<ScheduleTooltip />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px', color: '#918272' }} />
                <Line type="monotone" dataKey="morning" stroke="#9F8362" strokeWidth={2.5} dot={dayCount <= 31 ? { fill: '#9F8362', r: 3.5, strokeWidth: 0 } : false} name="Morning Wake" connectNulls />
                <Line type="monotone" dataKey="nightWake" stroke="#3B6179" strokeWidth={2.5} strokeDasharray="6 3" dot={dayCount <= 31 ? { fill: '#3B6179', r: 3.5, strokeWidth: 0 } : false} name="Night Wake" connectNulls />
                <Line type="monotone" dataKey="bed" stroke="#48778F" strokeWidth={2.5} dot={dayCount <= 31 ? { fill: '#48778F', r: 3.5, strokeWidth: 0 } : false} name="Bed Time" connectNulls />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}
