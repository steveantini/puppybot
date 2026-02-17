# PuppyBot

A clean, modern puppy behavior tracker built with React. Log potty breaks, meals, naps, wake/bed times, training skills, and general notes — all from a fast, mobile-friendly interface. Designed to replace paper daily dog logs with something you can tap through in seconds.

**Live app:** [puppybot.vercel.app](https://puppybot.vercel.app/)

## Features

- **Dashboard** — Personalized greeting, live clock, a welcoming intro, and large quick-add buttons for fast entry (3 taps or fewer)
- **History** — Browse past days in a scrollable list; tap any day to expand full details. Expand All / Collapse All toggle to view everything at once. Filter by category (Potty, Meals, Naps, Schedule, Skills, Notes) to see all matching entries across all dates. Select individual dates or all dates and export to PDF.
- **Stats & Trends** — Comprehensive charts powered by Recharts with a date range selector (All Time, Last 7 Days, Last 30 Days, Year to Date):
  - Potty success rate line chart tracking daily % trend; hover shows total, good, accidents, and %
  - Separate Pee (yellow/red) and Poop (brown/red) bar charts; tooltips show category-specific totals, accidents, and success rate
  - Calories eaten chart in shades of blue (dark blue for food, light blue for snacks)
  - Nap schedule heatmap in light blue (Gantt-style, 6 AM–9 PM timeline with total hours per day)
  - Sleep schedule line chart (morning wake, night wake, and bed time)
  - Export stats to PDF
- **Snack Tracking** — Log number of snacks per day (4 calories each); snack calories are shown separately in the Calories chart
- **Wake/Bed Schedule** — Log morning wake, multiple night wakes, and bed time all at once in a single form
- **Puppy Profile** — Store your puppy's name, breed, birthday (with auto-calculated age), photo (shown as avatar in the header), and a running weight log
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
| `daily_logs` | One row per day with JSONB columns for potty breaks, meals, naps, schedule, skills, notes, and snack count |
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
│   ├── BottomNav.jsx          # 5-tab bottom nav (Home, History, Stats, Health, Puppy)
│   ├── Modal.jsx              # Slide-up (mobile) / centered (desktop) modal
│   └── forms/
│       ├── PottyForm.jsx      # Potty break logging (pee/poop/bell/accident)
│       ├── MealForm.jsx       # Meal logging (amount given/eaten/notes)
│       ├── NapForm.jsx        # Nap logging (start/end time)
│       ├── WakeUpForm.jsx     # Wake up & bed time logging
│       └── SkillsNotesForm.jsx # Snacks count, skills & notes
├── context/
│   └── DataContext.jsx        # React Context provider — async Supabase state
├── pages/
│   ├── Dashboard.jsx          # Greeting, intro & quick-add buttons
│   ├── History.jsx            # Past days with expandable details + PDF export
│   ├── Stats.jsx              # Trend charts + heatmap + PDF export
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
  wake_up_times[] (JSONB — each with label: Morning Wake / Night Wake),
  bed_time,
  potty_breaks[] (time, pee, poop, ringBell),
  naps[] (startTime, endTime),
  meals[] (time, foodGiven, foodEaten, notes),
  snacks (integer — number of snacks, 4 cal each),
  skills, notes
}
```

**Health Records** (`health_records`)
```
[{ id, type, date, title, description, notes }]
```

## Design

- Vibrant, saturated blues, rich browns, and warm golds — punchy modern tones that pop
- Rounded corners and subtle shadows throughout
- Responsive: wide `max-w-7xl` layout with mobile-first breakpoints
- Bottom sheet modals on mobile, centered dialogs on desktop
- Touch-optimized with `active:scale` feedback and large tap targets
- Puppy profile photo displayed as an avatar in the header

## Calorie Tracking

Meals and snacks are tracked in calories on the Stats page:

| Source | Conversion |
|--------|-----------|
| Meals | 1 cup of food = **367 calories** (calculated from food given × fraction eaten) |
| Snacks | 1 snack = **4 calories** |

The Calories chart shows food and snack calories as separate stacked bars with a combined total in the tooltip.

## Roadmap

- [x] Supabase backend for cloud sync and multi-device access
- [x] Export daily log / stats as PDF
- [x] Date picker for logging past days
- [x] Calorie tracking (meals + snacks)
- [x] Nap schedule heatmap
- [x] Sleep schedule chart (morning wake, night wake, bed time)
- [x] Category filtering in History
- [x] Date range selector for Stats (All Time, 7d, 30d, YTD)
- [x] Expand All / Collapse All in History
- [x] Vibrant, modern color palette (iteratively refined)
- [x] Potty success rate combo chart (bars + trend line)
- [ ] Push notifications for feeding/potty reminders
- [ ] Multi-puppy support
- [ ] Photo gallery per day
- [ ] User authentication

## License

Private project.
