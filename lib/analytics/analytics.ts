export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, string | number | boolean>;
}

export interface AnalyticsProvider {
  track(event: AnalyticsEvent): void;
  identify?(userId: string, traits?: Record<string, string>): void;
}

class NoOpAnalytics implements AnalyticsProvider {
  track(_event: AnalyticsEvent): void {
    // No-op in development
  }
}

class ConsoleAnalytics implements AnalyticsProvider {
  track(event: AnalyticsEvent): void {
    if (__DEV__) {
      console.log('[Analytics]', event.name, event.properties);
    }
  }
}

let provider: AnalyticsProvider = new ConsoleAnalytics();

export function setAnalyticsProvider(p: AnalyticsProvider): void {
  provider = p;
}

export const analytics = {
  trackSpotViewed: (spotId: string) =>
    provider.track({ name: 'spot_viewed', properties: { spot_id: spotId } }),
  trackSearch: (query: string) =>
    provider.track({ name: 'search_performed', properties: { query_length: query.length } }),
  trackAIQuestion: (category: string) =>
    provider.track({ name: 'ai_question', properties: { category } }),
  trackEquipmentGenerated: () => provider.track({ name: 'equipment_setup_generated' }),
  trackTripSaved: () => provider.track({ name: 'trip_saved' }),
  trackReportSubmitted: () => provider.track({ name: 'report_submitted' }),
};
