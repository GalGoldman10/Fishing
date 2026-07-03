import { View, StyleSheet } from 'react-native';
import { env } from '@/lib/config/env';
import { getMapProvider } from '@/components/map/MapProvider';
import type { MapProviderProps } from '@/components/map/mapTypes';

export function FishingMap(props: MapProviderProps) {
  const provider = getMapProvider(env.mapProvider);
  const MapComponent = provider.MapComponent;

  return (
    <View style={styles.container}>
      <MapComponent {...props} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
