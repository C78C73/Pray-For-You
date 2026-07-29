export type AuthMethod = 'google' | 'email' | 'guest';

export interface UserProfile {
  id: string;
  displayName: string;
  email: string | null;
  authMethod: AuthMethod;
  symbolId: string;
  frameId: string;
  photoUri: string | null;
  ownedSymbolIds: string[];
  ownedFrameIds: string[];
  seeds: number;
  streak: {
    count: number;
    longestCount: number;
    lastActiveDate: string | null; // yyyy-mm-dd
    graceDaysAvailable: number;
  };
  friendCode: string;
  createdAt: string;
}

export type PrayerVisibility = 'global' | 'friends' | 'group';

export interface PrayerRequest {
  id: string;
  authorId: string;
  authorName: string;
  authorSymbolId: string;
  authorFrameId: string;
  text: string;
  visibility: PrayerVisibility;
  groupId?: string; // set when visibility === 'group'
  createdAt: string;
  prayedByIds: string[];
  answered: boolean;
}

export interface Friend {
  id: string;
  displayName: string;
  symbolId: string;
  frameId: string;
  friendCode: string;
}

export type GroupVisibility = 'open' | 'invite_only';

export interface Group {
  id: string;
  name: string;
  bio: string;
  visibility: GroupVisibility;
  inviteCode: string;
  ownerId: string;
  memberIds: string[];
  createdAt: string;
}

export interface AppNotification {
  id: string;
  type: 'prayed_for_you' | 'reminder' | 'friend_added';
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
}

export interface BibleVerse {
  reference: string;
  text: string;
  version: string;
}
