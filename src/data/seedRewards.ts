// Every way to earn Seeds (in-app currency). No purchases exist — this file
// is the entire economy. Keep it small and tied to real spiritual habits.
export const SEED_REWARDS = {
  prayedForSomeone: 3,
  postedPrayerRequest: 2,
  readBibleToday: 5,
  dailyStreakBonus: 2, // on top of readBibleToday, once/day when streak continues
  addedFriend: 5,
  weeklyStreakMilestone: 20, // every 7-day multiple
} as const;

export const GRACE_DAY_EVERY_DAYS = 30; // earn one streak "grace day" per 30-day streak
