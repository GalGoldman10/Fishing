# Localization Guide — FishGuide AI

The app is fully bilingual (English / Hebrew) with automatic RTL support.
It uses **react-i18next** — one translation system, no duplicated pages.

## Architecture

```
lib/localization/
  i18n.ts            i18next init, browser/device language detection,
                     dev missing-key logger, <html lang dir> sync on web
  locales/
    en.json          all English UI strings (single namespace, nested keys)
    he.json          all Hebrew UI strings (same key structure — enforced by tests)
  labels.ts          enum translators (shore types, likelihood, access, confidence...)
  localizedText.ts   getLocalizedText() for database content ({ en, he } objects)
  format.ts          Intl date / time / number / unit formatters (he-IL / en-US)
stores/languageStore.ts   persisted language preference + Supabase profile sync
components/common/
  DirectionProvider.tsx   applies rtl/ltr layout direction to the whole app
  DirectionalIcon.tsx     mirrors chevrons/arrows in RTL (fish/weather icons untouched)
```

## How language is resolved (priority order)

1. Signed-in user's `profiles.preferred_language` in Supabase
2. Saved device preference (SecureStore on native, localStorage on web)
3. Browser / device language (`he*` → Hebrew, anything else → English)
4. Fallback: English

Once the user picks a language manually it is persisted and never overridden
by browser detection.

## Using translations in components

```tsx
const { t, i18n } = useTranslation();

<Button title={t('common.save')} />                 // static UI text
t('equipment.stepProgress', { current: 1, total: 7 }) // interpolation

// enum values from data — never render raw enums:
translateLikelihood(species.likelihood, t)
translateShoreType(spot.shoreType, t)

// database content ({ en, he } objects):
getLocalizedText(spot.description, i18n.language)

// dates / numbers:
formatDateTime(spot.verifiedAt, i18n.language)   // locale-aware
formatUnit(25, '°C', i18n.language)              // number localized, unit symbol kept
```

Never write `language === 'he' ? 'שמור' : 'Save'` in components.

## Database content

Multilingual content uses per-language fields:

```ts
type LocalizedText = { en: string; he?: string };
```

- Beach data: `lib/mock/beachProfiles.ts` (description, parking, hazards, tips)
- Species data: `lib/mock/speciesProfiles.ts` (description, habitat, identification,
  handling, consumption warnings)
- Names: `localizedNames: { en, he }` on spots and species

`getLocalizedText()` falls back to English when a Hebrew value is missing or
empty — content is never hidden and `[object Object]` is never rendered.
`hasTranslation()` reports missing translations (for admin indicators).

### Migrating existing single-language columns (Supabase)

Existing English `TEXT` columns can be converted non-destructively:

```sql
-- example: fishing_spots.description TEXT -> JSONB { "en": ..., "he": "" }
ALTER TABLE fishing_spots ADD COLUMN description_i18n JSONB;
UPDATE fishing_spots
  SET description_i18n = jsonb_build_object('en', COALESCE(description, ''), 'he', '')
  WHERE description_i18n IS NULL;
```

Keep the old column until all readers use the new one, then drop it.
No existing data is deleted; Hebrew starts empty and falls back to English.

## AI responses

Every AI/research request includes the current UI language
(`ChatRequest.language: 'en' | 'he'`), and answers are generated in that
language. Search queries are generated in **both** Hebrew and English for
Israeli locations to improve research quality; only the final answer follows
the UI language. Source titles keep their original language; source types and
confidence labels are translated (`research.sourceType.*`,
`research.confidence.*`).

## RTL

- `DirectionProvider` re-renders the app with `direction: rtl` when Hebrew is active.
- On web, `<html lang dir>` and the page title update immediately on switch
  (`syncDocumentLanguage` in `i18n.ts`).
- Use `DirectionalIcon` for chevrons/arrows so they mirror in RTL.
- Prefer `marginStart/marginEnd` (RN logical properties) over left/right.

## Missing translations

- Dev builds log `Missing translation: <lang>.<key>` to the console
  (`missingKeyHandler` in `i18n.ts`).
- At runtime i18next falls back to English, so users never see raw keys.
- `tests/unit/localization.test.ts` fails CI if the two locale files diverge
  (missing keys, orphan keys, or empty values).

## Adding another language (e.g. Arabic)

1. Copy `lib/localization/locales/en.json` → `ar.json` and translate the values.
2. In `lib/localization/i18n.ts`: add `ar` to `supportedLanguages`, import the
   file, add it to `resources`, and include it in the RTL check if applicable.
3. Add the language button in `app/(tabs)/profile.tsx` (`profile.langAr` key).
4. Extend `getLocaleTag()` in `format.ts` (e.g. `ar` → `ar-EG`).
5. Add `ar` to the `preferred_language` CHECK constraint in the `profiles` table.
6. Add per-language fields to `beachProfiles.ts` / `speciesProfiles.ts`
   (optional — `getLocalizedText` falls back to English automatically).
7. Run `npm test` — the parity test will list any missing keys.

## Testing

```powershell
npm run typecheck
npm test          # includes localization key-parity + fallback tests
npx expo start --web -c
```

Manual checklist: switch to עברית in Profile → verify home, map, species guide,
spot details, chat (ask a question — answer must be Hebrew), equipment wizard,
trip planner, catch log, auth screens, admin screens; refresh the browser —
language must persist; check `<html dir="rtl">` in devtools.
