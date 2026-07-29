# Biblical Accuracy Policy

This app exists to point people to Jesus. Getting Scripture wrong — even by
accident — undermines that. Rules for anyone (human or AI) contributing:

1. **Never paraphrase Scripture text.** Every verse shown in the app must
   come verbatim from a named, citable translation. `src/data/verses.ts`
   and `src/services/bibleService.ts` are the only two places verse text
   is sourced from — one bundled sample, one live API — both public domain.
2. **Only use translations you have the right to display.**
   - Public domain, free forever: KJV (King James Version), WEB (World
     English Bible), WEBBE (WEB, British edition), ASV (American Standard
     Version), BBE (Bible in Basic English), OEB-US (Open English Bible).
     These are the six versions bundled in `src/services/bibleService.ts`.
   - Copyrighted, requires a license: NIV, ESV, NLT, NASB, CSB, and most
     translations published after ~1970. Do not bundle or fetch these
     without a signed license agreement (e.g. through API.Bible) — see
     [COST_ESTIMATE.md](COST_ESTIMATE.md).
3. **Always show the reference and translation abbreviation together**
   with any verse (e.g. "John 3:16, WEB") — never text alone. This lets
   users verify it themselves, which is the point.
4. **User-generated content is never treated as Scripture.** Prayer
   requests, testimonies, or any user text must be visually and
   structurally distinct from Bible content — different component
   (`PrayerCard`, not the Bible reader), never mixed into the verse-of-the-
   day rotation.
5. **When adding a new bundled passage**, copy it from the official source
   text (e.g. ebible.org for WEB, an official KJV text file) and diff it
   character-for-character before merging — don't retype from memory.
6. **Denominational neutrality.** Stick to widely-shared, historic
   Christian doctrine (the content already in this app: prayer, Scripture,
   grace, community) and avoid taking positions on secondary doctrinal
   disputes between denominations. This is a place for the Body of Christ
   broadly, not one tradition's app.
