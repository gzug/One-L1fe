import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../theme/ThemeContext';
import { spacing } from '../theme/marathonTheme';

type BrandMarkV2Props = {
  size?: number;
  showWordmark?: boolean;
  framed?: boolean;
};

export function BrandMarkV2({
  size = 40,
  showWordmark = false,
  framed = false,
}: BrandMarkV2Props) {
  const { colors } = useTheme();
  const stroke = Math.max(3, size * 0.115);

  return (
    <View style={styles.row}>
      <View
        style={[
          styles.markWrap,
          framed && {
            borderWidth: StyleSheet.hairlineWidth,
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: colors.surface,
            borderColor: colors.borderSubtle,
          },
        ]}
      >
        <Svg width={size} height={size} viewBox="0 0 64 64">
          <Path
            d="M44 14 C38 10 29 9 21 12 C13 16 9 24 10 33 C11 44 20 51 31 51 C37 51 41 49 44 46"
            stroke={colors.brandGreen}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <Path
            d="M47 20 L55 13 L55 50"
            stroke={colors.brandGreen}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </Svg>
      </View>
      {showWordmark ? (
        <Text style={[styles.wordmark, { color: colors.text, fontFamily: 'BrandDisplay' }]}>
          One L<Text style={{ color: colors.brandGreen }}>1</Text>fe
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  markWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordmark: {
    fontSize: 25,
    lineHeight: 29,
    fontWeight: '900',
    letterSpacing: 0,
  },
});
