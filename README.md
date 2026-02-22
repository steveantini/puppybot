# PuppyBot

A clean, modern puppy behavior tracker built with React. Log potty breaks, meals, naps, wake/bed times, training skills, and general notes — all from a fast, mobile-friendly interface. Designed to replace paper daily dog logs with something you can tap through in seconds. Includes an AI-powered assistant for analyzing patterns and getting training advice.

**Live app:** [puppybot.ai](https://puppybot.ai)

## Features

- **Dashboard** — Clean welcome intro, large quick-add buttons for fast entry (3 taps or fewer), Today's Snapshot with expandable Potty/Meals/Naps detail cards, and a Claude-inspired AI chat input with time-aware greeting
- **History** — Browse past days in a scrollable list; tap any day to expand full details. **Edit or delete** any individual entry (potty break, meal, nap, schedule, skills, notes) directly from the history view. Expand All / Collapse All toggle to view everything at once. Filter by category (Potty, Meals, Naps, Schedule, Skills, Notes) to see all matching entries across all dates. Select individual dates or all dates and export to PDF.
- **Stats & Trends** — Comprehensive charts powered by Recharts with a date range selector (All Time, Last 7 Days, Last 30 Days, Year to Date):
  - Potty success rate line chart tracking daily % trend; hover shows total, good, accidents, and %
  - Separate Pee (yellow/red) and Poop (brown/red) bar charts with dual Y axes; tooltips show category-specific totals, accidents, and success rate
  - Potty schedule heatmap (6 AM–9 PM timeline with colored vertical lines: yellow for pee, brown for poop, orange for both)
  - Nap schedule heatmap in light blue (Gantt-style, 6 AM–9 PM timeline with total hours per day)
  - Sleep schedule line chart (morning wake, night wake, and bed time)
  - Calories eaten chart in shades of blue (dark blue for food, light blue for treats)
  - All bar/line charts (Potty Success Rate, Pee, Poop, Calories) feature dual Y axes for easy reading from either side
  - Export stats to PDF
- **Treat Tracking** — Log number of treats per day (4 calories each); treat calories are shown separately in the Calories chart
- **Wake/Bed Schedule** — Log morning wake, multiple night wakes, and bed time all at once in a single form
- **Puppy Profile** — Store your puppy's name, breed, birthday (with auto-calculated age and dog years), gotcha day, breeder info, vet info, microchip number/company, insurance carrier/policy number, photo (shown as avatar in the header), and a running weight log. Collapsible "+More Info" section for reference details
- **Health Tracker** — Record vaccinations, parasite prevention, medications, and general health events grouped by date in reverse chronological order with expandable rows, category dropdown filter, Expand All/Collapse All, optional clinic/vet name (with autofill from Puppy Profile), and PDF export. **Edit or delete** any record directly from the expanded view.
- **Date Picker on All Forms** — Log entries for any date, not just today
- **PDF Export** — Generate printable reports from both History and Stats pages
- **Clickable Header** — Tap the PuppyBot logo/title from any page to return to the dashboard
- **AI Chat Assistant** — Claude-powered assistant on the dashboard with full access to granular daily log data (individual potty breaks, meals, naps), voice input, copy-to-clipboard, and per-user chat history persisted to Supabase
- **Demo Mode** — A read-only demo account (`demo@puppybot.ai`) lets visitors explore the full UI with real data; all write operations are silently blocked
- **Multi-User Auth** — Email/password login and signup via Supabase Auth with protected routes
- **Admin Panel** — Slide-out settings menu with account management, puppy management, and family sharing
- **Family Sharing** — Invite family members by email with role-based access (Owner, Editor, Viewer); auto-accept invites on signup/login

## Product Roadmap

See **[ROADMAP.md](./ROADMAP.md)** for the full development roadmap:

- **Phase 1 (Mostly Complete)**: Multi-user authentication, multi-puppy support, admin panel, profile enhancements, dashboard UI
- **Phase 2 (Partially Complete)**: Family sharing and collaboration features
- **Phase 3 (Future)**: Two-factor authentication and advanced security
- **Phase 4 (Future)**: Premium subscriptions and payment processing
- **Phase 5+**: Enhanced features, mobile apps, and community
- **iOS App**: See [iOS_ROADMAP.md](./iOS_ROADMAP.md) for the Capacitor-based native iOS plan

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
| Auth | Supabase Auth (email/password) |
| AI | Anthropic Claude Sonnet 4.5 (via Supabase Edge Functions) |
| Hosting | Vercel |
| Domain | puppybot.ai |

## Deployment

### Vercel

The app is hosted on [Vercel](https://vercel.com) with automatic deployments from the `main` branch.

**Live URL:** [https://puppybot.ai](https://puppybot.ai)

Two environment variables must be set in Vercel under **Settings → Environment Variables**:

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon/public API key |

Enable them for Production, Preview, and Development environments.

### Supabase

[Supabase](https://supabase.com) provides the PostgreSQL database, authentication, and Edge Functions. The base schema is defined in `supabase/migration.sql` with incremental migrations in `supabase/migrations/`.

| Table | Purpose |
|-------|---------|
| `puppies` | Puppy profile (name, breed, birthday, vet, microchip, insurance, photo) |
| `weight_logs` | Weight entries linked to a puppy |
| `daily_logs` | One row per day with JSONB columns for potty breaks, meals, naps, schedule, skills, notes, and treat count |
| `health_records` | Vaccinations, parasite prevention, medications, and general health events (with optional clinic/vet name) |
| `user_profiles` | User accounts (full name, subscription tier) |
| `puppy_members` | Links users to puppies with roles (owner, editor, viewer) |
| `puppy_invites` | Pending family sharing invitations |
| `chat_history` | AI assistant conversation logs |
| `weekly_insights` | AI-generated weekly summaries |

**To set up the database:** Open the Supabase SQL Editor, paste the contents of `supabase/migration.sql`, and run it. Then run each migration in `supabase/migrations/` in order. Update the Site URL in Supabase Auth settings to match your domain.

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- A Supabase project (free tier works)
- An Anthropic API key (for AI chat assistant)

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

### Deploy AI Chat Assistant

```bash
# Link to your Supabase project
npx supabase link --project-ref YOUR_PROJECT_REF

# Set your Anthropic API key
npx supabase secrets set ANTHROPIC_API_KEY=sk-ant-your-key-here

# Deploy the Edge Function
npx supabase functions deploy chat-assistant
```

## Project Structure

```
src/
├── components/
│   ├── AdminPanel.jsx         # Slide-out settings/admin panel
│   ├── BottomNav.jsx          # 5-tab bottom nav (Home, History, Stats, Health, Puppy)
│   ├── DashboardChat.jsx      # Claude-inspired AI chat interface
│   ├── Modal.jsx              # Slide-up (mobile) / centered (desktop) modal (used by History edit)
│   └── forms/
│       ├── PottyForm.jsx      # Potty break logging + editing (pee/poop/bell/accident)
│       ├── MealForm.jsx       # Meal logging + editing (amount given/eaten/notes)
│       ├── NapForm.jsx        # Nap logging + editing (start/end time)
│       ├── WakeUpForm.jsx     # Wake up & bed time logging
│       └── SkillsNotesForm.jsx # Treats count, skills & notes
├── context/
│   ├── AuthContext.jsx        # Authentication state, session, auto-accept invites
│   └── DataContext.jsx        # Auth-aware data provider — async Supabase state
├── pages/
│   ├── Dashboard.jsx          # Welcome intro, quick-add buttons, AI chat
│   ├── History.jsx            # Past days with expandable details, inline edit/delete + PDF export
│   ├── Stats.jsx              # Trend charts + heatmap + PDF export
│   ├── PuppyProfile.jsx      # Puppy info, vet, microchip, insurance + weight log
│   ├── HealthTracker.jsx     # Immunizations, vet visits, medications
│   ├── Login.jsx              # Email/password login
│   ├── Signup.jsx             # User registration
│   └── settings/
│       ├── AccountSettings.jsx    # Profile, email, password management
│       ├── PuppyManagement.jsx    # Add, edit, manage puppies
│       └── SharingManagement.jsx  # Invite family, manage access
├── utils/
│   ├── supabase.js            # Supabase client initialization
│   ├── storage.js             # Async CRUD operations (Supabase)
│   ├── helpers.js             # Date/time formatting, ID generation
│   └── pdfExport.js           # PDF report generation
├── App.jsx                    # Root layout, routing, header (clickable logo), admin panel
├── main.jsx                   # Entry point
└── index.css                  # Tailwind imports + custom animations

supabase/
├── migration.sql              # Base database schema + RLS policies
├── migrations/
│   ├── 001_auth_and_multi_user.sql  # Auth, profiles, sharing tables
│   ├── 002_add_microchip_insurance.sql  # Microchip & insurance columns
│   └── 003_chat_history_user_id.sql     # Per-user chat history persistence
└── functions/
    ├── chat-assistant/index.ts    # AI chat Edge Function (calls Anthropic API)
    └── weekly-insights/index.ts   # Weekly AI summary generator
```

## Data Model

All data is stored in Supabase PostgreSQL. Daily log sub-items (potty breaks, meals, naps, etc.) are stored as JSONB columns for simplicity.

**Puppy Profile** (`puppies` + `weight_logs`)
```
{ name, breed, birthday, breeder_name, breeder_website, gotcha_day,
  vet_name, vet_website, microchip_number, microchip_company,
  insurance_carrier, insurance_policy_number, photo_url, user_id }
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
  snacks (integer — number of treats, 4 cal each),
  skills, notes
}
```

**Health Records** (`health_records`)
```
[{ id, type, date, title, description, notes, clinic_name }]
// type: vaccination | parasite_prevention | medication | general
```

## Design

- Vibrant, saturated blues, rich browns, and warm golds — punchy modern tones that pop
- Rounded corners and subtle shadows throughout
- Responsive: wide `max-w-7xl` layout with mobile-first breakpoints
- Bottom sheet modals on mobile, centered dialogs on desktop
- Touch-optimized with `active:scale` feedback and large tap targets
- Puppy profile photo displayed as an avatar in the header
- Header paw icon (Lucide SVG) in light brown; "Puppy" in lighter steel blue, "Bot" in deeper steel blue, with a "beta" pill badge
- Clickable header logo returns to dashboard from any page

## Calorie Tracking

Meals and treats are tracked in calories on the Stats page:

| Source | Conversion |
|--------|-----------|
| Meals | 1 cup of food = **409 calories** (calculated from food given × fraction eaten) |
| Treats | 1 treat = **4 calories** |

The Calories chart shows food and treat calories as separate stacked bars with a combined total in the tooltip.

## AI Chat Assistant

PuppyBot includes an intelligent chat assistant powered by **Anthropic's Claude Sonnet 4.5** that can analyze your puppy's data and provide insights, training advice, and answer questions. The assistant runs as a Supabase Edge Function that calls the Anthropic API directly. Chat history is persisted per-user in Supabase, so conversations survive page navigation and browser refreshes.

### Features

- **Smart Analysis**: Ask questions about potty training progress, sleep patterns, eating habits, and trends
- **Context-Aware**: Analyzes all of your puppy's data to provide relevant insights
- **Training Tips**: Provides actionable recommendations based on behavioral patterns
- **Voice Input**: Speak your questions using browser speech recognition
- **Copy to Clipboard**: One-click copy any AI response (with confirmation checkmark)
- **Persistent History**: Chat conversations are saved per-user in Supabase and restored on return
- **Granular Data Access**: AI receives every individual potty break, meal, and nap entry — not just daily summaries — so it can answer specific questions like "how many poops today?"
- **Claude-Inspired UI**: Clean standalone input bar with auto-resizing textarea and "powered by Claude Sonnet 4.5" branding

### Setup Instructions

#### 1. Get an Anthropic API Key

1. Sign up at [console.anthropic.com](https://console.anthropic.com)
2. Generate an API key from the dashboard
3. Copy your key (starts with `sk-ant-...`)

#### 2. Deploy the Edge Function

```bash
# Link your Supabase project (one-time)
npx supabase link --project-ref YOUR_PROJECT_REF

# Set your Anthropic API key as a secret
npx supabase secrets set ANTHROPIC_API_KEY=sk-ant-your-key-here

# Deploy the chat assistant function
npx supabase functions deploy chat-assistant

# Deploy the weekly insights function (optional)
npx supabase functions deploy weekly-insights
```

The following environment variables are automatically available in Edge Functions:
- `SUPABASE_URL` (auto-injected)
- `SUPABASE_ANON_KEY` (auto-injected)

### Usage

1. **Scroll to Chat**: The AI assistant is on the dashboard below the quick-add buttons
2. **Ask Questions**: Type or speak your question in the Claude-style input bar
3. **Get Insights**: Claude analyzes your data and responds with specific insights
4. **Copy or Clear**: Copy any response to your clipboard, or clear the conversation

### Example Questions

- "How is potty training progress?"
- "Analyze sleep patterns over the last month"
- "Is eating schedule consistent?"
- "Show weekly trends"
- "Any training recommendations?"
- "Why are accidents increasing?"
- "How many calories per day on average?"

### Cost

With typical usage:
- Average query: $0.01 - $0.03
- 100 queries/month: ~$1-3

### Weekly Insights (Optional)

The `weekly-insights` Edge Function can generate automated weekly summaries. To schedule it:

1. Set up a cron job in Supabase (Dashboard > Edge Functions > Cron)
2. Schedule it to run weekly (e.g., Monday at 8 AM)
3. Or call it manually: `curl -X POST https://your-project.supabase.co/functions/v1/weekly-insights`

## Roadmap

- [x] Supabase backend for cloud sync and multi-device access
- [x] Export daily log / stats as PDF
- [x] Date picker for logging past days
- [x] Calorie tracking (meals + treats)
- [x] Nap schedule heatmap
- [x] Sleep schedule chart (morning wake, night wake, bed time)
- [x] Category filtering in History
- [x] Date range selector for Stats (All Time, 7d, 30d, YTD)
- [x] Expand All / Collapse All in History
- [x] Vibrant, modern color palette (iteratively refined)
- [x] Potty success rate combo chart (bars + trend line)
- [x] AI Chat Assistant (Claude-powered, voice input, copy to clipboard, granular data context)
- [x] Weekly insights generation with AI summaries
- [x] User authentication (Supabase Auth, email/password)
- [x] Multi-puppy support
- [x] Admin panel with account, puppy, and sharing management
- [x] Family sharing with auto-accept invites
- [x] Puppy profile: microchip, insurance, vet, breeder, gotcha day
- [x] Claude-inspired chat UI with time-aware greeting
- [x] Per-user chat history persistence (Supabase)
- [x] Demo mode (read-only viewer account)
- [x] Clickable header logo navigates to dashboard
- [x] Custom domain (puppybot.ai)
- [x] iOS app roadmap (Capacitor-based)
- [x] Edit and delete individual entries from History page and Health Tracker
- [x] Custom paw print favicon (steel-blue)
- [ ] Push notifications for feeding/potty reminders
- [ ] Photo gallery per day
- [ ] Two-factor authentication
- [ ] Public shareable puppy profiles
- [ ] Email invite notifications

## License

Private project.
