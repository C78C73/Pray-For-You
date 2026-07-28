import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppStore } from '../../src/store/useAppStore';
import { BIBLE_VERSIONS, BibleVersionId, SUGGESTED_PASSAGES, fetchPassage } from '../../src/services/bibleService';
import { BibleVerse } from '../../src/types';
import { todayKey } from '../../src/utils/date';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { useTheme } from '../../src/theme/ThemeContext';
import { ThemeColors, Spacing, Radius } from '../../src/theme/theme';

export default function BibleScreen() {
  const { colors, spacing, radius, typography } = useTheme();
  const styles = useMemo(() => makeStyles(colors, spacing, radius), [colors, spacing, radius]);
  const user = useAppStore((s) => s.user)!;
  const recordBibleReadToday = useAppStore((s) => s.recordBibleReadToday);

  const [passage, setPassage] = useState(SUGGESTED_PASSAGES[0]);
  const [version, setVersion] = useState<BibleVersionId>('web');
  const [verses, setVerses] = useState<BibleVerse[]>([]);
  const [loading, setLoading] = useState(false);

  const readToday = user.streak.lastActiveDate === todayKey();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchPassage(passage, version).then((v) => {
      if (!cancelled) {
        setVerses(v);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [passage, version]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={typography.title}>Bible</Text>
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
            style={[styles.versionChip, version === v.id && styles.chipActive]}
          >
            <Text style={[styles.chipLabel, version === v.id && styles.chipLabelActive]}>{v.id.toUpperCase()}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.passage}>
        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />
        ) : (
          verses.map((v) => (
            <Text key={v.reference} style={styles.verseLine}>
              <Text style={styles.verseNum}>{v.reference.split(':').pop()} </Text>
              {v.text}
            </Text>
          ))
        )}
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton
          label={readToday ? "Today's reading logged ✓" : 'Mark today’s reading complete'}
          onPress={recordBibleReadToday}
          disabled={readToday}
        />
      </View>
    </SafeAreaView>
  );
}

function makeStyles(colors: ThemeColors, spacing: Spacing, radius: Radius) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    header: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
    chipsRow: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, gap: spacing.sm },
    chip: {
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: radius.pill,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    versionChip: {
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.sm,
      borderRadius: radius.pill,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    chipLabel: { fontSize: 13, fontWeight: '600', color: colors.text },
    chipLabelActive: { color: colors.primaryText },
    passage: { padding: spacing.lg, paddingTop: spacing.sm, gap: spacing.sm },
    verseLine: { fontSize: 15, lineHeight: 24, color: colors.text },
    verseNum: { fontWeight: '700', color: colors.primary },
    footer: { padding: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border },
  });
}
