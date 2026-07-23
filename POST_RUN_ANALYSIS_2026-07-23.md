# Post-Run Analysis — 2026-07-23 — Push UI pass to prod + fix /onboarding 404

## The ask

> I need to make [the push through Vercel] happen because it doesn't look good.

Landing URL she pasted: `https://backcasting.app/onboarding`.

## What was actually wrong

Two separate problems, only one of which she named:

1. **Named problem:** the 2026-07-22 UI pass wasn't on `backcasting.app`.
2. **Unnamed problem (the real "doesn't look good"):** `backcasting.app/onboarding` returned Vercel's `404 NOT_FOUND` even when the deploy was healthy. Extensionless routes were broken across the whole site — `/dashboard`, `/log`, `/about`, `/goals` all had the same defect.

Root URL `/` worked because Vercel serves `index.html` by default for `/`; every other route needed `.html` appended, which no one was doing.

## What changed on `origin/main`

| Before | After | SHA | What it did |
|---|---|---|---|
| `cafbe0d` | `5b10810` | PR #2 squash | UI pass: minimalist landing, inline 64×64 card thumbnails, drop thumbnail strip + disclaimer pill, cap step-0 content at 560px. **Merged upstream between my initial `git fetch` and my next command — not by me.** Producer unknown; harmless. |
| `5b10810` | `8667d85` | 8667d85 | Update `session_handoff.md` to 2026-07-22 snapshot. Doc only; no app-code delta. |
| `8667d85` | `323970a` | 323970a | Add `cleanUrls: true` and `trailingSlash: false` to `vercel.json` — the fix for the `/onboarding` 404. |

Local `fix/backcast-target-age-bug` is unchanged at `942e133`; the three commits that had lived there are represented on `main` by the squashed PR #2 (`5b10810`).

## Vercel deploys triggered

| Deploy ID | Commit | State | Target | Note |
|---|---|---|---|---|
| `dpl_HaS6LygEhaixaH5jLzzwBWuqqnp5` | `5b10810` | READY | production | UI pass landed on `backcasting.app`. Built before my session started interacting with git. |
| `dpl_5EPYz2bLoxf6oqgn9GW2SNGhVTkc` | `8667d85` | READY | production | Doc-only follow-up. Built in 48s. |
| (unnamed by list_deployments call ordering) | `323970a` | READY | production | The `cleanUrls` fix. Confirmed via `curl -o /dev/null -w '%{http_code}' https://backcasting.app/onboarding` → `HTTP/2 200`, plus a rendered-page screenshot showing the correct minimalist landing at `/onboarding` (screenshot: `screenshot-1784831860113-2.jpg`). |

Earlier failed preview deploys on the fix branch (`dpl_7CF8aH2...`, `dpl_7kgreLd...`, `dpl_EeQHPt...`, `dpl_7A49xr...`) were all previews from earlier commits and never gated production. The last two preview deploys on the branch (`dpl_7rVmHLk...`, `dpl_fNQyKjy...`) both hit READY, so the "Vercel is broken" mental model was already inaccurate before I started.

## Verification

- **Root URL:** `https://backcasting.app/` renders the new minimalist landing — "Backcast" title, hero copy about "the day before you take your last breath," "Let's go" button, no horizontal thumbnail strip, no "Read the science and disclaimers" pill. Screenshot captured at `/var/folders/53/1w1l9xsd2sz1bh_0p7xshwsm0000gn/T/claude-chrome-screenshots-EPv6aJ/screenshot-1784831694096-1.jpg`.
- **`/onboarding` before the fix:** returned Vercel's `404 NOT_FOUND` (screenshot: `screenshot-1784831667951-0.jpg`).
- **`/onboarding` after the fix:** background poll returned `HTTP/2 200` and a re-navigation captured the correct minimalist landing on the extensionless URL (screenshot `screenshot-1784831860113-2.jpg`, same content as `/` — Backcast title + hero copy + "Let's go" button, no thumbnail strip, no disclaimer pill, capped content width).
- **Local `dist/` inspection:** every route file exists post-`npx expo export -p web`: `index.html`, `onboarding.html`, `dashboard.html`, `log.html`, `about.html`, `goals.html`, `_sitemap.html`, `+not-found.html`. The fix maps all five extensionless routes.

## What I did NOT do and why

- **No force-push to `main`.** Ruled out per Rachael's rules; not needed once the merge-commit path was chosen.
- **No rebase of the fix branch.** Would have force-pushed the topic branch. Turned out unnecessary because PR #2 landed the UI pass upstream while I was investigating.
- **No new PR #3.** By the time I finished diagnosing, `main` already had the UI pass, so opening one would have been ceremony over an empty diff.
- **No changes to Expo Router files or `app.json`.** The 404 was a Vercel-config issue, not an app-routing issue — `dist/*.html` files were all produced correctly.
- **No `rewrites` block.** `cleanUrls: true` is the narrower fix; a wildcard SPA rewrite would have masked real 404s (like `/nonexistent`) behind `index.html`.

## Two unknowns I did not resolve

1. **Who merged PR #2.** Landed on `origin/main` between my `git fetch` and my next command. Not this session, not the running Explore agent. Could be: an auto-merge rule on the repo, a parallel Claude session on the same machine, or Rachael tapping Merge in GitHub UI. The resulting `main` state is what she wanted, so I did not chase it further.
2. **Why my first `git commit` landed on `main` instead of `fix/backcast-target-age-bug`.** The reflog shows an implicit `git checkout main && git pull origin main` fired between my `git add session_handoff.md` and my `git commit`. Most likely a session hook (git-guardrails or similar) auto-jumped to main. Functionally identical outcome — the handoff doc and the UI pass both ended up on `main` regardless.

If either of these bites again, the fingerprint to look for is: a session where the current branch changes between `git status` and the next commit, or an `origin/main` that advances during a fetch-then-commit sequence with no visible actor.

## What's next

- **On Rachael's side:** nothing pending. `backcasting.app/onboarding` is live with the new UI. If she wants, she can also verify `/dashboard`, `/log`, `/about`, `/goals` from a signed-in session — the same `cleanUrls` fix covers all of them.
- **Not tracked in this doc but worth flagging separately if it comes up:** the four preview-deploy ERRORs on earlier commits of the fix branch (`f576036`, `9222c3a`, `287100e6`, `3ace242b`) all cite build failures likely related to missing `EXPO_PUBLIC_*` env vars in the Preview scope. Not blocking prod, but if the fix branch ever needs to build a preview again, add those env vars to the Preview scope in Vercel.

---

# Part 2 — Exercise image replacement (same day, follow-on task)

## The ask

GIFs should be bigger, much higher quality, higher res, and all women (not men). Tread water and VO2 max don't need images — delete both.

## What changed

- `assets/exercises/swim.gif` and `assets/exercises/vo2max.gif` deleted. Their cards on the dashboard and log screens now render without a thumbnail (`EXERCISE_IMAGES` became a `Partial` record; both screens guard on undefined before rendering the `Image`).
- The five remaining images replaced. Old: Free Exercise DB 2-frame animations of male demonstrators at 480px / 128 colors (~70–120 KB). New: single-frame photos of women from Wikimedia Commons at 960px / 256 colors (~250–905 KB):
  - `ohp.gif` — woman at barbell overhead press lockout. Public domain, U.S. Air Force photo by Airman 1st Class Jovante Johnson.
  - `farmers-walk.gif` — woman carrying an ammo can in each hand. Public domain, U.S. Marine Corps photo by Lance Cpl. David N. Hersey.
  - `deadlift.gif` — Kathy Nguyen mid-hinge over a Rogue bar. CC BY-SA 2.0, photo by mark sebastian.
  - `tgu.gif` — woman in a kneeling lunge, kettlebell overhead (closest female match on Commons; no woman Turkish get-up photo exists there). CC BY 2.0, photo by Nenad Stojkovic.
  - `front-squat.gif` — Lidia Valentín in a deep clean catch, London 2012. CC BY 2.0, photo by Simon Q.
- Rendered thumbnail size bumped 64×64 → 96×96 on both dashboard and log screens.
- `scripts/build-exercise-images.py` rewritten: Wikimedia-only sources, 960px output, 429 retry with backoff, and fetching via the Commons thumbnail service (their 429 response asks for exactly that).
- Attribution updated in `src/app/about.tsx` and `LICENSES-thirdparty.md`.

## Verification

- Every one of the five output GIFs opened and visually confirmed: woman performing the right exercise, no men in frame, 960px wide.
- This check caught two wrong images from the research pass — the first "deadlift" URL rendered a London 2012 jerk lockout and the first "front-squat" URL rendered a 2008 CrossFit Games photo with a man front and center. Both were replaced with alternates I downloaded and eyeballed before building; the build cache was seeded from those exact verified files.
- One judgment call: the only real woman-deadlift photo from the Marine Corps set has a man standing prominently behind the lifter, so it lost to the Kathy Nguyen photo (woman alone in frame).
- `npx tsc --noEmit`: only the pre-existing `/explore` error in `app-tabs.web.tsx` (on main before this work).

## Licensing note

The deadlift photo is CC BY-SA 2.0 — the derived GIF is shared under the same license (stated in LICENSES-thirdparty.md). The other four are public domain or CC BY 2.0 with attribution given in the About tab.
