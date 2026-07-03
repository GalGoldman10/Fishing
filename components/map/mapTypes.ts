import { ReactNode } from 'react';
import { FishingSpotSummary } from '@/types/fishing';

export interface MapProviderProps {
  spots: FishingSpotSummary[];
  userLocation?: { latitude: number; longitude: number } | null;
  onSpotPress?: (spot: FishingSpotSummary) => void;
  language?: string;
  /** When set, the map centers on this spot and excludes it from clustering. */
  selectedSpotId?: string | null;
  /** Enables marker clustering when many spots are close together. */
  clusteringEnabled?: boolean;
  children?: ReactNode;
}

export interface MapProvider {
  name: string;
  MapComponent: React.ComponentType<MapProviderProps>;
}

export function getMapProvider(providerName?: string): MapProvider {
  switch (providerName) {
    case 'react-native-maps':
    default:
      // Platform-specific implementation is re-exported from MapProvider.native/web
      throw new Error('getMapProvider must be imported from a platform MapProvider file');
  }
}
