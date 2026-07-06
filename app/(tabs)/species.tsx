import { useState } from 'react';
import { FlatList, Text, StyleSheet, Pressable, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '@/components/common/ThemeProvider';
import { Card } from '@/components/common/Button';
import { LoadingState } from '@/components/common/StateViews';
import { searchSpecies } from '@/features/spots/spotService';
import { getLocalizedSpeciesText } from '@/lib/mock/speciesProfiles';
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
        <>
          <FishRecognitionCard onPress={() => router.push('/identify')} />
          <TextInput
            style={[styles.search, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
            placeholder={t('common.search')}
            placeholderTextColor={colors.textMuted}
            value={query}
            onChangeText={setQuery}
          />
        </>
      }
      ListEmptyComponent={isLoading ? <LoadingState /> : null}
      renderItem={({ item }) => (
        <SpeciesCard species={item} language={i18n.language} onPress={() => router.push(`/species/${item.id}`)} />
      )}
      contentContainerStyle={{ padding: spacing.md, gap: spacing.sm }}
    />
  );
}

function FishRecognitionCard({ onPress }: { onPress: () => void }) {
  const { t } = useTranslation();
  return (
    <Pressable onPress={onPress} style={styles.recognitionWrap} accessibilityRole="button">
      <LinearGradient colors={['#062A42', '#0891B2']} style={styles.recognitionCard}>
        <View style={styles.recognitionIcon}>
          <Ionicons name="scan-circle" size={32} color="#fff" />
        </View>
        <View style={styles.recognitionText}>
          <Text style={styles.recognitionTitle}>{t('identify.title')}</Text>
          <Text style={styles.recognitionDesc}>{t('identify.cardDesc')}</Text>
        </View>
        <Ionicons name="chevron-forward" size={22} color="rgba(255,255,255,0.8)" />
      </LinearGradient>
    </Pressable>
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
  const localName = species.localizedNames?.[language] ?? species.commonName;
  const habitat =
    getLocalizedSpeciesText(species.id, 'habitat', language) ?? species.habitat;

  return (
    <Pressable onPress={onPress}>
      <Card>
        <Text style={[styles.name, { color: colors.text }]}>{localName}</Text>
        {species.scientificName && (
          <Text style={{ color: colors.textMuted, fontStyle: 'italic' }}>{species.scientificName}</Text>
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
  recognitionWrap: { marginBottom: spacing.md },
  recognitionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  recognitionIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recognitionText: { flex: 1, gap: 4 },
  recognitionTitle: { color: '#fff', fontSize: 17, fontWeight: '700' },
  recognitionDesc: { color: 'rgba(255,255,255,0.85)', fontSize: 13, lineHeight: 18 },
  search: {
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    fontSize: 16,
  },
  name: { fontSize: 18, fontWeight: '600' },
});
