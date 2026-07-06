import { View, Text, StyleSheet, Pressable, TextInput, Alert } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/components/common/ThemeProvider';
import { Button, Card } from '@/components/common/Button';
import { Chip } from '@/components/common/SectionCard';
import { saveWrongIdentificationReport } from '@/lib/fishRecognition/reportService';
import type { FishMatch, FishRecognitionResponse } from '@/lib/validation/schemas';
import { borderRadius, spacing } from '@/constants/theme';

interface Props {
  result: FishRecognitionResponse;
  imageUri?: string;
  language: 'en' | 'he';
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
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const router = useRouter();
  const lang = i18n.language === 'he' ? 'he' : 'en';

  const handleSpeciesPress = () => {
    if (match.speciesId) {
      if (onViewSpecies) onViewSpecies(match.speciesId);
      else router.push(`/species/${match.speciesId}`);
    }
  };

  const displayHe = match.nameHe ?? match.name;
  const displayEn = match.nameEn ?? match.name;

  return (
    <Card
      style={StyleSheet.flatten([
        styles.matchCard,
        isPrimary ? { borderColor: colors.accent, borderWidth: 1.5 } : undefined,
      ])}
    >
      <View style={styles.matchHeader}>
        <View style={styles.nameBlock}>
          <Text style={[styles.fishName, { color: colors.text }]}>
            {lang === 'he' ? displayHe : displayEn}
          </Text>
          {lang === 'he' && displayEn !== displayHe ? (
            <Text style={[styles.altName, { color: colors.textMuted }]}>{displayEn}</Text>
          ) : null}
          {match.scientificName ? (
            <Text style={[styles.scientific, { color: colors.textMuted }]}>{match.scientificName}</Text>
          ) : null}
          {match.familyHe || match.familyLatin ? (
            <Text style={[styles.family, { color: colors.textMuted }]}>
              {t('species.family')}: {match.familyHe}
              {match.familyLatin ? ` (${match.familyLatin})` : ''}
            </Text>
          ) : null}
        </View>
        <View style={[styles.confidenceBadge, { backgroundColor: colors.accent + '22' }]}>
          <Text style={[styles.confidenceText, { color: colors.accent }]}>{match.confidence}%</Text>
        </View>
      </View>

      {match.matchReason ? (
        <Text style={[styles.matchReason, { color: colors.textSecondary }]}>{match.matchReason}</Text>
      ) : null}

      <Text style={[styles.description, { color: colors.textSecondary }]}>{match.description}</Text>

      {match.keyIdentifyingSigns && match.keyIdentifyingSigns.length > 0 ? (
        <View style={styles.signsBlock}>
          <Text style={[styles.signsTitle, { color: colors.text }]}>{t('identify.keySigns')}</Text>
          {match.keyIdentifyingSigns.map((sign) => (
            <Text key={sign} style={[styles.signItem, { color: colors.textSecondary }]}>
              • {sign}
            </Text>
          ))}
        </View>
      ) : null}

      {match.identificationNotes && match.identificationNotes !== match.description ? (
        <InfoSection icon="eye-outline" label={t('identify.howToIdentify')} value={match.identificationNotes} />
      ) : null}

      {match.commonInIsrael !== undefined && (
        <View style={styles.chipRow}>
          <Chip
            label={
              match.commonInIsrael ? t('identify.commonInIsrael') : t('identify.uncommonInIsrael')
            }
            tone={match.commonInIsrael ? 'success' : 'default'}
          />
        </View>
      )}

      {match.confusedWith && match.confusedWith.length > 0 ? (
        <View style={styles.confusedBlock}>
          <Text style={[styles.signsTitle, { color: colors.text }]}>{t('identify.confusedWith')}</Text>
          <Text style={{ color: colors.textSecondary }}>
            {match.confusedWith.map((c) => c.name).join(', ')}
          </Text>
        </View>
      ) : null}

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

export function FishRecognitionResult({ result, imageUri, language, onViewSpecies }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [reportOpen, setReportOpen] = useState(false);
  const [correctName, setCorrectName] = useState('');
  const [reportNotes, setReportNotes] = useState('');
  const [reporting, setReporting] = useState(false);

  if (!result.primaryMatch) return null;

  const submitReport = async () => {
    if (!imageUri) return;
    setReporting(true);
    try {
      await saveWrongIdentificationReport({
        imageUri,
        language,
        aiResult: {
          status: result.status,
          region: result.region ?? 'mediterranean_israel',
          primaryMatch: result.primaryMatch
            ? {
                speciesId: result.primaryMatch.speciesId ?? '',
                name: result.primaryMatch.name,
                nameHe: result.primaryMatch.nameHe ?? result.primaryMatch.name,
                nameEn: result.primaryMatch.nameEn ?? result.primaryMatch.name,
                scientificName: result.primaryMatch.scientificName ?? '',
                confidence: result.primaryMatch.confidence,
                description: result.primaryMatch.description,
                identificationNotes: result.primaryMatch.identificationNotes ?? result.primaryMatch.description,
                matchReason: result.primaryMatch.matchReason ?? '',
                keyIdentifyingSigns: result.primaryMatch.keyIdentifyingSigns ?? [],
                confusedWith: result.primaryMatch.confusedWith ?? [],
                commonInIsrael: result.primaryMatch.commonInIsrael ?? false,
                habitat: result.primaryMatch.habitat,
                bestBait: result.primaryMatch.bestBait,
                techniques: result.primaryMatch.techniques,
                safetyWarning: result.primaryMatch.safetyWarning,
              }
            : undefined,
          alternativeMatches: result.alternativeMatches?.map((m) => ({
            speciesId: m.speciesId ?? '',
            name: m.name,
            nameHe: m.nameHe ?? m.name,
            nameEn: m.nameEn ?? m.name,
            scientificName: m.scientificName ?? '',
            confidence: m.confidence,
            description: m.description,
            identificationNotes: m.identificationNotes ?? m.description,
            matchReason: m.matchReason ?? '',
            keyIdentifyingSigns: m.keyIdentifyingSigns ?? [],
            confusedWith: m.confusedWith ?? [],
            commonInIsrael: m.commonInIsrael ?? false,
            habitat: m.habitat,
            bestBait: m.bestBait,
            techniques: m.techniques,
          })),
          uncertainMessage: result.uncertainMessage,
          imageQuality: result.imageQuality,
        },
        correctFishName: correctName,
        notes: reportNotes,
      });
      Alert.alert(t('identify.reportThanks'));
      setReportOpen(false);
      setCorrectName('');
      setReportNotes('');
    } finally {
      setReporting(false);
    }
  };

  return (
    <View style={styles.container}>
      {result.imageQuality && result.imageQuality.score < 70 ? (
        <View style={[styles.qualityBanner, { backgroundColor: colors.warning + '18' }]}>
          <Ionicons name="image-outline" size={20} color={colors.warning} />
          <Text style={[styles.uncertainText, { color: colors.warning }]}>
            {result.imageQuality.recommendation ?? t('identify.qualityWarning')}
          </Text>
        </View>
      ) : null}

      {result.status === 'uncertain' && result.uncertainMessage ? (
        <View style={[styles.uncertainBanner, { backgroundColor: colors.warning + '18' }]}>
          <Ionicons name="help-circle" size={20} color={colors.warning} />
          <Text style={[styles.uncertainText, { color: colors.warning }]}>{result.uncertainMessage}</Text>
        </View>
      ) : null}

      <Text style={[styles.bestMatchLabel, { color: colors.text }]}>{t('identify.bestMatch')}</Text>
      <MatchCard match={result.primaryMatch} isPrimary onViewSpecies={onViewSpecies} />

      {result.alternativeMatches && result.alternativeMatches.length > 0 ? (
        <>
          <Text style={[styles.altTitle, { color: colors.textMuted }]}>{t('identify.otherPossibilities')}</Text>
          {result.alternativeMatches.map((match, index) => (
            <MatchCard key={`${match.speciesId ?? match.name}-${index}`} match={match} onViewSpecies={onViewSpecies} />
          ))}
        </>
      ) : null}

      {imageUri ? (
        <View style={styles.reportSection}>
          {!reportOpen ? (
            <Pressable onPress={() => setReportOpen(true)} style={styles.reportButton}>
              <Ionicons name="flag-outline" size={18} color={colors.textSecondary} />
              <Text style={{ color: colors.textSecondary }}>{t('identify.reportWrong')}</Text>
            </Pressable>
          ) : (
            <Card style={styles.reportForm}>
              <Text style={[styles.signsTitle, { color: colors.text }]}>{t('identify.reportWrong')}</Text>
              <TextInput
                style={[styles.reportInput, { borderColor: colors.border, color: colors.text }]}
                placeholder={t('identify.correctNamePlaceholder')}
                placeholderTextColor={colors.textMuted}
                value={correctName}
                onChangeText={setCorrectName}
              />
              <TextInput
                style={[styles.reportInput, { borderColor: colors.border, color: colors.text }]}
                placeholder={t('identify.reportNotesPlaceholder')}
                placeholderTextColor={colors.textMuted}
                value={reportNotes}
                onChangeText={setReportNotes}
                multiline
              />
              <View style={styles.reportActions}>
                <Button
                  title={reporting ? t('common.loading') : t('common.save')}
                  onPress={submitReport}
                  disabled={reporting}
                />
                <Button title={t('common.cancel')} onPress={() => setReportOpen(false)} variant="ghost" />
              </View>
            </Card>
          )}
        </View>
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
  qualityBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  uncertainBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  uncertainText: { flex: 1, fontSize: 14, fontWeight: '600', lineHeight: 20 },
  bestMatchLabel: { fontSize: 16, fontWeight: '700' },
  matchCard: { gap: spacing.sm },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  nameBlock: { flex: 1 },
  fishName: { fontSize: 22, fontWeight: '700' },
  altName: { fontSize: 15, marginTop: 2 },
  scientific: { fontSize: 14, fontStyle: 'italic', marginTop: 2 },
  family: { fontSize: 13, marginTop: 4 },
  confidenceBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  confidenceText: { fontSize: 15, fontWeight: '700' },
  matchReason: { fontSize: 14, fontWeight: '600', lineHeight: 20 },
  description: { fontSize: 15, lineHeight: 22 },
  signsBlock: { gap: 4 },
  signsTitle: { fontSize: 14, fontWeight: '600' },
  signItem: { fontSize: 14, lineHeight: 20, paddingLeft: 4 },
  confusedBlock: { gap: 4 },
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
  reportSection: { marginTop: spacing.sm },
  reportButton: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm },
  reportForm: { gap: spacing.sm },
  reportInput: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    fontSize: 15,
  },
  reportActions: { gap: spacing.xs },
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
