import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BibleReader } from '../../src/components/BibleReader';
import { useTheme } from '../../src/theme/ThemeContext';

export default function BibleScreen() {
  const { colors } = useTheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <BibleReader />
    </SafeAreaView>
  );
}
