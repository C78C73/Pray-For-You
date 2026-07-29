import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Redirect } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useAppStore } from '../src/store/useAppStore';
import { PrimaryButton } from '../src/components/PrimaryButton';
import { useTheme } from '../src/theme/ThemeContext';
import { ThemeColors, Spacing, Radius } from '../src/theme/theme';

export default function Welcome() {
  const { colors, spacing, radius, typography } = useTheme();
  const styles = useMemo(() => makeStyles(colors, spacing, radius), [colors, spacing, radius]);
  const user = useAppStore((s) => s.user);
  const signIn = useAppStore((s) => s.signIn);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  if (user) return <Redirect href={Platform.OS === 'web' ? '/pages/home' : '/(tabs)'} />;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.wrap} keyboardShouldPersistTaps="handled">
        <View style={styles.hero}>
          <MaterialCommunityIcons name="cross" size={48} color={colors.primary} />
          <Text style={styles.title}>Faithstreak</Text>
          <Text style={styles.subtitle}>Pray for each other. Grow in faith, together.</Text>
        </View>

        {!showEmailForm ? (
          <View style={{ gap: spacing.sm, width: '100%' }}>
            <PrimaryButton
              label="Continue with Google"
              onPress={() => signIn('google', 'Friend', null)}
            />
            <PrimaryButton
              label="Continue with Email"
              variant="secondary"
              onPress={() => setShowEmailForm(true)}
            />
            <PrimaryButton
              label="Continue without an account"
              variant="ghost"
              onPress={() => signIn('guest', 'Guest', null)}
            />
            <Text style={styles.note}>
              No account means your streak and prayers stay on this device only.
            </Text>
          </View>
        ) : (
          <View style={{ gap: spacing.sm, width: '100%' }}>
            <TextInput
              placeholder="Your name"
              placeholderTextColor={colors.textMuted}
              value={name}
              onChangeText={setName}
              style={styles.input}
            />
            <TextInput
              placeholder="Email"
              placeholderTextColor={colors.textMuted}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              style={styles.input}
            />
            <PrimaryButton
              label="Continue"
              disabled={!name.trim() || !email.trim()}
              onPress={() => signIn('email', name, email.trim().toLowerCase())}
            />
            <PrimaryButton label="Back" variant="ghost" onPress={() => setShowEmailForm(false)} />
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function makeStyles(colors: ThemeColors, spacing: Spacing, radius: Radius) {
  return StyleSheet.create({
    wrap: {
      flexGrow: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.lg,
      gap: spacing.xl,
    },
    hero: {
      alignItems: 'center',
      gap: spacing.xs,
    },
    title: {
      fontSize: 30,
      fontWeight: '700',
      color: colors.text,
    },
    subtitle: {
      fontSize: 15,
      color: colors.textMuted,
      textAlign: 'center',
    },
    input: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
      fontSize: 15,
      color: colors.text,
    },
    note: {
      fontSize: 13,
      color: colors.textMuted,
      textAlign: 'center',
    },
  });
}
