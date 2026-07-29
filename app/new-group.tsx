import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';

import { useAppStore } from '../src/store/useAppStore';
import { PrimaryButton } from '../src/components/PrimaryButton';
import { GroupVisibility } from '../src/types';
import { useTheme } from '../src/theme/ThemeContext';
import { ThemeColors, Spacing, Radius } from '../src/theme/theme';

const BIO_MAX_LEN = 140;

export default function NewGroup() {
  const router = useRouter();
  const { colors, spacing, radius, typography } = useTheme();
  const styles = useMemo(() => makeStyles(colors, spacing, radius), [colors, spacing, radius]);
  const createGroup = useAppStore((s) => s.createGroup);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [visibility, setVisibility] = useState<GroupVisibility>('open');

  function submit() {
    const result = createGroup(name, bio, visibility);
    if (result.ok) {
      router.back();
    } else {
      Alert.alert('Not created', result.message);
    }
  }

  return (
    <View style={styles.wrap}>
      <Text style={typography.caption}>Group name</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="e.g. Sunday Small Group"
        placeholderTextColor={colors.textMuted}
        style={styles.input}
        autoFocus
      />

      <Text style={[typography.caption, { marginTop: spacing.md }]}>Bio (optional)</Text>
      <TextInput
        multiline
        maxLength={BIO_MAX_LEN}
        value={bio}
        onChangeText={setBio}
        placeholder="What's this group about?"
        placeholderTextColor={colors.textMuted}
        style={styles.bioInput}
      />
      <Text style={styles.counter}>{bio.length}/{BIO_MAX_LEN}</Text>

      <Text style={[typography.caption, { marginTop: spacing.md }]}>Who can join?</Text>
      <View style={styles.segment}>
        <Pressable
          onPress={() => setVisibility('open')}
          style={[styles.segmentBtn, visibility === 'open' && styles.segmentActive]}
        >
          <Text style={[styles.segmentLabel, visibility === 'open' && styles.segmentLabelActive]}>Open</Text>
        </Pressable>
        <Pressable
          onPress={() => setVisibility('invite_only')}
          style={[styles.segmentBtn, visibility === 'invite_only' && styles.segmentActive]}
        >
          <Text style={[styles.segmentLabel, visibility === 'invite_only' && styles.segmentLabelActive]}>
            Invite only
          </Text>
        </Pressable>
      </View>
      <Text style={typography.caption}>
        {visibility === 'open'
          ? 'Anyone can find and join this group.'
          : "Only people you share the group's invite code with can join."}
      </Text>

      <PrimaryButton label="Create group" onPress={submit} disabled={!name.trim()} style={{ marginTop: spacing.lg }} />
    </View>
  );
}

function makeStyles(colors: ThemeColors, spacing: Spacing, radius: Radius) {
  return StyleSheet.create({
    wrap: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
    input: {
      marginTop: spacing.sm,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      padding: spacing.md,
      fontSize: 15,
      color: colors.text,
    },
    bioInput: {
      marginTop: spacing.sm,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      padding: spacing.md,
      fontSize: 15,
      minHeight: 80,
      textAlignVertical: 'top',
      color: colors.text,
    },
    counter: { fontSize: 13, color: colors.textMuted, textAlign: 'right', marginTop: 4 },
    segment: {
      flexDirection: 'row',
      backgroundColor: colors.border,
      borderRadius: radius.pill,
      padding: 3,
      marginTop: spacing.sm,
      marginBottom: spacing.xs,
    },
    segmentBtn: { flex: 1, paddingVertical: spacing.sm, borderRadius: radius.pill, alignItems: 'center' },
    segmentActive: { backgroundColor: colors.surface },
    segmentLabel: { fontSize: 13, fontWeight: '600', color: colors.textMuted },
    segmentLabelActive: { color: colors.text },
  });
}
