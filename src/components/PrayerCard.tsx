import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PrayerRequest } from '../types';
import { Symbol } from './Symbol';
import { useTheme } from '../theme/ThemeContext';
import { ThemeColors, Spacing, Radius } from '../theme/theme';

interface Props {
  prayer: PrayerRequest;
  currentUserId: string;
  onPray: (id: string) => void;
}

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function PrayerCard({ prayer, currentUserId, onPray }: Props) {
  const { colors, spacing, radius, typography, cardShadow } = useTheme();
  const styles = useMemo(() => makeStyles(colors, spacing, radius, cardShadow), [colors, spacing, radius, cardShadow]);
  const alreadyPrayed = prayer.prayedByIds.includes(currentUserId);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Symbol symbolId={prayer.authorSymbolId} frameId={prayer.authorFrameId} size={36} />
        <View style={{ flex: 1 }}>
          <Text style={typography.body}>{prayer.authorName}</Text>
          <Text style={typography.caption}>
            {prayer.visibility === 'global' ? 'Community' : 'Friends'} · {timeAgo(prayer.createdAt)}
          </Text>
        </View>
        {prayer.answered && (
          <View style={styles.answeredTag}>
            <Text style={styles.answeredText}>Answered</Text>
          </View>
        )}
      </View>

      <Text style={[typography.body, styles.text]}>{prayer.text}</Text>

      <View style={styles.footer}>
        <Pressable
          onPress={() => onPray(prayer.id)}
          disabled={alreadyPrayed}
          style={[styles.prayButton, alreadyPrayed && styles.prayButtonDone]}
        >
          <MaterialCommunityIcons
            name="hands-pray"
            size={16}
            color={alreadyPrayed ? colors.success : colors.primary}
          />
          <Text style={[styles.prayLabel, alreadyPrayed && { color: colors.success }]}>
            {alreadyPrayed ? 'Prayed' : 'I prayed for this'}
          </Text>
        </Pressable>
        <Text style={typography.caption}>
          {prayer.prayedByIds.length} {prayer.prayedByIds.length === 1 ? 'person' : 'people'} prayed
        </Text>
      </View>
    </View>
  );
}

function makeStyles(colors: ThemeColors, spacing: Spacing, radius: Radius, cardShadow: object) {
  return StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius: radius.md,
      padding: spacing.md,
      marginBottom: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
      gap: spacing.sm,
      ...cardShadow,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    text: {
      lineHeight: 21,
    },
    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    prayButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: radius.pill,
      backgroundColor: colors.primarySoft,
    },
    prayButtonDone: {
      backgroundColor: colors.successSoft,
    },
    prayLabel: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.primary,
    },
    answeredTag: {
      backgroundColor: colors.successSoft,
      borderRadius: radius.pill,
      paddingVertical: 2,
      paddingHorizontal: spacing.sm,
    },
    answeredText: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.success,
    },
  });
}
