import React, { useMemo } from 'react';
import { Pressable, Text, StyleSheet, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { ThemeColors, Spacing, Radius } from '../theme/theme';

export function SeedsPill({ seeds }: { seeds: number }) {
  const { colors, spacing, radius } = useTheme();
  const styles = useMemo(() => makeStyles(colors, spacing, radius), [colors, spacing, radius]);
  return (
    <Pressable
      style={styles.pill}
      onPress={() =>
        Alert.alert(
          'Seeds 🌱',
          'Faithstreak\'s only currency — earned by praying for others, reading Scripture, adding friends, and creating groups. Never bought with real money. Spend them in Profile → Customize on profile symbols and frames.'
        )
      }
    >
      <MaterialCommunityIcons name="sprout" size={16} color={colors.success} />
      <Text style={styles.text}>{seeds}</Text>
    </Pressable>
  );
}

export function StreakPill({ count }: { count: number }) {
  const { colors, spacing, radius } = useTheme();
  const styles = useMemo(() => makeStyles(colors, spacing, radius), [colors, spacing, radius]);
  return (
    <Pressable
      style={styles.pill}
      onPress={() =>
        Alert.alert(
          'Streak 🔥',
          "Days in a row you've prayed or read Scripture. Missing a day only breaks it if you're out of \"grace days\" — see Settings → Streak. You can hide this counter from view there too; it keeps counting either way."
        )
      }
    >
      <MaterialCommunityIcons name="fire" size={16} color={colors.accent} />
      <Text style={styles.text}>{count}</Text>
    </Pressable>
  );
}

function makeStyles(colors: ThemeColors, spacing: Spacing, radius: Radius) {
  return StyleSheet.create({
    pill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.pill,
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.sm,
    },
    text: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.text,
    },
  });
}
