import { BibleVerse } from '../types';
import { OFFLINE_PASSAGES } from '../data/verses';

// Free, public-domain translations only (no license fees, no API key).
// bible-api.com serves these same public-domain texts; if the request
// fails (offline, proxy blocked, rate limited) we fall back to the small
// bundled sample so the tab never shows an error to someone trying to pray.
//
// To add modern copyrighted translations (NIV, ESV, NLT) later you need a
// licensed provider (e.g. API.Bible) and per-translation permission — see
// docs/COST_ESTIMATE.md. Do not bundle copyrighted text without a license.
export const BIBLE_VERSIONS = [
  { id: 'kjv', label: 'King James Version (KJV)' },
  { id: 'web', label: 'World English Bible (WEB)' },
  { id: 'bbe', label: 'Bible in Basic English (BBE)' },
  { id: 'oeb-us', label: 'Open English Bible, US (OEB-US)' },
] as const;

export type BibleVersionId = (typeof BIBLE_VERSIONS)[number]['id'];

interface BibleApiVerse {
  book_id: string;
  book_name: string;
  chapter: number;
  verse: number;
  text: string;
}

export async function fetchPassage(
  reference: string,
  version: BibleVersionId
): Promise<BibleVerse[]> {
  try {
    const url = `https://bible-api.com/${encodeURIComponent(reference)}?translation=${version}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`status ${res.status}`);
    const data = await res.json();
    const verses: BibleApiVerse[] = data.verses ?? [];
    if (verses.length === 0) throw new Error('empty');
    return verses.map((v) => ({
      reference: `${v.book_name} ${v.chapter}:${v.verse}`,
      version: version.toUpperCase(),
      text: v.text.trim(),
    }));
  } catch {
    return offlineFallback(reference);
  }
}

function offlineFallback(reference: string): BibleVerse[] {
  const key = Object.keys(OFFLINE_PASSAGES).find((k) =>
    k.toLowerCase().startsWith(reference.toLowerCase())
  );
  if (key) return OFFLINE_PASSAGES[key];
  return OFFLINE_PASSAGES['Psalm 23 (KJV)'];
}

export const SUGGESTED_PASSAGES = [
  'Psalm 23',
  'John 3',
  'Romans 8',
  'Philippians 4',
  '1 Corinthians 13',
  'James 1',
];
