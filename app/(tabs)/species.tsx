import { useState } from 'react';
import { FlatList, Text, StyleSheet, TextInput, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '@/components/common/ThemeProvider';
import { Card } from '@/components/common/Button';
import { LoadingState } from '@/components/common/StateViews';
import { searchSpecies } from '@/features/spots/spotService';
import { getLocalizedSpeciesText } from '@/lib/mock/speciesProfiles';
import { resolveLang } from '@/lib/localization/localizedText';
import { SpeciesSummary } from '@/types/fishing';
import { spacing, borderRadius } from '@/constants/theme';

export default function SpeciesScreen() {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const router = useRouter();
  const [query, setQuery] = useState('');

  const { data: species, isLoading } = useQuery({
    queryKey: ['species', query],
    queryFn: () => searchSpecies(query || undefined),
  });

  return (
    <FlatList
      style={{ backgroundColor: colors.background }}
      data={species}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={
        <TextInput
          style={[styles.search, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
          placeholder={t('common.search')}
          placeholderTextColor={colors.textMuted}
          value={query}
          onChangeText={setQuery}
        />
      }
      ListEmptyComponent={isLoading ? <LoadingState /> : null}
      renderItem={({ item }) => (
        <SpeciesCard species={item} language={i18n.language} onPress={() => router.push(`/species/${item.id}`)} />
      )}
      contentContainerStyle={{ padding: spacing.md, gap: spacing.sm }}
    />
  );
}

function SpeciesCard({
  species,
  language,
  onPress,
}: {
  species: SpeciesSummary;
  language: string;
  onPress: () => void;
}) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const lang = resolveLang(language);
  const localName = species.localizedNames?.[lang] ?? species.commonName;
  const habitat =
    getLocalizedSpeciesText(species.id, 'habitat', lang) ?? species.habitat;
  const familyLabel =
    lang === 'he'
      ? species.familyHe
      : species.familyLatin
        ? `${species.familyLatin.charAt(0)}${species.familyLatin.slice(1).toLowerCase()}`
        : undefined;

  return (
    <Pressable onPress={onPress}>
      <Card>
        <Text style={[styles.name, { color: colors.text }]}>{localName}</Text>
        {species.scientificName && (
          <Text style={{ color: colors.textMuted, fontStyle: 'italic' }}>{species.scientificName}</Text>
        )}
        {familyLabel && (
          <Text style={{ color: colors.textMuted, marginTop: spacing.xs }}>
            {t('species.family')}: {familyLabel}
          </Text>
        )}
        {habitat && <Text style={{ color: colors.textSecondary, marginTop: spacing.xs }}>{habitat}</Text>}
        {species.conservationStatus === 'vulnerable' && (
          <Text style={{ color: colors.warning, marginTop: spacing.xs }}>{t('species.protected')}</Text>
        )}
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  search: {
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    fontSize: 16,
  },
  name: { fontSize: 18, fontWeight: '600' },
});
