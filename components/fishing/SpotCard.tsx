import { Pressable, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { DirectionalIcon } from '@/components/common/DirectionalIcon';
import { useTheme } from '@/components/common/ThemeProvider';
import { Chip } from '@/components/common/SectionCard';
import { FishingSpotSummary } from '@/types/fishing';
import { borderRadius, shadows, spacing, typography } from '@/constants/theme';
import { formatDistance } from '@/lib/utils/distance';
import { translateDifficulty, translateShoreType } from '@/lib/localization/labels';

interface SpotCardProps {
  spot: FishingSpotSummary;
  language?: string;
  onPress: () => void;
  showWebBadge?: boolean;
}

export function SpotCard({ spot, language = 'en', onPress, showWebBadge }: SpotCardProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const localName = spot.localizedNames?.[language] ?? spot.name;
  const shoreIcon =
    spot.shoreType === 'sandy'
      ? 'sunny-outline'
      : spot.shoreType === 'rocky' || spot.shoreType === 'cliff'
        ? 'layers-outline'
        : spot.shoreType === 'pier' || spot.shoreType === 'harbor'
          ? 'boat-outline'
          : 'water-outline';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        shadows.soft,
        {
          backgroundColor: colors.surface,
          borderColor: colors.borderLight,
          opacity: pressed ? 0.96 : 1,
        },
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: colors.primarySoft }]}>
        <Ionicons name={shoreIcon} size={22} color={colors.primary} />
      </View>

      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
            {localName}
          </Text>
          {spot.distanceKm != null && (
            <Text style={[styles.distance, { color: colors.textMuted }]}>
              {formatDistance(spot.distanceKm, language)}
            </Text>
          )}
        </View>

        <Text style={[styles.meta, { color: colors.textSecondary }]} numberOfLines={1}>
          {spot.region} · {translateShoreType(spot.shoreType, t)}
        </Text>

        <View style={styles.chips}>
          <Chip label={translateDifficulty(spot.difficultyLevel, t)} tone="default" />
          {showWebBadge ? <Chip label={t('spot.fromWeb')} tone="web" /> : null}
          {spot.verificationStatus === 'demo' ? <Chip label={t('common.demo')} tone="demo" /> : null}
        </View>
      </View>

      <DirectionalIcon name="chevron-forward" size={18} color={colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { flex: 1, gap: 4 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  name: { ...typography.h3, flex: 1 },
  distance: { ...typography.caption },
  meta: { ...typography.bodySmall },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: 4 },
});
