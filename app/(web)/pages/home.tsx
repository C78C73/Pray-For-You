import React, { useMemo } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useAppStore } from '../../../src/store/useAppStore';
import { SeedsPill, StreakPill } from '../../../src/components/SeedsPill';
import { getVerseOfTheDay } from '../../../src/data/verses';
import { todayKey } from '../../../src/utils/date';
import { useTheme } from '../../../src/theme/ThemeContext';
import { ThemeColors, Spacing, Radius } from '../../../src/theme/theme';

const TILES = [
  { href: '/pages/bible', icon: 'book-cross', label: 'Bible', body: 'Read any book, any chapter — highlight verses as you go.' },
  { href: '/pages/people', icon: 'account-group', label: 'People', body: "See what your friends need prayer for, and let them know you prayed." },
  { href: '/pages/groups', icon: 'account-multiple-outline', label: 'Groups', body: 'Prayer requests shared with your circles and communities.' },
  { href: '/pages/you', icon: 'account-circle', label: 'You', body: 'Share what you need prayer for, and see your own requests.' },
] as const;

export default function Home() {
  const router = useRouter();
  const { colors, spacing, radius, typography, cardShadow } = useTheme();
  const styles = useMemo(() => makeStyles(colors, spacing, radius, cardShadow), [colors, spacing, radius, cardShadow]);
  const user = useAppStore((s) => s.user);
  const showStreak = useAppStore((s) => s.preferences.showStreak);
  const verse = useMemo(() => getVerseOfTheDay(todayKey()), []);

  if (!user) return <Redirect href="/welcome" />;

  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <View style={styles.header}>
        <View>
          <Text style={typography.title}>Welcome back, {user.displayName}</Text>
          <Text style={typography.caption}>Pray for each other. Grow in faith, together.</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          {showStreak && <StreakPill count={user.streak.count} />}
          <SeedsPill seeds={user.seeds} />
        </View>
      </View>

      <View style={styles.verseCard}>
        <Text style={styles.verseText}>“{verse.text}”</Text>
        <Text style={styles.verseRef}>
          {verse.reference} · {verse.version}
        </Text>
      </View>

      <View style={styles.tileGrid}>
        {TILES.map((t) => (
          <Pressable key={t.href} onPress={() => router.push(t.href as any)} style={styles.tile}>
            <MaterialCommunityIcons name={t.icon as any} size={32} color={colors.primary} />
            <Text style={styles.tileLabel}>{t.label}</Text>
            <Text style={styles.tileBody}>{t.body}</Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

function makeStyles(colors: ThemeColors, spacing: Spacing, radius: Radius, cardShadow: object) {
  return StyleSheet.create({
    wrap: { padding: spacing.xl, gap: spacing.xl, maxWidth: 920, width: '100%', alignSelf: 'center' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: spacing.md },
    verseCard: {
      padding: spacing.lg,
      backgroundColor: colors.primary,
      borderRadius: radius.lg,
      gap: spacing.xs,
    },
    verseText: { color: colors.primaryText, fontSize: 16, fontStyle: 'italic', lineHeight: 24 },
    verseRef: { color: colors.primaryText, opacity: 0.8, fontSize: 13, fontWeight: '600' },
    tileGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.lg },
    tile: {
      width: 400,
      flexGrow: 1,
      padding: spacing.lg,
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      gap: spacing.xs,
      ...cardShadow,
    },
    tileLabel: { fontSize: 18, fontWeight: '700', color: colors.text, marginTop: spacing.xs },
    tileBody: { fontSize: 14, color: colors.textMuted, lineHeight: 20 },
  });
}
