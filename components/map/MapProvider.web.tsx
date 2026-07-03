import { useEffect, useMemo, createElement } from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/components/common/ThemeProvider';
import { borderRadius, spacing } from '@/constants/theme';
import type { MapProvider, MapProviderProps } from '@/components/map/mapTypes';
import { FishingSpotSummary } from '@/types/fishing';
import { filterValidCoordinates, toLatLngArray } from '@/lib/utils/coordinates';

function spotLabel(spot: FishingSpotSummary, language?: string): string {
  return spot.localizedNames?.[language === 'he' ? 'he' : 'en'] ?? spot.name;
}

function WebOsmMap({
  spots,
  userLocation,
  onSpotPress,
  language,
  selectedSpotId,
  clusteringEnabled = true,
}: MapProviderProps) {
  const { t } = useTranslation();
  const youLabel = t('mapWeb.you');

  const markers = useMemo(() => {
    // Invalid coordinates are rejected (and logged) instead of defaulting to 0,0.
    const { valid } = filterValidCoordinates(spots);
    return valid.map((s) => ({
      id: s.id,
      // Explicit [latitude, longitude] adapter — Leaflet expects lat,lng order.
      latLng: toLatLngArray({ latitude: s.latitude, longitude: s.longitude }),
      name: spotLabel(s, language),
      selected: s.id === selectedSpotId,
    }));
  }, [spots, language, selectedSpotId]);

  const center = useMemo(() => {
    const selected = markers.find((m) => m.selected);
    if (selected) return { lat: selected.latLng[0], lng: selected.latLng[1] };
    if (userLocation) return { lat: userLocation.latitude, lng: userLocation.longitude };
    if (markers.length > 0) return { lat: markers[0].latLng[0], lng: markers[0].latLng[1] };
    return { lat: 32.08, lng: 34.77 };
  }, [markers, userLocation]);

  const html = useMemo(() => {
    const markersJson = JSON.stringify(markers);
    const userJson = JSON.stringify(userLocation);
    const dir = language === 'he' ? 'rtl' : 'ltr';
    return `<!DOCTYPE html>
<html lang="${language === 'he' ? 'he' : 'en'}" dir="${dir}">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css"/>
<link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css"/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script src="https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js"></script>
<style>
html,body,#map{margin:0;height:100%;width:100%}
.fg-pin{position:relative}
.fg-pin svg{display:block}
</style>
</head>
<body>
<div id="map"></div>
<script>
const markers = ${markersJson};
const user = ${userJson};
const center = ${JSON.stringify(center)};
const clustering = ${JSON.stringify(clusteringEnabled)};
const hasSelected = markers.some(m => m.selected);
const map = L.map('map', { zoomControl: true }).setView([center.lat, center.lng], hasSelected ? 14 : 8);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 18,
  attribution: '© OpenStreetMap'
}).addTo(map);

// Custom pin whose pointed tip touches the exact coordinate:
// icon 30x42, anchor at the bottom-center point (15, 42).
function pinIcon(selected) {
  const color = selected ? '#f59e0b' : '#0A4D68';
  return L.divIcon({
    className: 'fg-pin',
    html: '<svg width="30" height="42" viewBox="0 0 30 42"><path d="M15 0C6.7 0 0 6.7 0 15c0 11 15 27 15 27s15-16 15-27C30 6.7 23.3 0 15 0z" fill="' + color + '" stroke="#fff" stroke-width="2"/><circle cx="15" cy="15" r="5.5" fill="#fff"/></svg>',
    iconSize: [30, 42],
    iconAnchor: [15, 42],
    popupAnchor: [0, -44]
  });
}

const group = L.featureGroup();
if (user && Number.isFinite(user.latitude) && Number.isFinite(user.longitude)) {
  const um = L.circleMarker([user.latitude, user.longitude], {
    radius: 8, color: '#00FFCA', fillColor: '#00FFCA', fillOpacity: 1, weight: 2
  }).addTo(map).bindPopup(${JSON.stringify(youLabel)});
  group.addLayer(um);
}

const cluster = clustering ? L.markerClusterGroup({ maxClusterRadius: 45, showCoverageOnHover: false }) : null;
markers.forEach(m => {
  const marker = L.marker(m.latLng, { icon: pinIcon(m.selected) }).bindPopup(m.name);
  marker.on('click', () => parent.postMessage({ type: 'spotClick', id: m.id }, '*'));
  // The selected marker is never clustered so it stays individually visible.
  if (cluster && !m.selected) cluster.addLayer(marker);
  else marker.addTo(map);
  group.addLayer(marker);
});
if (cluster) map.addLayer(cluster);

if (hasSelected) {
  const sel = markers.find(m => m.selected);
  map.setView(sel.latLng, 14);
} else if (group.getLayers().length > 0) {
  map.fitBounds(group.getBounds().pad(0.15));
}
</script>
</body>
</html>`;
  }, [markers, userLocation, center, language, youLabel, clusteringEnabled]);

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const handler = (event: MessageEvent) => {
      if (event.data?.type !== 'spotClick') return;
      const spot = spots.find((s) => s.id === event.data.id);
      if (spot) onSpotPress?.(spot);
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [spots, onSpotPress]);

  if (Platform.OS === 'web') {
    return createElement('iframe', {
      title: 'fishing-map',
      srcDoc: html,
      style: { flex: 1, width: '100%', height: '100%', border: 'none', minHeight: 360 },
    });
  }

  return null;
}

function WebMapFallback({ spots: rawSpots, userLocation, onSpotPress, language }: MapProviderProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const spots = useMemo(() => filterValidCoordinates(rawSpots).valid, [rawSpots]);

  const bounds = useMemo(() => {
    const points = [
      ...spots.map((s) => ({ lat: s.latitude, lng: s.longitude })),
      ...(userLocation ? [{ lat: userLocation.latitude, lng: userLocation.longitude }] : []),
    ];
    if (points.length === 0) {
      return { minLat: 29.5, maxLat: 33.2, minLng: 34.2, maxLng: 35.6 };
    }
    const lats = points.map((p) => p.lat);
    const lngs = points.map((p) => p.lng);
    const pad = 0.08;
    return {
      minLat: Math.min(...lats) - pad,
      maxLat: Math.max(...lats) + pad,
      minLng: Math.min(...lngs) - pad,
      maxLng: Math.max(...lngs) + pad,
    };
  }, [spots, userLocation]);

  const toPosition = (lat: number, lng: number): { left: `${number}%`; top: `${number}%` } => {
    const x = ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * 100;
    const y = ((bounds.maxLat - lat) / (bounds.maxLat - bounds.minLat)) * 100;
    return {
      left: `${Math.min(92, Math.max(8, x))}%`,
      top: `${Math.min(88, Math.max(12, y))}%`,
    };
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.mapSurface, { backgroundColor: '#0d4f6e' }]}>
        <View style={styles.coastBand} />
        <Text style={styles.waterLabel}>{t('mapWeb.coastLabel')}</Text>
        <View style={[styles.legend, { backgroundColor: 'rgba(0,0,0,0.45)' }]}>
          <Text style={styles.legendText}>{t('mapWeb.spotCount', { count: spots.length })}</Text>
        </View>

        {userLocation && (
          <View
            style={[
              styles.marker,
              styles.userMarker,
              toPosition(userLocation.latitude, userLocation.longitude),
            ]}
          >
            <Text style={styles.markerText}>{t('mapWeb.you')}</Text>
          </View>
        )}

        {spots.map((spot) => (
          <SpotMarker
            key={spot.id}
            spot={spot}
            label={spotLabel(spot, language)}
            position={toPosition(spot.latitude, spot.longitude)}
            onPress={onSpotPress}
          />
        ))}
      </View>

      <Text style={[styles.hint, { color: colors.textSecondary }]}>{t('mapWeb.hint')}</Text>
    </View>
  );
}

function WebMapView(props: MapProviderProps) {
  if (Platform.OS === 'web') {
    return (
      <View style={styles.osmWrap}>
        <WebOsmMap {...props} />
      </View>
    );
  }
  return <WebMapFallback {...props} />;
}

function SpotMarker({
  spot,
  label,
  position,
  onPress,
}: {
  spot: FishingSpotSummary;
  label: string;
  position: { left: `${number}%`; top: `${number}%` };
  onPress?: (spot: FishingSpotSummary) => void;
}) {
  return (
    <Pressable
      style={[styles.marker, styles.spotMarker, position]}
      onPress={() => onPress?.(spot)}
    >
      <Text style={styles.markerText} numberOfLines={2}>
        {label}
      </Text>
    </Pressable>
  );
}

export const webMapsProvider: MapProvider = {
  name: 'web-osm',
  MapComponent: WebMapView,
};

export function getMapProvider(_providerName?: string): MapProvider {
  return webMapsProvider;
}

export type { MapProviderProps } from '@/components/map/mapTypes';

const styles = StyleSheet.create({
  container: { flex: 1 },
  osmWrap: { flex: 1, minHeight: 360 },
  mapSurface: {
    flex: 1,
    margin: spacing.md,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    position: 'relative',
    minHeight: 320,
  },
  coastBand: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '28%',
    backgroundColor: '#c9a86c',
    opacity: 0.85,
  },
  waterLabel: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    fontWeight: '600',
  },
  legend: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  legendText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  marker: {
    position: 'absolute',
    transform: [{ translateX: -40 }, { translateY: -14 }],
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    maxWidth: 100,
  },
  userMarker: {
    backgroundColor: '#00FFCA',
    zIndex: 10,
  },
  spotMarker: {
    backgroundColor: '#0A4D68',
    borderWidth: 1,
    borderColor: '#fff',
  },
  markerText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
  },
  hint: {
    textAlign: 'center',
    fontSize: 12,
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.md,
  },
});
