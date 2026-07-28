import React, { useMemo } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useAppStore } from '../src/store/useAppStore';
import { SYMBOLS } from '../src/data/symbols';
import { FRAMES } from '../src/data/frames';
import { Symbol } from '../src/components/Symbol';
import { SeedsPill } from '../src/components/SeedsPill';
import { useTheme } from '../src/theme/ThemeContext';
import { ThemeColors, Spacing, Radius } from '../src/theme/theme';

export default function EditSymbol() {
  const { colors, spacing, radius, typography } = useTheme();
  const styles = useMemo(() => makeStyles(colors, spacing, radius), [colors, spacing, radius]);
  const user = useAppStore((s) => s.user)!;
  const setSymbol = useAppStore((s) => s.setSymbol);
  const setFrame = useAppStore((s) => s.setFrame);
  const setPhoto = useAppStore((s) => s.setPhoto);
  const unlockSymbol = useAppStore((s) => s.unlockSymbol);
  const unlockFrame = useAppStore((s) => s.unlockFrame);

  async function pickPhoto() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Allow photo access to set a profile picture.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setPhoto(result.assets[0].uri);
    }
  }

  function handleSymbolPress(id: string) {
    if (user.ownedSymbolIds.includes(id)) {
      setSymbol(id);
      return;
    }
    const result = unlockSymbol(id);
    if (result.ok) setSymbol(id);
    else Alert.alert('Keep growing', result.message);
  }

  function handleFramePress(id: string) {
    if (user.ownedFrameIds.includes(id)) {
      setFrame(id);
      return;
    }
    const result = unlockFrame(id);
    if (result.ok) setFrame(id);
    else Alert.alert('Keep growing', result.message);
  }

  return (
    <ScrollView style={styles.wrap} contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}>
      <View style={{ alignItems: 'center', gap: spacing.sm }}>
        <Symbol symbolId={user.symbolId} frameId={user.frameId} photoUri={user.photoUri} size={96} />
        <SeedsPill seeds={user.seeds} />
        <Pressable onPress={pickPhoto} style={styles.photoBtn}>
          <MaterialCommunityIcons name="image-plus" size={16} color={colors.primary} />
          <Text style={styles.photoBtnLabel}>Upload your own photo instead</Text>
        </Pressable>
      </View>

      <View>
        <Text style={typography.heading}>Symbol</Text>
        <Text style={[typography.caption, { marginBottom: spacing.sm }]}>
          Earn Seeds by praying, reading, and inviting friends — never by paying.
        </Text>
        <View style={styles.grid}>
          {SYMBOLS.map((s) => {
            const owned = user.ownedSymbolIds.includes(s.id);
            const active = user.symbolId === s.id;
            return (
              <Pressable key={s.id} onPress={() => handleSymbolPress(s.id)} style={styles.gridItem}>
                <View style={[styles.iconCircle, active && styles.iconCircleActive]}>
                  <MaterialCommunityIcons name={s.icon as any} size={26} color={colors.primary} />
                  {!owned && (
                    <View style={styles.lockBadge}>
                      <MaterialCommunityIcons name="lock" size={10} color={colors.white} />
                    </View>
                  )}
                </View>
                <Text style={styles.itemLabel}>{s.label}</Text>
                {!owned && <Text style={styles.itemCost}>{s.costSeeds} seeds</Text>}
              </Pressable>
            );
          })}
        </View>
      </View>

      <View>
        <Text style={typography.heading}>Frame</Text>
        <View style={styles.grid}>
          {FRAMES.map((f) => {
            const owned = user.ownedFrameIds.includes(f.id);
            const active = user.frameId === f.id;
            return (
              <Pressable key={f.id} onPress={() => handleFramePress(f.id)} style={styles.gridItem}>
                <View
                  style={[
                    styles.iconCircle,
                    { borderColor: f.color === 'transparent' ? colors.border : f.color, borderWidth: 3 },
                    active && styles.iconCircleActive,
                  ]}
                >
                  {!owned && (
                    <View style={styles.lockBadge}>
                      <MaterialCommunityIcons name="lock" size={10} color={colors.white} />
                    </View>
                  )}
                </View>
                <Text style={styles.itemLabel}>{f.label}</Text>
                {!owned && <Text style={styles.itemCost}>{f.costSeeds} seeds</Text>}
              </Pressable>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}

function makeStyles(colors: ThemeColors, spacing: Spacing, radius: Radius) {
  return StyleSheet.create({
    wrap: { flex: 1, backgroundColor: colors.background },
    photoBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing.xs },
    photoBtnLabel: { color: colors.primary, fontSize: 13, fontWeight: '600' },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
    gridItem: { width: 84, alignItems: 'center', gap: 2 },
    iconCircle: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconCircleActive: { backgroundColor: colors.primarySoft },
    lockBadge: {
      position: 'absolute',
      bottom: -2,
      right: -2,
      backgroundColor: colors.textMuted,
      borderRadius: 8,
      width: 16,
      height: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    itemLabel: { fontSize: 11, textAlign: 'center', color: colors.text },
    itemCost: { fontSize: 10, color: colors.textMuted },
  });
}
