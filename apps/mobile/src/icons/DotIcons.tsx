// Minimal dot icons built from pure RN primitives to avoid adding a vector
// dep. Each glyph is a calm, non-clinical, non-emoji mark — one icon per
// score-capable orbit domain. Icons read best at 28–32dp and inherit the
// dot accent color.

import React from 'react';
import { StyleSheet, View } from 'react-native';

interface DotIconProps {
  color: string;
  size?: number;
}

const BASE_SIZE = 32;
const STROKE = 2.25;

function scale(value: number, size: number): number {
  return (value / BASE_SIZE) * size;
}

// Heart outline — two overlapping rotated squares form the rounded lobes, a
// third rotated square provides the bottom point. Readable as a heart without
// feeling medical/alarm.
export function HealthIcon({ color, size = BASE_SIZE }: DotIconProps): React.JSX.Element {
  const lobe = scale(12, size);
  const point = scale(14, size);
  const pointOffset = scale(6, size);
  return (
    <View style={[styles.frame, { width: size, height: size }]}>
      <View
        style={{
          position: 'absolute',
          left: scale(4, size),
          top: scale(6, size),
          width: lobe,
          height: lobe,
          borderTopLeftRadius: lobe,
          borderTopRightRadius: lobe,
          borderBottomLeftRadius: lobe / 4,
          borderBottomRightRadius: lobe / 4,
          borderColor: color,
          borderWidth: STROKE,
          transform: [{ rotate: '-45deg' }],
          backgroundColor: 'transparent',
        }}
      />
      <View
        style={{
          position: 'absolute',
          right: scale(4, size),
          top: scale(6, size),
          width: lobe,
          height: lobe,
          borderTopLeftRadius: lobe,
          borderTopRightRadius: lobe,
          borderBottomLeftRadius: lobe / 4,
          borderBottomRightRadius: lobe / 4,
          borderColor: color,
          borderWidth: STROKE,
          transform: [{ rotate: '45deg' }],
          backgroundColor: 'transparent',
        }}
      />
      <View
        style={{
          position: 'absolute',
          left: (size - point) / 2,
          top: pointOffset + scale(4, size),
          width: point,
          height: point,
          borderRadius: scale(3, size),
          borderColor: color,
          borderWidth: STROKE,
          transform: [{ rotate: '45deg' }],
          backgroundColor: 'transparent',
        }}
      />
    </View>
  );
}

// Apple outline — rounded circle body with a small stem and leaf.
export function NutritionIcon({ color, size = BASE_SIZE }: DotIconProps): React.JSX.Element {
  const body = scale(22, size);
  const stem = scale(6, size);
  const leaf = scale(8, size);
  return (
    <View style={[styles.frame, { width: size, height: size }]}>
      <View
        style={{
          position: 'absolute',
          left: (size - body) / 2,
          bottom: scale(3, size),
          width: body,
          height: body,
          borderRadius: body / 2,
          borderColor: color,
          borderWidth: STROKE,
        }}
      />
      <View
        style={{
          position: 'absolute',
          left: (size - STROKE) / 2,
          top: scale(4, size),
          width: STROKE,
          height: stem,
          backgroundColor: color,
          borderRadius: STROKE,
        }}
      />
      <View
        style={{
          position: 'absolute',
          left: size / 2 + scale(1, size),
          top: scale(3, size),
          width: leaf,
          height: leaf / 2,
          borderTopRightRadius: leaf,
          borderBottomRightRadius: leaf / 4,
          borderColor: color,
          borderWidth: STROKE,
          borderLeftWidth: 0,
          transform: [{ rotate: '-20deg' }],
        }}
      />
    </View>
  );
}

// Crescent moon — large ring with a matching-background circle offset inside
// to carve the crescent shape.
export function MindSleepIcon({ color, size = BASE_SIZE, backgroundColor = 'transparent' }: DotIconProps & { backgroundColor?: string }): React.JSX.Element {
  const outer = scale(26, size);
  const carve = scale(22, size);
  return (
    <View style={[styles.frame, { width: size, height: size }]}>
      <View
        style={{
          position: 'absolute',
          left: (size - outer) / 2,
          top: (size - outer) / 2,
          width: outer,
          height: outer,
          borderRadius: outer / 2,
          borderColor: color,
          borderWidth: STROKE,
        }}
      />
      <View
        style={{
          position: 'absolute',
          left: (size - outer) / 2 + scale(7, size),
          top: (size - outer) / 2 - scale(1, size),
          width: carve,
          height: carve,
          borderRadius: carve / 2,
          backgroundColor,
        }}
      />
    </View>
  );
}

// Rising bars — three bars increasing in height; reads as activity/movement
// without the gamification look of flame/lightning marks.
export function ActivityIcon({ color, size = BASE_SIZE }: DotIconProps): React.JSX.Element {
  const barWidth = scale(5, size);
  const gap = scale(3, size);
  const baseTop = scale(26, size);
  const heights = [scale(10, size), scale(16, size), scale(22, size)];
  const totalWidth = barWidth * 3 + gap * 2;
  const startLeft = (size - totalWidth) / 2;
  return (
    <View style={[styles.frame, { width: size, height: size }]}>
      {heights.map((h, i) => (
        <View
          key={i}
          style={{
            position: 'absolute',
            left: startLeft + i * (barWidth + gap),
            top: baseTop - h,
            width: barWidth,
            height: h,
            borderRadius: barWidth / 2,
            backgroundColor: color,
          }}
        />
      ))}
    </View>
  );
}

export type DotIconKey = 'health' | 'nutrition' | 'mind_and_sleep' | 'activity';

export function DotIcon({
  iconKey,
  color,
  size = BASE_SIZE,
  backgroundColor,
}: {
  iconKey: DotIconKey;
  color: string;
  size?: number;
  backgroundColor?: string;
}): React.JSX.Element {
  if (iconKey === 'health') return <HealthIcon color={color} size={size} />;
  if (iconKey === 'nutrition') return <NutritionIcon color={color} size={size} />;
  if (iconKey === 'mind_and_sleep') return <MindSleepIcon color={color} size={size} backgroundColor={backgroundColor} />;
  return <ActivityIcon color={color} size={size} />;
}

const styles = StyleSheet.create({
  frame: { alignItems: 'center', justifyContent: 'center' },
});
