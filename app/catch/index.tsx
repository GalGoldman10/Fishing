import { useEffect } from 'react';
import { FlatList, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/components/common/ThemeProvider';
import { Button } from '@/components/common/Button';
import { loadCatches, useCatchStore } from '@/features/catches/catchService';
import { formatDate } from '@/lib/localization/format';
import { spacing } from '@/constants/theme';

export default function CatchLogScreen() {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const router = useRouter();
  const catches = useCatchStore((s) => s.catches);

  useEffect(() => {
    void loadCatches();
  }, []);

  return (
    <FlatList
      style={{ backgroundColor: colors.background }}
      data={catches}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={
        <Button
          title={t('catch.newCatch')}
          onPress={() => router.push('/catch/new')}
          style={{ margin: spacing.md }}
        />
      }
      ListEmptyComponent={
        <Text style={[styles.empty, { color: colors.textMuted }]}>{t('catch.empty')}</Text>
      }
      renderItem={({ item }) => (
        <Pressable style={[styles.item, { backgroundColor: colors.surface }]}>
          <Text style={[styles.species, { color: colors.text }]}>{item.speciesName ?? t('common.unknown')}</Text>
          <Text style={{ color: colors.textSecondary }}>
            {formatDate(item.caughtAt, i18n.language)} · {item.released ? t('catch.released') : t('catch.kept')}
          </Text>
        </Pressable>
      )}
      contentContainerStyle={{ padding: spacing.md }}
    />
  );
}

const styles = StyleSheet.create({
  empty: { textAlign: 'center', padding: spacing.xl },
  item: { padding: spacing.md, borderRadius: 12, marginBottom: spacing.sm },
  species: { fontSize: 16, fontWeight: '600' },
});
