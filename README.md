# Faithstreak

A Christ-centered app for praying for each other — with a daily streak,
Scripture reading, and simple ways to stay connected with friends in faith.
No ads. No microtransactions. Nothing you can buy with real money, ever.

> "Confess your offenses to one another, and pray for one another, that you
> may be healed." — James 5:16 (WEB)

## What's in this scaffold

This is a working, click-through starter — not a finished product. It runs
today with **zero backend setup** (everything is stored on-device), and is
structured so a real backend (Firebase is recommended, see
[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)) can be dropped in without
rewriting the UI.

Implemented:

- Sign in with Google (stubbed), email (demo, no real password check yet),
  or **no account at all** (fully local/guest mode)
- Prayer feed: post a request to the whole community or just your friends;
  tap **"I prayed for this"**; the author gets notified
- Daily streak with a built-in "grace day" mechanic (a missed day doesn't
  erase your streak if you've banked grace — see `src/utils/streak.ts`)
- **Seeds** — the only in-app currency. Earned by praying for others,
  reading Scripture, and adding friends. Never purchased. Spent only on
  cosmetic profile symbols/frames (`src/data/seedRewards.ts`)
- Profile **symbol** instead of an avatar: a Christian icon (cross, dove,
  fish, anchor, praying hands, ...) or your own uploaded photo, with an
  unlockable decorative frame — never a costume/avatar-body system
- Bible tab with multiple free, public-domain translations (KJV, WEB, BBE,
  OEB-US), verse of the day, offline fallback content
- Add friends with a simple 6-character code; local prayer + reading
  reminders (max two notifications a day, by design)
- **Groups**: create one with a name and bio. Every group is searchable/
  browsable by anyone — visibility only changes how you *join*: **open**
  groups are one tap, **invite-only** groups require a request the owner
  approves (or deny) from the group's own page. An invite code is a
  shortcut that jumps straight to a specific group rather than a way
  around the request step. No cap on members. Post a prayer need and
  everyone in the group gets notified — see `app/group/[id].tsx`
- Light/dark theme with 5 accent colors, and a "show streak counter" switch
  that only hides the UI — the streak itself never stops counting
- A dedicated **web layout**: one screen, four columns (Bible · people and
  what they need prayer for · groups · your own request + streak), separate
  from the phone's tab layout — see `app/(web)/dashboard.tsx`

Not implemented yet (see [docs/ROADMAP.md](docs/ROADMAP.md)):
real accounts/sync across devices (friends and groups are demoable but
single-device), real push delivery across devices, content moderation for
prayer requests, App/Play Store listings.

## Running it

```bash
npm install
npm run web       # the website — a three-column dashboard, see below
npm run android   # the native app — requires Android Studio / a device, or use Expo Go
```

No API keys or accounts are required to run this and click through every
screen.

## Android app + website (not an iOS app)

This app is native on Android. The website isn't a stand-in for iOS
specifically — it's the fallback for **anyone without an Android device**
(iPhone, desktop, anything with a browser), so no one who wants to pray for
their friends is locked out. It's a genuinely different layout, not the
phone UI stretched wide: one screen, four columns side by side — Bible,
people and what they need prayer for, groups, and your own request +
streak (see `app/(web)/dashboard.tsx`). It's still installable to a home screen
("Add to Home Screen" in the browser) for anyone who wants an app-like
icon, but that's a bonus, not the point. Publishing natively to the Apple
App Store needs a paid Apple Developer account and a Mac, which is why
there's no separate iOS build — the website covers that gap for free.

## Project structure

```
app/                  Expo Router screens (file-based routing)
  welcome.tsx          sign-in screen
  (tabs)/              Android: Pray / Bible / Friends / Groups / Profile bottom tabs
  (web)/dashboard.tsx  Web: single-page, 4-column dashboard
  group/[id].tsx        group bio, members, invite code, scoped prayer feed
  new-group.tsx         modal: create a group (name, bio, open/invite-only)
  new-request.tsx      modal: post a prayer request (native)
  edit-symbol.tsx      modal: choose/unlock symbol + frame, upload photo
  settings.tsx         reminders, appearance, sign out
src/
  store/useAppStore.ts single source of truth (Zustand + AsyncStorage)
  services/            storage, Bible API, notifications — swap-in points for a real backend
  data/                symbols, frames, seed economy, offline Bible sample
  theme/                light/dark + accent color system
  components/          shared UI (Symbol, PrayerCard, buttons, pills)
  utils/                streak math, ids, dates
functions/             reference Cloud Function for real cross-device push (not deployed)
docs/                  architecture, cost estimate, roadmap, biblical-accuracy policy
```

## Docs

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — how this is built, and the recommended path to a real backend
- [docs/COST_ESTIMATE.md](docs/COST_ESTIMATE.md) — what this costs to run, from $0 up
- [docs/BIBLICAL_ACCURACY.md](docs/BIBLICAL_ACCURACY.md) — sourcing rules for any Scripture text in the app
- [docs/ROADMAP.md](docs/ROADMAP.md) — what to add next, and what to deliberately leave out
