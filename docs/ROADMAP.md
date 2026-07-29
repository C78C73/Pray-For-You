# Roadmap: what to add, and what to deliberately leave out

## Before any real users touch it

These aren't nice-to-haves — they're required for a community app where
strangers can post and see each other's content:

- Real accounts + sync (Firebase Auth + Firestore, see ARCHITECTURE.md)
- A **report** button and **block user** action on every prayer request
- Basic abuse/profanity filtering on submitted text, or manual review
  before a request appears in the *global* feed
- A community guidelines / terms screen at first launch (what this app is
  for, what won't be tolerated)
- Real friend lookup (currently the "add by code" flow fabricates a demo
  friend locally since there's no backend yet — see the comment in
  `src/store/useAppStore.ts`)
- Real group directory + membership across devices (today, `findGroupByCode`
  and the "All groups" search only see groups already known on your own
  device — there's no shared index of every group that exists yet, so a
  group made on someone else's phone won't show up on yours until a
  backend exists), and the same report/block/moderation coverage extended
  to group prayer feeds, not just the global one

## Strong candidates to add next

- **Prayer reactions beyond the button**: an optional short reply like
  "Amen" or a verse, so prayer feels like more than a tap (kept minimal on
  purpose — no comment threads, no likes-as-vanity-metric)
- **"Mark as answered"** on your own request (UI already exists on
  `PrayerCard`, just needs a control on the owner's view) — a good way to
  build testimony and gratitude into the habit loop
- **Reading plans** (e.g. a 7-day plan through Philippians) instead of only
  single-passage lookup
- **Group roles** (owner can remove a member or transfer ownership) —
  today anyone can leave, but there's no moderation inside a group yet
- **Offline-first Bible** — bundle full WEB or KJV text (~4–5MB JSON) as a
  static asset so the Bible tab works with zero network at all, not just a
  fallback sample
- **Verse memorization streak** — a short, Scripture-based alternative to
  generic "streak games," e.g. type-the-missing-word on a verse you picked

## Deliberately left out (and why)

- **Leaderboards / public rankings.** Ranking people by streak or prayer
  count invites comparison and pride — exactly what this app should guard
  against (Matthew 6:1–6). Personal stats only; no public ranking.
- **Ads.** Incompatible with a distraction-free, worship-first app, and
  with "as free as possible" hosting since ad SDKs add their own cost and
  privacy tradeoffs.
- **Microtransactions of any kind.** Explicit non-goal. Seeds are earned
  only, spent only on cosmetics, never purchasable — this is a product
  decision, not just a launch-phase limitation.
- **Avatars / costumes.** A symbol (Christian icon or your own photo) with
  an unlockable frame, not a dress-up avatar system — keeps focus on the
  person's faith, not an in-app character.
- **Stranger matching / random chat.** No feature pairs users with people
  they don't know for private conversation — a safety line worth holding,
  especially with a userbase likely to include minors.
- **Anything not about God.** No general social feed, no unrelated games,
  no meme content. Every feature should trace back to prayer, Scripture,
  or genuine community — if it doesn't, it doesn't belong.
