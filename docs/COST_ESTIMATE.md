# Cost Estimate

Short version: **close to $0 to start, and cheap for a long time after
that**, because there are no ads and no in-app purchases to build (nothing
to reconcile, no payment processor, no store commission).

## One-time

| Item | Cost |
|---|---|
| Google Play developer account | $25 (one-time, ever) |
| Apple App Store | $0 — skipped on purpose; the website covers non-Android users instead |
| Domain name (optional, e.g. faithstreak.app) | ~$12/year if you want a custom URL instead of the free Firebase/Vercel subdomain |

## Ongoing, at small scale (roughly up to a few thousand users)

| Service | Free tier covers | Likely monthly cost |
|---|---|---|
| Firebase Auth | Unlimited email/password + Google sign-ins | $0 |
| Firestore | 50K reads/20K writes per day | $0 |
| Cloud Functions (push notifications) | 2M invocations/month | $0 |
| Firebase Hosting (the website) | 10GB storage, 360MB/day transfer | $0 |
| Bible text | Public-domain translations, no license fee | $0 |
| Push notifications (Expo/FCM) | Free, no cap that matters here | $0 |

**Realistic total while small: $0–5/month**, plus the one-time $25 for
Google Play.

## As it grows

Firebase's paid tier (Blaze) is pay-as-you-go past the free quotas above,
not a flat subscription — you only pay for what exceeds the free amount.
For context, apps with tens of thousands of daily active users on a
similar read/write pattern typically land in the **$20–100/month** range.
It scales gradually with usage, not in a cliff.

## What would actually cost real money (and isn't needed to launch)

- **Modern Bible translations** (NIV, ESV, NLT, etc.) are copyrighted and
  need a licensed API (e.g. API.Bible) — pricing varies by publisher, often
  free for non-commercial/low-volume use but requires an application. The
  bundled public-domain translations (KJV, WEB, BBE, OEB-US) are
  Word-for-word accurate historic translations and free forever — a
  reasonable place to stay for a while.
- A custom domain (~$12/year) — cosmetic, not required.
- Paying an app-store optimization/marketing service — not necessary for
  an organic, word-of-mouth community app.

## What this app deliberately never costs

No ad SDK, no payment processor integration (Stripe/Apple/Google IAP), no
data broker relationship — because there are no ads and nothing to buy.
That's not just a values choice, it also means an entire category of
integration cost and maintenance never exists in the first place.
