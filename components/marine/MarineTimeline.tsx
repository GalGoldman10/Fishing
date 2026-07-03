import { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/components/common/ThemeProvider';
import { borderRadius, spacing, typography } from '@/constants/theme';
import { formatNumber, formatTime } from '@/lib/localization/format';
import type { MarineForecastHour } from '@/types/marine';
import { SEA_LEVEL_COLORS, SUITABILITY_COLORS } from './marineUi';
import { suitabilityLabel } from '@/lib/marine/suitability';

type Range = 12 | 24 | 72;
type Series = 'waves' | 'wind' | 'suitability';

const BAR_MAX_HEIGHT = 72;

interface Props {
  hourly: MarineForecastHour[];
}

/**
 * Hourly forecast timeline. One measurement per chart (selectable series)
 * so the chart stays readable on small screens; horizontal scroll for hours.
 */
export function MarineTimeline({ hourly }: Props) {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const [range, setRange] = useState<Range>(12);
  const [series, setSeries] = useState<Series>('waves');

  const slice = useMemo(() => hourly.slice(0, range), [hourly, range]);

  const values = useMemo(
    () =>
      slice.map((h) => {
        if (series === 'waves') return h.waveHeightMeters;
        if (series === 'wind') return Math.max(h.windSpeedKph ?? 0, h.windGustKph ?? 0) || h.windSpeedKph;
        return h.fishingSuitabilityScore;
      }),
    [slice, series],
  );

  const max = useMemo(() => {
    const finite = values.filter((v): v is number => v !== undefined);
    return finite.length ? Math.max(...finite, series === 'suitability' ? 100 : 0.1) : 1;
  }, [values, series]);

  if (hourly.length === 0) return null;

  const rangeOptions: { value: Range; label: string }[] = [
    { value: 12, label: t('marine.next12h') },
    { value: 24, label: t('marine.next24h') },
    { value: 72, label: t('marine.next3days') },
  ];
  const seriesOptions: { value: Series; label: string }[] = [
    { value: 'waves', label: t('marine.waveHeight') },
    { value: 'wind', label: t('marine.wind') },
    { value: 'suitability', label: t('marine.fishingSuitability') },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.controlsRow}>
        {seriesOptions.map((opt) => (
          <Pressable
            key={opt.value}
            onPress={() => setSeries(opt.value)}
            style={[
              styles.pill,
              {
                backgroundColor: series === opt.value ? colors.primary : colors.surfaceSecondary,
              },
            ]}
          >
            <Text
              style={[
                styles.pillText,
                { color: series === opt.value ? '#fff' : colors.textSecondary },
              ]}
            >
              {opt.label}
            </Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.controlsRow}>
        {rangeOptions.map((opt) => (
          <Pressable
            key={opt.value}
            onPress={() => setRange(opt.value)}
            style={[
              styles.pill,
              {
                backgroundColor: range === opt.value ? colors.accentSoft : 'transparent',
                borderColor: colors.borderLight,
                borderWidth: StyleSheet.hairlineWidth,
              },
            ]}
          >
            <Text style={[styles.pillText, { color: range === opt.value ? colors.accent : colors.textMuted }]}>
              {opt.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chartContent}>
        {slice.map((hour, idx) => {
          const value = values[idx];
          const height = value === undefined ? 0 : Math.max(4, (value / max) * BAR_MAX_HEIGHT);
          const barColor =
            series === 'suitability'
              ? SUITABILITY_COLORS[suitabilityLabel(hour.fishingSuitabilityScore)]
              : SEA_LEVEL_COLORS[hour.seaLevel].text;
          return (
            <View key={hour.time} style={styles.hourColumn}>
              <Text style={[styles.hourValue, { color: colors.textSecondary }]}>
                {value === undefined
                  ? '–'
                  : formatNumber(value, i18n.language, { maximumFractionDigits: series === 'waves' ? 1 : 0 })}
              </Text>
              <View style={styles.barTrack}>
                <View style={[styles.bar, { height, backgroundColor: barColor }]} />
              </View>
              <Text style={[styles.hourLabel, { color: colors.textMuted }]}>
                {formatTime(hour.time, i18n.language)}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.sm },
  controlsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  pill: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
  },
  pillText: { ...typography.caption, fontWeight: '600' },
  chartContent: { gap: 6, paddingVertical: spacing.xs },
  hourColumn: { alignItems: 'center', width: 44, gap: 4 },
  hourValue: { ...typography.caption, fontWeight: '600' },
  barTrack: {
    height: BAR_MAX_HEIGHT,
    justifyContent: 'flex-end',
    width: 18,
  },
  bar: { width: '100%', borderRadius: 4 },
  hourLabel: { fontSize: 10 },
});
