# Decline-curve prototype

**PROTOTYPE — throwaway. Delete or fold the answer back in when done.**

Co-located with the real math at `src/constants/exercises.ts`. The TUI imports
`backcast()` / `targetAtAge()` directly so it tests the real code, not a port.

## The question

The compound decline math in `exercises.ts` is short and clean — but does it
behave sensibly across the cases users will actually hit? Specifically:

- **Already-past-target.** If a 70-year-old picks target age 65, what does the
  formula return? Is the negative-decade exponent meaningful or nonsense?
- **Target past 100.** If someone picks target age 105, the
  `(100 - targetAge) / 10` factor goes negative. Same question.
- **Activity flag asymmetry.** The model assumes one activity level for life.
  Is that an acceptable simplification, or does it lie badly enough to
  matter for users who change activity mid-life?
- **`minTargetAt100` enforcement.** The exercise definitions ship a
  `minTargetAt100` floor. Is the math honoring it, or is that purely a UI
  concern?
- **`higherIsBetter` flag.** Set to `true` for every exercise including swim
  (treaded minutes). Is the flag dead weight, or actually used somewhere?

## Run it

```bash
cd /Users/rachaelquisel/Claude-Work/PROJECTS/backcast
npm run prototype:decline
```

One key + Enter per action:

| key | action |
|-----|--------|
| `n` / `p` | next / prev exercise |
| `A` / `a` | current age +/- 1 |
| `T` / `t` | target age +/- 1 |
| `s` | toggle activity (active ↔ sedentary) |
| `r` | reset to defaults |
| `q` | quit |

The frame shows the target value at your chosen target age, what you'd need
right *now* to hit it, and a per-decade roadmap. Edge cases trigger a red
warning line.

## Files

- `cli.ts` — throwaway TUI shell. Imports `EXERCISES`, `backcast`,
  `targetAtAge` from `../../constants/exercises`. Delete after the question
  is answered.

The math module itself (`src/constants/exercises.ts`) is **not** part of the
prototype — it's the real code being tested.

## Status

**ANSWERED — fix shipped on branch `fix/backcast-target-age-bug`.** The math
in `src/constants/exercises.ts` was changed to make `targetAge` actually
affect the result. Callers in `dashboard.tsx`, `log.tsx`, and `about.tsx`
were updated. Verify with `verify.ts`:

```
backcast(target=65) : 38.7832
backcast(target=80) : 43.9503
backcast(target=100): 51.9261
backcast(target=120): 61.3494
```

This prototype directory and the script line in `package.json` can be
deleted once the branch is merged. Keeping it around for now in case the
fix needs revisiting.

## Original verdict

> **Verdict:** Math is internally consistent but the `backcast()` API is
> misleading. The `targetAge` parameter is **algebraically dead** — it cancels
> out of the formula. `backcast(base, currentAge, targetAge, activity)` always
> returns `targetAtAge(base, currentAge, activity)` for any value of
> `targetAge`. Verified with `verify.ts` — returns 51.9261 lbs for target ages
> 65, 80, 100, and 120.
>
> **What surprised me:**
> 1. **`backcast()`'s `targetAge` is a no-op.** Onboarding asks for it, the
>    function takes it, the math ignores it. Users who pick target 65 vs target
>    90 get the same "need now" number. That's either a bug in the math or
>    a misleading API surface — either way it needs deciding.
> 2. **Past-target and past-100 produce valid math but product nonsense.**
>    `targetAge < currentAge` returns a number; `targetAge=110` returns a
>    number; `currentAge=105` returns a number. The TUI flags these but the
>    real onboarding/goals UI must block them at input.
> 3. **Activity level is assumed constant for life.** Toggling activity in the
>    TUI recomputes the entire trajectory as if the user had been at that
>    level since birth. Probably acceptable as a v1 simplification, but worth
>    a note in `about.tsx`.
> 4. **`higherIsBetter` and `minTargetAt100` are dead in the math layer.**
>    They live on the `Exercise` type but neither math function reads them.
>    Likely UI-only — confirm by greping for usages, then either remove from
>    the type or document them as UI-layer concerns.
>
> **What to fold into real code:**
> 1. Decide intent for `backcast()`. Two options:
>    - **It's wrong:** target age should affect the result somehow. Rework the
>      formula. Most likely the user wants "what do I need now to clear my
>      target *at target age*" → that's just `targetAtAge(base, currentAge)`
>      scaled relative to `targetAtAge(base, targetAge)`. Even simpler: drop
>      the parameter, rename the function `requiredNow()`, document that the
>      target age only affects the displayed *floor*, not the slope.
>    - **It's right and the parameter is vestigial:** delete it. Update
>      onboarding/goals to either remove target-age selection or use it only
>      for displaying the roadmap, not the headline number.
> 2. Add input guards in `onboarding.tsx` / `goals.tsx`:
>    `targetAge >= currentAge`, `currentAge ≤ 100`, `targetAge ≤ 100`.
> 3. Either drop `higherIsBetter`/`minTargetAt100` from `Exercise` or document
>    them as UI-layer-only.
