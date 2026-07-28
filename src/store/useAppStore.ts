import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { AuthMethod, Friend, PrayerRequest, PrayerVisibility, UserProfile, AppNotification } from '../types';
import { generateId, generateFriendCode } from '../utils/id';
import { todayKey } from '../utils/date';
import { applyDailyActivity } from '../utils/streak';
import { SEED_REWARDS } from '../data/seedRewards';
import { SYMBOLS } from '../data/symbols';
import { FRAMES } from '../data/frames';
import { notifyPrayedForYou } from '../services/notificationService';

interface AppState {
  hasHydrated: boolean;
  user: UserProfile | null;
  prayers: PrayerRequest[];
  friends: Friend[];
  notifications: AppNotification[];

  setHasHydrated: (v: boolean) => void;
  signIn: (method: AuthMethod, displayName: string, email: string | null) => void;
  signOut: () => void;

  setSymbol: (symbolId: string) => void;
  setFrame: (frameId: string) => void;
  setPhoto: (uri: string | null) => void;
  spendSeeds: (amount: number) => boolean;
  unlockSymbol: (symbolId: string) => { ok: boolean; message: string };
  unlockFrame: (frameId: string) => { ok: boolean; message: string };

  recordBibleReadToday: () => void;
  addPrayerRequest: (text: string, visibility: PrayerVisibility) => void;
  markPrayed: (prayerId: string) => void;
  markAnswered: (prayerId: string) => void;

  addFriendByCode: (code: string) => { ok: boolean; message: string };
  removeFriend: (friendId: string) => void;
  prayForFriend: (friendId: string) => void;

  markNotificationRead: (id: string) => void;
}

function newUser(method: AuthMethod, displayName: string, email: string | null): UserProfile {
  return {
    id: generateId(),
    displayName,
    email,
    authMethod: method,
    symbolId: 'cross',
    frameId: 'none',
    photoUri: null,
    ownedSymbolIds: SYMBOLS.filter((s) => s.costSeeds === 0).map((s) => s.id),
    ownedFrameIds: FRAMES.filter((f) => f.costSeeds === 0).map((f) => f.id),
    seeds: 10,
    streak: { count: 0, longestCount: 0, lastActiveDate: null, graceDaysAvailable: 0 },
    friendCode: generateFriendCode(),
    createdAt: new Date().toISOString(),
  };
}

const DEMO_FRIEND_NAMES = ['Sam', 'Priya', 'Jordan', 'Maria', 'Elijah', 'Grace'];
const DEMO_FRIEND_REQUESTS = [
  'Peace about a decision I have to make this week.',
  'My mom is recovering from surgery — for a smooth healing.',
  'Starting a new job Monday, for confidence and wisdom.',
  null, // some friends simply have nothing pending right now
];

function seedDemoPrayers(): PrayerRequest[] {
  const now = new Date().toISOString();
  return [
    {
      id: generateId(),
      authorId: 'community',
      authorName: 'Faithstreak Community',
      authorSymbolId: 'hands-pray',
      authorFrameId: 'grace-gold',
      text: 'For peace and healing for everyone carrying something heavy this week.',
      visibility: 'global',
      createdAt: now,
      prayedByIds: [],
      answered: false,
    },
    {
      id: generateId(),
      authorId: 'community',
      authorName: 'Faithstreak Community',
      authorSymbolId: 'dove',
      authorFrameId: 'none',
      text: 'For wisdom and open doors for anyone job-searching right now.',
      visibility: 'global',
      createdAt: now,
      prayedByIds: [],
      answered: false,
    },
  ];
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      hasHydrated: false,
      user: null,
      prayers: [],
      friends: [],
      notifications: [],

      setHasHydrated: (v) => set({ hasHydrated: v }),

      signIn: (method, displayName, email) => {
        set({
          user: newUser(method, displayName.trim() || 'Friend', email),
          prayers: seedDemoPrayers(),
          friends: [],
        });
      },

      signOut: () => set({ user: null, prayers: [], friends: [], notifications: [] }),

      setSymbol: (symbolId) =>
        set((s) =>
          s.user && s.user.ownedSymbolIds.includes(symbolId) ? { user: { ...s.user, symbolId } } : s
        ),

      setFrame: (frameId) =>
        set((s) =>
          s.user && s.user.ownedFrameIds.includes(frameId) ? { user: { ...s.user, frameId } } : s
        ),

      setPhoto: (uri) =>
        set((s) => (s.user ? { user: { ...s.user, photoUri: uri, symbolId: uri ? 'photo' : s.user.symbolId } } : s)),

      spendSeeds: (amount) => {
        const user = get().user;
        if (!user || user.seeds < amount) return false;
        set({ user: { ...user, seeds: user.seeds - amount } });
        return true;
      },

      unlockSymbol: (symbolId) => {
        const user = get().user;
        const def = SYMBOLS.find((s) => s.id === symbolId);
        if (!user || !def) return { ok: false, message: 'Not found.' };
        if (user.ownedSymbolIds.includes(symbolId)) return { ok: true, message: 'Already unlocked.' };
        if (user.seeds < def.costSeeds) return { ok: false, message: 'Not enough Seeds yet.' };
        set({
          user: {
            ...user,
            seeds: user.seeds - def.costSeeds,
            ownedSymbolIds: [...user.ownedSymbolIds, symbolId],
          },
        });
        return { ok: true, message: `Unlocked ${def.label}.` };
      },

      unlockFrame: (frameId) => {
        const user = get().user;
        const def = FRAMES.find((f) => f.id === frameId);
        if (!user || !def) return { ok: false, message: 'Not found.' };
        if (user.ownedFrameIds.includes(frameId)) return { ok: true, message: 'Already unlocked.' };
        if (user.seeds < def.costSeeds) return { ok: false, message: 'Not enough Seeds yet.' };
        set({
          user: {
            ...user,
            seeds: user.seeds - def.costSeeds,
            ownedFrameIds: [...user.ownedFrameIds, frameId],
          },
        });
        return { ok: true, message: `Unlocked ${def.label}.` };
      },

      recordBibleReadToday: () => {
        const user = get().user;
        if (!user) return;
        const today = todayKey();
        if (user.streak.lastActiveDate === today) return; // already counted today
        const { streak } = applyDailyActivity(user.streak, today);
        const bonus = streak.count > 1 ? SEED_REWARDS.dailyStreakBonus : 0;
        const milestoneBonus = streak.count % 7 === 0 ? SEED_REWARDS.weeklyStreakMilestone : 0;
        set({
          user: {
            ...user,
            streak,
            seeds: user.seeds + SEED_REWARDS.readBibleToday + bonus + milestoneBonus,
          },
        });
      },

      addPrayerRequest: (text, visibility) => {
        const user = get().user;
        if (!user || !text.trim()) return;
        const request: PrayerRequest = {
          id: generateId(),
          authorId: user.id,
          authorName: user.displayName,
          authorSymbolId: user.symbolId,
          authorFrameId: user.frameId,
          text: text.trim(),
          visibility,
          createdAt: new Date().toISOString(),
          prayedByIds: [],
          answered: false,
        };
        set((s) => ({
          prayers: [request, ...s.prayers],
          user: { ...user, seeds: user.seeds + SEED_REWARDS.postedPrayerRequest },
        }));
      },

      markPrayed: (prayerId) => {
        const user = get().user;
        if (!user) return;
        const prayer = get().prayers.find((p) => p.id === prayerId);
        if (!prayer || prayer.prayedByIds.includes(user.id)) return;

        set((s) => ({
          prayers: s.prayers.map((p) =>
            p.id === prayerId ? { ...p, prayedByIds: [...p.prayedByIds, user.id] } : p
          ),
          user: { ...user, seeds: user.seeds + SEED_REWARDS.prayedForSomeone },
        }));

        // In production this triggers a push to the author's device via a
        // Cloud Function (see /functions/index.js). Simulated locally here.
        if (prayer.authorId !== user.id) {
          void notifyPrayedForYou(user.displayName);
        }
      },

      markAnswered: (prayerId) =>
        set((s) => ({
          prayers: s.prayers.map((p) => (p.id === prayerId ? { ...p, answered: true } : p)),
        })),

      addFriendByCode: (code) => {
        const trimmed = code.trim().toUpperCase();
        if (!trimmed) return { ok: false, message: 'Enter a friend code.' };
        const user = get().user;
        if (user && trimmed === user.friendCode) {
          return { ok: false, message: "That's your own code." };
        }
        if (get().friends.some((f) => f.friendCode === trimmed)) {
          return { ok: false, message: 'Already friends.' };
        }
        // Demo-mode: there's no backend yet to look up a real account by
        // code, so we create a lightweight friend entry so the flow works
        // end to end. Replace with a Firestore lookup by friendCode.
        const friend: Friend = {
          id: generateId(),
          displayName: DEMO_FRIEND_NAMES[Math.floor(Math.random() * DEMO_FRIEND_NAMES.length)],
          symbolId: 'cross',
          frameId: 'none',
          friendCode: trimmed,
        };
        // Demo-mode: give some (not all) new friends a sample prayer need so
        // the "people + what they need prayer for" view isn't empty. Replace
        // with real friends' actual requests once accounts are real.
        const demoText = DEMO_FRIEND_REQUESTS[Math.floor(Math.random() * DEMO_FRIEND_REQUESTS.length)];
        const demoRequest: PrayerRequest | null = demoText
          ? {
              id: generateId(),
              authorId: friend.id,
              authorName: friend.displayName,
              authorSymbolId: friend.symbolId,
              authorFrameId: friend.frameId,
              text: demoText,
              visibility: 'friends',
              createdAt: new Date().toISOString(),
              prayedByIds: [],
              answered: false,
            }
          : null;
        set((s) => ({
          friends: [...s.friends, friend],
          prayers: demoRequest ? [demoRequest, ...s.prayers] : s.prayers,
          user: s.user ? { ...s.user, seeds: s.user.seeds + SEED_REWARDS.addedFriend } : s.user,
        }));
        return { ok: true, message: `You're now friends with ${friend.displayName}.` };
      },

      removeFriend: (friendId) =>
        set((s) => ({ friends: s.friends.filter((f) => f.id !== friendId) })),

      prayForFriend: (friendId) => {
        const user = get().user;
        const friend = get().friends.find((f) => f.id === friendId);
        if (!user || !friend) return;

        const openRequest = get()
          .prayers.filter((p) => p.authorId === friendId && !p.answered)
          .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))[0];

        set((s) => ({
          prayers: openRequest
            ? s.prayers.map((p) =>
                p.id === openRequest.id && !p.prayedByIds.includes(user.id)
                  ? { ...p, prayedByIds: [...p.prayedByIds, user.id] }
                  : p
              )
            : s.prayers,
          user: { ...user, seeds: user.seeds + SEED_REWARDS.prayedForSomeone },
        }));

        // Real cross-device delivery needs a backend (functions/index.js);
        // simulated locally for now so the flow is demoable end to end.
        void notifyPrayedForYou(user.displayName);
      },

      markNotificationRead: (id) =>
        set((s) => ({
          notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
        })),
    }),
    {
      name: 'faithstreak:app-store',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => state?.setHasHydrated(true),
    }
  )
);
