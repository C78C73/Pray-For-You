import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermission(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

/**
 * Local reminder to pray / read Scripture. Two per day max by design —
 * this app should not compete for attention like a game would.
 */
export async function scheduleDailyReminder(
  id: 'pray' | 'read',
  hour: number,
  minute: number
) {
  await Notifications.cancelScheduledNotificationAsync(id);
  const content =
    id === 'pray'
      ? { title: 'A moment to pray 🙏', body: 'Someone in your circle could use it today.' }
      : { title: 'Time in the Word 📖', body: 'Take a few minutes to read Scripture today.' };

  await Notifications.scheduleNotificationAsync({
    identifier: id,
    content,
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
}

export async function cancelDailyReminder(id: 'pray' | 'read') {
  await Notifications.cancelScheduledNotificationAsync(id);
}

/**
 * "So-and-so prayed for you" — in production this is sent from a Cloud
 * Function (see /functions) via Expo/FCM push when a friend taps "I prayed
 * for this". Locally (no backend wired up yet) we fire it immediately on
 * this device so the flow is fully demoable offline.
 */
export async function notifyPrayedForYou(prayingFriendName: string) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'You were prayed for 🙏',
      body: `${prayingFriendName} just prayed for you.`,
    },
    trigger: null,
  });
}

export function isPushSupported() {
  return Platform.OS !== 'web';
}
