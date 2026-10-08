# Upmail OWeb satellite foundation

Upmail is a constellation satellite of [OWeb](https://oweb.one) (`app_id`: `upmail`, activation scope: **workspace**).

## Upstream provenance

| Field | Value |
| --- | --- |
| Upstream product | [Inbox Zero](https://github.com/elie222/inbox-zero) |
| Working fork | [OneWeb-LLC/upmail](https://github.com/OneWeb-LLC/upmail) |
| Integration base commit | `84fd613d3dc1b3dbe8c3f46f9ec85d9e8681621c` |

Commercial licensing for the upstream product is **not** cleared in this repository; operators must resolve license terms independently. Preserve upstream notices and attribution.

## Architecture (this PR)

- **Identity**: Shared One OS Supabase Auth (`auth.oweb.one`, project `ebjzdcnphkfpxfldnatm`). Session storage key `ao-supabase-auth`.
- **Native login**: `/login` accepts OneID email/password via Supabase when `OWEB_SATELLITE_ENABLED=true`.
- **Continue with OWeb**: `https://oweb.one/login?launch=upmail`.
- **SSO return**: `/sso?launch_token=…` redeems via `POST https://oweb.one/api/v1/ecosystem/redeem-launch-token` with `{ launch_token, app_id: "upmail" }` (no service-role redeem on the satellite).
- **Activation**: First session calls OWeb `POST /api/v1/oneid/activate` and `POST /api/v1/oneid/activate-workspace` (idempotent).
- **Profiles**: Idempotent `upmail_profiles` projection (`id = auth.users.id`) — see `apps/web/supabase/migrations/`.
- **App bridge (Prisma)**: `User.supabaseAuthId`, `UpmailProfile`, `UpmailEmailAccountWorkspace` map canonical workspace ownership without renaming upstream mail tables.
- **Trust**: Automated `REPLY` / `SEND_EMAIL` / `FORWARD` defer to draft unless `UpmailProfile.autonomousSendEnabled` or `Rule.autonomousSendEnabled` is explicitly true.

## Phased table namespace (follow-up)

Upstream Prisma models (`EmailAccount`, `Rule`, …) keep their names for mergeability. Workspace ownership is enforced through `UpmailEmailAccountWorkspace` plus server-side membership checks against `ao_org_members`. A future phase may introduce `upmail_*` mirrors or renames with a dual-write migration plan.

## Migrations

| Location | Purpose |
| --- | --- |
| `apps/web/prisma/migrations/20261008120000_oweb_satellite_foundation/` | Prisma identity/workspace bridge |
| `apps/web/supabase/migrations/20261008120000_upmail_profiles.sql` | One OS tables + RLS (apply manually to project `ebjzdcnphkfpxfldnatm`) |

Do **not** apply destructive production data migrations from automation.

## Environment

See [OWEB_ENV.md](./OWEB_ENV.md).
