import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet, Alert } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useAppStore } from '../../../src/store/useAppStore';
import { Symbol } from '../../../src/components/Symbol';
import { PrimaryButton } from '../../../src/components/PrimaryButton';
import { PrayerVisibility } from '../../../src/types';
import { useTheme } from '../../../src/theme/ThemeContext';
import { ThemeColors, Spacing, Radius } from '../../../src/theme/theme';

const MAX_LEN = 280;

export default function YouPage() {
  const router = useRouter();
  const { colors, spacing, radius, typography, cardShadow } = useTheme();
  const styles = useMemo(() => makeStyles(colors, spacing, radius, cardShadow), [colors, spacing, radius, cardShadow]);
  const user = useAppStore((s) => s.user);
  const prayers = useAppStore((s) => s.prayers);
  const addPrayerRequest = useAppStore((s) => s.addPrayerRequest);
  const showStreak = useAppStore((s) => s.preferences.showStreak);
  const [text, setText] = useState('');
  const [visibility, setVisibility] = useState<PrayerVisibility>('friends');

  if (!user) return <Redirect href="/welcome" />;

  const mine = prayers.filter((p) => p.authorId === user.id).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  function submit() {
    if (!text.trim()) return;
    addPrayerRequest(text, visibility);
    setText('');
  }

  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <View style={styles.profileRow}>
        <Pressable onPress={() => router.push('/edit-symbol')}>
          <Symbol symbolId={user.symbolId} frameId={user.frameId} photoUri={user.photoUri} size={72} />
        </Pressable>
        <View>
          <Text style={typography.title}>{user.displayName}</Text>
          <Text style={typography.caption}>Tap your symbol to customize it.</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        {showStreak && <Stat icon="fire" label="Day streak" value={user.streak.count} info="Days in a row you've prayed or read Scripture. Missing a day only breaks it if you're out of grace days (Settings → Streak)." />}
        {showStreak && <Stat icon="trophy-outline" label="Best streak" value={user.streak.longestCount} info="The longest streak you've ever had — never goes down." />}
        <Stat icon="sprout" label="Seeds" value={user.seeds} info="Faithstreak's only currency — earned by praying, reading Scripture, adding friends, and creating groups. Never bought. Spend it on symbols and frames." />
      </View>

      <View style={styles.card}>
        <Text style={typography.heading}>What do you need prayer for?</Text>
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
      </View>

      <Text style={typography.heading}>Your requests</Text>
      <View style={styles.list}>
        {mine.length === 0 && <Text style={typography.caption}>Nothing shared yet.</Text>}
        {mine.map((p) => (
          <View key={p.id} style={styles.requestCard}>
            <Text style={typography.body}>{p.text}</Text>
            <Text style={typography.caption}>
              {p.prayedByIds.length} {p.prayedByIds.length === 1 ? 'person' : 'people'} prayed ·{' '}
              {p.visibility === 'global' ? 'Community' : p.visibility === 'group' ? 'Group' : 'Friends'}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function Stat({ icon, label, value, info }: { icon: string; label: string; value: number; info: string }) {
  const { colors, typography } = useTheme();
  return (
    <Pressable style={{ alignItems: 'center', gap: 2, flex: 1 }} onPress={() => Alert.alert(label, info)}>
      <MaterialCommunityIcons name={icon as any} size={24} color={colors.primary} />
      <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text }}>{value}</Text>
      <Text style={typography.caption}>{label}</Text>
    </Pressable>
  );
}

function makeStyles(colors: ThemeColors, spacing: Spacing, radius: Radius, cardShadow: object) {
  return StyleSheet.create({
    wrap: { padding: spacing.xl, gap: spacing.lg, maxWidth: 760, width: '100%', alignSelf: 'center' },
    profileRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
    statsRow: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: spacing.lg,
      ...cardShadow,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.lg,
      gap: spacing.sm,
      ...cardShadow,
    },
    textArea: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      padding: spacing.md,
      fontSize: 15,
      minHeight: 100,
      textAlignVertical: 'top',
      color: colors.text,
    },
    segment: {
      flexDirection: 'row',
      backgroundColor: colors.border,
      borderRadius: radius.pill,
      padding: 3,
    },
    segmentBtn: { flex: 1, paddingVertical: spacing.sm, borderRadius: radius.pill, alignItems: 'center' },
    segmentActive: { backgroundColor: colors.surface },
    segmentLabel: { fontSize: 13, fontWeight: '600', color: colors.textMuted },
    segmentLabelActive: { color: colors.text },
    list: { gap: spacing.sm },
    requestCard: {
      backgroundColor: colors.surface,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.md,
      gap: 4,
      ...cardShadow,
    },
  });
}
