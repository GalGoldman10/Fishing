# External Provider Integration

## Marine Conditions

Interface: `MarineConditionsProvider` in Edge Function.

Implementations:
- **MockMarineConditionsProvider** — default, always available
- **HttpMarineConditionsProvider** — placeholder HTTP adapter

Configuration:
```bash
MARINE_CONDITIONS_PROVIDER=mock|http
MARINE_CONDITIONS_API_KEY=...
```

Features: caching, expiration, timeout (5s), exponential backoff, graceful fallback.

## Maps

Abstraction: `components/map/MapProvider.tsx`

Current: react-native-maps
Future: Mapbox via new `MapProvider` implementation

## Analytics

Abstraction: `lib/analytics/analytics.ts`

Default: console logging in development. Swap `setAnalyticsProvider()` for production.

Privacy: no exact GPS in analytics, no full chat messages.

## OpenAI

Accessed only via `fishing-assistant` Edge Function. Never from mobile client.
