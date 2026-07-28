import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getSymbol } from '../data/symbols';
import { getFrame } from '../data/frames';
import { colors } from '../theme/theme';

interface Props {
  symbolId: string;
  frameId: string;
  photoUri?: string | null;
  size?: number;
}

export function Symbol({ symbolId, frameId, photoUri, size = 56 }: Props) {
  const frame = getFrame(frameId);
  const ringWidth = frame.id === 'none' ? 0 : Math.max(2, Math.round(size * 0.05));

  return (
    <View
      style={[
        styles.ring,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: ringWidth,
          borderColor: frame.color === 'transparent' ? colors.border : frame.color,
        },
      ]}
    >
      {symbolId === 'photo' && photoUri ? (
        <Image source={{ uri: photoUri }} style={{ width: '100%', height: '100%', borderRadius: size / 2 }} />
      ) : (
        <View style={[styles.iconWrap, { width: '100%', height: '100%', borderRadius: size / 2 }]}>
          <MaterialCommunityIcons
            name={getSymbol(symbolId).icon as any}
            size={size * 0.55}
            color={colors.primary}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  ring: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF2F8',
  },
});
