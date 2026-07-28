import React, { useMemo, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useAppStore } from '../../src/store/useAppStore';
import { PrayerCard } from '../../src/components/PrayerCard';
import { EmptyState } from '../../src/components/EmptyState';
import { SeedsPill, StreakPill } from '../../src/components/SeedsPill';
import { getVerseOfTheDay } from '../../src/data/verses';
import { todayKey } from '../../src/utils/date';
import { colors, radius, spacing, typography } from '../../src/theme/theme';

type Filter = 'global' | 'friends';

export default function PrayFeed() {
  const router = useRouter();
  const user = useAppStore((s) => s.user)!;
  const prayers = useAppStore((s) => s.prayers);
  const markPrayed = useAppStore((s) => s.markPrayed);
  const [filter, setFilter] = useState<Filter>('global');

  const verse = useMemo(() => getVerseOfTheDay(todayKey()), []);

  const visible = useMemo(
    () =>
      prayers
        .filter((p) => (filter === 'global' ? p.visibility === 'global' : p.authorId === user.id))
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)),
    [prayers, filter, user.id]
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={typography.title}>Pray</Text>
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <StreakPill count={user.streak.count} />
          <SeedsPill seeds={user.seeds} />
        </View>
      </View>

      <View style={styles.verseCard}>
        <Text style={styles.verseText}>“{verse.text}”</Text>
        <Text style={styles.verseRef}>
          {verse.reference} · {verse.version}
        </Text>
      </View>

      <View style={styles.segment}>
        <Pressable
          onPress={() => setFilter('global')}
          style={[styles.segmentBtn, filter === 'global' && styles.segmentActive]}
        >
          <Text style={[styles.segmentLabel, filter === 'global' && styles.segmentLabelActive]}>Community</Text>
        </Pressable>
        <Pressable
          onPress={() => setFilter('friends')}
          style={[styles.segmentBtn, filter === 'friends' && styles.segmentActive]}
        >
          <Text style={[styles.segmentLabel, filter === 'friends' && styles.segmentLabelActive]}>My Requests</Text>
        </Pressable>
      </View>

      <FlatList
        data={visible}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => <PrayerCard prayer={item} currentUserId={user.id} onPray={markPrayed} />}
        ListEmptyComponent={
          <EmptyState
            icon="hands-pray"
            title="Nothing here yet"
            body={filter === 'global' ? 'Check back soon for community requests.' : 'Share something you need prayer for.'}
          />
        }
      />

      <Pressable style={styles.fab} onPress={() => router.push('/new-request')}>
        <MaterialCommunityIcons name="plus" size={26} color={colors.white} />
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  verseCard: {
    margin: spacing.lg,
    marginBottom: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    gap: 4,
  },
  verseText: { color: colors.white, fontSize: 15, fontStyle: 'italic', lineHeight: 21 },
  verseRef: { color: '#D9E2F1', fontSize: 12, fontWeight: '600' },
  segment: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    backgroundColor: '#EDEAE0',
    borderRadius: radius.pill,
    padding: 3,
  },
  segmentBtn: { flex: 1, paddingVertical: spacing.sm, borderRadius: radius.pill, alignItems: 'center' },
  segmentActive: { backgroundColor: colors.surface },
  segmentLabel: { fontSize: 13, fontWeight: '600', color: colors.textMuted },
  segmentLabelActive: { color: colors.text },
  list: { padding: spacing.lg, paddingBottom: 100 },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
});
