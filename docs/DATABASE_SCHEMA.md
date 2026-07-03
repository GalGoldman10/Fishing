# Database Schema

See `supabase/migrations/` for authoritative SQL.

## Core Tables

| Table | Purpose |
|-------|---------|
| profiles | User preferences and display info |
| user_roles | RBAC: user, editor, moderator, admin |
| fishing_spots | Locations with PostGIS geography point |
| species | Fish species with localized names |
| spot_species | Many-to-many with likelihood and season |
| equipment_recommendations | Generic setup recommendations |
| regulations | Time-sensitive regulation records |
| hazards | Per-spot hazard warnings |
| sources | Citation and verification tracking |
| environmental_snapshots | Cached condition data |
| favorites, trip_plans, catch_logs | User content |
| chat_sessions, chat_messages | AI conversation history |
| spot_reports | Community corrections |
| audit_logs | Admin change tracking |
| rate_limits | API rate limiting |

## Spatial Queries

PostGIS functions:
- `search_fishing_spots(p_query, p_lat, p_lng, p_radius_km)`
- `get_nearby_spots(p_lat, p_lng, p_radius_km)`
- `get_fishing_spot_details(p_spot_id)`

## RLS Summary

- Public read: approved fishing data, species, regulations, hazards
- User write: own favorites, trips, catches, chats, reports, push tokens
- Editor write: fishing data mutations
- Admin: full access and audit log read
