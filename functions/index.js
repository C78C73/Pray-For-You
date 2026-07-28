/**
 * Reference implementation for real cross-device "someone prayed for you"
 * push notifications. Not wired up yet — the app currently runs on local
 * device storage only (see src/services/storage.ts). To go live:
 *
 *   1. Create a Firebase project, enable Firestore + Cloud Messaging.
 *   2. `firebase init functions` in this folder, `firebase deploy --only functions`.
 *   3. Replace src/services/storage.ts reads/writes with Firestore calls,
 *      mirroring the "prayers/{prayerId}" and "users/{uid}" shapes below.
 *   4. Store each user's Expo/FCM push token on their user doc at sign-in.
 *
 * This function watches a prayer request document; when a new id is
 * appended to `prayedByIds`, it pushes a notification to the request's
 * author (unless they prayed for their own request).
 */
const { onDocumentUpdated } = require('firebase-functions/v2/firestore');
const admin = require('firebase-admin');

admin.initializeApp();

exports.notifyOnPrayer = onDocumentUpdated('prayers/{prayerId}', async (event) => {
  const before = event.data.before.data();
  const after = event.data.after.data();

  const newPrayerIds = (after.prayedByIds || []).filter(
    (id) => !(before.prayedByIds || []).includes(id)
  );
  if (newPrayerIds.length === 0 || after.authorId === newPrayerIds[0]) return;

  const prayingUserSnap = await admin.firestore().doc(`users/${newPrayerIds[0]}`).get();
  const authorSnap = await admin.firestore().doc(`users/${after.authorId}`).get();
  const pushToken = authorSnap.data()?.pushToken;
  if (!pushToken) return;

  await admin.messaging().send({
    token: pushToken,
    notification: {
      title: 'You were prayed for 🙏',
      body: `${prayingUserSnap.data()?.displayName ?? 'A friend'} just prayed for you.`,
    },
  });
});
