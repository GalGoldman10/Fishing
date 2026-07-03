import { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { useTheme } from '@/components/common/ThemeProvider';
import { Screen } from '@/components/common/Screen';
import { EmptyState, ErrorState } from '@/components/common/StateViews';
import { SpotCard } from '@/components/fishing/SpotCard';
import { FishingMap } from '@/components/map/FishingMap';
import { MarineConditionsCard } from '@/components/marine/MarineConditionsCard';
import { MarineTimeline } from '@/components/marine/MarineTimeline';
import { FishingMethodsCard } from '@/components/marine/FishingMethodsCard';
import { SEA_LEVEL_COLORS, translateSeaLevel, translateSuitability } from '@/components/marine/marineUi';
import { useMarineForecast } from '@/features/marine/useMarineForecast';
import { getNearbySpots, getSpotById } from '@/features/spots/spotService';
import { useFavoritesStore } from '@/features/spots/favoritesService';
import { getLocalizedText } from '@/lib/localization/localizedText';
import { formatNumber, formatTime } from '@/lib/localization/format';
import { haversineKm } from '@/lib/utils/distance';
import { borderRadius, spacing, typography } from '@/constants/theme';
import type { FishingSpotSummary } from '@/types/fishing';

const DEFAULT_CENTER = { latitude: 32.0853, longitude: 34.7715 };

function Skeleton({ height }: { height: number }) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        height,
        borderRadius: borderRadius.lg,
        backgroundColor: colors.surfaceSecondary,
        opacity: 0.6,
      }}
    />
  );
}

export default function HomeScreen() {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWide = width >= 900;

  const [aiQuestion, setAiQuestion] = useState('');
  const [search, setSearch] = useState('');
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [selectedSpotId, setSelectedSpotId] = useState<string | null>(null);

  const center = userLocation ?? DEFAULT_CENTER;

  const {
    data: spots,
    isLoading: spotsLoading,
    isError: spotsError,
    refetch: refetchSpots,
  } = useQuery({
    queryKey: ['nearbySpots', center.latitude, center.longitude],
    queryFn: () => getNearbySpots(center.latitude, center.longitude, 400),
  });

  const filteredSpots = useMemo(() => {
    if (!spots) return [];
    if (!search.trim()) return spots;
    const q = search.trim().toLowerCase();
    return spots.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.region?.toLowerCase().includes(q) ||
        s.localizedNames?.he?.includes(search.trim()),
    );
  }, [spots, search]);

  const selectedSpot: FishingSpotSummary | null = useMemo(() => {
    if (!spots?.length) return null;
    if (selectedSpotId) return spots.find((s) => s.id === selectedSpotId) ?? spots[0];
    if (userLocation) {
      return [...spots].sort(
        (a, b) =>
          haversineKm(userLocation.latitude, userLocation.longitude, a.latitude, a.longitude) -
          haversineKm(userLocation.latitude, userLocation.longitude, b.latitude, b.longitude),
      )[0];
    }
    return spots[0];
  }, [spots, selectedSpotId, userLocation]);

  const marine = useMarineForecast(selectedSpot);

  // Distance to the auto-selected nearest spot (not shown when the user tapped a pin)
  const nearestDistanceKm = useMemo(() => {
    if (!userLocation || !selectedSpot || selectedSpotId) return null;
    return haversineKm(
      userLocation.latitude,
      userLocation.longitude,
      selectedSpot.latitude,
      selectedSpot.longitude,
    );
  }, [userLocation, selectedSpot, selectedSpotId]);

  const { data: selectedDetails } = useQuery({
    queryKey: ['spotDetails', selectedSpot?.id],
    enabled: !!selectedSpot,
    queryFn: () => getSpotById(selectedSpot!.id),
  });

  const favoriteIds = useFavoritesStore((s) => s.favoriteIds);
  const savedSpots = useMemo(
    () => (spots ?? []).filter((s) => favoriteIds.has(s.id)),
    [spots, favoriteIds],
  );

  const bestFishingTime = useMemo(() => {
    const hours = marine.data?.hourly?.slice(0, 24);
    if (!hours?.length) return null;
    const best = hours.reduce((acc, h) => (h.fishingSuitabilityScore > acc.fishingSuitabilityScore ? h : acc));
    return best.time;
  }, [marine.data]);

  const spotName = useCallback(
    (spot: FishingSpotSummary) => spot.localizedNames?.[i18n.language === 'he' ? 'he' : 'en'] ?? spot.name,
    [i18n.language],
  );

  const useMyLocation = useCallback(async () => {
    setLocating(true);
    setLocationError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError(t('marineErrors.locationDenied'));
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      setUserLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
      setSelectedSpotId(null);
      void refetchSpots();
    } catch {
      setLocationError(t('errors.locationUnavailable'));
    } finally {
      setLocating(false);
    }
  }, [t, refetchSpots]);

  // On load, locate the user so sea conditions show the closest beach automatically.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLocating(true);
        const existing = await Location.getForegroundPermissionsAsync();
        const status = existing.granted
          ? existing.status
          : (await Location.requestForegroundPermissionsAsync()).status;
        if (status !== 'granted' || cancelled) return;

        const lastKnown = await Location.getLastKnownPositionAsync();
        const loc = lastKnown ?? (await Location.getCurrentPositionAsync({}));
        if (cancelled || !loc) return;
        setUserLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
      } catch {
        // Silent: fall back to the default region until the user taps "Use my location"
      } finally {
        if (!cancelled) setLocating(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const askAi = useCallback(
    (question: string) => {
      if (!question.trim()) return;
      router.push({ pathname: '/chat', params: { q: question.trim() } });
    },
    [router],
  );

  const aiSuggestions = t('home.aiSuggestions', { returnObjects: true }) as string[];

  return (
    <Screen>
      {/* ---- Hero ---- */}
      <LinearGradient
        colors={['#062A42', '#0A4D68', '#0891B2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <View style={styles.heroBadge}>
          <Ionicons name="fish" size={14} color="#7DD3FC" />
          <Text style={styles.heroBadgeText}>{t('app.name')}</Text>
        </View>
        <Text style={styles.heroTitle}>{t('home.heroTitle')}</Text>
        <Text style={styles.heroSubtitle}>{t('home.heroDescription')}</Text>

        <View style={styles.heroInputWrap}>
          <Ionicons name="chatbubble-ellipses-outline" size={18} color="#94A3B8" />
          <TextInput
            style={styles.heroInput}
            placeholder={t('home.askPlaceholder')}
            placeholderTextColor="#94A3B8"
            value={aiQuestion}
            onChangeText={setAiQuestion}
            onSubmitEditing={() => askAi(aiQuestion)}
            returnKeyType="send"
          />
          <Pressable
            onPress={() => askAi(aiQuestion)}
            accessibilityLabel={t('home.askCta')}
            style={styles.heroSend}
          >
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </Pressable>
        </View>

        <View style={styles.heroActions}>
          <View style={[styles.heroInputWrap, styles.heroSearch]}>
            <Ionicons name="search" size={16} color="#94A3B8" />
            <TextInput
              style={styles.heroInput}
              placeholder={t('home.searchPlaceholder')}
              placeholderTextColor="#94A3B8"
              value={search}
              onChangeText={setSearch}
            />
          </View>
          <Pressable
            onPress={useMyLocation}
            disabled={locating}
            accessibilityLabel={t('marine.useMyLocation')}
            style={styles.heroLocationBtn}
          >
            <Ionicons name="locate" size={16} color="#062A42" />
            <Text style={styles.heroLocationText}>
              {locating ? t('marineLoading.findingLocation') : t('marine.useMyLocation')}
            </Text>
          </Pressable>
        </View>
        {locationError && <Text style={styles.heroError}>{locationError}</Text>}
      </LinearGradient>

      <View style={[styles.columns, isWide && styles.columnsWide]}>
        <View style={styles.column}>
          {/* ---- Current fishing conditions ---- */}
          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>{t('marine.seaConditions')}</Text>
          {selectedSpot && (
            <View style={styles.selectedRow}>
              <Ionicons name="location" size={16} color={colors.accent} />
              <View style={styles.selectedNameWrap}>
                <Text style={[styles.selectedName, { color: colors.text }]} numberOfLines={1}>
                  {spotName(selectedSpot)}
                </Text>
                {nearestDistanceKm != null && (
                  <Text style={[styles.nearestLabel, { color: colors.accent }]} numberOfLines={1}>
                    {nearestDistanceKm >= 1
                      ? t('marine.nearestBeachDistance', {
                          distance: formatNumber(Math.round(nearestDistanceKm), i18n.language),
                        })
                      : t('marine.nearestBeach')}
                  </Text>
                )}
              </View>
              {bestFishingTime && (
                <Text style={[styles.bestTime, { color: colors.textSecondary }]}>
                  {t('marine.bestTime', { time: formatTime(bestFishingTime, i18n.language) })}
                </Text>
              )}
            </View>
          )}
          <View style={styles.sectionBody}>
            {marine.isLoading ? (
              <View style={styles.skeletonStack}>
                <Text style={[styles.loadingText, { color: colors.textMuted }]}>
                  {t('marineLoading.conditions')}
                </Text>
                <Skeleton height={180} />
              </View>
            ) : marine.isError || !marine.data ? (
              <ErrorState message={t('marineErrors.unavailable')} onRetry={() => void marine.refetch()} />
            ) : (
              <View style={{ gap: spacing.md }}>
                <MarineConditionsCard
                  conditions={marine.data.current}
                  onRefresh={() => void marine.refresh()}
                  refreshing={marine.refreshing}
                />
                <FishingMethodsCard conditions={marine.data.current} />
                <MarineTimeline hourly={marine.data.hourly} />
              </View>
            )}
          </View>

          {/* ---- Map ---- */}
          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>{t('map.title')}</Text>
          <View style={[styles.mapWrap, { borderColor: colors.borderLight }]}>
            {spotsLoading ? (
              <View style={{ padding: spacing.md }}>
                <Text style={[styles.loadingText, { color: colors.textMuted }]}>
                  {t('marineLoading.spots')}
                </Text>
                <Skeleton height={280} />
              </View>
            ) : (
              <FishingMap
                spots={filteredSpots}
                userLocation={userLocation}
                language={i18n.language}
                selectedSpotId={selectedSpot?.id ?? null}
                clusteringEnabled
                onSpotPress={(spot) => setSelectedSpotId(spot.id)}
              />
            )}
          </View>

          {/* Selected spot preview under the map */}
          {selectedSpot && (
            <View style={[styles.previewCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
              <View style={styles.previewHeader}>
                <Text style={[styles.previewName, { color: colors.text }]} numberOfLines={1}>
                  {spotName(selectedSpot)}
                </Text>
                {marine.data && (
                  <View
                    style={[
                      styles.previewSeaBadge,
                      { backgroundColor: SEA_LEVEL_COLORS[marine.data.current.seaLevel].bg },
                    ]}
                  >
                    <Text
                      style={[
                        styles.previewSeaText,
                        { color: SEA_LEVEL_COLORS[marine.data.current.seaLevel].text },
                      ]}
                    >
                      {translateSeaLevel(marine.data.current.seaLevel, t)}
                    </Text>
                  </View>
                )}
              </View>
              {marine.data && (
                <Text style={[styles.previewMeta, { color: colors.textSecondary }]}>
                  {t('marine.fishingSuitability')}:{' '}
                  {formatNumber(marine.data.current.fishingSuitabilityScore, i18n.language)}/100 ·{' '}
                  {translateSuitability(marine.data.current.suitabilityLabel, t)}
                </Text>
              )}
              <Pressable
                onPress={() => router.push(`/spot/${selectedSpot.id}`)}
                style={[styles.previewCta, { backgroundColor: colors.primary }]}
              >
                <Text style={styles.previewCtaText}>{t('marine.viewFullDetails')}</Text>
              </Pressable>
            </View>
          )}
        </View>

        <View style={styles.column}>
          {/* ---- Recommended spots ---- */}
          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>{t('home.recommended')}</Text>
          {spotsLoading ? (
            <View style={[styles.skeletonStack, { paddingHorizontal: spacing.lg }]}>
              <Skeleton height={84} />
              <Skeleton height={84} />
              <Skeleton height={84} />
            </View>
          ) : spotsError ? (
            <ErrorState message={t('marineErrors.spotsUnavailable')} onRetry={() => void refetchSpots()} />
          ) : filteredSpots.length === 0 ? (
            <EmptyState title={t('marineErrors.locationNotFound')} />
          ) : (
            filteredSpots.slice(0, 6).map((spot) => (
              <SpotCard
                key={spot.id}
                spot={spot}
                language={i18n.language}
                onPress={() => router.push(`/spot/${spot.id}`)}
              />
            ))
          )}

          {/* ---- Fishing AI suggestions ---- */}
          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>{t('home.askFishGuide')}</Text>
          <View style={styles.suggestionsWrap}>
            {aiSuggestions.map((question) => (
              <Pressable
                key={question}
                onPress={() => askAi(question)}
                style={[styles.suggestion, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}
              >
                <Ionicons name="sparkles-outline" size={14} color={colors.accent} />
                <Text style={[styles.suggestionText, { color: colors.text }]}>{question}</Text>
              </Pressable>
            ))}
          </View>

          {/* ---- Saved locations ---- */}
          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>{t('home.savedSpots')}</Text>
          {savedSpots.length === 0 ? (
            <View style={[styles.emptySaved, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
              <Ionicons name="bookmark-outline" size={20} color={colors.textMuted} />
              <Text style={[styles.emptySavedText, { color: colors.textSecondary }]}>
                {t('home.noSavedSpots')}
              </Text>
            </View>
          ) : (
            savedSpots.map((spot) => (
              <SpotCard
                key={spot.id}
                spot={spot}
                language={i18n.language}
                onPress={() => router.push(`/spot/${spot.id}`)}
              />
            ))
          )}

          {/* ---- Regulations and safety ---- */}
          {selectedDetails?.regulations?.length ? (
            <>
              <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>{t('spot.regulations')}</Text>
              <View style={[styles.regCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
                {selectedDetails.regulations.slice(0, 2).map((reg) => (
                  <Text key={reg.id} style={[styles.regText, { color: colors.textSecondary }]}>
                    • {getLocalizedText(reg.localizedSummary ?? reg.summary, i18n.language)}
                  </Text>
                ))}
                <Text style={[styles.regDisclaimer, { color: colors.textMuted }]}>
                  {t('spot.regulationDisclaimer')}
                </Text>
              </View>
            </>
          ) : null}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    gap: spacing.md,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 5,
    borderRadius: borderRadius.full,
  },
  heroBadgeText: { color: '#E0F2FE', fontSize: 12, fontWeight: '700' },
  heroTitle: { color: '#fff', fontSize: 26, fontWeight: '800', lineHeight: 32, letterSpacing: -0.5 },
  heroSubtitle: { color: '#CBD5E1', fontSize: 15, lineHeight: 22 },
  heroInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    height: 48,
  },
  heroInput: { flex: 1, color: '#fff', fontSize: 15 },
  heroSend: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#0891B2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroActions: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  heroSearch: { flex: 1, minWidth: 180, height: 44 },
  heroLocationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#7DD3FC',
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    height: 44,
  },
  heroLocationText: { color: '#062A42', fontWeight: '700', fontSize: 13 },
  heroError: { color: '#FECACA', fontSize: 13 },
  columns: { gap: 0 },
  columnsWide: { flexDirection: 'row', paddingHorizontal: spacing.md },
  column: { flex: 1 },
  sectionLabel: {
    ...typography.overline,
    textTransform: 'uppercase',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  selectedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  selectedNameWrap: { flexShrink: 1 },
  selectedName: { ...typography.h3 },
  nearestLabel: { ...typography.caption, fontWeight: '600' },
  bestTime: { ...typography.caption, marginStart: 'auto' },
  sectionBody: { paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  skeletonStack: { gap: spacing.sm },
  loadingText: { ...typography.caption, marginBottom: spacing.xs },
  mapWrap: {
    height: 340,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    borderRadius: borderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  previewCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    gap: spacing.sm,
  },
  previewHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  previewName: { ...typography.h3, flexShrink: 1 },
  previewSeaBadge: { paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: borderRadius.full },
  previewSeaText: { ...typography.caption, fontWeight: '700' },
  previewMeta: { ...typography.bodySmall },
  previewCta: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  previewCtaText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  suggestionsWrap: { paddingHorizontal: spacing.lg, gap: spacing.xs, marginBottom: spacing.md },
  suggestion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  suggestionText: { ...typography.bodySmall, fontWeight: '500', flex: 1 },
  emptySaved: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  emptySavedText: { ...typography.bodySmall, flex: 1 },
  regCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: StyleSheet.hairlineWidth,
    gap: spacing.xs,
  },
  regText: { ...typography.bodySmall },
  regDisclaimer: { ...typography.caption, marginTop: spacing.xs },
});
