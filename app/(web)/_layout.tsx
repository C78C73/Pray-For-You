import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Stack, useRouter, usePathname } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useAppStore } from '../../src/store/useAppStore';
import { Symbol } from '../../src/components/Symbol';
import { useTheme } from '../../src/theme/ThemeContext';
import { ThemeColors, Spacing, Radius } from '../../src/theme/theme';

const NAV_ITEMS = [
  { href: '/pages/home', icon: 'home-variant-outline', label: 'Home' },
  { href: '/pages/bible', icon: 'book-cross', label: 'Bible' },
  { href: '/pages/people', icon: 'account-group', label: 'People' },
  { href: '/pages/groups', icon: 'account-multiple-outline', label: 'Groups' },
  { href: '/pages/you', icon: 'account-circle', label: 'You' },
] as const;

export default function WebLayout() {
  const { colors, spacing, radius } = useTheme();
  const styles = React.useMemo(() => makeStyles(colors, spacing, radius), [colors, spacing, radius]);
  const router = useRouter();
  const pathname = usePathname();
  const user = useAppStore((s) => s.user);

  return (
    <View style={styles.page}>
      <View style={styles.sidebar}>
        <MaterialCommunityIcons name="cross" size={26} color={colors.primary} style={{ marginBottom: spacing.lg }} />

        <View style={{ gap: spacing.sm }}>
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Pressable
                key={item.href}
                onPress={() => router.push(item.href as any)}
                style={[styles.navBtn, active && styles.navBtnActive]}
              >
                <MaterialCommunityIcons
                  name={item.icon as any}
                  size={22}
                  color={active ? colors.primary : colors.textMuted}
                />
                <Text style={[styles.navLabel, active && styles.navLabelActive]}>{item.label}</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={{ flex: 1 }} />

        <Pressable onPress={() => router.push('/settings')} style={styles.iconBtn}>
          <MaterialCommunityIcons name="cog-outline" size={22} color={colors.textMuted} />
        </Pressable>
        {user && (
          <Pressable onPress={() => router.push('/edit-symbol')} style={{ marginTop: spacing.sm }}>
            <Symbol symbolId={user.symbolId} frameId={user.frameId} photoUri={user.photoUri} size={36} />
          </Pressable>
        )}
      </View>

      <View style={styles.content}>
        <Stack screenOptions={{ headerShown: false }} />
      </View>
    </View>
  );
}

function makeStyles(colors: ThemeColors, spacing: Spacing, radius: Radius) {
  return StyleSheet.create({
    page: { flex: 1, flexDirection: 'row', backgroundColor: colors.background },
    sidebar: {
      width: 88,
      paddingVertical: spacing.lg,
      paddingHorizontal: spacing.sm,
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRightWidth: 1,
      borderRightColor: colors.border,
    },
    navBtn: {
      width: 64,
      paddingVertical: spacing.sm,
      borderRadius: radius.md,
      alignItems: 'center',
      gap: 2,
    },
    navBtnActive: { backgroundColor: colors.primarySoft },
    navLabel: { fontSize: 10, fontWeight: '600', color: colors.textMuted },
    navLabelActive: { color: colors.primary },
    iconBtn: { padding: spacing.sm },
    content: { flex: 1 },
  });
}
