# AI Architecture

## Retrieval-First Design

For every location-specific question:

1. Resolve location (user input, GPS, or attached spot)
2. Call `search_fishing_spots` / `get_nearby_spots`
3. Retrieve spot details, species, equipment, hazards, regulations
4. Fetch environmental conditions when available
5. Pass retrieved context to OpenAI Responses API
6. Validate structured JSON output with Zod
7. Display confidence and data freshness to user

## Tool Functions

Defined in `supabase/functions/_shared/schemas.ts` and executed in `_shared/tools.ts`:

- search_fishing_spots
- get_fishing_spot_details
- get_nearby_spots
- search_species
- build_equipment_setup
- get_environmental_conditions
- get_regulations

## Response Validation

`FishingAssistantResponse` schema validated server-side. On failure, retry once with repair prompt, then return safe plain-text fallback.

## Data Source Labeling

The system prompt instructs the model to distinguish:
- Verified database information
- Community-submitted information
- External live conditions
- General fishing knowledge
- AI inference
- Unknown information

## Rate Limiting

- Anonymous: 10 requests/hour
- Authenticated: 50 requests/hour

## Model Configuration

Single environment variable: `OPENAI_MODEL` (default: gpt-4.1-mini)
