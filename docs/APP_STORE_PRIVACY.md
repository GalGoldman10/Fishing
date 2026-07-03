# App Store Privacy Requirements

## Data Collected

| Data | Purpose | Linked to User |
|------|---------|----------------|
| Email | Authentication | Yes |
| Location | Nearby spots, conditions | Optional |
| Catch logs | Personal records | Yes |
| Chat messages | Assistant history | Yes (if signed in) |
| Push token | Trip notifications | Yes (opt-in) |

## Data NOT Collected in Analytics

- Exact GPS coordinates
- Full chat message content
- Catch coordinates (default private)

## User Rights

- Account deletion via Profile → Delete Account
- Calls `account-delete` Edge Function
- Removes profile and auth user

## Placeholders Required Before Release

- Privacy Policy URL
- Terms of Service URL
- App Store privacy nutrition labels

## iOS Info.plist

Location usage descriptions configured in `app.json`.

## Android Permissions

`ACCESS_FINE_LOCATION` — requested only when map/location feature used.
