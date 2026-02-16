import { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { formatTime, getCurrentTime, getGreeting, getTodayKey, formatDate } from '../utils/helpers';
import Modal from '../components/Modal';
import PottyForm from '../components/forms/PottyForm';
import MealForm from '../components/forms/MealForm';
import NapForm from '../components/forms/NapForm';
import WakeUpForm from '../components/forms/WakeUpForm';
import SkillsNotesForm from '../components/forms/SkillsNotesForm';
import {
  Droplets,
  UtensilsCrossed,
  Moon,
  Sun,
  BedDouble,
  PenLine,
  Trash2,
} from 'lucide-react';

const quickAddButtons = [
  { id: 'potty', label: 'Potty', icon: Droplets, color: 'bg-steel-50 text-steel-600 border-steel-200' },
  { id: 'meal', label: 'Meal', icon: UtensilsCrossed, color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { id: 'nap', label: 'Nap', icon: Moon, color: 'bg-indigo-50 text-indigo-600 border-indigo-200' },
  { id: 'wake', label: 'Wake / Bed', icon: Sun, color: 'bg-orange-50 text-orange-600 border-orange-200' },
  { id: 'notes', label: 'Notes', icon: PenLine, color: 'bg-sand-100 text-sand-600 border-sand-300' },
];

export default function Dashboard() {
  const { todayLog, puppy, deletePottyBreak, deleteMeal, deleteNap } = useData();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeModal, setActiveModal] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const today = getTodayKey();

  // Build timeline entries
  const timelineEntries = [];

  todayLog.wakeUpTimes?.forEach((w) => {
    timelineEntries.push({
      type: 'wake',
      time: w.time,
      data: w,
      icon: Sun,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50',
      label: 'Wake Up',
    });
  });

  todayLog.pottyBreaks?.forEach((p) => {
    const details = [];
    if (p.pee === 'good') details.push('Pee ✓');
    if (p.pee === 'accident') details.push('Pee ✗');
    if (p.poop === 'good') details.push('Poop ✓');
    if (p.poop === 'accident') details.push('Poop ✗');
    if (p.ringBell) details.push('Bell 🔔');
    timelineEntries.push({
      type: 'potty',
      time: p.time,
      data: p,
      icon: Droplets,
      color: 'text-steel-500',
      bgColor: 'bg-steel-50',
      label: 'Potty Break',
      detail: details.join(' · '),
      id: p.id,
    });
  });

  todayLog.meals?.forEach((m) => {
    timelineEntries.push({
      type: 'meal',
      time: m.time,
      data: m,
      icon: UtensilsCrossed,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      label: 'Meal',
      detail: `${m.foodGiven || ''}${m.foodEaten ? ' → ' + m.foodEaten : ''}`,
      id: m.id,
    });
  });

  todayLog.naps?.forEach((n) => {
    timelineEntries.push({
      type: 'nap',
      time: n.startTime,
      data: n,
      icon: Moon,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-50',
      label: 'Nap',
      detail: `${formatTime(n.startTime)} – ${formatTime(n.endTime)}`,
      id: n.id,
    });
  });

  if (todayLog.bedTime) {
    timelineEntries.push({
      type: 'bed',
      time: todayLog.bedTime,
      icon: BedDouble,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-50',
      label: 'Bed Time',
    });
  }

  timelineEntries.sort((a, b) => (a.time || '').localeCompare(b.time || ''));

  const pottyCount = todayLog.pottyBreaks?.length || 0;
  const mealCount = todayLog.meals?.length || 0;
  const napCount = todayLog.naps?.length || 0;
  const pottyGood = todayLog.pottyBreaks?.filter(
    (p) => p.pee === 'good' || p.poop === 'good'
  ).length || 0;

  const handleDelete = (type, id) => {
    if (type === 'potty') deletePottyBreak(id);
    if (type === 'meal') deleteMeal(id);
    if (type === 'nap') deleteNap(id);
  };

  return (
    <div className="pb-4 space-y-5">
      {/* Time & Greeting */}
      <div className="text-center pt-1">
        <div className="text-4xl font-light text-sand-800 tabular-nums tracking-tight">
          {currentTime.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
          })}
        </div>
        <p className="text-sand-400 text-sm mt-1.5">
          {getGreeting()}
          {puppy?.name ? `, ${puppy.name}'s family` : ''} &middot;{' '}
          {formatDate(today)}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl p-4 text-center border border-sand-200/70">
          <Droplets className="mx-auto text-steel-400" size={20} />
          <div className="text-2xl font-semibold text-sand-800 mt-1.5">{pottyCount}</div>
          <div className="text-[11px] text-sand-400 font-medium">
            Potty{pottyGood > 0 ? ` (${pottyGood} good)` : ''}
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 text-center border border-sand-200/70">
          <UtensilsCrossed className="mx-auto text-amber-400" size={20} />
          <div className="text-2xl font-semibold text-sand-800 mt-1.5">{mealCount}</div>
          <div className="text-[11px] text-sand-400 font-medium">Meals</div>
        </div>
        <div className="bg-white rounded-xl p-4 text-center border border-sand-200/70">
          <Moon className="mx-auto text-indigo-400" size={20} />
          <div className="text-2xl font-semibold text-sand-800 mt-1.5">{napCount}</div>
          <div className="text-[11px] text-sand-400 font-medium">Naps</div>
        </div>
      </div>

      {/* Main content area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Timeline */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-sand-200/70 overflow-hidden">
          <div className="px-4 py-3.5 border-b border-sand-100">
            <h3 className="text-[13px] font-semibold text-sand-700 uppercase tracking-wide">Today&apos;s Timeline</h3>
          </div>
          {timelineEntries.length === 0 ? (
            <div className="px-4 py-12 text-center text-sand-400 text-sm">
              <p>No entries yet today.</p>
              <p className="mt-1 text-sand-300 text-xs">Use the buttons below to start logging!</p>
            </div>
          ) : (
            <div className="divide-y divide-sand-100/60">
              {timelineEntries.map((entry, i) => {
                const Icon = entry.icon;
                return (
                  <div key={`${entry.type}-${entry.time}-${i}`} className="px-4 py-3 flex items-start gap-3 group">
                    <div className={`mt-0.5 p-1.5 rounded-lg ${entry.bgColor} ${entry.color}`}>
                      <Icon size={15} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sand-800 text-sm">
                          {entry.label}
                        </span>
                        <span className="text-xs text-sand-400">
                          {formatTime(entry.time)}
                        </span>
                      </div>
                      {entry.detail && (
                        <p className="text-xs text-sand-500 mt-0.5">{entry.detail}</p>
                      )}
                      {entry.data?.notes && (
                        <p className="text-xs text-sand-400 mt-0.5 italic">
                          {entry.data.notes}
                        </p>
                      )}
                    </div>
                    {entry.id && (
                      <button
                        onClick={() => handleDelete(entry.type, entry.id)}
                        className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 p-1.5 text-sand-300 hover:text-rose-400 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Skills & Notes Summary */}
        <div className="space-y-4">
          {(todayLog.skills || todayLog.notes) ? (
            <div className="bg-white rounded-xl border border-sand-200/70 p-4 space-y-3">
              {todayLog.skills && (
                <div>
                  <span className="text-[11px] font-semibold text-sand-400 uppercase tracking-wide">
                    Skills
                  </span>
                  <p className="text-sm text-sand-700 mt-0.5 leading-relaxed">{todayLog.skills}</p>
                </div>
              )}
              {todayLog.notes && (
                <div>
                  <span className="text-[11px] font-semibold text-sand-400 uppercase tracking-wide">
                    Notes
                  </span>
                  <p className="text-sm text-sand-700 mt-0.5 leading-relaxed">{todayLog.notes}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-sand-200/70 p-5 text-center">
              <PenLine className="mx-auto text-sand-300 mb-2" size={18} />
              <p className="text-sand-400 text-sm">No skills or notes yet today.</p>
              <p className="text-xs mt-1 text-sand-300">Tap &quot;Notes&quot; below to add.</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Add Buttons */}
      <div className="sticky bottom-[68px] z-40 bg-gradient-to-t from-sand-50 via-sand-50/95 to-sand-50/0 pt-6 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-hide justify-start sm:justify-center">
          {quickAddButtons.map((btn) => {
            const Icon = btn.icon;
            return (
              <button
                key={btn.id}
                onClick={() => setActiveModal(btn.id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl border text-sm font-medium whitespace-nowrap transition-all active:scale-[0.97] ${btn.color}`}
              >
                <Icon size={15} />
                {btn.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Modals */}
      <Modal
        isOpen={activeModal === 'potty'}
        onClose={() => setActiveModal(null)}
        title="Log Potty Break"
      >
        <PottyForm onClose={() => setActiveModal(null)} />
      </Modal>
      <Modal
        isOpen={activeModal === 'meal'}
        onClose={() => setActiveModal(null)}
        title="Log Meal"
      >
        <MealForm onClose={() => setActiveModal(null)} />
      </Modal>
      <Modal
        isOpen={activeModal === 'nap'}
        onClose={() => setActiveModal(null)}
        title="Log Nap"
      >
        <NapForm onClose={() => setActiveModal(null)} />
      </Modal>
      <Modal
        isOpen={activeModal === 'wake'}
        onClose={() => setActiveModal(null)}
        title="Log Wake / Bed Time"
      >
        <WakeUpForm onClose={() => setActiveModal(null)} />
      </Modal>
      <Modal
        isOpen={activeModal === 'notes'}
        onClose={() => setActiveModal(null)}
        title="Skills & Notes"
      >
        <SkillsNotesForm onClose={() => setActiveModal(null)} />
      </Modal>
    </div>
  );
}
