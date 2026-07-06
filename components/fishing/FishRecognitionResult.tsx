import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/components/common/ThemeProvider';
import { Card } from '@/components/common/Button';
import { Chip } from '@/components/common/SectionCard';
import type { FishMatch, FishRecognitionResponse } from '@/lib/validation/schemas';
import { borderRadius, spacing } from '@/constants/theme';

interface Props {
  result: FishRecognitionResponse;
  onViewSpecies?: (speciesId: string) => void;
}

function MatchCard({
  match,
  isPrimary,
  onViewSpecies,
}: {
  match: FishMatch;
  isPrimary?: boolean;
  onViewSpecies?: (speciesId: string) => void;
}) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const router = useRouter();

  const handleSpeciesPress = () => {
    if (match.speciesId) {
      if (onViewSpecies) onViewSpecies(match.speciesId);
      else router.push(`/species/${match.speciesId}`);
    }
  };

  return (
    <Card
      style={StyleSheet.flatten([
        styles.matchCard,
        isPrimary ? { borderColor: colors.accent, borderWidth: 1.5 } : undefined,
      ])}
    >
      <View style={styles.matchHeader}>
        <View style={styles.nameBlock}>
          <Text style={[styles.fishName, { color: colors.text }]}>{match.name}</Text>
          {match.scientificName ? (
            <Text style={[styles.scientific, { color: colors.textMuted }]}>{match.scientificName}</Text>
          ) : null}
        </View>
        <View style={[styles.confidenceBadge, { backgroundColor: colors.accent + '22' }]}>
          <Text style={[styles.confidenceText, { color: colors.accent }]}>
            {match.confidence}%
          </Text>
        </View>
      </View>

      <Text style={[styles.description, { color: colors.textSecondary }]}>{match.description}</Text>

      {match.commonInIsrael !== undefined && (
        <View style={styles.chipRow}>
          <Chip
            label={
              match.commonInIsrael
                ? t('identify.commonInIsrael')
                : t('identify.uncommonInIsrael')
            }
            tone={match.commonInIsrael ? 'success' : 'default'}
          />
        </View>
      )}

      <InfoSection icon="location-outline" label={t('identify.habitat')} value={match.habitat} />
      <InfoSection icon="nutrition-outline" label={t('identify.bestBait')} value={match.bestBait} />
      <InfoSection icon="construct-outline" label={t('identify.techniques')} value={match.techniques} />

      {match.safetyWarning ? (
        <View style={[styles.warningBox, { backgroundColor: colors.error + '12', borderColor: colors.error }]}>
          <Ionicons name="warning" size={18} color={colors.error} />
          <Text style={[styles.warningText, { color: colors.error }]}>{match.safetyWarning}</Text>
        </View>
      ) : null}

      {match.speciesId ? (
        <Text style={[styles.speciesLink, { color: colors.primary }]} onPress={handleSpeciesPress}>
          {t('identify.viewSpeciesGuide')} →
        </Text>
      ) : null}
    </Card>
  );
}

function InfoSection({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.infoSection}>
      <View style={styles.infoLabelRow}>
        <Ionicons name={icon} size={16} color={colors.accent} />
        <Text style={[styles.infoLabel, { color: colors.text }]}>{label}</Text>
      </View>
      <Text style={[styles.infoValue, { color: colors.textSecondary }]}>{value}</Text>
    </View>
  );
}

export function FishRecognitionResult({ result, onViewSpecies }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();

  if (!result.primaryMatch) return null;

  return (
    <View style={styles.container}>
      {result.status === 'uncertain' && result.uncertainMessage ? (
        <View style={[styles.uncertainBanner, { backgroundColor: colors.warning + '18' }]}>
          <Ionicons name="help-circle" size={20} color={colors.warning} />
          <Text style={[styles.uncertainText, { color: colors.warning }]}>{result.uncertainMessage}</Text>
        </View>
      ) : null}

      <MatchCard match={result.primaryMatch} isPrimary onViewSpecies={onViewSpecies} />

      {result.alternativeMatches && result.alternativeMatches.length > 0 ? (
        <>
          <Text style={[styles.altTitle, { color: colors.textMuted }]}>{t('identify.otherPossibilities')}</Text>
          {result.alternativeMatches.map((match, index) => (
            <MatchCard key={`${match.name}-${index}`} match={match} onViewSpecies={onViewSpecies} />
          ))}
        </>
      ) : null}

      <View style={[styles.disclaimer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Ionicons name="information-circle-outline" size={18} color={colors.textMuted} />
        <Text style={[styles.disclaimerText, { color: colors.textMuted }]}>{t('identify.disclaimer')}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.md },
  uncertainBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  uncertainText: { flex: 1, fontSize: 14, fontWeight: '600', lineHeight: 20 },
  matchCard: { gap: spacing.sm },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  nameBlock: { flex: 1 },
  fishName: { fontSize: 22, fontWeight: '700' },
  scientific: { fontSize: 14, fontStyle: 'italic', marginTop: 2 },
  confidenceBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  confidenceText: { fontSize: 15, fontWeight: '700' },
  description: { fontSize: 15, lineHeight: 22 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  infoSection: { gap: 4, marginTop: spacing.xs },
  infoLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  infoLabel: { fontSize: 14, fontWeight: '600' },
  infoValue: { fontSize: 14, lineHeight: 20, paddingLeft: 22 },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    marginTop: spacing.xs,
  },
  warningText: { flex: 1, fontSize: 13, lineHeight: 18, fontWeight: '500' },
  speciesLink: { fontSize: 14, fontWeight: '600', marginTop: spacing.xs },
  altTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: spacing.sm,
  },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: StyleSheet.hairlineWidth,
    marginTop: spacing.sm,
  },
  disclaimerText: { flex: 1, fontSize: 12, lineHeight: 17 },
});
