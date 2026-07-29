import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, TextInput, Pressable, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useAppStore } from '../../src/store/useAppStore';
import { EmptyState } from '../../src/components/EmptyState';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { Group } from '../../src/types';
import { useTheme } from '../../src/theme/ThemeContext';
import { ThemeColors, Spacing, Radius } from '../../src/theme/theme';

export default function GroupsScreen() {
  const router = useRouter();
  const { colors, spacing, radius, typography, cardShadow } = useTheme();
  const styles = useMemo(() => makeStyles(colors, spacing, radius, cardShadow), [colors, spacing, radius, cardShadow]);
  const user = useAppStore((s) => s.user)!;
  const groups = useAppStore((s) => s.groups);
  const joinGroupOpen = useAppStore((s) => s.joinGroupOpen);
  const joinGroupByCode = useAppStore((s) => s.joinGroupByCode);
  const [code, setCode] = useState('');

  const yours = groups.filter((g) => g.memberIds.includes(user.id));
  const discover = groups.filter((g) => g.visibility === 'open' && !g.memberIds.includes(user.id));

  function handleJoinByCode() {
    const result = joinGroupByCode(code);
    Alert.alert(result.ok ? 'Joined' : 'Not joined', result.message);
    if (result.ok) setCode('');
  }

  function renderGroup(group: Group, action?: React.ReactNode) {
    return (
      <Pressable
        key={group.id}
        style={styles.groupCard}
        onPress={() => router.push({ pathname: '/group/[id]', params: { id: group.id } })}
      >
        <View style={{ flex: 1 }}>
          <View style={styles.groupTitleRow}>
            <Text style={typography.body} numberOfLines={1}>
              {group.name}
            </Text>
            <View style={styles.visibilityTag}>
              <MaterialCommunityIcons
                name={group.visibility === 'open' ? 'earth' : 'lock-outline'}
                size={11}
                color={colors.textMuted}
              />
              <Text style={styles.visibilityLabel}>{group.visibility === 'open' ? 'Open' : 'Invite only'}</Text>
            </View>
          </View>
          {!!group.bio && (
            <Text style={typography.caption} numberOfLines={2}>
              {group.bio}
            </Text>
          )}
          <Text style={styles.memberCount}>
            {group.memberIds.length} {group.memberIds.length === 1 ? 'member' : 'members'}
          </Text>
        </View>
        {action}
        <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textMuted} />
      </Pressable>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={typography.title}>Groups</Text>
        <Pressable onPress={() => router.push('/new-group')}>
          <MaterialCommunityIcons name="plus-circle-outline" size={26} color={colors.primary} />
        </Pressable>
      </View>

      <View style={styles.joinRow}>
        <TextInput
          value={code}
          onChangeText={setCode}
          placeholder="Join with an invite code"
          placeholderTextColor={colors.textMuted}
          autoCapitalize="characters"
          style={styles.input}
        />
        <PrimaryButton label="Join" onPress={handleJoinByCode} disabled={!code.trim()} />
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        <Text style={[typography.heading, { marginTop: spacing.sm }]}>Your groups</Text>
        <View style={{ gap: spacing.sm, marginTop: spacing.sm }}>
          {yours.length === 0 ? (
            <EmptyState icon="account-multiple-outline" title="No groups yet" body="Create one or join with a code." />
          ) : (
            yours.map((g) => renderGroup(g))
          )}
        </View>

        {discover.length > 0 && (
          <>
            <Text style={[typography.heading, { marginTop: spacing.lg }]}>Discover</Text>
            <View style={{ gap: spacing.sm, marginTop: spacing.sm }}>
              {discover.map((g) =>
                renderGroup(
                  g,
                  <Pressable onPress={() => joinGroupOpen(g.id)} style={styles.joinBtn}>
                    <Text style={styles.joinBtnLabel}>Join</Text>
                  </Pressable>
                )
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function makeStyles(colors: ThemeColors, spacing: Spacing, radius: Radius, cardShadow: object) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.sm,
    },
    joinRow: { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.lg, marginTop: spacing.sm, alignItems: 'center' },
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
    groupCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      backgroundColor: colors.surface,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.md,
      ...cardShadow,
    },
    groupTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
    visibilityTag: { flexDirection: 'row', alignItems: 'center', gap: 3 },
    visibilityLabel: { fontSize: 11, color: colors.textMuted },
    memberCount: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
    joinBtn: {
      backgroundColor: colors.primarySoft,
      borderRadius: radius.pill,
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.sm,
    },
    joinBtnLabel: { fontSize: 12, fontWeight: '700', color: colors.primary },
  });
}
