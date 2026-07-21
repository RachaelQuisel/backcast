# Session Handoff — backcast — 2026-05-10

## Primary Objective

Use the new `prototype` skill to flush out a real bug in the backcast app, then ship the fix.

## What Shipped This Session

### Found a real math bug
The `backcast()` function in `src/constants/exercises.ts` took a `targetAge`
parameter that **cancelled out algebraically**. Users picking target age 65 vs
90 in onboarding got identical "need now" values — contradicting the product
narrative on `about.tsx` ("Pick the things you want to do at 80 (or 90, or 100)…").

Found via a logic prototype at `src/prototypes/decline-curve/` that drove the
math by hand through edge cases. Verified the cancellation with a 5-line
`verify.ts`.

### Shipped the fix
Branch `fix/backcast-target-age-bug`, **PR #1**: https://github.com/RachaelQuisel/backcast/pull/1

- `src/constants/exercises.ts` — new math: `targetValue` is now the value at
  `targetAge` (not at age 100). `targetAtAge` gained a `targetAge` arg.
- `src/app/dashboard.tsx` — updated `targetAtAge` callsites; simplified
  `targetAtGoal` to just `effectiveBase` (same value by construction now);
  removed the no-longer-needed at-100 conversion in the custom-target edit
  handler; dropped unused `retentionFor` import.
- `src/app/about.tsx` — one paragraph reworded to describe the corrected semantics.
- `src/app/log.tsx` — no change (signature unchanged).
- `src/prototypes/decline-curve/` — full prototype + verify script + Playwright
  UI test + screenshots + README.
- `package.json` — one new dev script: `prototype:decline`.

Zero new tsc errors; pre-existing `app-tabs.web.tsx` `/explore` error is
unrelated and on `main`.

### Verified end-to-end

| target age | rendered "need now" (OHP) | math predicts |
|---|---|---|
| 65 | 38.8 | 38.78 |
| 80 | 44.0 | 43.95 |
| 90 | 47.8 | 47.77 |

Live UI verified via Playwright (`src/prototypes/decline-curve/dashboard-test.py`)
against `expo start --web` with mocked Supabase responses.

## Decisions Made

- **Interpretation of `backcast()`'s intent:** Treat `targetValue` (Attia's
  centenarian-decathlon thresholds) as the capability the user commits to
  maintain *until* their target age. Past target age, natural decline
  continues unchecked. **Why:** Matches the about.tsx narrative ("pick the
  things you want to do at 80 / 90 / 100"). The alternative — treating
  thresholds as anchored at age 100 forever — was the buggy original behavior
  and contradicted the product copy.
- **Did NOT rename `Exercise.baseValueAt100`** to something semantically
  neutral (e.g. `centenarianThreshold`). **Why:** Touches the user-store
  schema and every exercise definition; out of scope for a math fix.
- **Did NOT add input guards** for `targetAge < currentAge` /
  `currentAge > 100` in the math layer. **Why:** Onboarding already
  restricts targetAge to 70–100 via UI chips. Defensive guards in the math
  layer are a separate hardening pass.
- **Pushed branch + opened PR; did NOT push to `main`.** **Why:** Production
  deploy without review is a shared-state action requiring explicit ok.
- **Did NOT modify Vercel Preview env vars.** Tried to (would have made the
  PR's Vercel preview build succeed); user denied — correctly. Modifying
  shared infrastructure config wasn't authorized.

## Outstanding Tasks (in priority order)

- [ ] **Re-enable anonymous sign-in in Supabase** (Dashboard → Auth → Providers
  → Anonymous). Required to test the live app at all.
- [ ] **Add Supabase env vars to Vercel Preview scope** so PR previews build.
  Currently only Production has them. (`vercel env add`, scope = Preview).
- [ ] **Manual QA on the fix.** Locally (`npm run web`) once anon sign-in is
  on: onboard with target=65, clear localStorage, onboard with target=90,
  confirm "your target now" moves between runs. Also exercise the "adjust"
  custom-target flow — the storage semantics changed (input is now stored
  directly as the at-target value, no back-conversion).
- [ ] **Review and merge PR #1** — https://github.com/RachaelQuisel/backcast/pull/1
- [ ] (follow-up issue) Add input guards in `onboarding.tsx` / math layer for
  `targetAge < currentAge`, `currentAge > 100`, `targetAge > 100`.
- [ ] (follow-up issue) Rename `Exercise.baseValueAt100` →
  `centenarianThreshold` (or similar) for semantic clarity.
- [ ] (follow-up issue) Drop the dead `higherIsBetter` flag from `Exercise`,
  or document it as UI-only (currently unused in math).

## Where things live

- **Prototype skill** that found the bug: `~/.claude/skills/prototype/` (also
  pushed to `RachaelQuisel/Skills/prototype/` on GitHub).
- **The prototype + tests** for backcast math: `src/prototypes/decline-curve/`
  in this repo. Includes `cli.ts` (TUI), `verify.ts` (math proof),
  `dashboard-test.py` (Playwright UI test), `screenshots/`, and a README
  with the full verdict.
- **Branch**: `fix/backcast-target-age-bug` (pushed, PR open).
- **Test artifact from skill validation**: `~/Claude-work/prototype-test/subscription-states/`
  — separate from this repo, can delete or keep as a reference example
  of the prototype skill's LOGIC branch.

## Continue Prompt

Please copy and paste the following into your next session:

> **PROMPT**: "Read `session_handoff.md`. We were testing the new `prototype`
> skill on the backcast app and found a real math bug in `backcast()` —
> `targetAge` was algebraically cancelling out. The fix is committed and
> pushed on branch `fix/backcast-target-age-bug` (PR #1) but unmerged. The
> first thing I need before manual QA is to re-enable anonymous sign-in
> in Supabase (Dashboard → Auth → Providers → Anonymous). Once that's on,
> walk me through the manual QA checklist in the handoff. After that, help
> me decide whether to merge the PR as-is or split out the follow-up
> hardening work into separate issues first."
