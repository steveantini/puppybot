# PuppyBot Product Roadmap

This document outlines the development roadmap for transforming PuppyBot from a personal app into a multi-tenant SaaS application.

## Current Status: Multi-User App with Auth, Sharing & AI

- ✅ Core puppy tracking (potty, meals, naps, sleep, treats, skills, notes)
- ✅ AI assistant powered by Claude 3.5 Sonnet (deployed Edge Function, Claude-inspired UI)
- ✅ Stats and history visualization with Recharts
- ✅ PDF export from History and Stats
- ✅ Supabase Auth (email/password login/signup)
- ✅ Admin panel with account, puppy, and sharing management
- ✅ Family sharing with role-based access and auto-accept invites
- ✅ Puppy profile: microchip, insurance, vet, breeder, gotcha day, dog years
- ✅ Clickable header logo navigates to dashboard
- ✅ Custom domain: **puppybot.ai**

---

## Development Phases

### **Phase 1: Foundation — Multi-User Support** ✅ Mostly Complete

#### 1.1 Authentication & Security ✅ Complete
- [x] Supabase Authentication setup
- [x] Email/password login and signup
- [x] Row Level Security (RLS) policies (permissive, to be tightened)
- [x] User profile system (`user_profiles` table)
- [x] Protected routes (redirect to login when unauthenticated)
- [ ] Password reset flow
- [ ] Email verification enforcement
- [ ] Session management UI

#### 1.2 Multi-Puppy Support ✅ Core Complete
- [x] Multiple puppies per user
- [x] Puppy management page
- [x] "Add New Puppy" functionality
- [x] Active puppy selection via localStorage
- [ ] Puppy switcher dropdown in header
- [ ] Archive/restore puppies
- [ ] Puppy transfer between users

#### 1.3 Admin Panel ✅ Complete
- [x] Hamburger menu navigation (slide-out panel)
- [x] Account settings page (name, email display)
- [x] Puppy management page
- [x] Family & Sharing management page
- [x] Greyed-out "Coming soon" items for future features
- [x] Sign out from admin panel
- [ ] Profile photo upload (Supabase Storage)
- [ ] Password change from settings
- [ ] Account deletion

#### 1.4 Puppy Profile Enhancements ✅ Complete
- [x] Dog years calculation (to one decimal)
- [x] Breeder name with clickable website link
- [x] Gotcha day
- [x] Veterinarian name with clickable website link
- [x] Microchip number and company
- [x] Insurance carrier and policy number
- [x] Collapsible "+More Info" section

#### 1.5 Dashboard & UI Enhancements ✅ Complete
- [x] Claude-inspired AI chat input (standalone input bar, auto-resizing textarea)
- [x] Time-aware greeting ("Good morning/afternoon/evening!")
- [x] "Powered by Claude 3.5 Sonnet" branding
- [x] Clickable PuppyBot header logo navigates to dashboard
- [x] Welcome text on page background (no card wrapper)
- [x] Clean spacing between sections
- [x] Renamed "Snacks" to "Treats" throughout UI and charts
- [x] Updated calorie calculation (381 cal/cup)

#### 1.6 AI Chat Assistant ✅ Deployed & Working
- [x] Supabase Edge Function (`chat-assistant`)
- [x] Direct Anthropic API integration (no SDK dependency)
- [x] Data-aware context (puppy profile + daily logs)
- [x] Date range filtering (week, month, YTD, all)
- [x] Voice input via Web Speech API
- [x] Save responses to daily notes
- [x] Export conversations as text files
- [x] Resilient error handling (non-blocking chat history, per-entry try/catch)

---

### **Phase 2: Collaboration Features** 🔄 Partially Complete

#### 2.1 Family Sharing ✅ Core Complete
- [x] Invite system (send invites by email from the app)
- [x] Role-based access (Owner, Editor, Viewer)
  - **Owner**: Full control, can delete puppy, manage members
  - **Editor**: Can log data, edit entries
  - **Viewer**: Read-only access to all data
- [x] Auto-accept invites on signup/login (Option B)
  - When a user signs up or logs in, any pending invites matching their email are automatically accepted
  - The shared puppy appears in their "My Puppies" list
  - Expired invites are automatically cleaned up
- [x] Family & Sharing management UI
- [x] Remove members
- [ ] Transfer ownership

#### 2.2 Email Invite Notifications (Option A — Future Enhancement)
- [ ] Transactional email service integration (Resend, SendGrid, or Supabase built-in)
- [ ] Email templates for invite notifications
- [ ] Magic link acceptance (click link in email to accept invite)
- [ ] Custom branded email sender domain
- [ ] Invite reminder emails for pending invites

#### 2.3 Professional Sharing
- [ ] Share with veterinarians (view-only)
- [ ] Share with trainers (view + notes)
- [ ] Time-limited access links
- [ ] Revoke access anytime

#### 2.4 Public Puppy Profiles
- [ ] Shareable read-only URL (e.g., puppybot.ai/public/arlo)
- [ ] Public view bypasses auth — shows profile, recent stats summary
- [ ] Owner controls what's visible on public profile

---

### **Phase 3: Security & Trust** 📅 Future

#### 3.1 Two-Factor Authentication (2FA)
- [ ] TOTP-based 2FA via Supabase
- [ ] QR code setup flow
- [ ] Backup codes generation
- [ ] 2FA management in admin panel
- [ ] Recovery flow for lost devices

#### 3.2 Advanced Security
- [ ] Login history and active sessions
- [ ] Suspicious activity alerts
- [ ] IP-based access controls (optional)
- [ ] Audit log for all actions
- [ ] GDPR compliance tools (data export, deletion)

#### 3.3 RLS Hardening
- [ ] Replace permissive "Allow all" RLS policies with proper per-user policies
- [ ] Use `SECURITY DEFINER` functions to avoid circular policy dependencies
- [ ] Test multi-user data isolation

---

### **Phase 4: Monetization & Premium Features** 💰 Future

#### 4.1 Subscription Tiers

**Free Tier**:
- 1 puppy
- All basic tracking features
- 7 days of AI chat history
- Basic stats (1 month lookback)
- 1 shared member per puppy

**Premium Tier** ($4.99/month or $49/year):
- Unlimited puppies
- Family sharing (up to 5 members per puppy)
- Unlimited AI chat history
- Advanced stats (all-time data)
- Weekly AI-generated insights
- Priority support
- Unlimited PDF exports
- 100 photos per puppy
- Custom branding (future)

#### 4.2 Payment Integration
- [ ] Stripe integration
- [ ] Subscription checkout flow
- [ ] Webhook handling for subscription events
- [ ] Billing history
- [ ] Payment method management
- [ ] Upgrade/downgrade flows
- [ ] Cancellation and retention flows
- [ ] Refund handling

#### 4.3 Feature Gating
- [ ] Puppy count limits
- [ ] Shared member limits
- [ ] AI chat history limits
- [ ] Stats date range limits
- [ ] Export limits
- [ ] Storage limits

---

### **Phase 5: Enhanced Features** ✨ Future

#### 5.1 Notifications & Reminders
- [ ] Email notifications for shared updates
- [ ] Reminder system (feeding, meds, vet appointments)
- [ ] Push notifications (PWA)
- [ ] Digest emails (daily/weekly summaries)
- [ ] Milestone alerts (age, training achievements)

#### 5.2 Advanced Analytics
- [ ] Behavioral pattern recognition
- [ ] Health anomaly detection
- [ ] Comparison with breed averages
- [ ] Predictive insights (AI-powered)
- [ ] Custom report builder

#### 5.3 Integrations
- [ ] Veterinary practice integrations
- [ ] Smart collar/device integrations (Whistle, Fi)
- [ ] Calendar integrations (Google, Apple)
- [ ] Export to pet health apps
- [ ] Import from other tracking apps

#### 5.4 Mobile Apps
- [ ] Progressive Web App (PWA) optimization
- [ ] Native iOS app (React Native or Swift)
- [ ] Native Android app (React Native or Kotlin)
- [ ] Offline-first functionality
- [ ] Camera integration for quick photo logging

---

### **Phase 6: Community & Content** 🌐 Future

#### 6.1 Public Profiles
- [ ] Optional public puppy profiles
- [ ] Share milestones on social media
- [ ] Follow other puppies
- [ ] Puppy discovery feed

#### 6.2 Educational Content
- [ ] Training guides library
- [ ] Breed-specific tips
- [ ] Expert Q&A
- [ ] Video tutorials
- [ ] Blog integration

#### 6.3 Community Features
- [ ] Breed-specific forums
- [ ] Training tips sharing
- [ ] Local puppy meetups
- [ ] Breeder/trainer directory

---

## Success Metrics

### User Engagement
- Daily active users (DAU)
- Data entry frequency
- AI assistant usage
- Feature adoption rates
- Mobile vs desktop usage

### Business Metrics
- Free to paid conversion rate
- Monthly recurring revenue (MRR)
- Customer lifetime value (LTV)
- Churn rate
- Net promoter score (NPS)

### Technical Metrics
- API response times
- Database query performance
- Edge function success rates
- Error rates
- Uptime (target: 99.9%)

---

## Technical Debt & Maintenance

### Ongoing Tasks
- [ ] Code splitting for better performance
- [ ] Accessibility (WCAG 2.1 AA compliance)
- [ ] Internationalization (i18n) support
- [ ] Dark mode support
- [ ] Improved mobile responsiveness
- [ ] Unit and integration testing
- [ ] E2E testing with Playwright
- [ ] Performance monitoring (Vercel Analytics)
- [ ] Error tracking (Sentry integration)
- [ ] Tighten RLS policies (currently permissive "Allow all")

---

## Innovation Backlog (Ideas to Explore)

- AI-powered photo recognition (breed identification, health issues)
- Voice logging ("Alexa, log a potty break for Max")
- Blockchain-based health records (secure, portable)
- AI chatbot for training advice (beyond current assistant)
- Gamification (achievements, badges, milestones)
- ~~Pet insurance integration~~ ✅ (insurance carrier & policy stored in puppy profile)
- Veterinary telemedicine integration
- DNA test result integration (Embark, Wisdom Panel)

---

## Decision Log

### Technology Choices

**Frontend**: React + Vite
- **Rationale**: Fast, modern, excellent DX, great for SPA

**Backend**: Supabase
- **Rationale**: Built-in auth, RLS, realtime, storage, edge functions

**Hosting**: Vercel
- **Rationale**: Zero-config, auto-scaling, excellent for React apps

**Domain**: puppybot.ai
- **Rationale**: Short, memorable, reflects the AI-powered nature of the app

**AI**: Anthropic Claude 3.5 Sonnet (direct API, no SDK)
- **Rationale**: Best-in-class reasoning, good for data analysis. Direct fetch avoids SDK version issues in Deno Edge Functions.

**Payments**: Stripe (planned)
- **Rationale**: Industry standard, excellent docs, full feature set

**Styling**: Tailwind CSS
- **Rationale**: Utility-first, fast development, excellent customization

---

## Version History

### v0.2.0 (Current) — Multi-User with Auth, Sharing & AI
- Authentication (email/password login/signup)
- Admin panel, account settings, puppy & sharing management
- Family sharing with auto-accept invites (Option B)
- Puppy profile: microchip, insurance, vet, breeder, gotcha day, dog years
- Claude-inspired chat UI with time-aware greeting
- AI Edge Function rewritten for reliability (direct API, no SDK)
- Clickable header logo returns to dashboard
- Renamed "Snacks" to "Treats" throughout
- Updated calorie calculation to 381 cal/cup
- Custom domain: puppybot.ai

### v0.1.0 — Personal App
- Core tracking features (potty, meals, naps, sleep, skills, notes)
- AI assistant (initial implementation)
- Stats and history with charts
- PDF export
- Single-user functionality

### v1.0.0 (Target: Q2 2026) — Multi-User MVP
- Tightened RLS policies
- Password reset and email verification
- Puppy switcher in header
- Public shareable profiles

### v1.1.0 (Target: Q3 2026) — Security & Trust
- Two-factor authentication
- Advanced security features
- Audit logging

### v2.0.0 (Target: Q4 2026) — Premium Launch
- Subscription tiers
- Payment processing
- Feature gating
- Enhanced features

---

## Feedback & Support

We're building PuppyBot for puppy parents everywhere. Your feedback shapes our roadmap!

- **Feature Requests**: [GitHub Issues](https://github.com/steveantini/puppybot/issues)
- **Bug Reports**: [GitHub Issues](https://github.com/steveantini/puppybot/issues)
- **Website**: [puppybot.ai](https://puppybot.ai)

---

**Last Updated**: February 2026
**Next Review**: Monthly
**Maintained By**: Development Team
