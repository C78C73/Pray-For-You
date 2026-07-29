import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet, Alert } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useAppStore } from '../../../src/store/useAppStore';
import { EmptyState } from '../../../src/components/EmptyState';
import { PrimaryButton } from '../../../src/components/PrimaryButton';
import { Group } from '../../../src/types';
import { useTheme } from '../../../src/theme/ThemeContext';
import { ThemeColors, Spacing, Radius } from '../../../src/theme/theme';

export default function GroupsPage() {
  const router = useRouter();
  const { colors, spacing, radius, typography, cardShadow } = useTheme();
  const styles = useMemo(() => makeStyles(colors, spacing, radius, cardShadow), [colors, spacing, radius, cardShadow]);
  const user = useAppStore((s) => s.user);
  const groups = useAppStore((s) => s.groups);
  const joinGroupOpen = useAppStore((s) => s.joinGroupOpen);
  const requestToJoinGroup = useAppStore((s) => s.requestToJoinGroup);
  const findGroupByCode = useAppStore((s) => s.findGroupByCode);
  const [code, setCode] = useState('');
  const [search, setSearch] = useState('');

  if (!user) return <Redirect href="/welcome" />;
  const userId = user.id;

  const yours = groups.filter((g) => g.memberIds.includes(user.id));
  const others = groups
    .filter((g) => !g.memberIds.includes(user.id))
    .filter((g) => g.name.toLowerCase().includes(search.trim().toLowerCase()));

  function openGroup(id: string) {
    router.push({ pathname: '/group/[id]', params: { id } });
  }

  function handleFindByCode() {
    const result = findGroupByCode(code);
    if (result.ok && result.groupId) {
      setCode('');
      openGroup(result.groupId);
    } else {
      Alert.alert('Not found', result.message);
    }
  }

  function handleRequest(group: Group) {
    const result = requestToJoinGroup(group.id);
    Alert.alert(result.ok ? 'Request sent' : 'Not sent', result.message);
  }

  function renderGroup(group: Group) {
    const requested = group.pendingRequests.some((r) => r.userId === userId);
    return (
      <Pressable key={group.id} style={styles.groupCard} onPress={() => openGroup(group.id)}>
        <View style={{ flex: 1 }}>
          <View style={styles.groupTitleRow}>
            <Text style={[typography.body, { fontWeight: '600' }]}>{group.name}</Text>
            <View style={styles.visibilityTag}>
              <MaterialCommunityIcons
                name={group.visibility === 'open' ? 'earth' : 'lock-outline'}
                size={12}
                color={colors.textMuted}
              />
              <Text style={styles.visibilityLabel}>{group.visibility === 'open' ? 'Open' : 'Invite only'}</Text>
            </View>
          </View>
          {!!group.bio && <Text style={typography.caption}>{group.bio}</Text>}
          <Text style={styles.memberCount}>
            {group.memberIds.length} {group.memberIds.length === 1 ? 'member' : 'members'}
          </Text>
        </View>
        {group.visibility === 'open' ? (
          <Pressable onPress={() => joinGroupOpen(group.id)} style={styles.joinBtn}>
            <Text style={styles.joinBtnLabel}>Join</Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={() => handleRequest(group)}
            disabled={requested}
            style={[styles.joinBtn, requested && styles.joinBtnDone]}
          >
            <Text style={[styles.joinBtnLabel, requested && styles.joinBtnLabelDone]}>
              {requested ? 'Requested' : 'Request'}
            </Text>
          </Pressable>
        )}
      </Pressable>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <View style={styles.header}>
        <View>
          <Text style={typography.title}>Groups</Text>
          <Text style={typography.caption}>Prayer shared with your circles.</Text>
        </View>
        <Pressable onPress={() => router.push('/new-group')} style={styles.createBtn}>
          <MaterialCommunityIcons name="plus" size={16} color={colors.primaryText} />
          <Text style={styles.createBtnLabel}>New group</Text>
        </Pressable>
      </View>

      <View style={styles.addRow}>
        <TextInput
          value={code}
          onChangeText={setCode}
          placeholder="Have an invite code?"
          placeholderTextColor={colors.textMuted}
          autoCapitalize="characters"
          style={styles.input}
        />
        <PrimaryButton label="Go" onPress={handleFindByCode} disabled={!code.trim()} />
      </View>

      <Text style={typography.heading}>Your groups</Text>
      <View style={styles.list}>
        {yours.length === 0 ? (
          <EmptyState icon="account-multiple-outline" title="No groups yet" body="Create one or search below." />
        ) : (
          yours.map((g) => renderGroup(g))
        )}
      </View>

      <Text style={[typography.heading, { marginTop: spacing.md }]}>All groups</Text>
      <TextInput
        value={search}
        onChangeText={setSearch}
        placeholder="Search groups by name"
        placeholderTextColor={colors.textMuted}
        style={styles.input}
      />
      <View style={styles.list}>
        {others.length === 0 && (
          <Text style={typography.caption}>
            {search.trim() ? 'No groups match that search.' : 'No other groups yet — be the first to create one.'}
          </Text>
        )}
        {others.map((g) => renderGroup(g))}
      </View>
    </ScrollView>
  );
}

function makeStyles(colors: ThemeColors, spacing: Spacing, radius: Radius, cardShadow: object) {
  return StyleSheet.create({
    wrap: { padding: spacing.xl, gap: spacing.md, maxWidth: 760, width: '100%', alignSelf: 'center' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    createBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: colors.primary,
      borderRadius: radius.pill,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
    },
    createBtnLabel: { color: colors.primaryText, fontSize: 13, fontWeight: '700' },
    addRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
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
    list: { gap: spacing.md, marginTop: spacing.sm },
    groupCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.lg,
      ...cardShadow,
    },
    groupTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    visibilityTag: { flexDirection: 'row', alignItems: 'center', gap: 3 },
    visibilityLabel: { fontSize: 11, color: colors.textMuted },
    memberCount: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
    joinBtn: {
      height: 32,
      backgroundColor: colors.primarySoft,
      borderRadius: radius.pill,
      paddingHorizontal: spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    joinBtnDone: { backgroundColor: colors.border },
    joinBtnLabel: { fontSize: 13, lineHeight: 17, fontWeight: '700', color: colors.primary },
    joinBtnLabelDone: { color: colors.textMuted },
  });
}
