import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, FlatList, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import * as Location from 'expo-location';
import { useTheme } from '@/components/common/ThemeProvider';
import { FishingMap } from '@/components/map/FishingMap';
import { getNearbySpots } from '@/features/spots/spotService';
import { LoadingState } from '@/components/common/StateViews';
import { SpotCard } from '@/components/fishing/SpotCard';
import { borderRadius, spacing } from '@/constants/theme';

export default function MapScreen() {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const router = useRouter();
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [listView, setListView] = useState(false);
  const [locationRequested, setLocationRequested] = useState(false);

  const center = userLocation ?? { latitude: 32.0853, longitude: 34.7715 };

  const { data: spots, isLoading, refetch } = useQuery({
    queryKey: ['mapSpots', center.latitude, center.longitude],
    queryFn: () => getNearbySpots(center.latitude, center.longitude, 100),
  });

  const requestLocation = useCallback(async () => {
    setLocationRequested(true);
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(t('map.locationPermissionTitle'), t('map.deniedLocation'));
      return;
    }
    const loc = await Location.getCurrentPositionAsync({});
    setUserLocation({
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
    });
    void refetch();
  }, [t, refetch]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.toolbar, { borderBottomColor: colors.borderLight }]}>
        <Pressable
          style={[styles.toggle, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}
          onPress={() => setListView(!listView)}
        >
          <Text style={{ color: colors.text, fontWeight: '600' }}>
            {listView ? t('map.mapView') : t('map.listView')}
          </Text>
        </Pressable>
        {!locationRequested && (
          <Pressable
            style={[styles.toggle, { backgroundColor: colors.primary }]}
            onPress={requestLocation}
          >
            <Text style={{ color: '#fff', fontWeight: '600' }}>{t('map.allowLocation')}</Text>
          </Pressable>
        )}
        <Pressable
          style={[styles.toggle, { backgroundColor: colors.accentSoft, borderColor: colors.borderLight }]}
          onPress={() => void refetch()}
        >
          <Text style={{ color: colors.primary, fontWeight: '600' }}>{t('map.searchArea')}</Text>
        </Pressable>
      </View>

      {isLoading ? (
        <LoadingState />
      ) : listView ? (
        <FlatList
          data={spots}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <SpotCard
              spot={item}
              language={i18n.language}
              showWebBadge
              onPress={() => router.push(`/spot/${item.id}`)}
            />
          )}
          contentContainerStyle={{ paddingVertical: spacing.md }}
        />
      ) : (
        <FishingMap
          spots={spots ?? []}
          userLocation={userLocation}
          language={i18n.language}
          clusteringEnabled
          onSpotPress={(spot) => router.push(`/spot/${spot.id}`)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  toolbar: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.sm,
    flexWrap: 'wrap',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  toggle: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
