import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, ScrollView, Pressable, StyleSheet, Alert, Share } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useAppStore } from '../../src/store/useAppStore';
import { PrayerCard } from '../../src/components/PrayerCard';
import { EmptyState } from '../../src/components/EmptyState';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { useTheme } from '../../src/theme/ThemeContext';
import { ThemeColors, Spacing, Radius } from '../../src/theme/theme';

const MAX_LEN = 280;

export default function GroupDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors, spacing, radius, typography, cardShadow } = useTheme();
  const styles = useMemo(() => makeStyles(colors, spacing, radius, cardShadow), [colors, spacing, radius, cardShadow]);

  const user = useAppStore((s) => s.user)!;
  const group = useAppStore((s) => s.groups.find((g) => g.id === id));
  const prayers = useAppStore((s) => s.prayers.filter((p) => p.groupId === id));
  const markPrayed = useAppStore((s) => s.markPrayed);
  const addGroupPrayerRequest = useAppStore((s) => s.addGroupPrayerRequest);
  const joinGroupOpen = useAppStore((s) => s.joinGroupOpen);
  const requestToJoinGroup = useAppStore((s) => s.requestToJoinGroup);
  const approveJoinRequest = useAppStore((s) => s.approveJoinRequest);
  const denyJoinRequest = useAppStore((s) => s.denyJoinRequest);
  const leaveGroup = useAppStore((s) => s.leaveGroup);

  const [text, setText] = useState('');

  if (!group) {
    return (
      <View style={styles.safe}>
        <Stack.Screen options={{ title: 'Group' }} />
        <EmptyState icon="account-multiple-outline" title="Group not found" body="It may have been removed." />
      </View>
    );
  }

  const isMember = group.memberIds.includes(user.id);
  const isOwner = group.ownerId === user.id;
  const hasRequested = group.pendingRequests.some((r) => r.userId === user.id);

  function submit() {
    if (!text.trim() || !group) return;
    addGroupPrayerRequest(group.id, text);
    setText('');
  }

  function handleRequest() {
    if (!group) return;
    const result = requestToJoinGroup(group.id);
    Alert.alert(result.ok ? 'Request sent' : 'Not sent', result.message);
  }

  function handleLeave() {
    if (!group) return;
    const groupId = group.id;
    Alert.alert('Leave group?', `You'll stop seeing ${group.name}'s prayer requests.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Leave', style: 'destructive', onPress: () => { leaveGroup(groupId); router.back(); } },
    ]);
  }

  return (
    <ScrollView style={styles.safe} contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}>
      <Stack.Screen options={{ title: group.name }} />

      <View style={styles.bioCard}>
        {!!group.bio && <Text style={typography.body}>{group.bio}</Text>}
        <View style={styles.metaRow}>
          <MaterialCommunityIcons
            name={group.visibility === 'open' ? 'earth' : 'lock-outline'}
            size={14}
            color={colors.textMuted}
          />
          <Text style={typography.caption}>
            {group.visibility === 'open' ? 'Open group' : 'Invite only'} · {group.memberIds.length}{' '}
            {group.memberIds.length === 1 ? 'member' : 'members'}
          </Text>
        </View>

        {isMember && (
          <View style={styles.codeRow}>
            <Text style={styles.code}>{group.inviteCode}</Text>
            <Pressable
              onPress={() => Share.share({ message: `Join ${group.name} on Faithstreak — invite code ${group.inviteCode}` })}
              style={styles.shareBtn}
            >
              <MaterialCommunityIcons name="share-variant" size={16} color={colors.primary} />
            </Pressable>
          </View>
        )}
      </View>

      {!isMember ? (
        group.visibility === 'open' ? (
          <PrimaryButton label={`Join ${group.name}`} onPress={() => joinGroupOpen(group.id)} />
        ) : (
          <View style={{ gap: spacing.sm }}>
            <Text style={typography.caption}>
              This group is invite only — the owner needs to approve your request to join.
            </Text>
            <PrimaryButton
              label={hasRequested ? 'Request sent' : 'Request to join'}
              onPress={handleRequest}
              disabled={hasRequested}
              variant={hasRequested ? 'secondary' : 'primary'}
            />
          </View>
        )
      ) : (
        <>
          {isOwner && group.pendingRequests.length > 0 && (
            <View style={{ gap: spacing.sm }}>
              <Text style={typography.heading}>Join requests</Text>
              {group.pendingRequests.map((r) => (
                <View key={r.userId} style={styles.requestRow}>
                  <Text style={[typography.body, { flex: 1 }]}>{r.displayName}</Text>
                  <Pressable onPress={() => denyJoinRequest(group.id, r.userId)} style={styles.denyBtn}>
                    <MaterialCommunityIcons name="close" size={16} color={colors.danger} />
                  </Pressable>
                  <Pressable onPress={() => approveJoinRequest(group.id, r.userId)} style={styles.approveBtn}>
                    <MaterialCommunityIcons name="check" size={16} color={colors.white} />
                  </Pressable>
                </View>
              ))}
            </View>
          )}

          <View>
            <Text style={typography.caption}>Share a prayer need with the group</Text>
            <TextInput
              multiline
              maxLength={MAX_LEN}
              value={text}
              onChangeText={setText}
              placeholder="Everyone in this group will be notified..."
              placeholderTextColor={colors.textMuted}
              style={styles.textArea}
            />
            <PrimaryButton label="Share with group" onPress={submit} disabled={!text.trim()} style={{ marginTop: spacing.sm }} />
          </View>

          <Text style={typography.heading}>Prayer requests</Text>
          {prayers.length === 0 ? (
            <EmptyState icon="hands-pray" title="Nothing shared yet" body="Be the first to ask this group for prayer." />
          ) : (
            prayers
              .slice()
              .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
              .map((p) => <PrayerCard key={p.id} prayer={p} currentUserId={user.id} onPray={markPrayed} />)
          )}

          <PrimaryButton label="Leave group" variant="secondary" onPress={handleLeave} />
        </>
      )}
    </ScrollView>
  );
}

function makeStyles(colors: ThemeColors, spacing: Spacing, radius: Radius, cardShadow: object) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    bioCard: {
      backgroundColor: colors.surface,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.md,
      gap: spacing.xs,
      ...cardShadow,
    },
    metaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
    codeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: spacing.xs,
      paddingTop: spacing.sm,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    code: { fontSize: 18, fontWeight: '800', letterSpacing: 2, color: colors.primary },
    shareBtn: { padding: spacing.xs },
    requestRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      backgroundColor: colors.surface,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.sm,
    },
    denyBtn: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    approveBtn: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: colors.success,
      alignItems: 'center',
      justifyContent: 'center',
    },
    textArea: {
      marginTop: spacing.xs,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      padding: spacing.md,
      fontSize: 15,
      minHeight: 90,
      textAlignVertical: 'top',
      color: colors.text,
    },
  });
}
