import React from 'react';
import { View } from 'react-native';
import { Redirect } from 'expo-router';

import { useAppStore } from '../../../src/store/useAppStore';
import { BibleReader } from '../../../src/components/BibleReader';
import { useTheme } from '../../../src/theme/ThemeContext';

export default function BiblePage() {
  const { colors } = useTheme();
  const user = useAppStore((s) => s.user);
  if (!user) return <Redirect href="/welcome" />;

  return (
    <View style={{ flex: 1, maxWidth: 760, width: '100%', alignSelf: 'center', backgroundColor: colors.background }}>
      <BibleReader />
    </View>
  );
}
