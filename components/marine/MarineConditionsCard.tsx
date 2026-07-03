import { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/components/common/ThemeProvider';
import { borderRadius, spacing, typography } from '@/constants/theme';
import { formatNumber, formatTime } from '@/lib/localization/format';
import { isMarineDataStale } from '@/features/marine/marineService';
import type { LiveMarineConditions } from '@/types/marine';
import {
  SEA_LEVEL_COLORS,
  SUITABILITY_COLORS,
  degreesToCompass,
  translateSeaLevel,
  translateSuitability,
} from './marineUi';

interface Props {
  conditions: LiveMarineConditions;
  onRefresh?: () => void;
  refreshing?: boolean;
  /** Compact mode hides the secondary metric grid (map preview / cards). */
  compact?: boolean;
}

function Metric({ label, value, degrees }: { label: string; value: string; degrees?: number }) {
  const { colors } = useTheme();
  return (
    <View style={styles.metric}>
      <Text style={[styles.metricLabel, { color: colors.textMuted }]}>{label}</Text>
      <View style={styles.metricValueRow}>
        {degrees !== undefined && (
          <Ionicons
            name="arrow-up"
            size={13}
            color={colors.accent}
            // Meteorological direction is where it comes FROM; +180 points where it flows TO.
            style={{ transform: [{ rotate: `${(degrees + 180) % 360}deg` }] }}
          />
        )}
        <Text style={[styles.metricValue, { color: colors.text }]}>{value}</Text>
      </View>
    </View>
  );
}

export function MarineConditionsCard({ conditions, onRefresh, refreshing, compact }: Props) {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const lang = i18n.language;
  const seaColors = SEA_LEVEL_COLORS[conditions.seaLevel];
  const stale = isMarineDataStale(conditions.fetchedAt);

  // Only fields the provider actually returned are rendered — nothing is invented.
  const metrics = useMemo(() => {
    const c = conditions;
    const rows: { key: string; label: string; value: string; degrees?: number }[] = [];
    const push = (key: string, label: string, value: string | undefined, degrees?: number) => {
      if (value !== undefined) rows.push({ key, label, value, degrees });
    };
    const num = (v: number | undefined, unit: string, digits = 1) =>
      v === undefined ? undefined : `${formatNumber(v, lang, { maximumFractionDigits: digits })} ${unit}`;

    push('waveHeight', t('marine.waveHeight'), num(c.waveHeightMeters, t('units.m')));
    push('wavePeriod', t('marine.wavePeriod'), num(c.wavePeriodSeconds, t('units.s'), 0));
    push('swellHeight', t('marine.swellHeight'), num(c.swellHeightMeters, t('units.m')));
    push(
      'swellDirection',
      t('marine.swellDirection'),
      c.swellDirectionDegrees === undefined ? undefined : degreesToCompass(c.swellDirectionDegrees, t),
      c.swellDirectionDegrees,
    );
    push('swellPeriod', t('marine.swellPeriod'), num(c.swellPeriodSeconds, t('units.s'), 0));
    push('windSpeed', t('marine.wind'), num(c.windSpeedKph, t('units.kmh'), 0));
    push('windGusts', t('marine.windGusts'), num(c.windGustKph, t('units.kmh'), 0));
    push(
      'windDirection',
      t('marine.windDirection'),
      c.windDirectionDegrees === undefined ? undefined : degreesToCompass(c.windDirectionDegrees, t),
      c.windDirectionDegrees,
    );
    push('seaTemp', t('marine.waterTemperature'), num(c.seaTemperatureCelsius, t('units.celsius')));
    push('airTemp', t('marine.airTemperature'), num(c.airTemperatureCelsius, t('units.celsius')));
    push('tide', t('marine.tide'), num(c.tideHeightMeters, t('units.m'), 2));
    push('nextHigh', t('marine.highTide'), c.nextHighTide ? formatTime(c.nextHighTide, lang) : undefined);
    push('nextLow', t('marine.lowTide'), c.nextLowTide ? formatTime(c.nextLowTide, lang) : undefined);
    push('current', t('marine.current'), num(c.currentSpeedKph, t('units.kmh')));
    push('visibility', t('marine.visibility'), num(c.visibilityKm, t('units.km'), 0));
    push(
      'rain',
      t('marine.rainProbability'),
      c.rainProbability === undefined ? undefined : `${formatNumber(c.rainProbability, lang, { maximumFractionDigits: 0 })}%`,
    );
    push('pressure', t('marine.pressure'), num(c.pressureHpa, t('units.hpa'), 0));
    push('sunrise', t('marine.sunrise'), c.sunrise ? formatTime(c.sunrise, lang) : undefined);
    push('sunset', t('marine.sunset'), c.sunset ? formatTime(c.sunset, lang) : undefined);
    return rows;
  }, [conditions, t, lang]);

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
      {/* Safety warnings — intentionally the most prominent element. */}
      {conditions.safetyWarnings.length > 0 && (
        <View style={styles.warningBanner}>
          <Ionicons name="warning" size={22} color="#fff" />
          <View style={styles.warningTexts}>
            {conditions.safetyWarnings.map((key) => (
              <Text key={key} style={styles.warningText}>
                {t(`marine.warnings.${key}`)}
              </Text>
            ))}
          </View>
        </View>
      )}

      <View style={styles.headerRow}>
        <View style={[styles.seaBadge, { backgroundColor: seaColors.bg }]}>
          <Ionicons name="water" size={14} color={seaColors.text} />
          <Text style={[styles.seaBadgeText, { color: seaColors.text }]}>
            {t('marine.seaConditions')}: {translateSeaLevel(conditions.seaLevel, t)}
          </Text>
        </View>
        {onRefresh && (
          <Pressable
            onPress={onRefresh}
            disabled={refreshing}
            accessibilityLabel={t('marine.refresh')}
            style={[styles.refreshBtn, { backgroundColor: colors.surfaceSecondary }]}
          >
            {refreshing ? (
              <ActivityIndicator size="small" color={colors.accent} />
            ) : (
              <Ionicons name="refresh" size={16} color={colors.accent} />
            )}
          </Pressable>
        )}
      </View>

      <View style={styles.scoreRow}>
        <View style={[styles.scoreCircle, { borderColor: SUITABILITY_COLORS[conditions.suitabilityLabel] }]}>
          <Text style={[styles.scoreValue, { color: SUITABILITY_COLORS[conditions.suitabilityLabel] }]}>
            {formatNumber(conditions.fishingSuitabilityScore, lang)}
          </Text>
        </View>
        <View style={styles.scoreTexts}>
          <Text style={[styles.scoreLabel, { color: colors.text }]}>
            {t('marine.fishingSuitability')}: {translateSuitability(conditions.suitabilityLabel, t)}
          </Text>
          <Text style={[styles.scoreHint, { color: colors.textSecondary }]}>
            {t(`marine.suitabilityExplanations.${conditions.suitabilityLabel}`)}
          </Text>
        </View>
      </View>

      {!compact && (
        <View style={styles.metricsGrid}>
          {metrics.map((m) => (
            <Metric key={m.key} label={m.label} value={m.value} degrees={m.degrees} />
          ))}
        </View>
      )}

      <View style={styles.footerRow}>
        <Text style={[styles.updatedText, { color: stale ? colors.warning : colors.textMuted }]}>
          {stale ? t('marine.dataOutdated') : t('marine.lastUpdated', { time: formatTime(conditions.fetchedAt, lang) })}
        </Text>
        <Text style={[styles.sourceText, { color: colors.textMuted }]}>
          {t('marine.source', { source: conditions.source })}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.md,
    gap: spacing.md,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: '#DC2626',
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  warningTexts: { flex: 1, gap: 2 },
  warningText: { color: '#fff', fontWeight: '700', fontSize: 14, lineHeight: 19 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  seaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
  },
  seaBadgeText: { ...typography.label },
  refreshBtn: {
    width: 34,
    height: 34,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  scoreCircle: {
    width: 62,
    height: 62,
    borderRadius: 31,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreValue: { fontSize: 20, fontWeight: '800' },
  scoreTexts: { flex: 1, gap: 2 },
  scoreLabel: { ...typography.h3 },
  scoreHint: { ...typography.bodySmall },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  metric: {
    flexBasis: '30%',
    flexGrow: 1,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    backgroundColor: 'rgba(148, 163, 184, 0.08)',
    gap: 2,
  },
  metricLabel: { ...typography.caption },
  metricValueRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metricValue: { ...typography.bodySmall, fontWeight: '700' },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  updatedText: { ...typography.caption, fontWeight: '600' },
  sourceText: { ...typography.caption },
});
