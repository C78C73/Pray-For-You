import React, { useState } from 'react';
import { View, Text, FlatList, TextInput, Pressable, StyleSheet, Alert, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useAppStore } from '../../src/store/useAppStore';
import { Symbol } from '../../src/components/Symbol';
import { EmptyState } from '../../src/components/EmptyState';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { colors, radius, spacing, typography } from '../../src/theme/theme';

export default function FriendsScreen() {
  const user = useAppStore((s) => s.user)!;
  const friends = useAppStore((s) => s.friends);
  const addFriendByCode = useAppStore((s) => s.addFriendByCode);
  const removeFriend = useAppStore((s) => s.removeFriend);
  const [code, setCode] = useState('');

  function handleAdd() {
    const result = addFriendByCode(code);
    Alert.alert(result.ok ? 'Added' : 'Not added', result.message);
    if (result.ok) setCode('');
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={typography.title}>Friends</Text>
      </View>

      <View style={styles.codeCard}>
        <Text style={typography.caption}>Your friend code</Text>
        <View style={styles.codeRow}>
          <Text style={styles.code}>{user.friendCode}</Text>
          <Pressable
            onPress={() =>
              Share.share({ message: `Add me on Faithstreak — my friend code is ${user.friendCode}` })
            }
            style={styles.shareBtn}
          >
            <MaterialCommunityIcons name="share-variant" size={18} color={colors.primary} />
          </Pressable>
        </View>
      </View>

      <View style={styles.addRow}>
        <TextInput
          value={code}
          onChangeText={setCode}
          placeholder="Enter a friend code"
          placeholderTextColor={colors.textMuted}
          autoCapitalize="characters"
          style={styles.input}
        />
        <PrimaryButton label="Add" onPress={handleAdd} disabled={!code.trim()} />
      </View>

      <FlatList
        data={friends}
        keyExtractor={(f) => f.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.friendRow}>
            <Symbol symbolId={item.symbolId} frameId={item.frameId} size={40} />
            <Text style={[typography.body, { flex: 1 }]}>{item.displayName}</Text>
            <Pressable onPress={() => removeFriend(item.id)}>
              <MaterialCommunityIcons name="close" size={20} color={colors.textMuted} />
            </Pressable>
          </View>
        )}
        ListEmptyComponent={
          <EmptyState
            icon="account-group"
            title="No friends yet"
            body="Share your friend code or add someone else's above."
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  codeCard: {
    margin: spacing.lg,
    marginBottom: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  codeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  code: { fontSize: 22, fontWeight: '800', letterSpacing: 2, color: colors.primary },
  shareBtn: { padding: spacing.sm },
  addRow: { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.lg, alignItems: 'center' },
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
  list: { padding: spacing.lg, paddingBottom: 100 },
  friendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
});
