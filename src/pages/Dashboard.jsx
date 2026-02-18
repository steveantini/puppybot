import { useState } from 'react';
import { useData } from '../context/DataContext';
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
  const [activeModal, setActiveModal] = useState(null);

  const puppyName = puppy?.name || 'your puppy';

  return (
    <div className="pb-4">
      {/* Welcome intro — no card, just text on background */}
      <div className="px-2 text-center pt-1">
        <p className="text-sand-600 text-sm leading-relaxed">
          Welcome to <strong className="text-steel-500">PuppyBot</strong> — your intelligent companion for tracking {puppyName}&apos;s daily routine.
          {' '}Use the buttons below to log potty breaks, meals, naps, sleep schedules, and notes.
          Every little entry helps you spot patterns and celebrate progress!
        </p>
      </div>

      {/* Quick Add Buttons */}
      <div className="max-w-3xl mx-auto grid grid-cols-5 gap-2 sm:gap-3 mt-16">
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
      <div className="mt-16">
        <DashboardChat />
      </div>
    </div>
  );
}
