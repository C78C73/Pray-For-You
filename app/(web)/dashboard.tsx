import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet, Alert } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useAppStore } from '../../src/store/useAppStore';
import { Symbol } from '../../src/components/Symbol';
import { SeedsPill, StreakPill } from '../../src/components/SeedsPill';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { getVerseOfTheDay } from '../../src/data/verses';
import { todayKey } from '../../src/utils/date';
import {
  BIBLE_VERSIONS,
  BibleVersionId,
  SUGGESTED_PASSAGES,
  fetchPassage,
} from '../../src/services/bibleService';
import { BibleVerse, PrayerVisibility } from '../../src/types';
import { useTheme } from '../../src/theme/ThemeContext';
import { ThemeColors, Spacing, Radius } from '../../src/theme/theme';

const MAX_LEN = 280;

function useDashboardTheme() {
  const theme = useTheme();
  const styles = useMemo(
    () => makeStyles(theme.colors, theme.spacing, theme.radius, theme.cardShadow),
    [theme.colors, theme.spacing, theme.radius, theme.cardShadow]
  );
  return { ...theme, styles };
}

export default function Dashboard() {
  const router = useRouter();
  const user = useAppStore((s) => s.user);
  const prayers = useAppStore((s) => s.prayers);
  const friends = useAppStore((s) => s.friends);
  const addFriendByCode = useAppStore((s) => s.addFriendByCode);
  const prayForFriend = useAppStore((s) => s.prayForFriend);
  const addPrayerRequest = useAppStore((s) => s.addPrayerRequest);
  const recordBibleReadToday = useAppStore((s) => s.recordBibleReadToday);
  const { styles } = useDashboardTheme();

  if (!user) return <Redirect href="/welcome" />;

  return (
    <View style={styles.page}>
      <Header
        onOpenProfile={() => router.push('/edit-symbol')}
        onOpenSettings={() => router.push('/settings')}
      />
      <ScrollView horizontal contentContainerStyle={styles.columnsRow} style={{ flex: 1 }}>
        <BibleColumn onReadToday={recordBibleReadToday} readToday={user.streak.lastActiveDate === todayKey()} />
        <PeopleColumn
          currentUserId={user.id}
          friends={friends}
          prayers={prayers}
          onAddFriend={addFriendByCode}
          onPray={prayForFriend}
        />
        <GroupsColumn />
        <YouColumn user={user} prayers={prayers} onSubmit={addPrayerRequest} />
      </ScrollView>
    </View>
  );
}

function Header({ onOpenProfile, onOpenSettings }: { onOpenProfile: () => void; onOpenSettings: () => void }) {
  const user = useAppStore((s) => s.user)!;
  const showStreak = useAppStore((s) => s.preferences.showStreak);
  const { colors, spacing, styles } = useDashboardTheme();
  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <MaterialCommunityIcons name="cross" size={22} color={colors.primary} />
        <Text style={styles.headerTitle}>Faithstreak</Text>
      </View>
      <View style={styles.headerRight}>
        {showStreak && <StreakPill count={user.streak.count} />}
        <SeedsPill seeds={user.seeds} />
        <Pressable onPress={onOpenProfile}>
          <Symbol symbolId={user.symbolId} frameId={user.frameId} photoUri={user.photoUri} size={32} />
        </Pressable>
        <Pressable onPress={onOpenSettings} style={{ padding: spacing.xs }}>
          <MaterialCommunityIcons name="cog-outline" size={22} color={colors.text} />
        </Pressable>
      </View>
    </View>
  );
}

function Column({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  const { colors, typography, styles } = useDashboardTheme();
  return (
    <View style={styles.column}>
      <View style={styles.columnHeader}>
        <MaterialCommunityIcons name={icon as any} size={18} color={colors.primary} />
        <Text style={typography.heading}>{title}</Text>
      </View>
      <View style={{ flex: 1 }}>{children}</View>
    </View>
  );
}

function BibleColumn({ onReadToday, readToday }: { onReadToday: () => void; readToday: boolean }) {
  const { colors, spacing, styles } = useDashboardTheme();
  const [passage, setPassage] = useState(SUGGESTED_PASSAGES[0]);
  const [version, setVersion] = useState<BibleVersionId>('web');
  const [verses, setVerses] = useState<BibleVerse[]>([]);
  const verse = useMemo(() => getVerseOfTheDay(todayKey()), []);

  useEffect(() => {
    let cancelled = false;
    fetchPassage(passage, version).then((v) => {
      if (!cancelled) setVerses(v);
    });
    return () => {
      cancelled = true;
    };
  }, [passage, version]);

  return (
    <Column title="Bible" icon="book-cross">
      <View style={styles.verseCard}>
        <Text style={styles.verseText}>“{verse.text}”</Text>
        <Text style={styles.verseRef}>
          {verse.reference} · {verse.version}
        </Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
        {SUGGESTED_PASSAGES.map((p) => (
          <Pressable key={p} onPress={() => setPassage(p)} style={[styles.chip, passage === p && styles.chipActive]}>
            <Text style={[styles.chipLabel, passage === p && styles.chipLabelActive]}>{p}</Text>
          </Pressable>
        ))}
      </ScrollView>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
        {BIBLE_VERSIONS.map((v) => (
          <Pressable
            key={v.id}
            onPress={() => setVersion(v.id)}
            style={[styles.smallChip, version === v.id && styles.chipActive]}
          >
            <Text style={[styles.chipLabel, version === v.id && styles.chipLabelActive]}>{v.id.toUpperCase()}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView style={styles.scrollArea} contentContainerStyle={{ gap: spacing.xs }}>
        {verses.map((v) => (
          <Text key={v.reference} style={styles.verseLine}>
            <Text style={styles.verseNum}>{v.reference.split(':').pop()} </Text>
            {v.text}
          </Text>
        ))}
      </ScrollView>

      <PrimaryButton
        label={readToday ? "Today's reading logged ✓" : "Mark today's reading complete"}
        onPress={onReadToday}
        disabled={readToday}
        style={{ marginTop: spacing.sm }}
      />
    </Column>
  );
}

function PeopleColumn({
  currentUserId,
  friends,
  prayers,
  onAddFriend,
  onPray,
}: {
  currentUserId: string;
  friends: ReturnType<typeof useAppStore.getState>['friends'];
  prayers: ReturnType<typeof useAppStore.getState>['prayers'];
  onAddFriend: (code: string) => { ok: boolean; message: string };
  onPray: (friendId: string) => void;
}) {
  const { colors, spacing, typography, styles } = useDashboardTheme();
  const [code, setCode] = useState('');

  function handleAdd() {
    const result = onAddFriend(code);
    Alert.alert(result.ok ? 'Added' : 'Not added', result.message);
    if (result.ok) setCode('');
  }

  const rows = friends.map((f) => {
    const request = prayers
      .filter((p) => p.authorId === f.id && !p.answered)
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))[0];
    return { friend: f, request };
  });

  return (
    <Column title="People" icon="account-group">
      <View style={styles.addRow}>
        <TextInput
          value={code}
          onChangeText={setCode}
          placeholder="Add friend code"
          placeholderTextColor={colors.textMuted}
          autoCapitalize="characters"
          style={styles.input}
        />
        <PrimaryButton label="Add" onPress={handleAdd} disabled={!code.trim()} />
      </View>

      <ScrollView style={styles.scrollArea} contentContainerStyle={{ gap: spacing.sm }}>
        {rows.length === 0 && (
          <Text style={[typography.caption, { marginTop: spacing.md }]}>
            Add a friend's code above to see what they need prayer for.
          </Text>
        )}
        {rows.map(({ friend, request }) => {
          const alreadyPrayed = !!request && request.prayedByIds.includes(currentUserId);
          return (
            <View key={friend.id} style={styles.friendCard}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                <Symbol symbolId={friend.symbolId} frameId={friend.frameId} size={36} />
                <Text style={[typography.body, { flex: 1, fontWeight: '600' }]}>{friend.displayName}</Text>
              </View>
              <Text style={[typography.caption, styles.friendRequestText]}>
                {request ? request.text : 'No current request shared'}
              </Text>
              <Pressable
                onPress={() => onPray(friend.id)}
                disabled={alreadyPrayed}
                style={[styles.prayButton, alreadyPrayed && styles.prayButtonDone]}
              >
                <MaterialCommunityIcons
                  name="hands-pray"
                  size={16}
                  color={alreadyPrayed ? colors.success : colors.primary}
                />
                <Text style={[styles.prayLabel, alreadyPrayed && { color: colors.success }]}>
                  {alreadyPrayed ? 'Prayed for them' : 'I prayed for you'}
                </Text>
              </Pressable>
            </View>
          );
        })}
      </ScrollView>
    </Column>
  );
}

function GroupsColumn() {
  const router = useRouter();
  const { colors, spacing, typography, styles } = useDashboardTheme();
  const user = useAppStore((s) => s.user)!;
  const groups = useAppStore((s) => s.groups);
  const joinGroupOpen = useAppStore((s) => s.joinGroupOpen);
  const joinGroupByCode = useAppStore((s) => s.joinGroupByCode);
  const [code, setCode] = useState('');

  const yours = groups.filter((g) => g.memberIds.includes(user.id));
  const discover = groups.filter((g) => g.visibility === 'open' && !g.memberIds.includes(user.id));

  function handleJoin() {
    const result = joinGroupByCode(code);
    Alert.alert(result.ok ? 'Joined' : 'Not joined', result.message);
    if (result.ok) setCode('');
  }

  function openGroup(id: string) {
    router.push({ pathname: '/group/[id]', params: { id } });
  }

  return (
    <Column title="Groups" icon="account-multiple-outline">
      <View style={styles.addRow}>
        <TextInput
          value={code}
          onChangeText={setCode}
          placeholder="Join with a code"
          placeholderTextColor={colors.textMuted}
          autoCapitalize="characters"
          style={styles.input}
        />
        <PrimaryButton label="Join" onPress={handleJoin} disabled={!code.trim()} />
      </View>

      <Pressable onPress={() => router.push('/new-group')} style={styles.createGroupBtn}>
        <MaterialCommunityIcons name="plus" size={16} color={colors.primary} />
        <Text style={styles.createGroupLabel}>Create a group</Text>
      </Pressable>

      <ScrollView style={styles.scrollArea} contentContainerStyle={{ gap: spacing.sm }}>
        {yours.length === 0 && discover.length === 0 && (
          <Text style={[typography.caption, { marginTop: spacing.md }]}>
            Create a group or join one with an invite code.
          </Text>
        )}
        {yours.map((g) => (
          <Pressable key={g.id} onPress={() => openGroup(g.id)} style={styles.groupRow}>
            <View style={{ flex: 1 }}>
              <Text style={[typography.body, { fontWeight: '600' }]}>{g.name}</Text>
              <Text style={typography.caption}>
                {g.memberIds.length} {g.memberIds.length === 1 ? 'member' : 'members'}
              </Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={18} color={colors.textMuted} />
          </Pressable>
        ))}

        {discover.length > 0 && (
          <>
            <Text style={[typography.caption, { marginTop: spacing.sm }]}>Discover</Text>
            {discover.map((g) => (
              <View key={g.id} style={styles.groupRow}>
                <Pressable style={{ flex: 1 }} onPress={() => openGroup(g.id)}>
                  <Text style={typography.body}>{g.name}</Text>
                  <Text style={typography.caption}>
                    {g.memberIds.length} {g.memberIds.length === 1 ? 'member' : 'members'}
                  </Text>
                </Pressable>
                <Pressable onPress={() => joinGroupOpen(g.id)} style={styles.joinBtn}>
                  <Text style={styles.joinBtnLabel}>Join</Text>
                </Pressable>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </Column>
  );
}

function YouColumn({
  user,
  prayers,
  onSubmit,
}: {
  user: ReturnType<typeof useAppStore.getState>['user'];
  prayers: ReturnType<typeof useAppStore.getState>['prayers'];
  onSubmit: (text: string, visibility: PrayerVisibility) => void;
}) {
  const showStreak = useAppStore((s) => s.preferences.showStreak);
  const { colors, spacing, typography, styles } = useDashboardTheme();
  const [text, setText] = useState('');
  const [visibility, setVisibility] = useState<PrayerVisibility>('friends');
  if (!user) return null;

  const mine = prayers.filter((p) => p.authorId === user.id).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  function submit() {
    if (!text.trim()) return;
    onSubmit(text, visibility);
    setText('');
  }

  return (
    <Column title="You" icon="account-circle">
      <View style={styles.statsRow}>
        {showStreak && (
          <View style={styles.stat}>
            <MaterialCommunityIcons name="fire" size={20} color={colors.accent} />
            <Text style={styles.statValue}>{user.streak.count}</Text>
            <Text style={typography.caption}>Day streak</Text>
          </View>
        )}
        <View style={styles.stat}>
          <MaterialCommunityIcons name="sprout" size={20} color={colors.success} />
          <Text style={styles.statValue}>{user.seeds}</Text>
          <Text style={typography.caption}>Seeds</Text>
        </View>
      </View>

      <Text style={[typography.caption, { marginTop: spacing.md }]}>What do you need prayer for?</Text>
      <TextInput
        multiline
        maxLength={MAX_LEN}
        value={text}
        onChangeText={setText}
        placeholder="Share as much or as little as you're comfortable with..."
        placeholderTextColor={colors.textMuted}
        style={styles.textArea}
      />
      <View style={styles.segment}>
        <Pressable
          onPress={() => setVisibility('friends')}
          style={[styles.segmentBtn, visibility === 'friends' && styles.segmentActive]}
        >
          <Text style={[styles.segmentLabel, visibility === 'friends' && styles.segmentLabelActive]}>Friends</Text>
        </Pressable>
        <Pressable
          onPress={() => setVisibility('global')}
          style={[styles.segmentBtn, visibility === 'global' && styles.segmentActive]}
        >
          <Text style={[styles.segmentLabel, visibility === 'global' && styles.segmentLabelActive]}>Community</Text>
        </Pressable>
      </View>
      <PrimaryButton label="Share request" onPress={submit} disabled={!text.trim()} style={{ marginTop: spacing.sm }} />

      <Text style={[typography.caption, { marginTop: spacing.lg }]}>Your requests</Text>
      <ScrollView style={styles.scrollArea} contentContainerStyle={{ gap: spacing.sm }}>
        {mine.length === 0 && <Text style={typography.caption}>Nothing shared yet.</Text>}
        {mine.map((p) => (
          <View key={p.id} style={styles.myRequestCard}>
            <Text style={typography.body}>{p.text}</Text>
            <Text style={typography.caption}>
              {p.prayedByIds.length} {p.prayedByIds.length === 1 ? 'person' : 'people'} prayed ·{' '}
              {p.visibility === 'global' ? 'Community' : 'Friends'}
            </Text>
          </View>
        ))}
      </ScrollView>
    </Column>
  );
}

function makeStyles(colors: ThemeColors, spacing: Spacing, radius: Radius, cardShadow: object) {
  return StyleSheet.create({
    page: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.surface,
    },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
    headerTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
    headerRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    columnsRow: { flexGrow: 1 },
    column: {
      width: 380,
      minWidth: 340,
      padding: spacing.lg,
      borderRightWidth: 1,
      borderRightColor: colors.border,
      gap: spacing.sm,
    },
    columnHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.xs },
    scrollArea: { flex: 1, marginTop: spacing.xs },
    verseCard: {
      padding: spacing.md,
      backgroundColor: colors.primary,
      borderRadius: radius.lg,
      gap: 4,
    },
    verseText: { color: colors.primaryText, fontSize: 14, fontStyle: 'italic', lineHeight: 20 },
    verseRef: { color: colors.primaryText, opacity: 0.8, fontSize: 12, fontWeight: '600' },
    chipsRow: { gap: spacing.xs, paddingVertical: 2 },
    chip: {
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.sm,
      borderRadius: radius.pill,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    smallChip: {
      paddingVertical: 4,
      paddingHorizontal: spacing.sm,
      borderRadius: radius.pill,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    chipLabel: { fontSize: 12, fontWeight: '600', color: colors.text },
    chipLabelActive: { color: colors.primaryText },
    verseLine: { fontSize: 14, lineHeight: 21, color: colors.text },
    verseNum: { fontWeight: '700', color: colors.primary },
    addRow: { flexDirection: 'row', gap: spacing.xs, alignItems: 'center' },
    input: {
      flex: 1,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.sm,
      fontSize: 14,
      color: colors.text,
    },
    friendCard: {
      backgroundColor: colors.surface,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.sm,
      gap: spacing.xs,
      ...cardShadow,
    },
    friendRequestText: { fontStyle: 'italic' },
    createGroupBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start' },
    createGroupLabel: { fontSize: 13, fontWeight: '600', color: colors.primary },
    groupRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      backgroundColor: colors.surface,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.sm,
      ...cardShadow,
    },
    joinBtn: {
      backgroundColor: colors.primarySoft,
      borderRadius: radius.pill,
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.sm,
    },
    joinBtnLabel: { fontSize: 12, fontWeight: '700', color: colors.primary },
    prayButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      alignSelf: 'flex-start',
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.sm,
      borderRadius: radius.pill,
      backgroundColor: colors.primarySoft,
    },
    prayButtonDone: { backgroundColor: colors.successSoft },
    prayLabel: { fontSize: 12, fontWeight: '700', color: colors.primary },
    statsRow: { flexDirection: 'row', gap: spacing.lg },
    stat: { alignItems: 'center', gap: 2 },
    statValue: { fontSize: 18, fontWeight: '700', color: colors.text },
    textArea: {
      marginTop: spacing.xs,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      padding: spacing.sm,
      fontSize: 14,
      minHeight: 90,
      textAlignVertical: 'top',
      color: colors.text,
    },
    segment: {
      flexDirection: 'row',
      backgroundColor: colors.border,
      borderRadius: radius.pill,
      padding: 3,
      marginTop: spacing.xs,
    },
    segmentBtn: { flex: 1, paddingVertical: spacing.xs, borderRadius: radius.pill, alignItems: 'center' },
    segmentActive: { backgroundColor: colors.surface },
    segmentLabel: { fontSize: 12, fontWeight: '600', color: colors.textMuted },
    segmentLabelActive: { color: colors.text },
    myRequestCard: {
      backgroundColor: colors.surface,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.sm,
      gap: 2,
      ...cardShadow,
    },
  });
}
