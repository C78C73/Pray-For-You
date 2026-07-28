import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useAppStore } from '../../src/store/useAppStore';
import { Symbol } from '../../src/components/Symbol';
import { colors, radius, spacing, typography } from '../../src/theme/theme';

export default function ProfileScreen() {
  const router = useRouter();
  const user = useAppStore((s) => s.user)!;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={typography.title}>Profile</Text>
        <Pressable onPress={() => router.push('/settings')}>
          <MaterialCommunityIcons name="cog-outline" size={24} color={colors.text} />
        </Pressable>
      </View>

      <View style={styles.card}>
        <Pressable onPress={() => router.push('/edit-symbol')}>
          <Symbol symbolId={user.symbolId} frameId={user.frameId} photoUri={user.photoUri} size={88} />
          <View style={styles.editBadge}>
            <MaterialCommunityIcons name="pencil" size={14} color={colors.white} />
          </View>
        </Pressable>
        <Text style={[typography.heading, { marginTop: spacing.sm }]}>{user.displayName}</Text>
        {user.email && <Text style={typography.caption}>{user.email}</Text>}
      </View>

      <View style={styles.statsRow}>
        <Stat icon="fire" label="Day streak" value={user.streak.count} />
        <Stat icon="trophy-outline" label="Best streak" value={user.streak.longestCount} />
        <Stat icon="sprout" label="Seeds" value={user.seeds} />
      </View>

      {user.streak.graceDaysAvailable > 0 && (
        <View style={styles.graceNote}>
          <MaterialCommunityIcons name="weather-sunny" size={16} color={colors.accent} />
          <Text style={typography.caption}>
            {' '}
            You have {user.streak.graceDaysAvailable} grace day
            {user.streak.graceDaysAvailable > 1 ? 's' : ''} banked — mercy covers a missed day.
          </Text>
        </View>
      )}

      <Pressable style={styles.linkRow} onPress={() => router.push('/edit-symbol')}>
        <MaterialCommunityIcons name="shimmer" size={20} color={colors.primary} />
        <Text style={styles.linkLabel}>Customize symbol & frame</Text>
        <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textMuted} />
      </Pressable>
      <Pressable style={styles.linkRow} onPress={() => router.push('/settings')}>
        <MaterialCommunityIcons name="bell-outline" size={20} color={colors.primary} />
        <Text style={styles.linkLabel}>Prayer & reading reminders</Text>
        <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textMuted} />
      </Pressable>
    </SafeAreaView>
  );
}

function Stat({ icon, label, value }: { icon: string; label: string; value: number }) {
  return (
    <View style={styles.stat}>
      <MaterialCommunityIcons name={icon as any} size={22} color={colors.primary} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={typography.caption}>{label}</Text>
    </View>
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
  card: { alignItems: 'center', paddingVertical: spacing.lg },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.background,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
  },
  stat: { alignItems: 'center', gap: 2 },
  statValue: { fontSize: 18, fontWeight: '700', color: colors.text },
  graceNote: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    padding: spacing.sm,
    backgroundColor: '#FBF3E1',
    borderRadius: radius.md,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  linkLabel: { flex: 1, fontSize: 15, color: colors.text, fontWeight: '500' },
});
