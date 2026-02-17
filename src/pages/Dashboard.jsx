import { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { getGreeting, getTodayKey, formatDate, TZ } from '../utils/helpers';
import Modal from '../components/Modal';
import PottyForm from '../components/forms/PottyForm';
import MealForm from '../components/forms/MealForm';
import NapForm from '../components/forms/NapForm';
import WakeUpForm from '../components/forms/WakeUpForm';
import SkillsNotesForm from '../components/forms/SkillsNotesForm';
import DashboardChat from '../components/DashboardChat';
import {
  Droplets,
  UtensilsCrossed,
  Moon,
  Sun,
  PenLine,
} from 'lucide-react';

const quickAddButtons = [
  { id: 'potty', label: 'Potty', icon: Droplets, color: 'bg-steel-50 text-steel-600 border-steel-200 hover:bg-steel-100' },
  { id: 'meal', label: 'Meal', icon: UtensilsCrossed, color: 'bg-warm-50 text-warm-700 border-warm-200 hover:bg-warm-100' },
  { id: 'nap', label: 'Nap', icon: Moon, color: 'bg-steel-50 text-steel-700 border-steel-200 hover:bg-steel-100' },
  { id: 'wake', label: 'Wake / Bed', icon: Sun, color: 'bg-sand-100 text-sand-700 border-sand-300 hover:bg-sand-200' },
  { id: 'notes', label: 'Notes', icon: PenLine, color: 'bg-sand-100 text-sand-600 border-sand-300 hover:bg-sand-200' },
];

export default function Dashboard() {
  const { puppy } = useData();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeModal, setActiveModal] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const today = getTodayKey();
  const puppyName = puppy?.name || 'your puppy';

  return (
    <div className="pb-4 space-y-6">
      {/* Greeting */}
      <div className="text-center pt-2">
        <p className="text-sand-800 text-lg font-semibold">
          {getGreeting()}, {puppyName}&apos;s family!
        </p>
        <p className="text-sand-500 text-sm mt-1">
          {formatDate(today)}
        </p>
        <div className="text-lg font-medium text-sand-400 tabular-nums tracking-tight mt-0.5">
          {currentTime.toLocaleTimeString('en-US', {
            timeZone: TZ,
            hour: 'numeric',
            minute: '2-digit',
          })}
        </div>
      </div>

      {/* Welcome intro */}
      <div className="bg-white rounded-2xl border border-sand-200/80 shadow-sm px-6 py-5 text-center max-w-2xl mx-auto">
        <p className="text-sand-700 text-sm leading-relaxed">
          Welcome to <strong className="text-steel-500">PuppyBot</strong> — your intelligent companion for tracking {puppyName}&apos;s daily routine.
          Use the buttons below to log potty breaks, meals, naps, sleep schedules, and notes.
          Every little entry helps you spot patterns and celebrate progress! Plus, our <strong className="text-steel-500">AI-powered assistant</strong> below 
          can analyze your data, answer questions, and provide personalized training insights.
        </p>
      </div>

      {/* Quick Add Buttons — full width, closer to square */}
      <div className="grid grid-cols-5 gap-2 sm:gap-3">
        {quickAddButtons.map((btn) => {
          const Icon = btn.icon;
          return (
            <button
              key={btn.id}
              onClick={() => setActiveModal(btn.id)}
              className={`flex flex-col items-center justify-center gap-2 py-6 sm:py-8 rounded-2xl border text-sm font-bold whitespace-nowrap transition-all active:scale-[0.97] shadow-sm ${btn.color}`}
            >
              <Icon size={26} />
              {btn.label}
            </button>
          );
        })}
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

      {/* AI Chat Assistant */}
      <DashboardChat />
    </div>
  );
}
