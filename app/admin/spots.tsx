import { useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/components/common/ThemeProvider';
import { FishingMap } from '@/components/map/FishingMap';
import { DEMO_SPOTS } from '@/lib/mock/demoData';
import { translateVerificationStatus } from '@/lib/localization/labels';
import { formatDateTime } from '@/lib/localization/format';
import { parseCoordinate, isValidCoordinates } from '@/lib/utils/coordinates';
import {
  loadOverrides,
  saveOverride,
  clearOverride,
  applyOverrides,
  loadSeaThresholds,
  saveSeaThresholds,
  SpotCoordinateOverride,
} from '@/features/spots/spotOverridesService';
import { listPinReports, PinReport } from '@/features/spots/pinReportService';
import { DEFAULT_SEA_THRESHOLDS, SeaLevelThresholds } from '@/types/marine';
import { borderRadius, spacing, typography } from '@/constants/theme';
import type { FishingSpotSummary } from '@/types/fishing';

interface CoordDraft {
  lat: string;
  lng: string;
  marineLat: string;
  marineLng: string;
  parkingLat: string;
  parkingLng: string;
}

function draftFromSpot(spot: FishingSpotSummary): CoordDraft {
  return {
    lat: String(spot.latitude),
    lng: String(spot.longitude),
    marineLat: spot.marineCoordinates ? String(spot.marineCoordinates.latitude) : '',
    marineLng: spot.marineCoordinates ? String(spot.marineCoordinates.longitude) : '',
    parkingLat: spot.parkingCoordinates ? String(spot.parkingCoordinates.latitude) : '',
    parkingLng: spot.parkingCoordinates ? String(spot.parkingCoordinates.longitude) : '',
  };
}

export default function AdminSpotsScreen() {
  const { colors } = useTheme();
  const { t, i18n } = useTranslation();
  const [search, setSearch] = useState('');
  const [spots, setSpots] = useState<FishingSpotSummary[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<CoordDraft | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [reports, setReports] = useState<PinReport[]>([]);
  const [thresholds, setThresholds] = useState<SeaLevelThresholds>(DEFAULT_SEA_THRESHOLDS);

  const reload = async () => {
    const overrides = await loadOverrides();
    setSpots(applyOverrides([...DEMO_SPOTS], overrides));
    setReports(await listPinReports());
    setThresholds(await loadSeaThresholds());
  };

  useEffect(() => {
    void reload();
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return spots;
    const q = search.trim().toLowerCase();
    return spots.filter(
      (s) => s.name.toLowerCase().includes(q) || s.localizedNames?.he?.includes(search.trim()),
    );
  }, [spots, search]);

  const selected = spots.find((s) => s.id === selectedId) ?? null;

  const selectSpot = (spot: FishingSpotSummary) => {
    setSelectedId(spot.id);
    setDraft(draftFromSpot(spot));
    setMessage(null);
  };

  const save = async () => {
    if (!selected || !draft) return;
    const lat = parseCoordinate(draft.lat);
    const lng = parseCoordinate(draft.lng);
    if (lat === undefined || lng === undefined || !isValidCoordinates(lat, lng)) {
      setMessage(t('marineErrors.invalidCoordinates'));
      return;
    }
    const marineLat = parseCoordinate(draft.marineLat);
    const marineLng = parseCoordinate(draft.marineLng);
    const parkingLat = parseCoordinate(draft.parkingLat);
    const parkingLng = parseCoordinate(draft.parkingLng);

    const override: SpotCoordinateOverride = {
      spotId: selected.id,
      latitude: lat,
      longitude: lng,
      marineCoordinates:
        marineLat !== undefined && marineLng !== undefined && isValidCoordinates(marineLat, marineLng)
          ? { latitude: marineLat, longitude: marineLng }
          : undefined,
      parkingCoordinates:
        parkingLat !== undefined && parkingLng !== undefined && isValidCoordinates(parkingLat, parkingLng)
          ? { latitude: parkingLat, longitude: parkingLng }
          : undefined,
      coordinateSource: 'admin-manual',
      verifiedAt: new Date().toISOString(),
      verifiedBy: 'admin',
    };
    await saveOverride(override);
    setMessage(t('adminPins.saved'));
    await reload();
  };

  const revert = () => {
    if (selected) setDraft(draftFromSpot(selected));
    setMessage(null);
  };

  const resetToOriginal = async () => {
    if (!selected) return;
    await clearOverride(selected.id);
    setMessage(t('adminPins.reverted'));
    await reload();
    const original = DEMO_SPOTS.find((s) => s.id === selected.id);
    if (original) setDraft(draftFromSpot(original));
  };

  const updateThreshold = (key: keyof SeaLevelThresholds, value: string) => {
    const parsed = parseCoordinate(value);
    if (parsed === undefined) return;
    setThresholds((prev) => ({ ...prev, [key]: parsed }));
  };

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: spacing.xxl }}>
      <Text style={[styles.info, { color: colors.textSecondary }]}>{t('adminPins.intro')}</Text>

      <TextInput
        style={[styles.search, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
        placeholder={t('home.searchPlaceholder')}
        placeholderTextColor={colors.textMuted}
        value={search}
        onChangeText={setSearch}
      />

      {filtered.map((s) => (
        <Pressable
          key={s.id}
          onPress={() => selectSpot(s)}
          style={[
            styles.spotRow,
            {
              backgroundColor: s.id === selectedId ? colors.primarySoft : colors.surface,
              borderColor: colors.borderLight,
            },
          ]}
        >
          <Text style={{ color: colors.text, fontWeight: '600' }}>
            {s.localizedNames?.[i18n.language] ?? s.name}
          </Text>
          <Text style={[styles.coordsText, { color: colors.textMuted }]}>
            {s.latitude.toFixed(5)}, {s.longitude.toFixed(5)} · {translateVerificationStatus(s.verificationStatus, t)}
            {s.coordinatesVerifiedAt
              ? ` · ${t('adminPins.verifiedAt', { time: formatDateTime(s.coordinatesVerifiedAt, i18n.language) })}`
              : ''}
          </Text>
        </Pressable>
      ))}

      {selected && draft && (
        <View style={[styles.editor, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.editorTitle, { color: colors.text }]}>
            {selected.localizedNames?.[i18n.language] ?? selected.name}
          </Text>

          <View style={styles.mapPreview}>
            <FishingMap
              spots={[{ ...selected, latitude: parseCoordinate(draft.lat) ?? selected.latitude, longitude: parseCoordinate(draft.lng) ?? selected.longitude }]}
              language={i18n.language}
              selectedSpotId={selected.id}
              clusteringEnabled={false}
            />
          </View>

          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>{t('adminPins.spotCoordinates')}</Text>
          <View style={styles.row}>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border }]}
              value={draft.lat}
              onChangeText={(v) => setDraft({ ...draft, lat: v })}
              placeholder="Latitude"
              placeholderTextColor={colors.textMuted}
            />
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border }]}
              value={draft.lng}
              onChangeText={(v) => setDraft({ ...draft, lng: v })}
              placeholder="Longitude"
              placeholderTextColor={colors.textMuted}
            />
          </View>

          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>{t('adminPins.marineCoordinates')}</Text>
          <View style={styles.row}>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border }]}
              value={draft.marineLat}
              onChangeText={(v) => setDraft({ ...draft, marineLat: v })}
              placeholder="Latitude"
              placeholderTextColor={colors.textMuted}
            />
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border }]}
              value={draft.marineLng}
              onChangeText={(v) => setDraft({ ...draft, marineLng: v })}
              placeholder="Longitude"
              placeholderTextColor={colors.textMuted}
            />
          </View>

          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>{t('adminPins.parkingCoordinates')}</Text>
          <View style={styles.row}>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border }]}
              value={draft.parkingLat}
              onChangeText={(v) => setDraft({ ...draft, parkingLat: v })}
              placeholder="Latitude"
              placeholderTextColor={colors.textMuted}
            />
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border }]}
              value={draft.parkingLng}
              onChangeText={(v) => setDraft({ ...draft, parkingLng: v })}
              placeholder="Longitude"
              placeholderTextColor={colors.textMuted}
            />
          </View>

          {message && <Text style={[styles.message, { color: colors.info }]}>{message}</Text>}

          <View style={styles.buttonRow}>
            <Pressable onPress={save} style={[styles.btn, { backgroundColor: colors.primary }]}>
              <Text style={styles.btnText}>{t('adminPins.saveVerified')}</Text>
            </Pressable>
            <Pressable onPress={revert} style={[styles.btn, { backgroundColor: colors.surfaceSecondary }]}>
              <Text style={[styles.btnText, { color: colors.text }]}>{t('adminPins.revert')}</Text>
            </Pressable>
            <Pressable onPress={resetToOriginal} style={[styles.btn, { backgroundColor: colors.surfaceSecondary }]}>
              <Text style={[styles.btnText, { color: colors.error }]}>{t('adminPins.resetOriginal')}</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Pending user reports about incorrect pins */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('adminPins.pendingReports')}</Text>
      {reports.length === 0 ? (
        <Text style={[styles.info, { color: colors.textMuted }]}>{t('adminPins.noReports')}</Text>
      ) : (
        reports.map((r) => (
          <View key={r.id} style={[styles.reportRow, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
            <Text style={{ color: colors.text, fontWeight: '600' }}>{r.spotId}</Text>
            <Text style={[styles.coordsText, { color: colors.textSecondary }]}>
              {r.currentLatitude.toFixed(5)}, {r.currentLongitude.toFixed(5)} → {r.suggestedLatitude.toFixed(5)}, {r.suggestedLongitude.toFixed(5)}
            </Text>
            {r.explanation ? (
              <Text style={[styles.coordsText, { color: colors.textMuted }]}>{r.explanation}</Text>
            ) : null}
          </View>
        ))
      )}

      {/* Configurable sea-level thresholds */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('adminPins.thresholdsTitle')}</Text>
      <Text style={[styles.info, { color: colors.textMuted }]}>{t('adminPins.thresholdsHint')}</Text>
      {(
        [
          ['calmMaxWaveM', t('marine.seaLevels.calm')],
          ['lowMaxWaveM', t('marine.seaLevels.low')],
          ['moderateMaxWaveM', t('marine.seaLevels.moderate')],
          ['highMaxWaveM', t('marine.seaLevels.high')],
          ['strongWindKph', t('marine.wind')],
          ['dangerousGustKph', t('marine.windGusts')],
        ] as [keyof SeaLevelThresholds, string][]
      ).map(([key, label]) => (
        <View key={key} style={styles.thresholdRow}>
          <Text style={[styles.fieldLabel, { color: colors.textSecondary, flex: 1 }]}>{label}</Text>
          <TextInput
            style={[styles.input, styles.thresholdInput, { color: colors.text, borderColor: colors.border }]}
            defaultValue={String(thresholds[key])}
            onChangeText={(v) => updateThreshold(key, v)}
            keyboardType="numbers-and-punctuation"
          />
        </View>
      ))}
      <Pressable
        onPress={async () => {
          await saveSeaThresholds(thresholds);
          setMessage(t('adminPins.saved'));
        }}
        style={[styles.btn, { backgroundColor: colors.primary, marginHorizontal: spacing.md }]}
      >
        <Text style={styles.btnText}>{t('common.save')}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  info: { padding: spacing.md, ...typography.bodySmall },
  search: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  spotRow: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.xs,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 2,
  },
  coordsText: { ...typography.caption },
  editor: {
    margin: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    gap: spacing.sm,
  },
  editorTitle: { ...typography.h3 },
  mapPreview: { height: 220, borderRadius: borderRadius.md, overflow: 'hidden' },
  fieldLabel: { ...typography.caption, fontWeight: '600' },
  row: { flexDirection: 'row', gap: spacing.sm },
  input: {
    flex: 1,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    fontSize: 14,
  },
  message: { ...typography.bodySmall, fontWeight: '600' },
  buttonRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  btn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  sectionTitle: { ...typography.h3, paddingHorizontal: spacing.md, paddingTop: spacing.lg },
  reportRow: {
    marginHorizontal: spacing.md,
    marginTop: spacing.xs,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 2,
  },
  thresholdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  thresholdInput: { flex: 0, width: 100 },
});
