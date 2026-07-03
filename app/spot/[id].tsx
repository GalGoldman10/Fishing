import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Linking, Pressable, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/components/common/ThemeProvider';
import { Screen } from '@/components/common/Screen';
import { SectionCard, Chip, InfoRow } from '@/components/common/SectionCard';
import { LoadingState, ErrorState } from '@/components/common/StateViews';
import { MarineConditionsCard } from '@/components/marine/MarineConditionsCard';
import { MarineTimeline } from '@/components/marine/MarineTimeline';
import { FishingMethodsCard } from '@/components/marine/FishingMethodsCard';
import { useMarineForecast } from '@/features/marine/useMarineForecast';
import { getSpotById } from '@/features/spots/spotService';
import { submitPinReport } from '@/features/spots/pinReportService';
import { fetchWebPlaceInfo } from '@/features/spots/webEnrichmentService';
import {
  translateAccessType,
  translateDifficulty,
  translateFeatureType,
  translateLikelihood,
  translateShoreType,
} from '@/lib/localization/labels';
import { formatDateTime } from '@/lib/localization/format';
import { parseCoordinate, isValidCoordinates } from '@/lib/utils/coordinates';
import { getBeachProfile } from '@/lib/mock/beachProfiles';
import { borderRadius, spacing, typography } from '@/constants/theme';

function PinReportForm({
  spotId,
  latitude,
  longitude,
}: {
  spotId: string;
  latitude: number;
  longitude: number;
}) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [explanation, setExplanation] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const submit = async () => {
    const parsedLat = parseCoordinate(lat);
    const parsedLng = parseCoordinate(lng);
    if (parsedLat === undefined || parsedLng === undefined || !isValidCoordinates(parsedLat, parsedLng)) {
      setStatus('error');
      return;
    }
    setStatus('sending');
    try {
      await submitPinReport({
        spotId,
        currentLatitude: latitude,
        currentLongitude: longitude,
        suggestedLatitude: parsedLat,
        suggestedLongitude: parsedLng,
        explanation: explanation.trim() || undefined,
      });
      setStatus('sent');
    } catch {
      setStatus('error');
    }
  };

  if (status === 'sent') {
    return (
      <Text style={[pinStyles.sentText, { color: colors.success }]}>{t('pinReport.sent')}</Text>
    );
  }

  if (!open) {
    return (
      <Pressable onPress={() => setOpen(true)} style={pinStyles.openBtn}>
        <Ionicons name="flag-outline" size={15} color={colors.warning} />
        <Text style={[pinStyles.openText, { color: colors.warning }]}>{t('pinReport.reportIncorrect')}</Text>
      </Pressable>
    );
  }

  return (
    <View style={pinStyles.form}>
      <Text style={[pinStyles.label, { color: colors.textSecondary }]}>
        {t('pinReport.currentCoordinates', { lat: latitude.toFixed(5), lng: longitude.toFixed(5) })}
      </Text>
      <View style={pinStyles.row}>
        <TextInput
          style={[pinStyles.input, { color: colors.text, borderColor: colors.border }]}
          placeholder={t('pinReport.suggestedLatitude')}
          placeholderTextColor={colors.textMuted}
          value={lat}
          onChangeText={setLat}
          keyboardType="numbers-and-punctuation"
        />
        <TextInput
          style={[pinStyles.input, { color: colors.text, borderColor: colors.border }]}
          placeholder={t('pinReport.suggestedLongitude')}
          placeholderTextColor={colors.textMuted}
          value={lng}
          onChangeText={setLng}
          keyboardType="numbers-and-punctuation"
        />
      </View>
      <TextInput
        style={[pinStyles.input, { color: colors.text, borderColor: colors.border }]}
        placeholder={t('pinReport.explanation')}
        placeholderTextColor={colors.textMuted}
        value={explanation}
        onChangeText={setExplanation}
      />
      {status === 'error' && (
        <Text style={[pinStyles.errorText, { color: colors.error }]}>{t('marineErrors.invalidCoordinates')}</Text>
      )}
      <Pressable
        onPress={submit}
        disabled={status === 'sending'}
        style={[pinStyles.submitBtn, { backgroundColor: colors.primary }]}
      >
        <Text style={pinStyles.submitText}>
          {status === 'sending' ? t('common.loading') : t('pinReport.submit')}
        </Text>
      </Pressable>
    </View>
  );
}

const pinStyles = StyleSheet.create({
  openBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing.sm },
  openText: { ...typography.bodySmall, fontWeight: '600' },
  form: { gap: spacing.sm, marginTop: spacing.sm },
  label: { ...typography.caption },
  row: { flexDirection: 'row', gap: spacing.sm },
  input: {
    flex: 1,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    fontSize: 14,
  },
  errorText: { ...typography.caption },
  submitBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  submitText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  sentText: { ...typography.bodySmall, fontWeight: '600', marginTop: spacing.sm },
});

export default function SpotDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();

  const { data: spot, isLoading, error, refetch } = useQuery({
    queryKey: ['spot', id],
    queryFn: () => getSpotById(id!),
    enabled: !!id,
  });

  const { data: webInfo, isLoading: webLoading } = useQuery({
    queryKey: ['webInfo', id, spot?.latitude, spot?.longitude, i18n.language],
    queryFn: () =>
      fetchWebPlaceInfo(spot!.latitude, spot!.longitude, spot!.name, i18n.language),
    enabled: !!spot,
    staleTime: 1000 * 60 * 60,
  });

  // Marine forecast uses the spot's dedicated sea coordinate, not the pin/parking.
  const marine = useMarineForecast(spot ?? null);

  if (isLoading) return <LoadingState />;
  if (error || !spot) return <ErrorState message={t('errors.spotNotFound')} onRetry={() => void refetch()} />;

  const localName = spot.localizedNames?.[i18n.language] ?? spot.name;
  const beachProfile = getBeachProfile(spot.id);
  const lang = i18n.language === 'he' ? 'he' : 'en';
  const localizedDescription =
    beachProfile?.description[lang] ?? spot.description;
  const localizedParking = beachProfile?.parkingInformation[lang] ?? spot.parkingInformation;
  const localizedHazard = beachProfile?.hazardNotes?.[lang];

  return (
    <>
      <Stack.Screen options={{ title: localName, headerLargeTitle: false }} />
      <Screen>
        <View style={[styles.hero, { backgroundColor: colors.primarySoft }]}>
          <View style={styles.heroTop}>
            <Chip
              label={spot.verificationStatus === 'demo' ? t('common.demo') : t(`common.${spot.verificationStatus}`)}
              tone={spot.verificationStatus === 'demo' ? 'demo' : 'primary'}
            />
            <Chip label={t('spot.fromWeb')} tone="web" />
          </View>
          <Text style={[styles.heroTitle, { color: colors.text }]}>{localName}</Text>
          <Text style={[styles.heroMeta, { color: colors.textSecondary }]}>
            {spot.region} · {spot.countryCode}
          </Text>
        </View>

        {localizedDescription && (
          <SectionCard title={t('spot.about')}>
            <Text style={[styles.body, { color: colors.textSecondary, lineHeight: 22 }]}>{localizedDescription}</Text>
          </SectionCard>
        )}

        <SectionCard title={t('marine.seaConditions')}>
          {marine.isLoading ? (
            <View style={{ gap: spacing.sm }}>
              <Text style={[styles.caption, { color: colors.textMuted }]}>
                {t('marineLoading.conditions')}
              </Text>
              <ActivityIndicator color={colors.accent} />
            </View>
          ) : marine.isError || !marine.data ? (
            <Text style={[styles.body, { color: colors.textSecondary }]}>
              {t('marineErrors.unavailable')}
            </Text>
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
        </SectionCard>

        <SectionCard title={t('spot.fromWeb')} subtitle={t('spot.webDisclaimer')}>
          {webLoading ? (
            <ActivityIndicator color={colors.accent} />
          ) : (
            <>
              <Text style={[styles.body, { color: colors.text }]}>{webInfo?.summary}</Text>
              {webInfo?.address ? (
                <Text style={[styles.caption, { color: colors.textMuted, marginTop: spacing.sm }]}>
                  {webInfo.address}
                </Text>
              ) : null}
              {webInfo?.terrainHints && webInfo.terrainHints.length > 0 && (
                <View style={styles.hintList}>
                  {webInfo.terrainHints.map((hint) => (
                    <Text key={hint} style={[styles.caption, { color: colors.textSecondary }]}>
                      • {hint}
                    </Text>
                  ))}
                </View>
              )}
              {webInfo?.nearbyFeatures && webInfo.nearbyFeatures.length > 0 && (
                <View style={styles.featureWrap}>
                  {webInfo.nearbyFeatures.slice(0, 4).map((f) => (
                    <Chip
                      key={`${f.name}-${f.type}`}
                      label={`${f.name} (${translateFeatureType(f.type, t)})`}
                      tone="default"
                    />
                  ))}
                </View>
              )}
              {webInfo?.wikipediaUrl && (
                <Pressable onPress={() => void Linking.openURL(webInfo.wikipediaUrl!)} style={styles.linkRow}>
                  <Ionicons name="open-outline" size={16} color={colors.web} />
                  <Text style={[styles.link, { color: colors.web }]}>{t('spot.sources')}</Text>
                </Pressable>
              )}
              <Text style={[styles.fetched, { color: colors.textMuted }]}>
                {t('spot.webFetched', { time: formatDateTime(webInfo?.fetchedAt ?? Date.now(), i18n.language) })}
              </Text>
            </>
          )}
        </SectionCard>

        <SectionCard title={t('spot.shoreSeabed')}>
          <InfoRow label={t('spot.shoreLabel')} value={translateShoreType(spot.shoreType, t)} />
          <InfoRow label={t('spot.seabedLabel')} value={translateShoreType(spot.seabedType, t)} />
          <InfoRow label={t('spot.difficultyLabel')} value={translateDifficulty(spot.difficultyLevel, t)} />
        </SectionCard>

        <SectionCard title={t('spot.access')}>
          <InfoRow
            label={t('spot.accessLabel')}
            value={spot.accessType ? translateAccessType(spot.accessType, t) : t('common.unknown')}
          />
          {localizedParking ? (
            <Text style={[styles.body, { color: colors.textSecondary }]}>{localizedParking}</Text>
          ) : null}
          <PinReportForm spotId={spot.id} latitude={spot.latitude} longitude={spot.longitude} />
        </SectionCard>

        <SectionCard title={t('spot.species')}>
          {spot.species.map((s) => (
            <InfoRow
              key={s.speciesId}
              label={s.localizedNames?.[i18n.language] ?? s.commonName}
              value={translateLikelihood(s.likelihood, t)}
            />
          ))}
        </SectionCard>

        {spot.hazards.length > 0 && (
          <SectionCard title={t('spot.hazards')}>
            {localizedHazard && (
              <Text style={[styles.warning, { color: colors.warning, marginBottom: spacing.sm }]}>
                {localizedHazard}
              </Text>
            )}
            {spot.hazards.map((h) => (
              <Text key={h.id} style={[styles.warning, { color: colors.warning }]}>
                {h.localizedTitle?.[lang] ?? h.title}: {h.localizedDescription?.[lang] ?? h.description}
              </Text>
            ))}
          </SectionCard>
        )}

        <SectionCard title={t('spot.regulations')}>
          {spot.regulations.map((r) => (
            <Text key={r.id} style={[styles.body, { color: colors.textSecondary, marginBottom: spacing.sm }]}>
              {r.localizedSummary?.[lang] ?? r.summary}
            </Text>
          ))}
          <Text style={[styles.caption, { color: colors.warning }]}>{t('spot.regulationDisclaimer')}</Text>
        </SectionCard>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  hero: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    gap: spacing.sm,
  },
  heroTop: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  heroTitle: { ...typography.h1, fontSize: 24 },
  heroMeta: { ...typography.body },
  body: { ...typography.body },
  caption: { ...typography.caption, lineHeight: 18 },
  hintList: { marginTop: spacing.md, gap: 4 },
  featureWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.md },
  linkRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing.md },
  link: { ...typography.bodySmall, fontWeight: '600' },
  fetched: { ...typography.caption, marginTop: spacing.md },
  warning: { ...typography.bodySmall, marginBottom: spacing.xs },
});
