import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  AuthMethod,
  Friend,
  Group,
  GroupVisibility,
  GroupJoinRequest,
  PrayerRequest,
  PrayerVisibility,
  UserProfile,
  AppNotification,
} from '../types';
import { generateId, generateFriendCode } from '../utils/id';
import { todayKey } from '../utils/date';
import { applyDailyActivity } from '../utils/streak';
import { SEED_REWARDS } from '../data/seedRewards';
import { SYMBOLS } from '../data/symbols';
import { FRAMES } from '../data/frames';
import { notifyPrayedForYou, notifyGroupPrayerRequest } from '../services/notificationService';
import { ThemeMode, AccentId } from '../theme/theme';

interface Preferences {
  themeMode: ThemeMode;
  accentId: AccentId;
  showStreak: boolean;
}

const DEFAULT_PREFERENCES: Preferences = {
  themeMode: 'system',
  accentId: 'blue',
  showStreak: true,
};

interface AppState {
  hasHydrated: boolean;
  user: UserProfile | null;
  prayers: PrayerRequest[];
  friends: Friend[];
  groups: Group[];
  notifications: AppNotification[];
  preferences: Preferences;

  setHasHydrated: (v: boolean) => void;
  signIn: (method: AuthMethod, displayName: string, email: string | null) => void;
  signOut: () => void;

  setThemeMode: (mode: ThemeMode) => void;
  setAccentId: (accentId: AccentId) => void;
  setShowStreak: (show: boolean) => void;

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

  createGroup: (name: string, bio: string, visibility: GroupVisibility) => { ok: boolean; message: string };
  joinGroupOpen: (groupId: string) => void;
  requestToJoinGroup: (groupId: string) => { ok: boolean; message: string };
  approveJoinRequest: (groupId: string, userId: string) => void;
  denyJoinRequest: (groupId: string, userId: string) => void;
  findGroupByCode: (code: string) => { ok: boolean; message: string; groupId?: string };
  leaveGroup: (groupId: string) => void;
  addGroupPrayerRequest: (groupId: string, text: string) => void;

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

// Demo-mode: seeded so Groups has something to browse/join on first run.
// The third group is owned by the signed-in user with a demo request
// already pending, so the approve/deny UI is visible without needing a
// second device.
function seedDemoGroups(userId: string): Group[] {
  const now = new Date().toISOString();
  return [
    {
      id: generateId(),
      name: 'Sunday Small Group',
      bio: 'A few of us who meet after service to pray and catch up.',
      visibility: 'open',
      inviteCode: generateFriendCode(),
      ownerId: 'community',
      memberIds: [userId],
      pendingRequests: [],
      createdAt: now,
    },
    {
      id: generateId(),
      name: 'Young Adults Prayer Circle',
      bio: 'Weekly prayer requests for anyone in their 20s and 30s navigating faith and life.',
      visibility: 'open',
      inviteCode: generateFriendCode(),
      ownerId: 'community',
      memberIds: [],
      pendingRequests: [],
      createdAt: now,
    },
    {
      id: generateId(),
      name: 'Prayer Warriors',
      bio: 'A closer circle for deeper, ongoing prayer needs.',
      visibility: 'invite_only',
      inviteCode: generateFriendCode(),
      ownerId: userId,
      memberIds: [userId],
      pendingRequests: [{ userId: generateId(), displayName: 'Priya' }],
      createdAt: now,
    },
  ];
}

function seedDemoGroupPrayer(groupId: string): PrayerRequest {
  return {
    id: generateId(),
    authorId: 'community',
    authorName: 'Sam',
    authorSymbolId: 'cross',
    authorFrameId: 'none',
    text: 'Traveling for work this week — safety and rest.',
    visibility: 'group',
    groupId,
    createdAt: new Date().toISOString(),
    prayedByIds: [],
    answered: false,
  };
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      hasHydrated: false,
      user: null,
      prayers: [],
      friends: [],
      groups: [],
      notifications: [],
      preferences: DEFAULT_PREFERENCES,

      setHasHydrated: (v) => set({ hasHydrated: v }),

      signIn: (method, displayName, email) => {
        const user = newUser(method, displayName.trim() || 'Friend', email);
        const groups = seedDemoGroups(user.id);
        set({
          user,
          prayers: [...seedDemoPrayers(), seedDemoGroupPrayer(groups[0].id)],
          friends: [],
          groups,
        });
      },

      // Appearance and the streak-visibility switch are device settings, not
      // account data — they deliberately survive sign-out.
      signOut: () => set({ user: null, prayers: [], friends: [], groups: [], notifications: [] }),

      setThemeMode: (themeMode) => set((s) => ({ preferences: { ...s.preferences, themeMode } })),
      setAccentId: (accentId) => set((s) => ({ preferences: { ...s.preferences, accentId } })),
      setShowStreak: (showStreak) => set((s) => ({ preferences: { ...s.preferences, showStreak } })),

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

      createGroup: (name, bio, visibility) => {
        const user = get().user;
        if (!user) return { ok: false, message: 'Sign in first.' };
        if (!name.trim()) return { ok: false, message: 'Give your group a name.' };
        const group: Group = {
          id: generateId(),
          name: name.trim(),
          bio: bio.trim(),
          visibility,
          inviteCode: generateFriendCode(),
          ownerId: user.id,
          memberIds: [user.id],
          pendingRequests: [],
          createdAt: new Date().toISOString(),
        };
        set((s) => ({
          groups: [group, ...s.groups],
          user: { ...user, seeds: user.seeds + SEED_REWARDS.createdGroup },
        }));
        return { ok: true, message: `${group.name} created.` };
      },

      joinGroupOpen: (groupId) => {
        const user = get().user;
        const group = get().groups.find((g) => g.id === groupId);
        if (!user || !group || group.visibility !== 'open' || group.memberIds.includes(user.id)) return;
        set((s) => ({
          groups: s.groups.map((g) => (g.id === groupId ? { ...g, memberIds: [...g.memberIds, user.id] } : g)),
        }));
      },

      requestToJoinGroup: (groupId) => {
        const user = get().user;
        const group = get().groups.find((g) => g.id === groupId);
        if (!user || !group) return { ok: false, message: 'Group not found.' };
        if (group.visibility === 'open') return { ok: false, message: 'This group is open — just join it.' };
        if (group.memberIds.includes(user.id)) return { ok: false, message: "You're already in this group." };
        if (group.pendingRequests.some((r) => r.userId === user.id)) {
          return { ok: false, message: 'Request already sent.' };
        }
        const request: GroupJoinRequest = { userId: user.id, displayName: user.displayName };
        set((s) => ({
          groups: s.groups.map((g) =>
            g.id === groupId ? { ...g, pendingRequests: [...g.pendingRequests, request] } : g
          ),
        }));
        return { ok: true, message: 'Request sent — the group owner needs to approve it.' };
      },

      approveJoinRequest: (groupId, userId) => {
        const owner = get().user;
        const group = get().groups.find((g) => g.id === groupId);
        if (!owner || !group || group.ownerId !== owner.id) return;
        set((s) => ({
          groups: s.groups.map((g) =>
            g.id === groupId
              ? {
                  ...g,
                  memberIds: g.memberIds.includes(userId) ? g.memberIds : [...g.memberIds, userId],
                  pendingRequests: g.pendingRequests.filter((r) => r.userId !== userId),
                }
              : g
          ),
        }));
      },

      denyJoinRequest: (groupId, userId) => {
        const owner = get().user;
        const group = get().groups.find((g) => g.id === groupId);
        if (!owner || !group || group.ownerId !== owner.id) return;
        set((s) => ({
          groups: s.groups.map((g) =>
            g.id === groupId ? { ...g, pendingRequests: g.pendingRequests.filter((r) => r.userId !== userId) } : g
          ),
        }));
      },

      findGroupByCode: (code) => {
        const trimmed = code.trim().toUpperCase();
        if (!trimmed) return { ok: false, message: 'Enter an invite code.' };
        // Demo-mode: only matches groups already known on this device (the
        // seeded ones, or ones you created). A real invite code needs a
        // backend lookup — see docs/ARCHITECTURE.md.
        const group = get().groups.find((g) => g.inviteCode === trimmed);
        if (!group) return { ok: false, message: 'No group found with that code.' };
        return { ok: true, message: group.name, groupId: group.id };
      },

      leaveGroup: (groupId) =>
        set((s) => ({
          groups: s.groups.map((g) =>
            g.id === groupId ? { ...g, memberIds: g.memberIds.filter((id) => id !== s.user?.id) } : g
          ),
        })),

      addGroupPrayerRequest: (groupId, text) => {
        const user = get().user;
        const group = get().groups.find((g) => g.id === groupId);
        if (!user || !group || !text.trim()) return;
        const request: PrayerRequest = {
          id: generateId(),
          authorId: user.id,
          authorName: user.displayName,
          authorSymbolId: user.symbolId,
          authorFrameId: user.frameId,
          text: text.trim(),
          visibility: 'group',
          groupId,
          createdAt: new Date().toISOString(),
          prayedByIds: [],
          answered: false,
        };
        set((s) => ({
          prayers: [request, ...s.prayers],
          user: { ...user, seeds: user.seeds + SEED_REWARDS.postedPrayerRequest },
        }));

        // Fanning this out to every member's device needs a backend (a
        // Cloud Function iterating the group's memberIds); simulated as one
        // local notification here so the flow is demoable end to end.
        void notifyGroupPrayerRequest(group.name, user.displayName);
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
