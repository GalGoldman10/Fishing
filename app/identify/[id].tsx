import { useEffect, useState } from 'react';
import { View, Image, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/components/common/ThemeProvider';
import { LoadingState } from '@/components/common/StateViews';
import { FishRecognitionResult } from '@/components/fishing/FishRecognitionResult';
import {
  getRecognitionById,
} from '@/features/fishRecognition/historyService';
import type { FishRecognitionHistoryEntry } from '@/features/fishRecognition/types';
import { borderRadius, spacing } from '@/constants/theme';

export default function FishIdentifyHistoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [entry, setEntry] = useState<FishRecognitionHistoryEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      if (!id) return;
      const found = await getRecognitionById(id);
      setEntry(found);
      setLoading(false);
    })();
  }, [id]);

  if (loading) return <LoadingState />;
  if (!entry) return <LoadingState message={t('identify.historyNotFound')} />;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Image source={{ uri: entry.imageUri }} style={styles.image} resizeMode="cover" />
      <View style={styles.resultWrap}>
        <FishRecognitionResult result={entry.result} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: spacing.xxl },
  image: { width: '100%', height: 240, borderRadius: borderRadius.lg, margin: spacing.md },
  resultWrap: { paddingHorizontal: spacing.md },
});
