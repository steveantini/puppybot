# PuppyBot

A clean, modern puppy behavior tracker built with React. Log potty breaks, meals, naps, wake/bed times, training skills, and general notes — all from a fast, mobile-friendly interface. Designed to replace paper daily dog logs with something you can tap through in seconds.

**Live app:** [puppybot.vercel.app](https://puppybot.vercel.app/)

## Features

- **Dashboard** — Live clock, today's quick stats, chronological timeline of all logged activities, and sticky quick-add buttons for fast entry (3 taps or fewer)
- **History** — Browse past days in a scrollable list; tap any day to expand full details. Select individual dates or all dates and export to PDF.
- **Stats & Trends** — 7-day bar and line charts for potty success rate, meal tracking, and nap frequency (powered by Recharts). Export stats to PDF.
- **Puppy Profile** — Store your puppy's name, breed, birthday (with auto-calculated age), photo, and a running weight log
- **Health Tracker** — Record immunizations, vet visits, and medications with date, description, and filterable categories
- **Date Picker on All Forms** — Log entries for any date, not just today
- **PDF Export** — Generate printable reports from both History and Stats pages

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + React Router 7 |
| Build | Vite 6 |
| Styling | Tailwind CSS 4 |
| Icons | Lucide React |
| Charts | Recharts |
| PDF Export | jsPDF + jspdf-autotable |
| Database | Supabase (PostgreSQL) |
| Hosting | Vercel |

## Deployment

### Vercel

The app is hosted on [Vercel](https://vercel.com) with automatic deployments from the `main` branch.

**Live URL:** [https://puppybot.vercel.app/](https://puppybot.vercel.app/)

Two environment variables must be set in Vercel under **Settings → Environment Variables**:

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon/public API key |

Enable them for Production, Preview, and Development environments.

### Supabase

[Supabase](https://supabase.com) provides the PostgreSQL database for all app data. The schema is defined in `supabase/migration.sql` and creates four tables:

| Table | Purpose |
|-------|---------|
| `puppies` | Puppy profile (name, breed, birthday, photo) |
| `weight_logs` | Weight entries linked to a puppy |
| `daily_logs` | One row per day with JSONB columns for potty breaks, meals, naps, schedule, skills, and notes |
| `health_records` | Immunizations, vet visits, and medications |

**To set up the database:** Open the Supabase SQL Editor, paste the contents of `supabase/migration.sql`, and run it. The migration also creates permissive RLS policies (no authentication required for now).

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- A Supabase project (free tier works)

### Install & Run

```bash
# Clone the repo
git clone https://github.com/steveantini/puppybot.git
cd puppybot

# Install dependencies
npm install

# Create a .env file from the example
cp .env.example .env
# Fill in your Supabase URL and anon key in .env

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
│       ├── PottyForm.jsx      # Potty break logging (pee/poop/bell/accident)
│       ├── MealForm.jsx       # Meal logging (amount given/eaten/notes)
│       ├── NapForm.jsx        # Nap logging (start/end time)
│       ├── WakeUpForm.jsx     # Wake up & bed time logging
│       └── SkillsNotesForm.jsx # Free-text skills & notes
├── context/
│   └── DataContext.jsx        # React Context provider — async Supabase state
├── pages/
│   ├── Dashboard.jsx          # Today's timeline + quick stats + quick-add
│   ├── History.jsx            # Past days with expandable details + PDF export
│   ├── Stats.jsx              # 7-day trend charts + PDF export
│   ├── PuppyProfile.jsx      # Puppy info + weight log
│   └── HealthTracker.jsx     # Immunizations, vet visits, medications
├── utils/
│   ├── supabase.js            # Supabase client initialization
│   ├── storage.js             # Async CRUD operations (Supabase)
│   ├── helpers.js             # Date/time formatting, ID generation
│   └── pdfExport.js           # PDF report generation
├── App.jsx                    # Root layout + routing + loading screen
├── main.jsx                   # Entry point
└── index.css                  # Tailwind imports + custom animations

supabase/
└── migration.sql              # Database table creation + RLS policies
```

## Data Model

All data is stored in Supabase PostgreSQL. Daily log sub-items (potty breaks, meals, naps, etc.) are stored as JSONB columns for simplicity.

**Puppy Profile** (`puppies` + `weight_logs`)
```
{ name, breed, birthday, photo_url }
weight_logs: [{ date, weight }]
```

**Daily Logs** (`daily_logs`)
```
{
  date,
  wake_up_times[] (JSONB),
  bed_time,
  potty_breaks[] (time, pee, poop, ringBell),
  naps[] (startTime, endTime),
  meals[] (time, foodGiven, foodEaten, notes),
  skills, notes
}
```

**Health Records** (`health_records`)
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

- [x] Supabase backend for cloud sync and multi-device access
- [x] Export daily log / stats as PDF
- [x] Date picker for logging past days
- [ ] Push notifications for feeding/potty reminders
- [ ] Multi-puppy support
- [ ] Photo gallery per day
- [ ] User authentication

## License

Private project.
