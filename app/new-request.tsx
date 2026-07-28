import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';

import { useAppStore } from '../src/store/useAppStore';
import { PrimaryButton } from '../src/components/PrimaryButton';
import { PrayerVisibility } from '../src/types';
import { colors, radius, spacing, typography } from '../src/theme/theme';

const MAX_LEN = 280;

export default function NewRequest() {
  const router = useRouter();
  const addPrayerRequest = useAppStore((s) => s.addPrayerRequest);
  const [text, setText] = useState('');
  const [visibility, setVisibility] = useState<PrayerVisibility>('friends');

  function submit() {
    if (!text.trim()) return;
    addPrayerRequest(text, visibility);
    router.back();
  }

  return (
    <View style={styles.wrap}>
      <Text style={typography.caption}>What do you need prayer for?</Text>
      <TextInput
        multiline
        maxLength={MAX_LEN}
        value={text}
        onChangeText={setText}
        placeholder="Share as much or as little as you're comfortable with..."
        placeholderTextColor={colors.textMuted}
        style={styles.input}
        autoFocus
      />
      <Text style={styles.counter}>{text.length}/{MAX_LEN}</Text>

      <Text style={[typography.caption, { marginTop: spacing.md }]}>Who can see this?</Text>
      <View style={styles.segment}>
        <Pressable
          onPress={() => setVisibility('friends')}
          style={[styles.segmentBtn, visibility === 'friends' && styles.segmentActive]}
        >
          <Text style={[styles.segmentLabel, visibility === 'friends' && styles.segmentLabelActive]}>
            Just my friends
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setVisibility('global')}
          style={[styles.segmentBtn, visibility === 'global' && styles.segmentActive]}
        >
          <Text style={[styles.segmentLabel, visibility === 'global' && styles.segmentLabelActive]}>
            Whole community
          </Text>
        </Pressable>
      </View>

      <PrimaryButton label="Share request" onPress={submit} disabled={!text.trim()} style={{ marginTop: spacing.lg }} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
  input: {
    marginTop: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: 15,
    minHeight: 120,
    textAlignVertical: 'top',
    color: colors.text,
  },
  counter: { ...typography.caption, textAlign: 'right', marginTop: 4 },
  segment: {
    flexDirection: 'row',
    backgroundColor: '#EDEAE0',
    borderRadius: radius.pill,
    padding: 3,
    marginTop: spacing.sm,
  },
  segmentBtn: { flex: 1, paddingVertical: spacing.sm, borderRadius: radius.pill, alignItems: 'center' },
  segmentActive: { backgroundColor: colors.surface },
  segmentLabel: { fontSize: 13, fontWeight: '600', color: colors.textMuted },
  segmentLabelActive: { color: colors.text },
});
