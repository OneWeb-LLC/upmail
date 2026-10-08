# Upmail OWeb environment manifest

Names only — never commit secret values.

## Required (shared One OS)

| Name | Scope | Notes |
| --- | --- | --- |
| `SUPABASE_URL` | Server | `https://auth.oweb.one` (or project URL) |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Client | Legacy anon JWT or `sb_publishable_*` |
| `NEXT_PUBLIC_SUPABASE_PROJECT_ID` | Client | `ebjzdcnphkfpxfldnatm` |

## Required (Upmail satellite mode)

| Name | Scope | Notes |
| --- | --- | --- |
| `OWEB_SATELLITE_ENABLED` | Server | `true` to enable OneID login + SSO paths |
| `OWEB_CONTROL_PLANE_URL` | Server | Default `https://oweb.one` |
| `NEXT_PUBLIC_OWEB_CONTROL_PLANE_URL` | Client | Continue-with-OWeb links |

## Optional aliases

| Name | Notes |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Alias for publishable key |

## Not needed on the satellite

| Name | Reason |
| --- | --- |
| `SUPABASE_SERVICE_ROLE_KEY` | SSO redeem uses OWeb HTTP API; do not bundle service role in Upmail |
| Second Stripe / wallet env set | Entitlements remain on OWeb |
| OWeb integration credential blobs | Execution providers discovered via OWeb APIs |

## Existing Upmail env (unchanged)

Gmail/Outlook provider OAuth (`GOOGLE_*`, `MICROSOFT_*`), `DATABASE_URL`, `AUTH_SECRET`, LLM keys, and mail encryption secrets remain required for mailbox sync and AI features.
