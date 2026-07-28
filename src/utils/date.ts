export function todayKey(d: Date = new Date()): string {
  return d.toISOString().slice(0, 10); // yyyy-mm-dd, UTC is fine for a streak
}

export function daysBetween(aKey: string, bKey: string): number {
  const a = new Date(aKey + 'T00:00:00Z').getTime();
  const b = new Date(bKey + 'T00:00:00Z').getTime();
  return Math.round((b - a) / 86_400_000);
}
