# Session Handoff — backcast

## Primary Objective

Get the **backcast** Expo web app deployed publicly with auto-deploy from GitHub, then iteratively improve correctness (decline rate math, activity-level personalization, error handling). Started from a local Expo project with no remote and a freshly-applied Supabase schema.

## What Shipped This Session

### Infrastructure
- **Supabase MCP server** added to `.mcp.json` (project ref `wtsfnwhwjbytenxnqrkh`)
- **Supabase agent skills** installed under `.agents/skills/` (`supabase`, `supabase-postgres-best-practices`)
- **Vercel project** `backcast` (renamed from `dist`) under `xray-team-url` team
- **GitHub repo** `RachaelQuisel/backcast` (private, personal account — NOT work)
- **Branch**: `main` (master deleted on local + remote, default branch updated on GitHub)
- **Auto-deploy**: every push to `main` triggers a Vercel build via `vercel.json` (`buildCommand: "npx expo export -p web"`, `outputDirectory: "dist"`)
- **Env vars on Vercel (production scope)**: `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`

### Live URL
- Production: https://backcast-ejc2dsudb-xray-team-url.vercel.app (latest deploy URL changes per push; check `npx vercel ls backcast`)
- Inspector: https://vercel.com/xray-team-url/backcast

### Code Changes (in commit order)
1. **Env validation in `src/lib/supabase.ts`** — throws clear errors when `EXPO_PUBLIC_*` vars missing instead of failing inside supabase-js
2. **Initialize race fix in `src/store/user-store.ts`** — module-scoped `initPromise` dedupes concurrent `initialize()` calls (Strict Mode double-mount could create two anonymous users)
3. **`addLog` rollback in `src/store/user-store.ts`** — optimistic UI now removes the local entry if the Supabase insert fails
4. **Decline rate `15% → 8%`** — extracted `DECLINE_RETENTION_PER_DECADE = 0.92` constant, propagated through `backcast()`, `targetAtAge()`, dashboard custom-target conversion, and copy in `onboarding.tsx` + `about.tsx`
5. **Activity-level personalization** — added `ActivityLevel` type, `RETENTION_BY_ACTIVITY = { active: 0.92, sedentary: 0.87 }`, an onboarding step (now 6 steps total: welcome / age / sex / weight / activity / target age), `setActivityLevel` store action, dashboard inline picker pill, schema column + idempotent migration in `supabase-schema.sql`
6. **ErrorBoundary** moved from `src/app/error.tsx` (which Expo Router exposed as `/error`) to `src/components/error-boundary.tsx`, re-exported from `src/app/_layout.tsx` as `ErrorBoundary`. Logs `name`, `message`, `stack` internally on mount; user copy stays generic.

## Decisions Made & Why

- **Decline rate = 8% active / 13% sedentary**: User flagged that VO2 max targets at the prior 15% rate were elite-athlete territory (~79 mL/kg/min for a 41yo). 8% aligns with Fitzgerald 1997 (~5%/decade VO2 in trained adults) and Wroblewski 2011 (minimal strength loss in master's athletes through 81). 13% picked for sedentary based on Pollock 1997 / population averages cited in the project's research notes (`age-related-decline-research.md`, `fitness-backcasting-decline-rates.md`).
- **Active is the default `activityLevel`**: ensures existing users (if any) see no number changes after the schema migration — only those who explicitly choose "Sedentary" get the 13% curve.
- **Vercel project named `backcast`, not `dist`**: initial deploy ran from `dist/` folder so Vercel inferred the project name; renamed via `vercel project rename` rather than redeploying.
- **GitHub repo on RachaelQuisel personal, private**: explicit user instruction — separation from work GitHub.
- **`master → main`**: per user's terminology preference (stored in memory).
- **No custom domain**: user confirmed they don't own one; auto-assigned `backcast-*.vercel.app` is fine.
- **ErrorBoundary lives in `src/components/`**: keeping it under `src/app/` would re-expose it as a navigable `/error` route. Components dir keeps the route table clean.
- **No Sentry / toast system added**: explicitly noted as out-of-scope follow-ups; user didn't approve those.

## Outstanding Tasks

- [ ] **Supabase migration (CRITICAL — user must run manually)**: in the Supabase SQL editor, run:
  ```sql
  alter table profiles add column if not exists activity_level text default 'active'
    check (activity_level in ('active', 'sedentary'));
  ```
  Without this, the activity-level choice still works locally (and the dashboard pill recalculates the math) but every profile sync logs a `column "activity_level" does not exist` error to console.
- [ ] **Pre-existing TypeScript error**: `src/components/app-tabs.web.tsx:28` references the deleted `/explore` route. Leftover from the Expo starter template; this component isn't actually used by any current route, so it doesn't break the build (Expo bundler doesn't strict-check TS) but it pollutes `tsc --noEmit` output. Either wire it up to a real route or delete `app-tabs.tsx` + `app-tabs.web.tsx`.
- [ ] **Code review follow-ups** (from the `/review` pass earlier — user only asked to fix the top 3):
  - **MEDIUM** — `src/app/dashboard.tsx:11`, `src/app/log.tsx:20` use `useUserStore()` without selectors → re-renders on every unrelated state change. Switch to per-field selectors or `useShallow`.
  - **MEDIUM** — `src/app/dashboard.tsx:20-35` `latestLogs` is two-pass (first pass is dead work). Single-pass max-by-date grouping.
  - **MEDIUM** — `src/app/goals.tsx:19-24` `handleContinue` calls `setSelectedGoals` then immediately `router.replace`; can flicker.
  - **MEDIUM** — Storage adapter in `src/lib/supabase.ts:31-43` silently no-ops `setItem`/`removeItem` during SSR. At minimum, log a one-time warning.
  - **HIGH (deferred)** — Anonymous auth has no upgrade path to email/password. If user wipes device, all data is gone. Out of scope for MVP.
  - **HIGH (deferred)** — `reset()` in `user-store.ts` deletes all profile + workout_logs from Supabase with no in-function confirmation. Add a confirm token argument or rename to `dangerouslyResetAllData`.
  - **LOW** — UI/schema bound mismatches (UI caps age `< 100` and target `<= 100`; schema allows 120). Pick one source of truth.
  - **LOW** — Pressable-inside-Pressable with `stopPropagation` in `dashboard.tsx:120-133` is a smell.
- [ ] **vibe-safe-errors deferred items**:
  - Add Sentry (or similar) so console errors aren't lost on refresh in production.
  - Add a toast system so sync failures (`addLog` rollback, profile sync errors) surface to the user.
  - Validate `profile.activity_level` from DB at the boundary (currently cast w/o runtime check).
- [ ] **`useMemo` on `generateDecadeAges`** in `dashboard.tsx:259` — small perf nit; called twice per render.

## Useful Commands

```bash
# Dev server
cd /Users/rachaelquisel/Claude-work/projects/backcast && npx expo start --web

# Local web build (what Vercel does)
npx expo export -p web

# Check latest deploys
npx vercel ls backcast

# Deploy logs for a specific deploy
npx vercel inspect <deploy-url> --logs

# Manage env vars
npx vercel env ls
npx vercel env add NAME production

# Type check (one pre-existing /explore error noted above)
npx tsc --noEmit
```

## Continue Prompt

Please copy and paste the following prompt into your next session:

> **PROMPT**: "Please read `/Users/rachaelquisel/Claude-work/projects/backcast/session_handoff.md`. We are working on the **backcast** Expo + Supabase + Vercel app. Pick up exactly where we left off — first confirm I've run the `activity_level` Supabase migration (SQL in the Outstanding Tasks section), then we can either tackle the deferred code-review items or move on to a new feature, my choice."
