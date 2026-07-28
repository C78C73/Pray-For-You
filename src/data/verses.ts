import { BibleVerse } from '../types';

// Bundled offline text so the Bible tab always works with zero setup and
// zero API cost. All from PUBLIC DOMAIN translations (KJV, WEB) — verified
// against an official text before adding any new one; never paraphrase.
// See docs/BIBLICAL_ACCURACY.md before adding more.

export const OFFLINE_PASSAGES: Record<string, BibleVerse[]> = {
  'Psalm 23 (KJV)': [
    { reference: 'Psalm 23:1', version: 'KJV', text: 'The LORD is my shepherd; I shall not want.' },
    { reference: 'Psalm 23:2', version: 'KJV', text: 'He maketh me to lie down in green pastures: he leadeth me beside the still waters.' },
    { reference: 'Psalm 23:3', version: 'KJV', text: 'He restoreth my soul: he leadeth me in the paths of righteousness for his name’s sake.' },
    { reference: 'Psalm 23:4', version: 'KJV', text: 'Yea, though I walk through the valley of the shadow of death, I will fear no evil: for thou art with me; thy rod and thy staff they comfort me.' },
    { reference: 'Psalm 23:5', version: 'KJV', text: 'Thou preparest a table before me in the presence of mine enemies: thou anointest my head with oil; my cup runneth over.' },
    { reference: 'Psalm 23:6', version: 'KJV', text: 'Surely goodness and mercy shall follow me all the days of my life: and I will dwell in the house of the LORD for ever.' },
  ],
  'John 3:16-17 (WEB)': [
    { reference: 'John 3:16', version: 'WEB', text: 'For God so loved the world, that he gave his one and only Son, that whoever believes in him should not perish, but have eternal life.' },
    { reference: 'John 3:17', version: 'WEB', text: 'For God didn’t send his Son into the world to judge the world, but that the world should be saved through him.' },
  ],
  'Lamentations 3:22-23 (WEB)': [
    { reference: 'Lamentations 3:22', version: 'WEB', text: 'It is because of Yahweh’s loving kindnesses that we are not consumed, because his compassion doesn’t fail.' },
    { reference: 'Lamentations 3:23', version: 'WEB', text: 'They are new every morning. Great is your faithfulness.' },
  ],
};

export const VERSE_OF_THE_DAY_POOL: BibleVerse[] = [
  { reference: 'Philippians 4:6-7', version: 'WEB', text: 'In nothing be anxious, but in everything, by prayer and petition with thanksgiving, let your requests be made known to God. And the peace of God, which surpasses all understanding, will guard your hearts and your thoughts in Christ Jesus.' },
  { reference: 'Matthew 18:20', version: 'KJV', text: 'For where two or three are gathered together in my name, there am I in the midst of them.' },
  { reference: 'James 5:16', version: 'WEB', text: 'Confess your offenses to one another, and pray for one another, that you may be healed. The insistent prayer of a righteous person is powerfully effective.' },
  { reference: 'Jeremiah 29:11', version: 'WEB', text: 'For I know the thoughts that I think toward you, says Yahweh, thoughts of peace, and not of evil, to give you hope and a future.' },
  { reference: 'Psalm 46:1', version: 'KJV', text: 'God is our refuge and strength, a very present help in trouble.' },
  { reference: '1 Thessalonians 5:16-18', version: 'WEB', text: 'Rejoice always. Pray without ceasing. In everything give thanks, for this is the will of God in Christ Jesus toward you.' },
  { reference: 'Joshua 1:9', version: 'WEB', text: 'Haven’t I commanded you? Be strong and courageous. Don’t be afraid. Don’t be dismayed, for Yahweh your God is with you wherever you go.' },
  { reference: 'Romans 8:28', version: 'KJV', text: 'And we know that all things work together for good to them that love God, to them who are the called according to his purpose.' },
  { reference: 'Matthew 6:33', version: 'KJV', text: 'But seek ye first the kingdom of God, and his righteousness; and all these things shall be added unto you.' },
  { reference: 'Galatians 6:9', version: 'WEB', text: 'Let’s not be weary in doing good, for we will reap in due season, if we don’t give up.' },
];

export function getVerseOfTheDay(dateKey: string): BibleVerse {
  let hash = 0;
  for (let i = 0; i < dateKey.length; i++) hash = (hash * 31 + dateKey.charCodeAt(i)) >>> 0;
  return VERSE_OF_THE_DAY_POOL[hash % VERSE_OF_THE_DAY_POOL.length];
}
