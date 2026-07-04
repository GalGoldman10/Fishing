# הפעלת ChatGPT בבוט / Enable ChatGPT in the bot

הבוט **כבר תומך ב-ChatGPT** (OpenAI) — רק צריך להגדיר מפתח API בשרת.  
מפתח OpenAI **לעולם לא** נכנס לאפליקציה או ל-GitHub — רק ל-Supabase.

The bot **already supports ChatGPT** — you only need to configure an API key on the server.  
The OpenAI key **never** goes in the app or GitHub — only in Supabase secrets.

---

## שלב 1 — פרויקט Supabase (חינם)

1. צור פרויקט ב-[supabase.com](https://supabase.com)
2. התקן CLI: `npm install -g supabase`
3. בתיקיית הפרויקט:

```bash
cd fishguide-ai
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

---

## שלב 2 — מפתח OpenAI

1. קבל API key מ-[platform.openai.com](https://platform.openai.com/api-keys)
2. הגדר אותו כ-secret ב-Supabase:

```bash
supabase secrets set OPENAI_API_KEY=sk-...
supabase secrets set OPENAI_MODEL=gpt-4.1-mini
```

אופציונלי — חיפוש באינטרנט בתוך התשובות:

```bash
supabase secrets set WEB_SEARCH_PROVIDER=auto
supabase secrets set TAVILY_API_KEY=tvly-...
```

---

## שלב 3 — פריסת Edge Functions

**חובה** — בלי זה ChatGPT לא יעבוד (האתר ייפול למנוע מקומי).

### אופציה א — Supabase CLI (מומלץ)

```bash
cd fishguide-ai
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase functions deploy fishing-assistant
supabase functions deploy fishing-research
supabase functions deploy web-search
```

### אופציה ב — GitHub Actions

1. Supabase → Account → **Access Tokens** → צור token
2. GitHub Secrets:
   - `SUPABASE_ACCESS_TOKEN` = ה-token
   - `SUPABASE_PROJECT_REF` = Project ID (מ-Settings → General)
3. GitHub → Actions → **Deploy Supabase Edge Functions** → Run workflow

---

## שלב 4 — חיבור האתר (GitHub Pages)

ב-GitHub → **Settings → Secrets and variables → Actions**, הוסף:

| Secret | ערך |
|--------|-----|
| `EXPO_PUBLIC_SUPABASE_URL` | `https://YOUR_PROJECT.supabase.co` (Project ID from Settings → General, e.g. `jtsjetxvvdckjyqdmrow`) |
| `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | מפתח anon/public מ-Supabase |

אחרי push ל-`main`, האתר יקרא ל-`fishing-assistant` ו-ChatGPT יענה על שאלות.

---

## פיתוח מקומי

```bash
cp supabase/.env.local.example supabase/.env.local
# ערוך OPENAI_API_KEY

supabase start
supabase functions serve fishing-assistant --env-file supabase/.env.local
```

ב-`.env`:

```env
EXPO_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-local-anon-key
EXPO_PUBLIC_USE_MOCK_DATA=true
```

---

## איך זה עובד

```
שאלה → fishing-assistant (Supabase) → ChatGPT + מקורות דיג → תשובה
```

אם Supabase/OpenAI לא מוגדרים — הבוט נופל ל**מנוע מקומי** (בלי ChatGPT).

במסך הצ'אט תראה תג **ChatGPT** כשהתשובה מגיעה מה-AI.

---

## עלות

- Supabase: חינמי לרוב השימוש
- OpenAI: לפי שימוש (מודל ברירת מחדל: `gpt-4.1-mini` — זול יחסית)
