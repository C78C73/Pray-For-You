// Decorative rings around a profile symbol — the only "cosmetic" system in
// the app. Earned with Seeds (never bought), always tasteful/muted colors.
export interface FrameDef {
  id: string;
  label: string;
  color: string;
  costSeeds: number;
}

export const FRAMES: FrameDef[] = [
  { id: 'none', label: 'Plain', color: 'transparent', costSeeds: 0 },
  { id: 'grace-gold', label: 'Grace', color: '#C9A24B', costSeeds: 30 },
  { id: 'living-water', label: 'Living Water', color: '#2B4C7E', costSeeds: 30 },
  { id: 'new-growth', label: 'New Growth', color: '#3E7C59', costSeeds: 50 },
  { id: 'refiners-fire', label: "Refiner's Fire", color: '#C1652F', costSeeds: 50 },
  { id: 'royal', label: 'Royal', color: '#5B3A8E', costSeeds: 70 },
];

export function getFrame(id: string): FrameDef {
  return FRAMES.find((f) => f.id === id) ?? FRAMES[0];
}
