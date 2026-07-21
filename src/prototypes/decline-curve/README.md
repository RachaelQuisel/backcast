# Decline-curve prototype

Kept around as a live sanity harness for the exercises.ts math. Not a formal
test suite — the project has no runner — but the two scripts here are the
cheapest way to catch a regression in the decline formula or the past-horizon
clamp before it reaches the app.

## Files

- **`verify.ts`** — assertion-based math check. Covers `defaultTargetAt` /
  `minTargetAt` identity under Model B, `backcast` past-horizon clamp,
  `targetAtAge` trajectory shape, active-vs-sedentary asymmetry. Non-zero exit
  on any failed assertion.
  ```bash
  npx tsx src/prototypes/decline-curve/verify.ts
  ```

- **`cli.ts`** — interactive TUI shell for driving `backcast()` and
  `targetAtAge()` through edge cases by hand (past-target, target-past-100,
  activity toggle). Useful when tweaking the formula.
  ```bash
  npm run prototype:decline
  ```

- **`dashboard-test.py`** — Playwright script that boots the live dashboard
  against mocked Supabase for three target ages and asserts the "Your target
  now" value matches `backcast()`. Seeds a custom target so the test
  exercises the targetAge branch (default targets are age-invariant by
  design under Model B — see below).
  ```bash
  # requires the web dev server running at :8082
  npm run web
  # then, from another shell:
  python3 src/prototypes/decline-curve/dashboard-test.py
  ```

- **`screenshots/`** — full-page captures from the Playwright run.

## Model B (locked)

The app treats `baseValueAt100` as a **threshold you commit to hitting at
your chosen `targetAge`** — not a fixed age-100 spec. Same threshold value
whichever `targetAge` you pick; the earlier the target, the more work is
required *now* to defend it.

- Default `targetValue` at `targetAge` = `baseValueAt100` (identity).
- Required now = `baseValueAt100 / retention^((targetAge - currentAge)/10)`.
- Past horizon (`targetAge ≤ currentAge`): returns `targetValue` unchanged.

Custom targets carry a `{value, targetAge, activityLevel}` stamp. Changing
the profile's `targetAge` or `activityLevel` no longer re-anchors the
commitment silently — the card falls into a "Set for age X" warning state
that keeps the stored value visible and prompts a re-set.

## Migration note

Legacy `custom_targets` from before the fix were plain numbers normalized to
Attia's age-100 form. Migration stamps them as
`{value: X, targetAge: 100, activityLevel: <profile's current>}`. Anyone
whose current targetAge ≠ 100 will see the stale-warning path on first
load, which is the correct behavior — we can't recover the user's original
targetAge intent from the legacy data.
