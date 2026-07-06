import { ScrollView, Text, StyleSheet, Linking, Pressable } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '@/components/common/ThemeProvider';
import { LoadingState } from '@/components/common/StateViews';
import { getSpeciesById } from '@/features/spots/spotService';
import { resolveLang } from '@/lib/localization/localizedText';
import { spacing } from '@/constants/theme';

function pickLocalized(
  language: string,
  localized?: { en: string; he: string },
  fallback?: string,
): string | undefined {
  if (localized) return localized[resolveLang(language)];
  return fallback;
}

function Section({ title, body, colors }: { title: string; body?: string; colors: ReturnType<typeof useTheme>['colors'] }) {
  if (!body || body.trim() === '' || body.startsWith('לא צוין') || body.startsWith('Not specified')) return null;
  return (
    <>
      <Text style={[styles.section, { color: colors.text }]}>{title}</Text>
      <Text style={{ color: colors.textSecondary, lineHeight: 22 }}>{body}</Text>
    </>
  );
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

  const lang = resolveLang(i18n.language);
  const name = species.localizedNames?.[lang] ?? species.commonName;
  const content = species.localizedContent;
  const description = pickLocalized(lang, content?.description, species.description);
  const habitat = pickLocalized(lang, content?.habitat, species.habitat);
  const handlingNotes = pickLocalized(lang, content?.handlingNotes, species.handlingNotes);
  const cookingMethods = pickLocalized(lang, content?.cookingMethods, species.consumptionWarning);
  const identificationNotes = pickLocalized(lang, content?.identificationNotes, species.identificationNotes);
  const diet = pickLocalized(lang, content?.diet);
  const sizeSeason = pickLocalized(lang, content?.sizeSeason);
  const reproduction = pickLocalized(lang, content?.reproduction);
  const aliases = content?.aliases?.filter((alias) => alias !== name);
  const familyLine =
    content?.familyHe && content?.familyLatin
      ? `${content.familyHe} (${content.familyLatin})`
      : content?.familyHe;

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>{name}</Text>
      {species.scientificName && (
        <Text style={[styles.scientific, { color: colors.textMuted }]}>{species.scientificName}</Text>
      )}
      {familyLine && (
        <Text style={{ color: colors.textMuted, marginTop: spacing.xs }}>
          {t('species.family')}: {familyLine}
        </Text>
      )}
      {aliases && aliases.length > 0 && (
        <Text style={{ color: colors.textMuted, marginTop: spacing.xs }}>
          {t('species.aliases')}: {aliases.join(', ')}
        </Text>
      )}
      {description && (
        <Text style={{ color: colors.textSecondary, marginTop: spacing.md, lineHeight: 22 }}>{description}</Text>
      )}
      <Section title={t('species.habitat')} body={habitat} colors={colors} />
      <Section title={t('species.identification')} body={identificationNotes} colors={colors} />
      <Section title={t('species.diet')} body={diet} colors={colors} />
      <Section title={t('species.sizeSeason')} body={sizeSeason} colors={colors} />
      <Section title={t('species.reproduction')} body={reproduction} colors={colors} />
      <Section title={t('species.cooking')} body={cookingMethods} colors={colors} />
      {handlingNotes && (
        <Text style={{ color: colors.warning, marginTop: spacing.md, lineHeight: 22 }}>{handlingNotes}</Text>
      )}
      {species.conservationStatus === 'vulnerable' && (
        <Text style={{ color: colors.warning, marginTop: spacing.md, lineHeight: 22 }}>{t('species.protected')}</Text>
      )}
      {content?.sourceUrl && (
        <Pressable onPress={() => void Linking.openURL(content.sourceUrl!)} style={{ marginTop: spacing.lg }}>
          <Text style={{ color: colors.accent, textDecorationLine: 'underline' }}>{t('species.source')}</Text>
        </Pressable>
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
