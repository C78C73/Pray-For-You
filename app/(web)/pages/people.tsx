import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet, Alert, Share } from 'react-native';
import { Redirect } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useAppStore } from '../../../src/store/useAppStore';
import { Symbol } from '../../../src/components/Symbol';
import { PrimaryButton } from '../../../src/components/PrimaryButton';
import { EmptyState } from '../../../src/components/EmptyState';
import { useTheme } from '../../../src/theme/ThemeContext';
import { ThemeColors, Spacing, Radius } from '../../../src/theme/theme';

export default function PeoplePage() {
  const { colors, spacing, radius, typography, cardShadow } = useTheme();
  const styles = useMemo(() => makeStyles(colors, spacing, radius, cardShadow), [colors, spacing, radius, cardShadow]);
  const user = useAppStore((s) => s.user);
  const friends = useAppStore((s) => s.friends);
  const prayers = useAppStore((s) => s.prayers);
  const addFriendByCode = useAppStore((s) => s.addFriendByCode);
  const prayForFriend = useAppStore((s) => s.prayForFriend);
  const [code, setCode] = useState('');

  if (!user) return <Redirect href="/welcome" />;

  function handleAdd() {
    const result = addFriendByCode(code);
    Alert.alert(result.ok ? 'Added' : 'Not added', result.message);
    if (result.ok) setCode('');
  }

  const rows = friends.map((f) => {
    const request = prayers
      .filter((p) => p.authorId === f.id && !p.answered)
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))[0];
    return { friend: f, request };
  });

  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <View style={styles.header}>
        <View>
          <Text style={typography.title}>People</Text>
          <Text style={typography.caption}>What your friends need prayer for.</Text>
        </View>
        <Pressable
          onPress={() => Share.share({ message: `Add me on Faithstreak — my friend code is ${user.friendCode}` })}
          style={styles.codeChip}
        >
          <MaterialCommunityIcons name="share-variant" size={14} color={colors.primary} />
          <Text style={styles.codeChipLabel}>{user.friendCode}</Text>
        </Pressable>
      </View>

      <View style={styles.addRow}>
        <TextInput
          value={code}
          onChangeText={setCode}
          placeholder="Add a friend by code"
          placeholderTextColor={colors.textMuted}
          autoCapitalize="characters"
          style={styles.input}
        />
        <PrimaryButton label="Add" onPress={handleAdd} disabled={!code.trim()} />
      </View>

      <View style={styles.list}>
        {rows.length === 0 && (
          <EmptyState icon="account-group" title="No friends yet" body="Share your code or add someone else's above." />
        )}
        {rows.map(({ friend, request }) => {
          const alreadyPrayed = !!request && request.prayedByIds.includes(user.id);
          return (
            <View key={friend.id} style={styles.friendCard}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                <Symbol symbolId={friend.symbolId} frameId={friend.frameId} size={44} />
                <View style={{ flex: 1 }}>
                  <Text style={[typography.body, { fontWeight: '600' }]}>{friend.displayName}</Text>
                  <Text style={typography.caption}>{request ? request.text : 'No current request shared'}</Text>
                </View>
              </View>
              <Pressable
                onPress={() => prayForFriend(friend.id)}
                disabled={alreadyPrayed}
                style={[styles.prayButton, alreadyPrayed && styles.prayButtonDone]}
              >
                <MaterialCommunityIcons
                  name="hands-pray"
                  size={16}
                  color={alreadyPrayed ? colors.success : colors.primary}
                />
                <Text style={[styles.prayLabel, alreadyPrayed && { color: colors.success }]}>
                  {alreadyPrayed ? 'Prayed for them' : 'I prayed for you'}
                </Text>
              </Pressable>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

function makeStyles(colors: ThemeColors, spacing: Spacing, radius: Radius, cardShadow: object) {
  return StyleSheet.create({
    wrap: { padding: spacing.xl, gap: spacing.lg, maxWidth: 760, width: '100%', alignSelf: 'center' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    codeChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.pill,
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.sm,
    },
    codeChipLabel: { fontSize: 13, fontWeight: '700', color: colors.primary, letterSpacing: 1 },
    addRow: { flexDirection: 'row', gap: spacing.sm },
    input: {
      flex: 1,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      fontSize: 15,
      color: colors.text,
    },
    list: { gap: spacing.md },
    friendCard: {
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.lg,
      gap: spacing.md,
      ...cardShadow,
    },
    prayButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      alignSelf: 'flex-start',
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: radius.pill,
      backgroundColor: colors.primarySoft,
    },
    prayButtonDone: { backgroundColor: colors.successSoft },
    prayLabel: { fontSize: 13, fontWeight: '700', color: colors.primary },
  });
}
