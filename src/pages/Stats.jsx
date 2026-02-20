import { useState, useMemo, useRef, useCallback } from 'react';
import { useData } from '../context/DataContext';
import { formatShortDate } from '../utils/helpers';
import { exportStatsPdf } from '../utils/pdfExport';
import { toPng } from 'html-to-image';
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
import { TrendingUp, BarChart3, FileDown, ChevronDown, Loader2, CircleCheck, MoonStar } from 'lucide-react';

const RANGE_OPTIONS = [
  { value: 'all', label: 'All Time' },
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: 'ytd', label: 'Year to Date' },
];

const CAL_PER_CUP = 409;
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
      <div style={{ color: '#6B5D4F', marginTop: 2 }}>Treats: <strong>{Math.round(snack)} cal</strong></div>
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

function PottySchedule({ dateRange, allLogs }) {
  const [hoveredDot, setHoveredDot] = useState(null);

  const pottyRows = useMemo(() => {
    const dates = [...dateRange].sort((a, b) => b.localeCompare(a));
    return dates.map((date) => {
      const log = allLogs[date];
      const breaks = (log?.pottyBreaks || []).map((b) => {
        const min = timeToMinutes(b.time);
        if (min == null) return null;
        const clipped = Math.max(NAP_START, Math.min(NAP_END, min));
        const hasPee = b.pee === 'good' || b.pee === 'accident';
        const hasPoop = b.poop === 'good' || b.poop === 'accident';
        if (!hasPee && !hasPoop) return null;
        let type = 'both';
        if (hasPee && !hasPoop) type = 'pee';
        else if (!hasPee && hasPoop) type = 'poop';
        return { min, clipped, type, leftPct: ((clipped - NAP_START) / NAP_SPAN) * 100, peeStatus: b.pee, poopStatus: b.poop };
      }).filter(Boolean);
      const dateLabel = new Date(date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return { date, dateLabel, breaks };
    });
  }, [dateRange, allLogs]);

  const dotColor = (type) => {
    if (type === 'pee') return '#E2B735';
    if (type === 'poop') return '#926940';
    return '#E87C3E';
  };

  if (pottyRows.length === 0) return <p className="text-sm text-sand-400 italic text-center py-6">No data in range.</p>;

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
          <div className="shrink-0" style={{ width: 56 }} />
        </div>

        {pottyRows.map((row) => (
          <div key={row.date} className="flex items-center" style={{ height: 28 }}>
            <div className="shrink-0 text-[11px] text-sand-600 font-medium truncate pr-2" style={{ width: 70 }}>{row.dateLabel}</div>
            <div className="flex-1 relative bg-sand-100/60 rounded-sm" style={{ height: 18 }}>
              {HOUR_TICKS.map((m) => <div key={m} className="absolute top-0 bottom-0" style={{ left: `${((m - NAP_START) / NAP_SPAN) * 100}%`, width: 1, background: 'rgba(209, 199, 186, 0.4)' }} />)}
              {row.breaks.map((b, i) => (
                <div
                  key={i}
                  className="absolute top-0 bottom-0 rounded-sm cursor-default"
                  style={{ left: `${b.leftPct}%`, transform: 'translateX(-50%)', width: 5, background: dotColor(b.type), opacity: 0.9 }}
                  onMouseEnter={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const parts = [];
                    if (b.type === 'pee' || b.type === 'both') parts.push(`Pee: ${b.peeStatus}`);
                    if (b.type === 'poop' || b.type === 'both') parts.push(`Poop: ${b.poopStatus}`);
                    setHoveredDot({ time: minutesToTimeLabel(b.min), details: parts, type: b.type, x: rect.left + rect.width / 2, y: rect.top });
                  }}
                  onMouseLeave={() => setHoveredDot(null)}
                />
              ))}
            </div>
            <div className="shrink-0 text-[11px] font-semibold text-sand-700 text-right pl-2" style={{ width: 56 }}>
              {row.breaks.length > 0 ? `${row.breaks.length}x` : '—'}
            </div>
          </div>
        ))}

        {/* Legend */}
        <div className="flex items-center justify-center gap-5 mt-3 text-[10px] text-sand-500">
          <span className="flex items-center gap-1.5"><span className="inline-block w-1.5 h-3 rounded-sm" style={{ background: '#E2B735' }} /> Pee</span>
          <span className="flex items-center gap-1.5"><span className="inline-block w-1.5 h-3 rounded-sm" style={{ background: '#926940' }} /> Poop</span>
          <span className="flex items-center gap-1.5"><span className="inline-block w-1.5 h-3 rounded-sm" style={{ background: '#E87C3E' }} /> Both</span>
        </div>
      </div>

      {hoveredDot && (
        <div className="fixed z-50 pointer-events-none" style={{ left: hoveredDot.x, top: hoveredDot.y - 8, transform: 'translate(-50%, -100%)' }}>
          <div style={{ borderRadius: '10px', border: '1px solid #EBE6DE', fontSize: '11px', fontFamily: 'DM Sans, system-ui, sans-serif', boxShadow: '0 4px 16px rgba(42, 35, 29, 0.12)', background: '#fff', padding: '8px 12px', whiteSpace: 'nowrap' }}>
            <div style={{ fontWeight: 600, color: '#4A3F35' }}>{hoveredDot.time}</div>
            {hoveredDot.details.map((d, i) => (
              <div key={i} style={{ color: '#918272', marginTop: 2 }}>{d}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
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

const SLEEP_SPAN = 900; // 6pm to 9am = 15 hours = 900 minutes
const SLEEP_TICKS = [0, 180, 360, 540, 720, 900]; // 6p, 9p, 12a, 3a, 6a, 9a

function normalizeToOvernight(minutes) {
  if (minutes >= 1080) return minutes - 1080;
  if (minutes < 540) return minutes + 360;
  return null;
}

function sleepTickLabel(norm) {
  const actual = norm < 360 ? norm + 1080 : norm - 360;
  const h = Math.floor(actual / 60);
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  const suffix = h >= 12 && h < 24 ? 'p' : 'a';
  return `${h12}${suffix}`;
}

function SleepHeatmap({ dateRange, allLogs }) {
  const [hoveredSleep, setHoveredSleep] = useState(null);

  const sleepRows = useMemo(() => {
    const sorted = [...dateRange].sort();
    const rows = [];

    for (let i = 0; i < sorted.length; i++) {
      const date = sorted[i];
      const prevDate = i > 0 ? sorted[i - 1] : null;
      const log = allLogs[date];
      const prevLog = prevDate ? allLogs[prevDate] : null;

      const wakes = log?.wakeUpTimes || [];
      const morningWake = wakes.find((w) => w.label !== 'Night Wake');
      const nightWake = wakes.find((w) => w.label === 'Night Wake');

      const bedMin = prevLog?.bedTime ? timeToMinutes(prevLog.bedTime) : null;
      const wakeMin = morningWake ? timeToMinutes(morningWake.time) : null;
      const nightWakeMin = nightWake ? timeToMinutes(nightWake.time) : null;

      if (bedMin == null && wakeMin == null) continue;

      const bedNorm = bedMin != null ? normalizeToOvernight(bedMin) : null;
      const wakeNorm = wakeMin != null ? normalizeToOvernight(wakeMin) : null;
      const nightWakeNorm = nightWakeMin != null ? normalizeToOvernight(nightWakeMin) : null;

      const segments = [];
      const sleptThrough = nightWakeNorm == null;

      if (bedNorm != null && wakeNorm != null) {
        if (nightWakeNorm != null && nightWakeNorm > bedNorm && nightWakeNorm < wakeNorm) {
          segments.push({ left: bedNorm, right: nightWakeNorm, type: 'sleep' });
          segments.push({ left: nightWakeNorm, right: wakeNorm, type: 'after-wake' });
        } else {
          segments.push({ left: bedNorm, right: wakeNorm, type: 'sleep' });
        }
      } else if (bedNorm != null) {
        const endNorm = Math.min(bedNorm + 180, SLEEP_SPAN);
        segments.push({ left: bedNorm, right: endNorm, type: 'sleep' });
      } else if (wakeNorm != null) {
        const startNorm = Math.max(wakeNorm - 180, 0);
        segments.push({ left: startNorm, right: wakeNorm, type: 'sleep' });
      }

      const totalMin = (bedNorm != null && wakeNorm != null && wakeNorm > bedNorm)
        ? wakeNorm - bedNorm
        : null;
      const totalLabel = totalMin != null
        ? (totalMin >= 60 ? `${Math.floor(totalMin / 60)}h ${totalMin % 60}m` : `${totalMin}m`)
        : '—';

      const dateLabel = new Date(date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      rows.push({
        date,
        dateLabel,
        segments,
        sleptThrough,
        bedMin,
        wakeMin,
        nightWakeMin,
        totalLabel,
      });
    }

    return rows.reverse();
  }, [dateRange, allLogs]);

  if (sleepRows.length === 0) return <p className="text-sm text-sand-400 italic text-center py-6">No data in range.</p>;

  return (
    <div className="overflow-x-auto">
      <div style={{ minWidth: 600 }}>
        <div className="flex items-end mb-1">
          <div className="shrink-0" style={{ width: 70 }} />
          <div className="flex-1 relative" style={{ height: 20 }}>
            {SLEEP_TICKS.map((norm) => {
              const pct = (norm / SLEEP_SPAN) * 100;
              return (
                <span key={norm} className="absolute text-[10px] text-sand-400 font-medium" style={{ left: `${pct}%`, transform: 'translateX(-50%)' }}>
                  {sleepTickLabel(norm)}
                </span>
              );
            })}
          </div>
          <div className="shrink-0" style={{ width: 80 }} />
        </div>

        {sleepRows.map((row) => (
          <div key={row.date} className="flex items-center" style={{ height: 28 }}>
            <div className="shrink-0 text-[11px] text-sand-600 font-medium truncate pr-2" style={{ width: 70 }}>{row.dateLabel}</div>
            <div className="flex-1 relative bg-sand-100/60 rounded-sm" style={{ height: 18 }}>
              {SLEEP_TICKS.map((norm) => (
                <div key={norm} className="absolute top-0 bottom-0" style={{ left: `${(norm / SLEEP_SPAN) * 100}%`, width: 1, background: norm === 360 ? 'rgba(160, 140, 120, 0.35)' : 'rgba(209, 199, 186, 0.4)' }} />
              ))}
              {row.segments.map((seg, i) => {
                const leftPct = (seg.left / SLEEP_SPAN) * 100;
                const widthPct = ((seg.right - seg.left) / SLEEP_SPAN) * 100;
                const color = seg.type === 'sleep' ? '#3B6179' : '#6A9ABF';
                return (
                  <div
                    key={i}
                    className="absolute top-0 bottom-0 rounded-sm cursor-default"
                    style={{ left: `${leftPct}%`, width: `${widthPct}%`, background: color, opacity: seg.type === 'sleep' ? 0.85 : 0.55, minWidth: 2 }}
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setHoveredSleep({
                        bed: row.bedMin != null ? minutesToTimeLabel(row.bedMin) : null,
                        wake: row.wakeMin != null ? minutesToTimeLabel(row.wakeMin) : null,
                        nightWake: row.nightWakeMin != null ? minutesToTimeLabel(row.nightWakeMin) : null,
                        total: row.totalLabel,
                        sleptThrough: row.sleptThrough,
                        x: rect.left + rect.width / 2,
                        y: rect.top,
                      });
                    }}
                    onMouseLeave={() => setHoveredSleep(null)}
                  />
                );
              })}
              {row.nightWakeMin != null && (() => {
                const norm = normalizeToOvernight(row.nightWakeMin);
                if (norm == null) return null;
                const pct = (norm / SLEEP_SPAN) * 100;
                return <div className="absolute top-0 bottom-0" style={{ left: `${pct}%`, width: 3, background: '#E8A838', transform: 'translateX(-50%)', borderRadius: 1 }} />;
              })()}
            </div>
            <div className="shrink-0 flex items-center justify-end gap-1.5 pl-2" style={{ width: 80 }}>
              {row.sleptThrough ? (
                <CircleCheck size={13} className="text-emerald-400" />
              ) : (
                <MoonStar size={13} className="text-amber-400" />
              )}
              <span className="text-[11px] font-semibold text-sand-700">{row.totalLabel}</span>
            </div>
          </div>
        ))}

        {/* Legend */}
        <div className="flex items-center justify-center gap-5 mt-3 text-[10px] text-sand-500">
          <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded-sm" style={{ background: '#3B6179', opacity: 0.85 }} /> Sleep</span>
          <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded-sm" style={{ background: '#6A9ABF', opacity: 0.55 }} /> After Night Wake</span>
          <span className="flex items-center gap-1.5"><span className="inline-block w-1 h-3 rounded-sm" style={{ background: '#E8A838' }} /> Night Wake</span>
          <span className="flex items-center gap-1.5"><CircleCheck size={11} className="text-emerald-400" /> Slept Through</span>
          <span className="flex items-center gap-1.5"><MoonStar size={11} className="text-amber-400" /> Disrupted</span>
        </div>
      </div>

      {hoveredSleep && (
        <div className="fixed z-50 pointer-events-none" style={{ left: hoveredSleep.x, top: hoveredSleep.y - 8, transform: 'translate(-50%, -100%)' }}>
          <div style={{ borderRadius: '10px', border: '1px solid #EBE6DE', fontSize: '11px', fontFamily: 'DM Sans, system-ui, sans-serif', boxShadow: '0 4px 16px rgba(42, 35, 29, 0.12)', background: '#fff', padding: '8px 12px', whiteSpace: 'nowrap' }}>
            {hoveredSleep.bed && <div style={{ color: '#4A3F35' }}><strong>Bed:</strong> {hoveredSleep.bed}</div>}
            {hoveredSleep.nightWake && <div style={{ color: '#E8A838', marginTop: 2 }}><strong>Night Wake:</strong> {hoveredSleep.nightWake}</div>}
            {hoveredSleep.wake && <div style={{ color: '#4A3F35', marginTop: 2 }}><strong>Wake:</strong> {hoveredSleep.wake}</div>}
            <div style={{ color: '#918272', marginTop: 3, borderTop: '1px solid #EBE6DE', paddingTop: 3 }}>
              {hoveredSleep.total !== '—' ? `Total: ${hoveredSleep.total}` : 'Partial data'}
              {hoveredSleep.sleptThrough ? ' · Slept through ✓' : ' · Night wake'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Stats() {
  const { allLogs, puppy } = useData();
  const [range, setRange] = useState('all');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  const chartRefs = {
    successRate: useRef(null),
    pee: useRef(null),
    poop: useRef(null),
    pottySchedule: useRef(null),
    napSchedule: useRef(null),
    sleepSchedule: useRef(null),
    calories: useRef(null),
  };

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

  const totalPee = pottyData.reduce((sum, d) => sum + d.peeGood + d.peeAccident, 0);
  const totalPoop = pottyData.reduce((sum, d) => sum + d.poopGood + d.poopAccident, 0);
  const totalPeeAccidents = pottyData.reduce((sum, d) => sum + d.peeAccident, 0);
  const totalPoopAccidents = pottyData.reduce((sum, d) => sum + d.poopAccident, 0);
  const totalPotty = totalPee + totalPoop;
  const totalAccidents = totalPeeAccidents + totalPoopAccidents;
  const successRate = totalPotty > 0 ? Math.round(((totalPotty - totalAccidents) / totalPotty) * 100) : 0;

  const maxPeePerDay = Math.max(1, ...pottyData.map((d) => d.peeGood + d.peeAccident));
  const maxPoopPerDay = Math.max(1, ...pottyData.map((d) => d.poopGood + d.poopAccident));
  const maxCalPerDay = Math.max(1, ...calorieData.map((d) => d.foodCal + d.snackCal));

  const hasData = Object.keys(allLogs).length > 0;
  const rangeLabel = getRangeLabel(range);
  const dayCount = dateRange.length;

  const handleExportPdf = useCallback(async () => {
    setExporting(true);
    try {
      const order = [
        { key: 'successRate', label: 'Potty Success Rate' },
        { key: 'pee', label: 'Pee' },
        { key: 'poop', label: 'Poop' },
        { key: 'pottySchedule', label: 'Potty Schedule' },
        { key: 'napSchedule', label: 'Nap Schedule' },
        { key: 'sleepSchedule', label: 'Sleep Schedule' },
        { key: 'calories', label: 'Calories Eaten' },
      ];

      const chartImages = [];
      for (const item of order) {
        const el = chartRefs[item.key]?.current;
        if (!el) continue;

        const dataUrl = await toPng(el, {
          backgroundColor: '#ffffff',
          pixelRatio: 2,
          skipFonts: true,
        });

        const img = new Image();
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = dataUrl;
        });

        chartImages.push({
          label: item.label,
          dataUrl,
          width: img.naturalWidth,
          height: img.naturalHeight,
        });
      }

      const pawPng = await new Promise((resolve) => {
        const svgStr = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#E8BF8E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="4" r="2"/><circle cx="18" cy="8" r="2"/><circle cx="20" cy="16" r="2"/><path d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z"/></svg>`;
        const img = new Image();
        img.onload = () => {
          const c = document.createElement('canvas');
          c.width = 128; c.height = 128;
          const ctx = c.getContext('2d');
          ctx.drawImage(img, 0, 0, 128, 128);
          resolve(c.toDataURL('image/png'));
        };
        img.onerror = () => resolve(null);
        img.src = `data:image/svg+xml;base64,${btoa(svgStr)}`;
      });

      exportStatsPdf({ chartImages, rangeLabel, pawPng, puppyName: puppy?.name || 'Puppy' });
    } catch (err) {
      console.error('PDF export failed:', err);
      alert('PDF export failed: ' + (err.message || 'Unknown error'));
    } finally {
      setExporting(false);
    }
  }, [rangeLabel, chartRefs]);

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
            <button onClick={handleExportPdf} disabled={exporting} className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-steel-500 rounded-xl hover:bg-steel-600 transition-colors shadow-sm disabled:opacity-60">
              {exporting ? <><Loader2 size={15} className="animate-spin" /> Generating…</> : <><FileDown size={15} /> Export PDF</>}
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
          {/* Potty Success Rate — Line Chart */}
          <div ref={chartRefs.successRate} className="bg-white rounded-2xl border border-sand-200/80 shadow-sm p-5">
            <h3 className="text-xs font-semibold text-sand-500 mb-4 flex items-center gap-2 uppercase tracking-widest">
              <TrendingUp size={14} className="text-sand-400" />
              Potty Success Rate ({dayCount}d)
            </h3>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={pottyComboData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EBE6DE" />
                <XAxis {...xAxisProps} />
                <YAxis {...yAxisProps} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                <YAxis yAxisId="right" orientation="right" {...yAxisProps} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                <Tooltip content={<SuccessComboTooltip />} />
                <Line type="monotone" dataKey="successPct" stroke="#2B6AAF" strokeWidth={2.5} dot={{ fill: '#2B6AAF', r: 4, strokeWidth: 0 }} name="Success %" connectNulls activeDot={{ r: 6, fill: '#2B6AAF', strokeWidth: 2, stroke: '#fff' }} />
                <Line yAxisId="right" type="monotone" dataKey="successPct" stroke="transparent" dot={false} activeDot={false} legendType="none" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Pee Chart */}
          <div ref={chartRefs.pee} className="bg-white rounded-2xl border border-sand-200/80 shadow-sm p-5">
            <h3 className="text-xs font-semibold text-sand-500 mb-4 flex items-center gap-2 uppercase tracking-widest">
              <TrendingUp size={14} className="text-sand-400" />
              Pee ({dayCount}d)
            </h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={pottyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EBE6DE" />
                <XAxis {...xAxisProps} />
                <YAxis {...yAxisProps} domain={[0, maxPeePerDay]} />
                <YAxis yAxisId="right" orientation="right" {...yAxisProps} domain={[0, maxPeePerDay]} />
                <Tooltip content={<PeeTooltip />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px', color: '#9A8568' }} />
                <Bar dataKey="peeGood" stackId="pee" fill="#E2B735" name="Pee (Good)" radius={[0, 0, 0, 0]} />
                <Bar dataKey="peeAccident" stackId="pee" fill="#D4726A" name="Pee (Accident)" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="right" dataKey="peeGood" stackId="pee-r" fill="transparent" legendType="none" />
                <Bar yAxisId="right" dataKey="peeAccident" stackId="pee-r" fill="transparent" legendType="none" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Poop Chart */}
          <div ref={chartRefs.poop} className="bg-white rounded-2xl border border-sand-200/80 shadow-sm p-5">
            <h3 className="text-xs font-semibold text-sand-500 mb-4 flex items-center gap-2 uppercase tracking-widest">
              <TrendingUp size={14} className="text-sand-400" />
              Poop ({dayCount}d)
            </h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={pottyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EBE6DE" />
                <XAxis {...xAxisProps} />
                <YAxis {...yAxisProps} domain={[0, maxPoopPerDay]} />
                <YAxis yAxisId="right" orientation="right" {...yAxisProps} domain={[0, maxPoopPerDay]} />
                <Tooltip content={<PoopTooltip />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px', color: '#9A8568' }} />
                <Bar dataKey="poopGood" stackId="poop" fill="#926940" name="Poop (Good)" radius={[0, 0, 0, 0]} />
                <Bar dataKey="poopAccident" stackId="poop" fill="#D4726A" name="Poop (Accident)" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="right" dataKey="poopGood" stackId="poop-r" fill="transparent" legendType="none" />
                <Bar yAxisId="right" dataKey="poopAccident" stackId="poop-r" fill="transparent" legendType="none" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Potty Schedule Heatmap */}
          <div ref={chartRefs.pottySchedule} className="bg-white rounded-2xl border border-sand-200/80 shadow-sm p-5">
            <h3 className="text-xs font-semibold text-sand-500 mb-4 flex items-center gap-2 uppercase tracking-widest">
              <TrendingUp size={14} className="text-sand-400" />
              Potty Schedule ({dayCount}d)
            </h3>
            <PottySchedule dateRange={dateRange} allLogs={allLogs} />
          </div>

          {/* Nap Heatmap */}
          <div ref={chartRefs.napSchedule} className="bg-white rounded-2xl border border-sand-200/80 shadow-sm p-5">
            <h3 className="text-xs font-semibold text-sand-500 mb-4 flex items-center gap-2 uppercase tracking-widest">
              <TrendingUp size={14} className="text-sand-400" />
              Nap Schedule ({dayCount}d)
            </h3>
            <NapHeatmap dateRange={dateRange} allLogs={allLogs} />
          </div>

          {/* Sleep Schedule Heatmap */}
          <div ref={chartRefs.sleepSchedule} className="bg-white rounded-2xl border border-sand-200/80 shadow-sm p-5">
            <h3 className="text-xs font-semibold text-sand-500 mb-4 flex items-center gap-2 uppercase tracking-widest">
              <TrendingUp size={14} className="text-sand-400" />
              Sleep Schedule ({dayCount}d)
            </h3>
            <SleepHeatmap dateRange={dateRange} allLogs={allLogs} />
          </div>

          {/* Calories Chart */}
          <div ref={chartRefs.calories} className="bg-white rounded-2xl border border-sand-200/80 shadow-sm p-5">
            <h3 className="text-xs font-semibold text-sand-500 mb-4 flex items-center gap-2 uppercase tracking-widest">
              <TrendingUp size={14} className="text-sand-400" />
              Calories Eaten ({dayCount}d)
            </h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={calorieData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EBE6DE" />
                <XAxis {...xAxisProps} />
                <YAxis {...yAxisProps} allowDecimals={false} domain={[0, maxCalPerDay]} />
                <YAxis yAxisId="right" orientation="right" {...yAxisProps} allowDecimals={false} domain={[0, maxCalPerDay]} />
                <Tooltip content={<CaloriesTooltip />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px', color: '#918272' }} />
                <Bar dataKey="foodCal" stackId="cal" fill="#2B6AAF" name="Food" radius={[0, 0, 0, 0]} />
                <Bar dataKey="snackCal" stackId="cal" fill="#96BDE0" name="Treats" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="right" dataKey="foodCal" stackId="cal-r" fill="transparent" legendType="none" />
                <Bar yAxisId="right" dataKey="snackCal" stackId="cal-r" fill="transparent" legendType="none" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}
