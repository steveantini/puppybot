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
        <div className="flex flex-col items-center py-2 px-3 min-w-[48px] relative">
          <Icon
            size={21}
            strokeWidth={isActive ? 2.2 : 1.5}
            className={`transition-colors ${
              isActive ? 'text-steel-600' : 'text-sand-400 hover:text-sand-600'
            }`}
          />
          <span className={`text-[10px] mt-1 transition-colors ${
            isActive ? 'font-bold text-steel-600' : 'font-medium text-sand-400'
          }`}>
            {label}
          </span>
          {isActive && (
            <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-[2.5px] rounded-full bg-steel-500" />
          )}
        </div>
      )}
    </NavLink>
  );
}

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-sand-200 z-50 shadow-[0_-1px_3px_rgba(0,0,0,0.04)]">
      <div className="max-w-5xl mx-auto flex items-center justify-around py-1 px-2 pb-[max(0.25rem,env(safe-area-inset-bottom))]">
        {navItems.map((item) => (
          <NavItem key={item.to} {...item} />
        ))}
      </div>
    </nav>
  );
}
