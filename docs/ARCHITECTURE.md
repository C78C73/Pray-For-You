# Architecture

## Stack

- **Expo + React Native (TypeScript), Expo Router** — one codebase builds
  the native Android app and the website (for anyone without Android) from the same
  screens. This is the standard way to hit "Android + web" without
  maintaining two separate frontends.
- **Zustand + AsyncStorage** (`src/store/useAppStore.ts`) — the entire app
  state today. No backend required to run it.
- **bible-api.com** for live Scripture lookups (public-domain translations,
  no key needed), with a bundled offline fallback (`src/data/verses.ts`) so
  the Bible tab never breaks without a network connection.
- **Expo Notifications** for local daily reminders. Cross-device "so-and-so
  prayed for you" push is stubbed (`functions/index.js`) since it requires
  a real backend to know about other users' devices at all.

## Why not build the real backend yet

A backend (accounts that sync across devices, a real friend graph, real
push between two different phones) needs a server component and a
database — something this scaffold intentionally avoids so it's runnable
immediately with `npm install && npm run web`, no API keys, no signup, no
cost. The moment you want two people to actually see each other's prayer
requests, you need one.

## Recommended backend: Firebase

For a Christ-centered, ad-free, no-microtransaction app run by one or a
few people, Firebase is the pragmatic choice:

- **Firebase Auth** — Google sign-in and email/password, replacing the
  stubs in `app/welcome.tsx`.
- **Firestore** — `users/{uid}`, `prayers/{prayerId}`, `friendships/{id}`
  collections. The shapes already match `src/types/index.ts`; swapping
  `src/services/storage.ts` for Firestore reads/writes is the only change
  most screens need.
- **Cloud Functions + Firebase Cloud Messaging** — real push notifications
  when a friend prays for you. See `functions/index.js` for a working
  reference implementation of exactly this.
- **Firebase Hosting** — serves the website, free tier
  covers this comfortably (see [COST_ESTIMATE.md](COST_ESTIMATE.md)).

All of it has a genuinely free tier sufficient for hundreds to low
thousands of daily active users before any bill appears.

## Alternative: Supabase

If you'd rather have a Postgres database and open-source hosting, Supabase
covers Auth + Postgres + Realtime + Storage on a comparable free tier. The
tradeoff is push notifications aren't built in — you'd still add Expo's
push service or FCM directly. Either is a reasonable choice; Firebase is
recommended here mainly because Cloud Messaging is bundled, which matters
for the "notify when someone prayed for you" feature.

## Data model (target shape once a backend exists)

```
users/{uid}
  displayName, email, authMethod, symbolId, frameId, photoUrl,
  ownedSymbolIds, ownedFrameIds, seeds, streak { count, longestCount,
  lastActiveDate, graceDaysAvailable }, friendCode, pushToken, createdAt

prayers/{prayerId}
  authorId, authorName, authorSymbolId, authorFrameId, text, visibility
  ('global' | 'friends'), createdAt, prayedByIds[], answered

friendships/{id}
  userIdA, userIdB, createdAt
```

`src/types/index.ts` already matches this; only the storage layer changes.

## Content moderation

Once prayer requests are visible to people beyond the author (real
friends, or the global community feed), you need, before public launch:
a report button on every request, a block-user action, and either manual
review or a lightweight profanity/abuse filter on submission. None of this
exists yet — it's a hard requirement before this goes live with real
strangers, not a nice-to-have. See [ROADMAP.md](ROADMAP.md).
