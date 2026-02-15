import { NavLink } from 'react-router-dom';
import { Home, CalendarDays, BarChart3, Dog, Heart } from 'lucide-react';

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/history', icon: CalendarDays, label: 'History' },
  { to: '/stats', icon: BarChart3, label: 'Stats' },
  { to: '/profile', icon: Dog, label: 'Puppy' },
  { to: '/health', icon: Heart, label: 'Health' },
];

function NavItem({ to, icon: Icon, label }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
    >
      {({ isActive }) => (
        <div
          className={`flex flex-col items-center py-2 px-3 rounded-xl transition-colors min-w-[48px] ${
            isActive ? 'text-sky-600' : 'text-stone-400 hover:text-stone-600'
          }`}
        >
          <Icon size={22} strokeWidth={isActive ? 2.5 : 1.5} />
          <span className={`text-[10px] mt-0.5 ${isActive ? 'font-semibold' : 'font-medium'}`}>
            {label}
          </span>
        </div>
      )}
    </NavLink>
  );
}

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-stone-200 z-50">
      <div className="max-w-lg mx-auto flex items-center justify-around py-1 px-2 pb-[max(0.25rem,env(safe-area-inset-bottom))]">
        {navItems.map((item) => (
          <NavItem key={item.to} {...item} />
        ))}
      </div>
    </nav>
  );
}
