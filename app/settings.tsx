import React, { useMemo, useState } from 'react';
import { View, Text, Switch, Pressable, ScrollView, StyleSheet, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useAppStore } from '../src/store/useAppStore';
import { PrimaryButton } from '../src/components/PrimaryButton';
import {
  requestNotificationPermission,
  scheduleDailyReminder,
  cancelDailyReminder,
  isPushSupported,
} from '../src/services/notificationService';
import { useTheme } from '../src/theme/ThemeContext';
import { ACCENTS, ThemeColors, ThemeMode, Spacing, Radius } from '../src/theme/theme';

const MODES: { id: ThemeMode; label: string; icon: string }[] = [
  { id: 'light', label: 'Light', icon: 'white-balance-sunny' },
  { id: 'dark', label: 'Dark', icon: 'moon-waning-crescent' },
  { id: 'system', label: 'System', icon: 'theme-light-dark' },
];

export default function Settings() {
  const router = useRouter();
  const { colors, spacing, radius, typography, cardShadow } = useTheme();
  const styles = useMemo(() => makeStyles(colors, spacing, radius, cardShadow), [colors, spacing, radius, cardShadow]);

  const signOut = useAppStore((s) => s.signOut);
  const preferences = useAppStore((s) => s.preferences);
  const setThemeMode = useAppStore((s) => s.setThemeMode);
  const setAccentId = useAppStore((s) => s.setAccentId);
  const setShowStreak = useAppStore((s) => s.setShowStreak);

  const [prayReminder, setPrayReminder] = useState(false);
  const [readReminder, setReadReminder] = useState(false);

  async function togglePray(value: boolean) {
    if (value) {
      const granted = await requestNotificationPermission();
      if (!granted) {
        Alert.alert('Notifications off', 'Enable notifications in system settings to get reminders.');
        return;
      }
      await scheduleDailyReminder('pray', 8, 0);
    } else {
      await cancelDailyReminder('pray');
    }
    setPrayReminder(value);
  }

  async function toggleRead(value: boolean) {
    if (value) {
      const granted = await requestNotificationPermission();
      if (!granted) {
        Alert.alert('Notifications off', 'Enable notifications in system settings to get reminders.');
        return;
      }
      await scheduleDailyReminder('read', 19, 0);
    } else {
      await cancelDailyReminder('read');
    }
    setReadReminder(value);
  }

  function handleSignOut() {
    Alert.alert('Sign out?', 'On this device, guest data is stored locally and will be cleared.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: () => {
          signOut();
          router.replace('/welcome');
        },
      },
    ]);
  }

  return (
    <ScrollView style={styles.safe} contentContainerStyle={styles.wrap}>
      <Text style={typography.heading}>Appearance</Text>
      <View style={styles.card}>
        <Text style={[typography.caption, { marginBottom: spacing.xs }]}>Theme</Text>
        <View style={styles.segment}>
          {MODES.map((m) => (
            <Pressable
              key={m.id}
              onPress={() => setThemeMode(m.id)}
              style={[styles.segmentBtn, preferences.themeMode === m.id && styles.segmentActive]}
            >
              <MaterialCommunityIcons
                name={m.icon as any}
                size={16}
                color={preferences.themeMode === m.id ? colors.text : colors.textMuted}
              />
              <Text
                style={[styles.segmentLabel, preferences.themeMode === m.id && styles.segmentLabelActive]}
              >
                {m.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={[typography.caption, { marginTop: spacing.md, marginBottom: spacing.xs }]}>Accent color</Text>
        <View style={styles.swatchRow}>
          {ACCENTS.map((a) => (
            <Pressable key={a.id} onPress={() => setAccentId(a.id)} style={styles.swatchWrap}>
              <View
                style={[
                  styles.swatch,
                  { backgroundColor: a[preferences.themeMode === 'dark' ? 'dark' : 'light'] },
                  preferences.accentId === a.id && styles.swatchActive,
                ]}
              >
                {preferences.accentId === a.id && (
                  <MaterialCommunityIcons name="check" size={16} color={colors.white} />
                )}
              </View>
              <Text style={styles.swatchLabel}>{a.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <Text style={[typography.heading, { marginTop: spacing.lg }]}>Streak</Text>
      <View style={styles.card}>
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={typography.body}>Show streak counter</Text>
            <Text style={typography.caption}>
              Turning this off just hides it — your streak keeps counting in the background.
            </Text>
          </View>
          <Switch value={preferences.showStreak} onValueChange={setShowStreak} />
        </View>
      </View>

      <Text style={[typography.heading, { marginTop: spacing.lg }]}>Reminders</Text>
      <Text style={typography.caption}>At most two a day — this app shouldn't compete for your attention.</Text>

      <View style={styles.row}>
        <Text style={typography.body}>Daily prayer reminder (8:00 AM)</Text>
        <Switch
          value={prayReminder}
          onValueChange={togglePray}
          disabled={!isPushSupported() && Platform.OS === 'web'}
        />
      </View>
      <View style={styles.row}>
        <Text style={typography.body}>Bible reading reminder (7:00 PM)</Text>
        <Switch
          value={readReminder}
          onValueChange={toggleRead}
          disabled={!isPushSupported() && Platform.OS === 'web'}
        />
      </View>
      {!isPushSupported() && Platform.OS === 'web' && (
        <Text style={typography.caption}>Reminders are available in the Android app.</Text>
      )}

      <View style={{ marginTop: spacing.xl, marginBottom: spacing.xl }}>
        <PrimaryButton label="Sign out" variant="secondary" onPress={handleSignOut} />
      </View>
    </ScrollView>
  );
}

function makeStyles(colors: ThemeColors, spacing: Spacing, radius: Radius, cardShadow: object) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    wrap: { padding: spacing.lg, paddingBottom: spacing.xl * 2, gap: spacing.sm },
    card: {
      backgroundColor: colors.surface,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.md,
      marginTop: spacing.sm,
      ...cardShadow,
    },
    segment: {
      flexDirection: 'row',
      backgroundColor: colors.border,
      borderRadius: radius.pill,
      padding: 3,
    },
    segmentBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
      paddingVertical: spacing.sm,
      borderRadius: radius.pill,
    },
    segmentActive: { backgroundColor: colors.surface },
    segmentLabel: { fontSize: 13, fontWeight: '600', color: colors.textMuted },
    segmentLabelActive: { color: colors.text },
    swatchRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
    swatchWrap: { alignItems: 'center', gap: 4, width: 64 },
    swatch: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: 'transparent',
    },
    swatchActive: { borderColor: colors.text },
    swatchLabel: { fontSize: 10, color: colors.textMuted, textAlign: 'center' },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.md,
      marginTop: spacing.sm,
      gap: spacing.sm,
      ...cardShadow,
    },
  });
}
