import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { Spacing } from '../theme/theme';

export function EmptyState({ icon, title, body }: { icon: string; title: string; body: string }) {
  const { colors, spacing, typography } = useTheme();
  const styles = useMemo(() => makeStyles(spacing), [spacing]);
  return (
    <View style={styles.wrap}>
      <MaterialCommunityIcons name={icon as any} size={40} color={colors.textMuted} />
      <Text style={[typography.heading, { marginTop: spacing.sm }]}>{title}</Text>
      <Text style={[typography.caption, { textAlign: 'center', marginTop: 4 }]}>{body}</Text>
    </View>
  );
}

function makeStyles(spacing: Spacing) {
  return StyleSheet.create({
    wrap: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.xl * 1.5,
      paddingHorizontal: spacing.lg,
    },
  });
}
