import { useMemo, useState } from 'react';
import { useData } from '../context/DataContext';
import { formatTime, getTodayKey } from '../utils/helpers';
import {
  Droplets,
  UtensilsCrossed,
  Moon,
  Sun,
  PenLine,
  CircleCheck,
  CircleAlert,
  Cookie,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

const CAL_PER_CUP = 409;
const CAL_PER_SNACK = 4;

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

function StatCard({ icon: Icon, iconColor, label, expandable, expanded, onToggle, children, detail }) {
  return (
    <div className="bg-white rounded-2xl border border-sand-200/80 shadow-sm p-4 flex flex-col gap-1.5">
      <button
        onClick={expandable ? onToggle : undefined}
        className={`flex items-center gap-2 mb-1 w-full ${expandable ? 'cursor-pointer' : 'cursor-default'}`}
      >
        <Icon size={16} className={iconColor} />
        <span className="text-[11px] font-semibold text-sand-500 uppercase tracking-widest flex-1 text-left">{label}</span>
        {expandable && (
          expanded
            ? <ChevronUp size={14} className="text-sand-300" />
            : <ChevronDown size={14} className="text-sand-300" />
        )}
      </button>
      <div className="space-y-1">{children}</div>
      {expanded && detail && (
        <div className="border-t border-sand-100 mt-2 pt-2 space-y-1.5">
          {detail}
        </div>
      )}
    </div>
  );
}

function Metric({ value, unit, sub }) {
  return (
    <div>
      <span className="text-2xl font-bold text-sand-800">{value}</span>
      {unit && <span className="text-sm font-medium text-sand-500 ml-1">{unit}</span>}
      {sub && <p className="text-[11px] text-sand-400 mt-0.5">{sub}</p>}
    </div>
  );
}

function SuccessBar({ rate }) {
  const color = rate === 100 ? 'bg-emerald-400' : rate >= 80 ? 'bg-amber-400' : 'bg-rose-400';
  return (
    <div className="flex items-center gap-2 mt-1">
      <div className="flex-1 h-1.5 bg-sand-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${rate}%` }} />
      </div>
      <span className={`text-xs font-bold ${rate === 100 ? 'text-emerald-500' : rate >= 80 ? 'text-amber-500' : 'text-rose-400'}`}>
        {rate}%
      </span>
    </div>
  );
}

export default function TodaySnapshot() {
  const { allLogs } = useData();
  const todayKey = getTodayKey();
  const log = allLogs[todayKey];

  const [expandedCards, setExpandedCards] = useState({ potty: true, meals: true, naps: true });

  const toggle = (key) =>
    setExpandedCards((prev) => ({ ...prev, [key]: !prev[key] }));

  const pottyStats = useMemo(() => {
    const breaks = log?.pottyBreaks || [];
    let pee = 0, poop = 0, accidents = 0, total = 0;
    breaks.forEach((b) => {
      if (b.pee === 'good') { pee++; total++; }
      if (b.pee === 'accident') { pee++; accidents++; total++; }
      if (b.poop === 'good') { poop++; total++; }
      if (b.poop === 'accident') { poop++; accidents++; total++; }
    });
    const good = total - accidents;
    const rate = total > 0 ? Math.round((good / total) * 100) : null;
    return { breaks: breaks.length, pee, poop, accidents, rate };
  }, [log?.pottyBreaks]);

  const mealStats = useMemo(() => {
    const meals = log?.meals || [];
    let totalCups = 0;
    meals.forEach((m) => {
      totalCups += parseCups(m.foodGiven) * parseEatenFraction(m.foodEaten);
    });
    const foodCal = Math.round(totalCups * CAL_PER_CUP);
    const snackCal = (log?.snacks || 0) * CAL_PER_SNACK;
    return { count: meals.length, foodCal, snackCal, totalCal: foodCal + snackCal, treats: log?.snacks || 0 };
  }, [log?.meals, log?.snacks]);

  const napStats = useMemo(() => {
    const naps = log?.naps || [];
    let totalMin = 0;
    naps.forEach((n) => {
      if (n.startTime && n.endTime) {
        const [sh, sm] = n.startTime.split(':').map(Number);
        const [eh, em] = n.endTime.split(':').map(Number);
        const dur = (eh * 60 + em) - (sh * 60 + sm);
        if (dur > 0) totalMin += dur;
      }
    });
    const hrs = Math.floor(totalMin / 60);
    const mins = totalMin % 60;
    const label = totalMin > 0
      ? (hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`)
      : '—';
    return { count: naps.length, totalMin, label };
  }, [log?.naps]);

  const schedule = useMemo(() => {
    const wakes = log?.wakeUpTimes || [];
    const morningWake = wakes.find((w) => w.label !== 'Night Wake');
    const nightWake = wakes.find((w) => w.label === 'Night Wake');
    return {
      wake: morningWake ? formatTime(morningWake.time) : null,
      nightWake: nightWake ? formatTime(nightWake.time) : null,
      bed: log?.bedTime ? formatTime(log.bedTime) : null,
    };
  }, [log?.wakeUpTimes, log?.bedTime]);

  const hasNotes = !!(log?.skills || log?.notes);

  if (!log) return null;

  const isEmpty = pottyStats.breaks === 0 && mealStats.count === 0 && napStats.count === 0
    && !schedule.wake && !schedule.bed && !hasNotes;

  if (isEmpty) return null;

  const pottyBreaks = log?.pottyBreaks || [];
  const meals = log?.meals || [];
  const naps = log?.naps || [];

  const pottyDetail = pottyBreaks.length > 0 && (
    <div className="space-y-1.5">
      {pottyBreaks.map((p, i) => (
        <div key={p.id || i} className="flex items-center gap-2 text-[12px] flex-wrap">
          <span className="text-sand-400 font-medium w-[52px] shrink-0">{formatTime(p.time)}</span>
          {p.pee === 'good' && <span className="text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-medium">Pee ✓</span>}
          {p.pee === 'accident' && <span className="text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded font-medium">Pee ✗</span>}
          {p.poop === 'good' && <span className="text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-medium">Poop ✓</span>}
          {p.poop === 'accident' && <span className="text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded font-medium">Poop ✗</span>}
          {p.ringBell && <span className="text-steel-500 bg-steel-50 px-1.5 py-0.5 rounded font-medium">🔔</span>}
        </div>
      ))}
    </div>
  );

  const mealDetail = meals.length > 0 && (
    <div className="space-y-1.5">
      {meals.map((m, i) => (
        <div key={m.id || i} className="text-[12px]">
          <div className="flex items-center gap-2">
            <span className="text-sand-400 font-medium w-[52px] shrink-0">{formatTime(m.time)}</span>
            <span className="text-sand-700">
              {m.foodGiven}{m.foodEaten ? ` → ${m.foodEaten}` : ''}
            </span>
          </div>
          {m.notes && <p className="text-[11px] text-sand-400 italic ml-[60px]">{m.notes}</p>}
        </div>
      ))}
    </div>
  );

  const napDetail = naps.length > 0 && (
    <div className="space-y-1.5">
      {naps.map((n, i) => {
        let dur = '';
        if (n.startTime && n.endTime) {
          const [sh, sm] = n.startTime.split(':').map(Number);
          const [eh, em] = n.endTime.split(':').map(Number);
          const mins = (eh * 60 + em) - (sh * 60 + sm);
          if (mins > 0) dur = mins >= 60 ? `${Math.floor(mins / 60)}h ${mins % 60}m` : `${mins}m`;
        }
        return (
          <div key={n.id || i} className="flex items-center gap-2 text-[12px]">
            <Moon size={11} className="text-steel-400 shrink-0" />
            <span className="text-sand-700">{formatTime(n.startTime)} – {formatTime(n.endTime)}</span>
            {dur && <span className="text-sand-400">({dur})</span>}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto mt-8">
      <h3 className="text-xs font-semibold text-sand-500 uppercase tracking-widest mb-3 flex items-center gap-2 px-1">
        <Sun size={13} className="text-warm-300" />
        Today&apos;s Snapshot
      </h3>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Potty */}
        <StatCard
          icon={Droplets}
          iconColor="text-steel-400"
          label="Potty"
          expandable={pottyBreaks.length > 0}
          expanded={expandedCards.potty}
          onToggle={() => toggle('potty')}
          detail={pottyDetail}
        >
          <Metric value={pottyStats.breaks} unit={pottyStats.breaks === 1 ? 'break' : 'breaks'} />
          {pottyStats.breaks > 0 && (
            <>
              <div className="flex items-center gap-3 text-[11px] text-sand-500">
                <span>💧 {pottyStats.pee} pee</span>
                <span>💩 {pottyStats.poop} poop</span>
              </div>
              {pottyStats.rate !== null && <SuccessBar rate={pottyStats.rate} />}
              {pottyStats.accidents > 0 && (
                <div className="flex items-center gap-1 text-[11px] text-rose-400 font-medium mt-0.5">
                  <CircleAlert size={11} /> {pottyStats.accidents} accident{pottyStats.accidents !== 1 ? 's' : ''}
                </div>
              )}
              {pottyStats.accidents === 0 && pottyStats.breaks > 0 && (
                <div className="flex items-center gap-1 text-[11px] text-emerald-500 font-medium mt-0.5">
                  <CircleCheck size={11} /> No accidents
                </div>
              )}
            </>
          )}
        </StatCard>

        {/* Meals */}
        <StatCard
          icon={UtensilsCrossed}
          iconColor="text-warm-500"
          label="Meals"
          expandable={meals.length > 0}
          expanded={expandedCards.meals}
          onToggle={() => toggle('meals')}
          detail={mealDetail}
        >
          <Metric
            value={mealStats.count}
            unit={mealStats.count === 1 ? 'meal' : 'meals'}
          />
          {mealStats.totalCal > 0 && (
            <p className="text-[11px] text-sand-500">
              {mealStats.totalCal} cal
              {mealStats.snackCal > 0 && <span className="text-sand-400"> ({mealStats.foodCal} food + {mealStats.snackCal} treats)</span>}
            </p>
          )}
          {mealStats.treats > 0 && (
            <div className="flex items-center gap-1 text-[11px] text-warm-500 font-medium mt-0.5">
              <Cookie size={11} /> {mealStats.treats} treat{mealStats.treats !== 1 ? 's' : ''}
            </div>
          )}
        </StatCard>

        {/* Naps */}
        <StatCard
          icon={Moon}
          iconColor="text-steel-500"
          label="Naps"
          expandable={naps.length > 0}
          expanded={expandedCards.naps}
          onToggle={() => toggle('naps')}
          detail={napDetail}
        >
          <Metric
            value={napStats.count}
            unit={napStats.count === 1 ? 'nap' : 'naps'}
          />
          {napStats.totalMin > 0 && (
            <p className="text-[11px] text-sand-500">{napStats.label} total sleep</p>
          )}
        </StatCard>

        {/* Schedule */}
        <StatCard icon={Sun} iconColor="text-warm-300" label="Schedule">
          <div className="space-y-1 text-sm text-sand-700">
            <div className="flex justify-between">
              <span className="text-sand-400 text-[11px]">Wake</span>
              <span className="font-semibold text-[13px]">{schedule.wake || '—'}</span>
            </div>
            {schedule.nightWake && (
              <div className="flex justify-between">
                <span className="text-sand-400 text-[11px]">Night wake</span>
                <span className="font-semibold text-[13px]">{schedule.nightWake}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-sand-400 text-[11px]">Bed</span>
              <span className="font-semibold text-[13px]">{schedule.bed || '—'}</span>
            </div>
          </div>
        </StatCard>
      </div>

      {/* Notes preview */}
      {hasNotes && (
        <div className="mt-3 bg-white rounded-2xl border border-sand-200/80 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-2">
            <PenLine size={14} className="text-sand-400" />
            <span className="text-[11px] font-semibold text-sand-500 uppercase tracking-widest">Notes & Skills</span>
          </div>
          {log.skills && (
            <p className="text-sm text-sand-600 leading-relaxed">
              <span className="font-semibold text-sand-700">Skills: </span>
              {log.skills.length > 120 ? log.skills.slice(0, 120) + '…' : log.skills}
            </p>
          )}
          {log.notes && (
            <p className="text-sm text-sand-600 leading-relaxed mt-1">
              <span className="font-semibold text-sand-700">Notes: </span>
              {log.notes.length > 120 ? log.notes.slice(0, 120) + '…' : log.notes}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
