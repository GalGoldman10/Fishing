import { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/components/common/ThemeProvider';
import { borderRadius, spacing, typography } from '@/constants/theme';
import { formatNumber } from '@/lib/localization/format';
import { computeFishActivity, type ActivityTier } from '@/lib/marine/fishActivity';
import type { LiveMarineConditions } from '@/types/marine';

const TIER_STYLE: Record<ActivityTier, { color: string; bg: string; emoji: string }> = {
  slow: { color: '#B91C1C', bg: '#FEE2E2', emoji: '🍺' },
  challenging: { color: '#B45309', bg: '#FEF3C7', emoji: '🎣' },
  hot: { color: '#047857', bg: '#DCFCE7', emoji: '🔥' },
};

const TIERS: ActivityTier[] = ['slow', 'challenging', 'hot'];

interface Props {
  conditions: LiveMarineConditions;
}

export function FishActivityMeter({ conditions }: Props) {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const [legendOpen, setLegendOpen] = useState(false);

  const activity = useMemo(() => computeFishActivity(conditions), [conditions]);
  const tierStyle = TIER_STYLE[activity.tier];

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: colors.text }]}>{t('marine.activityTitle')}</Text>
        <Pressable
          onPress={() => setLegendOpen((v) => !v)}
          accessibilityLabel={t('marine.activityLegendToggle')}
          style={styles.legendBtn}
        >
          <Ionicons
            name={legendOpen ? 'chevron-up' : 'information-circle-outline'}
            size={18}
            color={colors.accent}
          />
        </Pressable>
      </View>

      <View style={styles.meterRow}>
        <View style={[styles.percentBadge, { backgroundColor: tierStyle.bg }]}>
          <Text style={styles.tierEmoji}>{tierStyle.emoji}</Text>
          <Text style={[styles.percentText, { color: tierStyle.color }]}>
            {formatNumber(activity.percent, i18n.language)}%
          </Text>
        </View>
        <View style={styles.meterTexts}>
          <Text style={[styles.tierName, { color: tierStyle.color }]}>
            {t(`marine.activityTiers.${activity.tier}.name`)}
          </Text>
          <Text style={[styles.tierHint, { color: colors.textSecondary }]}>
            {t(`marine.activityTiers.${activity.tier}.hint`)}
          </Text>
        </View>
      </View>

      {/* Progress track with tier bands */}
      <View style={[styles.track, { backgroundColor: colors.surfaceSecondary }]}>
        <View
          style={[
            styles.trackFill,
            { width: `${activity.percent}%`, backgroundColor: tierStyle.color },
          ]}
        />
      </View>

      {legendOpen && (
        <View style={styles.legend}>
          {TIERS.map((tier) => {
            const s = TIER_STYLE[tier];
            return (
              <View key={tier} style={[styles.legendItem, { backgroundColor: s.bg }]}>
                <Text style={styles.legendEmoji}>{s.emoji}</Text>
                <View style={styles.legendTexts}>
                  <Text style={[styles.legendName, { color: s.color }]}>
                    {t(`marine.activityTiers.${tier}.range`)} · {t(`marine.activityTiers.${tier}.name`)}
                  </Text>
                  <Text style={[styles.legendDesc, { color: s.color }]}>
                    {t(`marine.activityTiers.${tier}.description`)}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      )}

      <Text style={[styles.disclaimer, { color: colors.textMuted }]}>
        {t('marine.activityDisclaimer')}
      </Text>
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
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { ...typography.h3 },
  legendBtn: { padding: 4 },
  meterRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  percentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  tierEmoji: { fontSize: 18 },
  percentText: { fontSize: 22, fontWeight: '800' },
  meterTexts: { flex: 1, gap: 2 },
  tierName: { fontSize: 15, fontWeight: '800' },
  tierHint: { ...typography.bodySmall },
  track: { height: 8, borderRadius: 4, overflow: 'hidden' },
  trackFill: { height: '100%', borderRadius: 4 },
  legend: { gap: spacing.xs },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
  },
  legendEmoji: { fontSize: 18 },
  legendTexts: { flex: 1, gap: 1 },
  legendName: { fontSize: 13, fontWeight: '800' },
  legendDesc: { fontSize: 12, opacity: 0.9 },
  disclaimer: { ...typography.caption },
});
