import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/components/common/ThemeProvider';
import { borderRadius, spacing, typography } from '@/constants/theme';
import { formatNumber } from '@/lib/localization/format';
import { assessFishingMethods, recommendSinker, type MethodRating } from '@/lib/marine/methodSuitability';
import { getMoonInfo } from '@/lib/marine/moonPhase';
import type { LiveMarineConditions } from '@/types/marine';

const RATING_COLORS: Record<MethodRating, { bg: string; text: string }> = {
  good: { bg: '#DCFCE7', text: '#047857' },
  caution: { bg: '#FEF3C7', text: '#B45309' },
  bad: { bg: '#FEE2E2', text: '#B91C1C' },
  unknown: { bg: 'rgba(148,163,184,0.15)', text: '#64748B' },
};

const METHOD_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  shore: 'footsteps-outline',
  drone: 'airplane-outline',
  boat: 'boat-outline',
};

const MOON_ICONS: Record<string, string> = {
  newMoon: '🌑',
  waxingCrescent: '🌒',
  firstQuarter: '🌓',
  waxingGibbous: '🌔',
  fullMoon: '🌕',
  waningGibbous: '🌖',
  lastQuarter: '🌗',
  waningCrescent: '🌘',
};

interface Props {
  conditions: LiveMarineConditions;
}

export function FishingMethodsCard({ conditions }: Props) {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const lang = i18n.language;

  const methods = assessFishingMethods(conditions);
  const sinker = recommendSinker(conditions);
  const moon = getMoonInfo();

  const metricFor = (method: string): string | null => {
    const num = (v: number | undefined, unit: string) =>
      v === undefined ? null : `${formatNumber(v, lang, { maximumFractionDigits: 1 })} ${unit}`;
    switch (method) {
      case 'drone':
        return num(conditions.windGustKph ?? conditions.windSpeedKph, t('units.kmh'));
      case 'shore':
        return num(conditions.waveHeightMeters, t('units.m'));
      case 'boat':
        return num(conditions.swellHeightMeters ?? conditions.waveHeightMeters, t('units.m'));
      default:
        return null;
    }
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
      <Text style={[styles.title, { color: colors.text }]}>{t('marine.methodsTitle')}</Text>

      <View style={styles.methodsRow}>
        {methods.map((m) => {
          const c = RATING_COLORS[m.rating];
          const metric = metricFor(m.method);
          return (
            <View key={m.method} style={[styles.methodTile, { backgroundColor: c.bg }]}>
              <Ionicons name={METHOD_ICONS[m.method]} size={20} color={c.text} />
              <Text style={[styles.methodName, { color: c.text }]}>
                {t(`marine.methods.${m.method}`)}
              </Text>
              <Text style={[styles.methodRating, { color: c.text }]}>
                {t(`marine.methodRatings.${m.rating}`)}
              </Text>
              {metric && <Text style={[styles.methodMetric, { color: c.text }]}>{metric}</Text>}
              <Text style={[styles.methodReason, { color: c.text }]} numberOfLines={2}>
                {t(`marine.methodReasons.${m.reasonKey}`)}
              </Text>
            </View>
          );
        })}
      </View>

      <View style={[styles.row, { borderTopColor: colors.borderLight }]}>
        <Ionicons name="fitness-outline" size={16} color={colors.accent} />
        <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>{t('marine.sinkerLabel')}</Text>
        <Text style={[styles.rowValue, { color: colors.text }]}>{t(`marine.sinkers.${sinker}`)}</Text>
      </View>

      <View style={[styles.row, { borderTopColor: colors.borderLight }]}>
        <Text style={styles.moonEmoji}>{MOON_ICONS[moon.phase]}</Text>
        <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>{t('marine.moonLabel')}</Text>
        <Text style={[styles.rowValue, { color: colors.text }]}>
          {t(`marine.moonPhases.${moon.phase}`)} · {t(`marine.moonActivity.${moon.activity}`)}
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
    gap: spacing.sm,
  },
  title: { ...typography.h3 },
  methodsRow: { flexDirection: 'row', gap: spacing.sm },
  methodTile: {
    flex: 1,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    alignItems: 'center',
    gap: 3,
  },
  methodName: { ...typography.label, textAlign: 'center' },
  methodRating: { fontSize: 13, fontWeight: '800', textAlign: 'center' },
  methodMetric: { ...typography.caption, fontWeight: '600' },
  methodReason: { fontSize: 10, textAlign: 'center', opacity: 0.85 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  rowLabel: { ...typography.caption },
  rowValue: { ...typography.bodySmall, fontWeight: '700', flex: 1, textAlign: 'right' },
  moonEmoji: { fontSize: 16 },
});
