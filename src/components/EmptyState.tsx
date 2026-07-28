import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../theme/theme';

export function EmptyState({ icon, title, body }: { icon: string; title: string; body: string }) {
  return (
    <View style={styles.wrap}>
      <MaterialCommunityIcons name={icon as any} size={40} color={colors.textMuted} />
      <Text style={[typography.heading, { marginTop: spacing.sm }]}>{title}</Text>
      <Text style={[typography.caption, { textAlign: 'center', marginTop: 4 }]}>{body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 1.5,
    paddingHorizontal: spacing.lg,
  },
});
