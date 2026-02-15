# PuppyBot

A clean, modern puppy behavior tracker built with React. Log potty breaks, meals, naps, wake/bed times, training skills, and general notes — all from a fast, mobile-friendly interface. Designed to replace paper daily dog logs with something you can tap through in seconds.

## Features

- **Dashboard** — Live clock, today's quick stats, chronological timeline of all logged activities, and sticky quick-add buttons for fast entry (3 taps or fewer)
- **History** — Browse past days in a scrollable list; tap any day to expand and see the full log with potty results, meals, naps, schedule, skills, and notes
- **Stats & Trends** — 7-day bar and line charts for potty success rate, meal tracking, and nap frequency (powered by Recharts)
- **Puppy Profile** — Store your puppy's name, breed, birthday (with auto-calculated age), photo, and a running weight log
- **Health Tracker** — Record immunizations, vet visits, and medications with date, description, and filterable categories

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + React Router 7 |
| Build | Vite 6 |
| Styling | Tailwind CSS 4 |
| Icons | Lucide React |
| Charts | Recharts |
| Storage | localStorage (Supabase-ready architecture) |

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install & Run

```bash
# Clone the repo
git clone https://github.com/steveantini/puppybot.git
cd puppybot

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── BottomNav.jsx          # 5-tab bottom navigation bar
│   ├── Modal.jsx              # Slide-up (mobile) / centered (desktop) modal
│   └── forms/
│       ├── PottyForm.jsx      # Potty break logging (pee/poop/bell)
│       ├── MealForm.jsx       # Meal logging (amount given/eaten/notes)
│       ├── NapForm.jsx        # Nap logging (start/end time)
│       ├── WakeUpForm.jsx     # Wake up & bed time logging
│       └── SkillsNotesForm.jsx # Free-text skills & notes
├── context/
│   └── DataContext.jsx        # React Context provider for all app state
├── pages/
│   ├── Dashboard.jsx          # Today's timeline + quick stats + quick-add
│   ├── History.jsx            # Past days with expandable detail view
│   ├── Stats.jsx              # 7-day trend charts
│   ├── PuppyProfile.jsx      # Puppy info + weight log
│   └── HealthTracker.jsx     # Immunizations, vet visits, medications
├── utils/
│   ├── storage.js             # localStorage CRUD operations
│   └── helpers.js             # Date/time formatting, ID generation
├── App.jsx                    # Root layout + routing
├── main.jsx                   # Entry point
└── index.css                  # Tailwind imports + custom animations
```

## Data Model

All data is stored in `localStorage` under three keys, designed for an easy future migration to Supabase or any backend.

**Puppy Profile** (`puppybot_puppy`)
```
{ name, breed, birthday, photoUrl, weightLog[] }
```

**Daily Logs** (`puppybot_logs`)
```
{
  [YYYY-MM-DD]: {
    date, wakeUpTimes[], bedTime,
    pottyBreaks[] (time, pee, poop, ringBell),
    naps[] (startTime, endTime),
    meals[] (time, foodGiven, foodEaten, notes),
    skills, notes
  }
}
```

**Health Records** (`puppybot_health`)
```
[{ id, type, date, title, description, notes }]
```

## Design

- Soft blues, warm browns, and whites — friendly but not childish
- Rounded corners and subtle shadows throughout
- Responsive: mobile-first with expanded layouts on tablet/desktop
- Bottom sheet modals on mobile, centered dialogs on desktop
- Touch-optimized with `active:scale` feedback and large tap targets

## Roadmap

- [ ] Supabase backend for cloud sync and multi-device access
- [ ] Push notifications for feeding/potty reminders
- [ ] Export daily log as PDF
- [ ] Multi-puppy support
- [ ] Photo gallery per day

## License

Private project.
