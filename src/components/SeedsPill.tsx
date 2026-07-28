import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { ThemeColors, Spacing, Radius } from '../theme/theme';

export function SeedsPill({ seeds }: { seeds: number }) {
  const { colors, spacing, radius } = useTheme();
  const styles = useMemo(() => makeStyles(colors, spacing, radius), [colors, spacing, radius]);
  return (
    <View style={styles.pill}>
      <MaterialCommunityIcons name="sprout" size={16} color={colors.success} />
      <Text style={styles.text}>{seeds}</Text>
    </View>
  );
}

export function StreakPill({ count }: { count: number }) {
  const { colors, spacing, radius } = useTheme();
  const styles = useMemo(() => makeStyles(colors, spacing, radius), [colors, spacing, radius]);
  return (
    <View style={styles.pill}>
      <MaterialCommunityIcons name="fire" size={16} color={colors.accent} />
      <Text style={styles.text}>{count}</Text>
    </View>
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
