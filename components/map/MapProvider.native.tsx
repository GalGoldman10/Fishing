import { useEffect, useMemo, useRef } from 'react';
import { StyleSheet, Platform } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/components/common/ThemeProvider';
import { translateShoreType } from '@/lib/localization/labels';
import type { MapProvider, MapProviderProps } from '@/components/map/mapTypes';
import { FishingSpotSummary } from '@/types/fishing';
import { filterValidCoordinates } from '@/lib/utils/coordinates';

function spotLabel(spot: FishingSpotSummary, language?: string): string {
  return spot.localizedNames?.[language === 'he' ? 'he' : 'en'] ?? spot.name;
}

function ReactNativeMapsView({
  spots: rawSpots,
  userLocation,
  onSpotPress,
  language,
  selectedSpotId,
}: MapProviderProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const mapRef = useRef<MapView>(null);

  // Invalid coordinates never create a marker; they are logged instead.
  const spots = useMemo(() => filterValidCoordinates(rawSpots).valid, [rawSpots]);

  const initialRegion = useMemo(() => {
    const latitudes = spots.map((s) => s.latitude);
    const longitudes = spots.map((s) => s.longitude);
    if (userLocation) {
      latitudes.push(userLocation.latitude);
      longitudes.push(userLocation.longitude);
    }
    if (latitudes.length === 0) {
      return { latitude: 32.08, longitude: 34.77, latitudeDelta: 2, longitudeDelta: 2 };
    }
    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);
    const minLng = Math.min(...longitudes);
    const maxLng = Math.max(...longitudes);
    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: Math.max(0.3, (maxLat - minLat) * 1.4),
      longitudeDelta: Math.max(0.3, (maxLng - minLng) * 1.4),
    };
  }, [spots, userLocation]);

  // Center on the selected spot with a close zoom, without resetting to the user.
  useEffect(() => {
    if (!selectedSpotId) return;
    const spot = spots.find((s) => s.id === selectedSpotId);
    if (!spot) return;
    mapRef.current?.animateToRegion(
      {
        latitude: spot.latitude,
        longitude: spot.longitude,
        latitudeDelta: 0.03,
        longitudeDelta: 0.03,
      },
      400,
    );
  }, [selectedSpotId, spots]);

  return (
    <MapView
      ref={mapRef}
      style={styles.map}
      provider={Platform.OS === 'android' ? PROVIDER_DEFAULT : undefined}
      initialRegion={initialRegion}
      showsUserLocation={!!userLocation}
      showsMyLocationButton={false}
    >
      {spots.map((spot) => (
        <Marker
          key={spot.id}
          // Default RN Maps pin is anchored at its point; keep anchor explicit.
          anchor={{ x: 0.5, y: 1 }}
          coordinate={{ latitude: spot.latitude, longitude: spot.longitude }}
          title={spotLabel(spot, language)}
          description={translateShoreType(spot.shoreType, t)}
          pinColor={spot.id === selectedSpotId ? '#f59e0b' : colors.primary}
          onCalloutPress={() => onSpotPress?.(spot)}
          onPress={() => onSpotPress?.(spot)}
        />
      ))}
    </MapView>
  );
}

export const reactNativeMapsProvider: MapProvider = {
  name: 'react-native-maps',
  MapComponent: ReactNativeMapsView,
};

export function getMapProvider(_providerName?: string): MapProvider {
  return reactNativeMapsProvider;
}

export type { MapProviderProps } from '@/components/map/mapTypes';

const styles = StyleSheet.create({
  map: { flex: 1 },
});
