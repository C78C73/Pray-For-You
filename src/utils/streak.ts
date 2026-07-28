import { UserProfile } from '../types';
import { daysBetween } from './date';
import { GRACE_DAY_EVERY_DAYS } from '../data/seedRewards';

const MAX_GRACE_DAYS = 3;

/**
 * Advances the streak for "today". Missing a single day doesn't zero you
 * out if you've banked a grace day — reflects mercy being "new every
 * morning" (Lamentations 3:22-23) rather than punishing a slip.
 */
export function applyDailyActivity(
  streak: UserProfile['streak'],
  todayKeyStr: string
): { streak: UserProfile['streak']; earnedGraceDay: boolean; streakBroken: boolean } {
  if (streak.lastActiveDate === todayKeyStr) {
    return { streak, earnedGraceDay: false, streakBroken: false };
  }

  let count = streak.count;
  let graceDaysAvailable = streak.graceDaysAvailable;
  let streakBroken = false;

  if (!streak.lastActiveDate) {
    count = 1;
  } else {
    const gap = daysBetween(streak.lastActiveDate, todayKeyStr);
    if (gap === 1) {
      count += 1;
    } else if (gap === 2 && graceDaysAvailable > 0) {
      graceDaysAvailable -= 1;
      count += 1;
    } else {
      streakBroken = count > 1;
      count = 1;
    }
  }

  let earnedGraceDay = false;
  if (count > 0 && count % GRACE_DAY_EVERY_DAYS === 0 && graceDaysAvailable < MAX_GRACE_DAYS) {
    graceDaysAvailable += 1;
    earnedGraceDay = true;
  }

  return {
    streak: {
      count,
      longestCount: Math.max(streak.longestCount, count),
      lastActiveDate: todayKeyStr,
      graceDaysAvailable,
    },
    earnedGraceDay,
    streakBroken,
  };
}
