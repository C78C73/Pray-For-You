import React, { useState } from 'react';
import { View, Text, Switch, StyleSheet, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';

import { useAppStore } from '../src/store/useAppStore';
import { PrimaryButton } from '../src/components/PrimaryButton';
import {
  requestNotificationPermission,
  scheduleDailyReminder,
  cancelDailyReminder,
  isPushSupported,
} from '../src/services/notificationService';
import { colors, radius, spacing, typography } from '../src/theme/theme';

export default function Settings() {
  const router = useRouter();
  const signOut = useAppStore((s) => s.signOut);
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
    <View style={styles.wrap}>
      <Text style={typography.heading}>Reminders</Text>
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

      <View style={{ marginTop: spacing.xl }}>
        <PrimaryButton label="Sign out" variant="secondary" onPress={handleSignOut} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.background, padding: spacing.lg, gap: spacing.sm },
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
  },
});
