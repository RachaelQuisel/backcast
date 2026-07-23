# Session Handoff — 2026-07-22

## Primary Objective

Ship the `fix/backcast-target-age-bug` PR through a code review, then extend
the branch with:
- Exercise images (bundle + display on cards)
- Landing page redesign (kill the wall of text)
- Dashboard card redesign (kill the sprawl)
- Vercel deploy env-var setup so preview builds actually succeed

Ended blocked on **Vercel Deployment Protection** redirecting every asset
URL to SSO login, which makes dashboard GIFs appear broken on the preview
URL even though the code, bundling, and file paths are all correct.

## What actually shipped on the branch

`origin/fix/backcast-target-age-bug` at `942e133`, 7 commits ahead of `main`:

- **`9222c3a`** — Address code-review findings on the targetAge fix. Lock
  Model B (baseValueAt100 = threshold at any chosen targetAge, not
  age-100 anchor). `backcast()` clamps past-horizon. `CustomTarget` gains
  `{value, targetAge, activityLevel}` shape with legacy-migration on load.
  Stale-target UX preserves the stored commitment visibly and warns.
- **`c3ba73b`** — Add 7 exercise banner GIFs to `assets/exercises/`.
  Sourced from Free Exercise DB (5, Unlicense) + Wikimedia Commons (2,
  public domain).
- **`b083b62`** — Rubric-driven revisions on the image commit: real
  photographer attribution (VO2 max was fabricated), reproducible
  `scripts/build-exercise-images.py`, type-safe `EXERCISE_IMAGES` via
  `ExerciseId` literal union in `exercises.ts`.
- **`3f35e5d`** — Polish: gradient overlay on card banners, bundled
  `LICENSES-thirdparty.md`, fixed Playwright test port :8082 → :8081,
  verified end-to-end.
- **`a4490a9`** — First landing revision (thumbnail strip + Attia
  subtitle + "Read the science" pill). Later stripped.
- **`69aa9c9`** — Fix phone: `alignSelf: 'stretch'` on the hero strip so
  the first tile wasn't clipped.
- **`f576036`** — Structural code-quality pass. Deleted identity wrappers
  `defaultTargetAt` / `minTargetAt`, deleted runtime `throw` + wrapper
  `exerciseImage(id)`, collapsed the custom-target fallback to a single
  `??` pattern. Net -82 lines.
- **`911eafd`** — Empty commit to re-trigger Vercel after Preview env
  vars were added.
- **`942e133`** — UI pass (this session's last commit). Landing stripped
  to Backcast + Attia subtitle + Let's go button, capped at maxWidth 560
  so desktop doesn't sprawl. Dashboard cards: 110-tall banner → 64×64
  inline thumbnail beside exercise name. Log page: matching 64×64 header
  thumbnail. Reverted the 4 female-subject Wikimedia photos back to Free
  Exercise DB illustrations because 3 of 4 didn't depict the actual
  movement (Jang Miran's clean-and-jerk isn't a deadlift; water polo
  goalkeeper isn't tread water; static kettlebell hold isn't farmer's
  walk).

## Decisions made (and why)

- **Model B locked** — `baseValueAt100` is a threshold the user commits
  to at their chosen `targetAge`, not an age-100 anchor. The branch's
  original intent said `targetAge` should move `backcast()`'s result;
  the alternative reading (scale from age-100 spec) makes `targetAge`
  cancel out for defaults. Model B matches the About page framing.
- **`CustomTarget` shape gets `targetAge` + `activityLevel` stamps** — so
  a later change to either doesn't silently re-anchor the stored
  commitment. Migration stamps legacy plain-number entries as
  `targetAge: 100` because that's the literal meaning of the legacy
  form.
- **Card design: number is the hero** — 64×64 inline thumbnail beside
  the exercise name, no more full-width banner. The target number
  (`44.0`) stays the largest thing on the card by design.
- **Landing minimalism** — no thumbnail strip, no disclaimers pill.
  About tab is always one tap away; the landing doesn't need to sell it.
- **Free Exercise DB > Wikimedia photos for lifts** — visual style
  consistency across all 7 cards + movement accuracy. Rachael asked for
  female subjects; Wikimedia's coverage there is poor and the images
  that exist don't depict the movements. Female representation is on
  the follow-up list, best sourced from Pexels next time.
- **Vercel env vars: added Preview scope for `EXPO_PUBLIC_SUPABASE_URL`
  and `_ANON_KEY`** — Production already had them, Preview didn't, so
  every preview deployment on the PR branch had been failing until now.
- **`defaultTargetAt` / `minTargetAt` deleted** — identity wrappers on
  `exercise.baseValueAt100` / `.minTargetAt100`; misleading signature.
- **`ExerciseId` literal union in `exercises.ts`** — TypeScript enforces
  every EXERCISES id has a matching EXERCISE_IMAGES entry at compile
  time. Replaces the module-load runtime `throw` and the
  `exerciseImage(id): T | undefined` wrapper.

## Outstanding tasks

- [ ] **Dashboard images broken on Vercel preview URL** — cause is
  Vercel Deployment Protection redirecting `/assets/**` requests to
  `vercel.com/sso-api`. The GIFs ARE bundled correctly
  (`dist/assets/assets/exercises/*.gif` after `npx expo export -p web`);
  it's a Vercel edge behavior. **Three fixes to pick from:**
  1. **Merge PR #1 to `main`** — production deployment typically
     bypasses protection. Fastest path; also ships the whole branch.
  2. Turn off Deployment Protection for Preview in the Vercel project
     settings (dashboard → Settings → Deployment Protection).
  3. Visit the preview URL through a Vercel-authenticated session
     (which Rachael's local browser probably already has, so the images
     may actually be visible when she's logged into Vercel).
- [ ] **Female-subject exercise images** — deferred. Wikimedia Commons
  matches were bad. Next attempt: Pexels (better fitness coverage,
  per-image license check).
- [ ] **Post-merge sanity check** — after merge to main, hit the
  production URL and confirm 7 dashboard cards render with GIF thumbs.

## Temporary artifacts reconciled

- Playwright screenshot scripts (`snap_all.py`, `snap_onboarding.py`,
  `check_deployed.py`, `verify_bypass.py`, `screenshot_deployed_raw.py`,
  `inspect_deployed.py`) live only in
  `/private/tmp/claude-501/-Users-rachaelquisel/.../scratchpad/` and can
  be discarded — nothing there needs to persist.
- `.cache/exercise-source-frames/` is gitignored; safe to leave.
- Plan file at `/Users/rachaelquisel/.claude/plans/concurrent-juggling-eclipse.md`
  captured the last plan pass; historical, not durable.

## Continue Prompt

Please copy and paste the following prompt into your next session:

> **PROMPT**: "Please read `session_handoff.md` in `~/Claude-Work/PROJECTS/backcast`. We're finishing the `fix/backcast-target-age-bug` PR. The current blocker is that Vercel Deployment Protection is redirecting dashboard image asset URLs to SSO login on preview deployments — the code is right, the bundling is right, it's a Vercel edge behavior. Start by picking one of the three fixes listed under 'Outstanding tasks' (merge to main is the fastest), then confirm the 7 dashboard GIFs render on the resulting URL."
