# Fishing Research Platform

FishGuide AI is a specialized fishing research and advice platform. Every answer is built from multiple independent sources — never a single copy-paste.

## Architecture

```
User Question
     │
     ▼
┌─────────────┐
│ Scope Guard │──► Refuse non-fishing topics
└──────┬──────┘
       ▼
┌──────────────────┐
│ Query Understanding │──► Location, category, intent
└──────┬───────────┘
       ▼
┌──────────────────┐
│ Query Generator  │──► 3-10 targeted searches (EN + HE)
└──────┬───────────┘
       ▼
┌──────────────────────────────────────┐
│ Parallel Multi-Provider Search       │
│  Wikipedia │ Tavily │ Serper │ Jina │
└──────┬───────────────────────────────┘
       ▼
┌──────────────────┐
│ Content Classifier│──► Fishing relevance ≥ 70
└──────┬───────────┘
       ▼
┌──────────────────┐
│ Duplicate Detection│──► Group same-source families
└──────┬───────────┘
       ▼
┌──────────────────┐
│ Source Scoring  │──► Authority + relevance + freshness
└──────┬───────────┘
       ▼
┌──────────────────┐
│ Answer Synthesis│──► Combined answer + citations
└──────────────────┘
```

## Key Modules

| Module | Path | Purpose |
|--------|------|---------|
| Types | `types/research.ts` | FishingSource, FishingAnswer, etc. |
| Scope Guard | `lib/research/scopeGuard.ts` | Fishing-only question filter |
| Query Understanding | `lib/research/queryUnderstanding.ts` | Intent + location detection |
| Query Generator | `lib/research/queryGenerator.ts` | Multi-query generation |
| Content Classifier | `lib/research/contentClassifier.ts` | Relevance score 0-100 |
| Duplicate Detection | `lib/research/duplicateDetection.ts` | Source family grouping |
| Source Scoring | `lib/research/sourceScoring.ts` | Authority/freshness/relevance |
| Orchestrator | `lib/research/orchestrator.ts` | Full research pipeline |
| Answer Synthesis | `lib/research/answerSynthesis.ts` | Structured answer builder |
| Client Service | `features/assistant/researchService.ts` | Client entry point |
| Edge Function | `supabase/functions/fishing-research/` | Server-side research API |

## Edge Functions

| Function | Endpoint | Purpose |
|----------|----------|---------|
| `fishing-research` | POST | Multi-source research only |
| `fishing-assistant` | POST | Research + OpenAI synthesis |
| `web-search` | POST | Single-query web search (legacy) |

## Environment Variables

### Client (`.env`)
```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-key
EXPO_PUBLIC_USE_MOCK_DATA=true
```

### Server Secrets (Supabase Dashboard → Edge Functions → Secrets)
```
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4.1-mini
WEB_SEARCH_PROVIDER=auto
TAVILY_API_KEY=tvly-...        # Recommended for multi-source
SERPER_API_KEY=...             # Google search fallback
MARINE_CONDITIONS_API_KEY=...  # Future: live conditions
```

## Running Locally

```powershell
cd fishguide-ai
npm install
npx expo start --web -c
```

### With Supabase local
```powershell
npx supabase start
npx supabase db reset
npx supabase functions serve
```

Set `EXPO_PUBLIC_USE_MOCK_DATA=false` and point to local Supabase.

## Source Priority

1. **Highest**: Government, fisheries authorities, official weather/marine services, scientific databases
2. **Medium**: Fishing organizations, guides, tackle shops, charters
3. **Supporting**: Forums, social media, individual angler reports (labeled as reports)

## Cache Durations (planned)

| Data Type | TTL |
|-----------|-----|
| Weather | 15-30 min |
| Waves | 30-60 min |
| Tides | 6-12 h |
| Regulations | 24 h |
| Location guides | 7 days |
| Species info | 30 days |
| Fishing reports | 1-6 h |

## Testing

```powershell
npm test
```

15 research platform tests cover: scope refusal, multi-query generation, duplicate detection, source scoring, citations, Hebrew support, and anti-hallucination.

## Admin

Trusted/blocked domains and knowledge base entries are managed via:
- `trusted_domains` table
- `blocked_domains` table
- `fishing_knowledge` table
- Admin UI at `/admin`

## Anti-Hallucination

The system never invents regulations, species, weather, or source URLs. When information cannot be confirmed, answers use explicit uncertainty language and `limited` confidence.
