# backcast

Pick what you want your body to be capable of in old age. The app backcasts from that target through a compound decline curve and tells you what you need to be able to do **right now** to stay on track.

Built on [Peter Attia's Centenarian Decathlon](https://peterattiamd.com/training-for-the-centenarian-decathlon/) framework with Annie Duke's backcasting model. See `src/app/about.tsx` for the in-app explanation and `age-related-decline-research.md` for the research notes behind the math.

---

## Quick start

```bash
npm install
cp .env.example .env   # then fill in EXPO_PUBLIC_SUPABASE_URL + ANON_KEY
npx expo start         # press `w` for web, `i` for iOS sim, `a` for Android, or scan the QR
```

The app expects a Supabase project with the schema in `supabase-schema.sql` already applied (Supabase Dashboard → SQL editor → paste + run).

## Environment

| Variable | Purpose | Required |
|---|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase project URL | yes |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key (RLS-enforced) | yes |

Both are baked into the public bundle — anon key is designed to be public, but **RLS policies must be enabled** (they are, in `supabase-schema.sql`).

## Deploy

Auto-deploys to Vercel on every push to `main`:

```
GitHub: RachaelQuisel/backcast (private)
Vercel: xray-team-url/backcast
Build:  npx expo export -p web → dist/
```

Both env vars must be set in the Vercel project (Production scope) for the build to succeed — verify with `npx vercel env ls`.

## Tech stack

- **Expo SDK 55** + **expo-router 5** (file-based routing under `src/app/`)
- **Supabase** (anonymous auth + Postgres with RLS)
- **Zustand** for client state (`src/store/user-store.ts`)
- **TypeScript**, no `any`
- **expo-secure-store** on native, `localStorage` on web (see `src/lib/supabase.ts` for the storage adapter)

## Project layout

```
src/
  app/                 # expo-router routes
    _layout.tsx        # root layout + ErrorBoundary registration
    index.tsx          # auth gate → onboarding or dashboard
    onboarding.tsx     # 6-step intake (age, sex, weight, activity, target age)
    goals.tsx          # exercise selection
    dashboard.tsx      # main view: targets + decade roadmap
    log.tsx            # log a single workout entry
    about.tsx          # math + research + caveats
  components/
    error-boundary.tsx # wired via _layout export
  constants/
    exercises.ts       # Exercise list + backcast()/targetAtAge() math
  lib/
    supabase.ts        # client + cross-platform storage adapter
    auth.ts            # ensureSession (anonymous sign-in)
  store/
    user-store.ts      # Zustand store with optimistic Supabase sync
supabase-schema.sql    # tables, RLS policies, triggers, migrations
vercel.json            # build config for auto-deploy
```

## Math model

Targets are stored at age 100 (`baseValueAt100` per exercise). The app compounds a per-decade retention factor based on the user's chosen activity level:

| Activity level | Decline / decade | Retention factor | Source |
|---|---|---|---|
| Active        | 8%  | 0.92 | Fitzgerald 1997 (VO2 trained), Wroblewski 2011 (master's strength) |
| Sedentary     | 13% | 0.87 | Pollock 1997 / population averages |

```
target_at_age(age) = baseValueAt100 / retention ^ ((100 - age) / 10)
backcast(now, target_age) = target_at_age(target_age) / retention ^ ((target_age - now) / 10)
```

Users set their activity level during onboarding and can change it any time via the dashboard pill.

## Useful commands

```bash
npx expo start --web         # dev server (web)
npx expo export -p web       # build to dist/ (what Vercel runs)
npx tsc --noEmit             # type-check
npx vercel ls backcast       # list recent deployments
npx vercel inspect <url> --logs   # build logs for a specific deploy
```

## Privacy

Anonymous auth — no email, no PII. Each user gets a UUID tied to their device storage. Wiping app data wipes the account. This is by design for the MVP and intentionally limits long-term portability — see the `Outstanding` section of `session_handoff.md` for the upgrade-path discussion.
