// Profile "symbols" replace avatars: a single Christian icon the user picks
// (or their own uploaded photo, see PhotoSymbol). Kept intentionally small
// and reverent — no costumes, no meme icons, nothing that mocks anything.
export interface SymbolDef {
  id: string;
  label: string;
  icon: string; // MaterialCommunityIcons name
  costSeeds: number; // 0 = free / starter
}

export const SYMBOLS: SymbolDef[] = [
  { id: 'cross', label: 'Cross', icon: 'cross', costSeeds: 0 },
  { id: 'hands-pray', label: 'Praying Hands', icon: 'hands-pray', costSeeds: 0 },
  { id: 'dove', label: 'Dove', icon: 'dove', costSeeds: 25 },
  { id: 'fish', label: 'Fish (Ichthys)', icon: 'fish', costSeeds: 25 },
  { id: 'anchor', label: 'Anchor (Hope)', icon: 'anchor', costSeeds: 40 },
  { id: 'sprout', label: 'Sprout (Growth)', icon: 'sprout', costSeeds: 40 },
  { id: 'shield-cross', label: 'Shield of Faith', icon: 'shield-cross', costSeeds: 60 },
  { id: 'book-cross', label: 'Open Word', icon: 'book-cross', costSeeds: 60 },
  { id: 'star-four-points', label: 'Star of Bethlehem', icon: 'star-four-points-outline', costSeeds: 80 },
];

export function getSymbol(id: string): SymbolDef {
  return SYMBOLS.find((s) => s.id === id) ?? SYMBOLS[0];
}
