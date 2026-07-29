import { BibleVerse } from '../types';
import { OFFLINE_PASSAGES } from '../data/verses';

// Free, public-domain translations only (no license fees, no API key).
// bible-api.com serves these same public-domain texts. Modern translations
// like NIV, ESV, and NLT are still copyrighted and can't be added here —
// see docs/BIBLICAL_ACCURACY.md and docs/COST_ESTIMATE.md for what a real
// license through a provider like API.Bible would take.
export const BIBLE_VERSIONS = [
  { id: 'web', label: 'World English Bible (WEB)' },
  { id: 'asv', label: 'American Standard Version (ASV)' },
  { id: 'kjv', label: 'King James Version (KJV)' },
  { id: 'bbe', label: 'Bible in Basic English (BBE)' },
  { id: 'webbe', label: 'World English Bible, British (WEBBE)' },
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

/**
 * Fetches a passage (e.g. "Genesis 1" or "John 3:16"). Returns an empty
 * array on failure rather than silently substituting an unrelated verse —
 * showing Psalm 23 when someone asked for Revelation 22 would be more
 * confusing than just saying the chapter didn't load.
 */
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
    return [];
  }
}

/** Only used for the small verse-of-the-day widget, which has its own bundled pool. */
export function offlineSample(reference: string): BibleVerse[] {
  const key = Object.keys(OFFLINE_PASSAGES).find((k) =>
    k.toLowerCase().startsWith(reference.toLowerCase())
  );
  return key ? OFFLINE_PASSAGES[key] : [];
}

export const SUGGESTED_PASSAGES = [
  'Psalm 23',
  'John 3',
  'Romans 8',
  'Philippians 4',
  '1 Corinthians 13',
  'James 1',
];
