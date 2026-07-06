import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  Alert,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/components/common/ThemeProvider';
import { Button, Card } from '@/components/common/Button';
import { ErrorState, LoadingState } from '@/components/common/StateViews';
import { FishRecognitionLoading } from '@/components/fishing/FishRecognitionLoading';
import { FishImagePreview } from '@/components/fishing/FishImagePreview';
import { FishRecognitionResult } from '@/components/fishing/FishRecognitionResult';
import { identifyFish } from '@/features/fishRecognition/fishRecognitionService';
import { prepareImageForRecognition, type PreparedImage } from '@/features/fishRecognition/imageUtils';
import {
  getRecognitionHistory,
  saveRecognitionHistory,
} from '@/features/fishRecognition/historyService';
import type { FishRecognitionHistoryEntry } from '@/features/fishRecognition/types';
import { FishRecognitionError } from '@/features/fishRecognition/types';
import type { FishRecognitionResponse } from '@/lib/validation/schemas';
import { formatDateTime } from '@/lib/localization/format';
import { borderRadius, spacing } from '@/constants/theme';

type ScreenPhase = 'pick' | 'preview' | 'loading' | 'result' | 'error';

export default function FishIdentifyScreen() {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const router = useRouter();
  const language = (i18n.language === 'he' ? 'he' : 'en') as 'en' | 'he';

  const [phase, setPhase] = useState<ScreenPhase>('pick');
  const [selectedImage, setSelectedImage] = useState<PreparedImage | null>(null);
  const [isPreparing, setIsPreparing] = useState(false);
  const [result, setResult] = useState<FishRecognitionResponse | null>(null);
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [history, setHistory] = useState<FishRecognitionHistoryEntry[]>([]);

  const loadHistory = useCallback(async () => {
    const entries = await getRecognitionHistory();
    setHistory(entries);
  }, []);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  const requestGalleryPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(t('common.error'), t('identify.galleryPermission'));
      return false;
    }
    return true;
  };

  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(t('common.error'), t('identify.cameraPermission'));
      return false;
    }
    return true;
  };

  const applyPickedAsset = async (asset: ImagePicker.ImagePickerAsset) => {
    setIsPreparing(true);
    setResult(null);
    setErrorKey(null);
    try {
      const prepared = await prepareImageForRecognition(asset.uri, asset.width, asset.height);
      setSelectedImage(prepared);
      setPhase('preview');
    } catch {
      Alert.alert(t('common.error'), t('identify.prepareFailed'));
    } finally {
      setIsPreparing(false);
    }
  };

  const pickFromGallery = async () => {
    const ok = await requestGalleryPermission();
    if (!ok) return;
    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 1,
      exif: false,
    });
    if (!pickerResult.canceled && pickerResult.assets[0]) {
      await applyPickedAsset(pickerResult.assets[0]);
    }
  };

  const takePhoto = async () => {
    const ok = await requestCameraPermission();
    if (!ok) return;
    const pickerResult = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 1,
      exif: false,
    });
    if (!pickerResult.canceled && pickerResult.assets[0]) {
      await applyPickedAsset(pickerResult.assets[0]);
    }
  };

  const runIdentification = async () => {
    if (!selectedImage) return;
    setPhase('loading');
    setErrorKey(null);
    try {
      const identification = await identifyFish({
        imageUri: selectedImage.uri,
        imageWidth: selectedImage.width,
        imageHeight: selectedImage.height,
        language,
      });
      setResult(identification);
      await saveRecognitionHistory({
        imageUri: selectedImage.uri,
        imageWidth: selectedImage.width,
        imageHeight: selectedImage.height,
        language,
        result: identification,
      });
      await loadHistory();
      setPhase('result');
    } catch (err) {
      const key =
        err instanceof FishRecognitionError
          ? err.userMessageKey
          : 'identify.errors.apiFailed';
      setErrorKey(key);
      setPhase('error');
    }
  };

  const reset = () => {
    setSelectedImage(null);
    setResult(null);
    setErrorKey(null);
    setPhase('pick');
  };

  const openHistoryEntry = (entry: FishRecognitionHistoryEntry) => {
    router.push(`/identify/${entry.id}`);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient colors={['#062A42', '#0891B2']} style={styles.hero}>
        <Ionicons name="scan-circle" size={40} color="#fff" />
        <Text style={styles.heroTitle}>{t('identify.title')}</Text>
        <Text style={styles.heroSubtitle}>{t('identify.subtitle')}</Text>
      </LinearGradient>

      {phase === 'pick' && (
        <View style={styles.actions}>
          <Pressable
            style={[styles.actionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={pickFromGallery}
            accessibilityRole="button"
            accessibilityLabel={t('identify.uploadGallery')}
          >
            <View style={[styles.actionIcon, { backgroundColor: colors.primary + '15' }]}>
              <Ionicons name="images-outline" size={28} color={colors.primary} />
            </View>
            <Text style={[styles.actionTitle, { color: colors.text }]}>{t('identify.uploadGallery')}</Text>
            <Text style={[styles.actionDesc, { color: colors.textSecondary }]}>
              {t('identify.uploadGalleryDesc')}
            </Text>
          </Pressable>

          <Pressable
            style={[styles.actionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={takePhoto}
            accessibilityRole="button"
            accessibilityLabel={t('identify.takePhoto')}
          >
            <View style={[styles.actionIcon, { backgroundColor: colors.accent + '15' }]}>
              <Ionicons name="camera-outline" size={28} color={colors.accent} />
            </View>
            <Text style={[styles.actionTitle, { color: colors.text }]}>{t('identify.takePhoto')}</Text>
            <Text style={[styles.actionDesc, { color: colors.textSecondary }]}>
              {t('identify.takePhotoDesc')}
            </Text>
          </Pressable>
        </View>
      )}

      {isPreparing && <LoadingState message={t('identify.preparingImage')} />}

      {(phase === 'preview' || phase === 'loading' || phase === 'result' || phase === 'error') && selectedImage && (
        <Card style={styles.previewCard}>
          <FishImagePreview
            uri={selectedImage.uri}
            width={selectedImage.width}
            height={selectedImage.height}
          />
          {phase === 'preview' && (
            <View style={styles.previewActions}>
              <Button title={t('identify.identifyButton')} onPress={runIdentification} />
              <Button title={t('identify.chooseAnother')} onPress={reset} variant="outline" />
            </View>
          )}
          {phase === 'loading' && <FishRecognitionLoading />}
          {phase === 'error' && errorKey && (
            <View style={styles.errorWrap}>
              <ErrorState message={t(errorKey)} onRetry={runIdentification} />
              <Button title={t('identify.chooseAnother')} onPress={reset} variant="ghost" />
            </View>
          )}
        </Card>
      )}

      {phase === 'result' && result && (
        <View style={styles.resultSection}>
          <FishRecognitionResult result={result} />
          <Button title={t('identify.identifyAnother')} onPress={reset} variant="outline" />
        </View>
      )}

      {history.length > 0 && (
        <View style={styles.historySection}>
          <Text style={[styles.historyTitle, { color: colors.text }]}>{t('identify.historyTitle')}</Text>
          {history.map((entry) => {
            const name =
              entry.result.primaryMatch?.name ??
              (entry.language === 'he' ? 'לא זוהה' : 'Unidentified');
            return (
              <Pressable
                key={entry.id}
                onPress={() => openHistoryEntry(entry)}
                style={[styles.historyItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <Image
                  source={{ uri: entry.imageUri }}
                  style={styles.historyThumb}
                  resizeMode="cover"
                />
                <View style={styles.historyMeta}>
                  <Text style={[styles.historyName, { color: colors.text }]} numberOfLines={1}>
                    {name}
                  </Text>
                  <Text style={[styles.historyDate, { color: colors.textMuted }]}>
                    {formatDateTime(entry.identifiedAt, entry.language)}
                  </Text>
                  {entry.result.primaryMatch ? (
                    <Text style={[styles.historyConfidence, { color: colors.accent }]}>
                      {entry.result.primaryMatch.confidence}%
                    </Text>
                  ) : null}
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
              </Pressable>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: spacing.xxl },
  hero: {
    padding: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  heroTitle: { color: '#fff', fontSize: 24, fontWeight: '700', textAlign: 'center' },
  heroSubtitle: { color: 'rgba(255,255,255,0.85)', fontSize: 15, textAlign: 'center', lineHeight: 22 },
  actions: { padding: spacing.md, gap: spacing.md },
  actionCard: {
    borderRadius: borderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  actionIcon: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTitle: { fontSize: 18, fontWeight: '600' },
  actionDesc: { fontSize: 14, lineHeight: 20 },
  previewCard: { marginHorizontal: spacing.md, overflow: 'hidden', padding: 0 },
  previewActions: { padding: spacing.md, gap: spacing.sm },
  errorWrap: { padding: spacing.md, gap: spacing.sm },
  resultSection: { paddingHorizontal: spacing.md, gap: spacing.md },
  historySection: { padding: spacing.md, gap: spacing.sm, marginTop: spacing.md },
  historyTitle: { fontSize: 18, fontWeight: '600', marginBottom: spacing.xs },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  historyThumb: { width: 56, height: 56, borderRadius: borderRadius.sm },
  historyMeta: { flex: 1, gap: 2 },
  historyName: { fontSize: 16, fontWeight: '600' },
  historyDate: { fontSize: 12 },
  historyConfidence: { fontSize: 12, fontWeight: '600' },
});
