import { ScrollView, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '@/components/common/ThemeProvider';
import { LoadingState } from '@/components/common/StateViews';
import { getSpeciesById } from '@/features/spots/spotService';
import { spacing } from '@/constants/theme';

function pickLocalized(
  language: string,
  localized?: { en: string; he: string },
  fallback?: string,
): string | undefined {
  if (localized) return language === 'he' ? localized.he : localized.en;
  return fallback;
}

export default function SpeciesDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();

  const { data: species, isLoading } = useQuery({
    queryKey: ['species', id],
    queryFn: () => getSpeciesById(id!),
    enabled: !!id,
  });

  if (isLoading) return <LoadingState />;
  if (!species) return null;

  const lang = i18n.language;
  const name = species.localizedNames?.[lang] ?? species.commonName;
  const content = species.localizedContent;
  const description = pickLocalized(lang, content?.description, species.description);
  const habitat = pickLocalized(lang, content?.habitat, species.habitat);
  const handlingNotes = pickLocalized(lang, content?.handlingNotes, species.handlingNotes);
  const consumptionWarning = pickLocalized(lang, content?.consumptionWarning, species.consumptionWarning);
  const identificationNotes = pickLocalized(lang, content?.identificationNotes, species.identificationNotes);

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>{name}</Text>
      {species.scientificName && (
        <Text style={[styles.scientific, { color: colors.textMuted }]}>{species.scientificName}</Text>
      )}
      {description && (
        <Text style={{ color: colors.textSecondary, marginTop: spacing.md, lineHeight: 22 }}>{description}</Text>
      )}
      {habitat && (
        <>
          <Text style={[styles.section, { color: colors.text }]}>{t('species.habitat')}</Text>
          <Text style={{ color: colors.textSecondary, lineHeight: 22 }}>{habitat}</Text>
        </>
      )}
      {identificationNotes && (
        <>
          <Text style={[styles.section, { color: colors.text }]}>{t('species.identification')}</Text>
          <Text style={{ color: colors.textSecondary, lineHeight: 22 }}>{identificationNotes}</Text>
        </>
      )}
      {handlingNotes && (
        <Text style={{ color: colors.warning, marginTop: spacing.md, lineHeight: 22 }}>{handlingNotes}</Text>
      )}
      {consumptionWarning && (
        <Text style={{ color: colors.error, marginTop: spacing.sm, lineHeight: 22 }}>{consumptionWarning}</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg },
  title: { fontSize: 26, fontWeight: '700' },
  scientific: { fontSize: 16, fontStyle: 'italic' },
  section: { fontSize: 18, fontWeight: '600', marginTop: spacing.lg, marginBottom: spacing.sm },
});
