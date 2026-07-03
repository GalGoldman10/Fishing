import { useCallback, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { FishingSpotSummary } from '@/types/fishing';
import type { MarineForecast } from '@/types/marine';
import { getMarineForecast, RefreshRateLimitedError } from './marineService';

/**
 * Resolves the coordinate used for marine forecast requests:
 * the spot's dedicated offshore marineCoordinates when available,
 * never a parking or inland coordinate.
 */
export function getMarineRequestCoordinates(spot: FishingSpotSummary): {
  latitude: number;
  longitude: number;
} {
  return spot.marineCoordinates ?? { latitude: spot.latitude, longitude: spot.longitude };
}

export function useMarineForecast(spot: FishingSpotSummary | null | undefined) {
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const coords = spot ? getMarineRequestCoordinates(spot) : null;

  const query = useQuery<MarineForecast>({
    queryKey: ['marineForecast', coords?.latitude, coords?.longitude, spot?.shoreType],
    enabled: !!coords,
    staleTime: 20 * 60 * 1000,
    retry: 1,
    queryFn: () =>
      getMarineForecast({
        latitude: coords!.latitude,
        longitude: coords!.longitude,
        shoreType: spot!.shoreType,
      }),
  });

  const refresh = useCallback(async () => {
    if (!coords || !spot) return;
    setRefreshing(true);
    try {
      const forecast = await getMarineForecast({
        latitude: coords.latitude,
        longitude: coords.longitude,
        shoreType: spot.shoreType,
        forceRefresh: true,
      });
      queryClient.setQueryData(
        ['marineForecast', coords.latitude, coords.longitude, spot.shoreType],
        forecast,
      );
    } catch (error) {
      // Rate-limited refresh is silent; the cached data is still shown.
      if (!(error instanceof RefreshRateLimitedError) && __DEV__) {
        console.warn('[marine] manual refresh failed:', error);
      }
    } finally {
      setRefreshing(false);
    }
  }, [coords?.latitude, coords?.longitude, spot, queryClient]);

  return { ...query, refresh, refreshing };
}
