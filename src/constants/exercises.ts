/**
 * Backcast exercise definitions based on Peter Attia's Centenarian Decathlon.
 *
 * `baseValueAt100` is the capability threshold from Attia's framework — a
 * level Attia argues is enough to stay independent in old age. The name is
 * historical (Attia originally anchored it at age 100), but in this app the
 * threshold is *the same value at whatever age the user commits to*: pick
 * targetAge=80 and the app treats 30 lb OHP as your goal at 80, not at 100.
 * `backcast()` then tells you what you need right now to defend that
 * threshold from currentAge to targetAge.
 *
 * Decline model (2026-07-23): strength decline accelerates with age. For
 * average adults WITHOUT regular resistance training, per-decade loss is:
 *   - under 30:  0% (strength peaks late 20s / early 30s)
 *   - 30-49:     ~7.5%  (gradual fast-twitch fiber loss, subtle hormonal shifts)
 *   - 50-69:     ~13.5% (sharper hormonal decline, loss of active motor units)
 *   - 70+:       ~30%   (steep loss of power, balance, motor-unit recruitment)
 * Strength falls 2-5x faster than muscle mass — fast-twitch fibers atrophy
 * first, neural drive weakens, and fat infiltrates muscle tissue — which is
 * why these rates are steeper than mass-loss numbers.
 *
 * 'active' models the documented effect of resistance training 2-3x/week:
 * functional age shifts back ~15-20 years. We evaluate the same curve at
 * (age - 15), the conservative end of that range.
 */

export type ActivityLevel = 'active' | 'sedentary';

/**
 * Per-decade strength loss (fraction) for untrained adults, by the age at
 * which each bracket begins. Brackets: [30,50), [50,70), [70,∞). Midpoints
 * of the research ranges (5-10%, 12-15%, 25-35%).
 */
export const UNTRAINED_DECLINE_BRACKETS: ReadonlyArray<{ startAge: number; lossPerDecade: number }> = [
  { startAge: 30, lossPerDecade: 0.075 },
  { startAge: 50, lossPerDecade: 0.135 },
  { startAge: 70, lossPerDecade: 0.30 },
];

/** Years of functional age that regular resistance training buys back. */
export const ACTIVE_FUNCTIONAL_AGE_SHIFT = 15;

export const DEFAULT_ACTIVITY_LEVEL: ActivityLevel = 'active';

/**
 * Literal-union of every exercise id. Load-bearing at the type layer: `Exercise.id`
 * uses it, and `EXERCISE_IMAGES` in `exercise-images.ts` is `Record<ExerciseId, ...>`
 * so a new exercise without a matching image is a compile error, not a runtime one.
 */
export type ExerciseId =
  | 'ohp'
  | 'farmers-walk'
  | 'deadlift'
  | 'tgu'
  | 'front-squat'
  | 'swim'
  | 'vo2max';

export interface Exercise {
  id: ExerciseId;
  name: string;
  description: string; // the real-life activity
  unit: string;
  baseValueAt100: number;
  /** Min value users can set as their goal at target age */
  minTargetAt100: number;
  /** Higher is better (true for weights/VO2), lower is better for swim time */
  higherIsBetter: boolean;
}

export const EXERCISES: Exercise[] = [
  {
    id: 'ohp',
    name: 'Overhead Press',
    description: 'Put a suitcase in an overhead bin',
    unit: 'lbs (5 reps)',
    baseValueAt100: 30.2,
    minTargetAt100: 10,
    higherIsBetter: true,
  },
  {
    id: 'farmers-walk',
    name: "Farmer's Walk",
    description: 'Carry 4 bags of groceries up 2 flights of stairs',
    unit: 'lbs (3 min)',
    baseValueAt100: 41.5,
    minTargetAt100: 15,
    higherIsBetter: true,
  },
  {
    id: 'deadlift',
    name: 'Dead Lift',
    description: 'Pick up a 40 lb child from the floor',
    unit: 'lbs (10 reps)',
    baseValueAt100: 60.3,
    minTargetAt100: 20,
    higherIsBetter: true,
  },
  {
    id: 'tgu',
    name: 'Turkish Get-Up',
    description: 'Get up from the ground with control and confidence',
    unit: 'lbs (5 reps)',
    baseValueAt100: 11.3,
    minTargetAt100: 5,
    higherIsBetter: true,
  },
  {
    id: 'front-squat',
    name: 'Front Squat',
    description: 'Squat to pick things up, carry loads confidently',
    unit: 'lbs (10 reps)',
    baseValueAt100: 41.5,
    minTargetAt100: 15,
    higherIsBetter: true,
  },
  {
    id: 'swim',
    name: 'Tread Water',
    description: 'Tread water without touching the bottom',
    unit: 'minutes',
    baseValueAt100: 3.8,
    minTargetAt100: 1,
    higherIsBetter: true,
  },
  {
    id: 'vo2max',
    name: 'VO2 Max',
    description: 'Overall cardiorespiratory fitness',
    unit: 'mL/kg/min',
    baseValueAt100: 30.2,
    minTargetAt100: 18,
    higherIsBetter: true,
  },
];

/**
 * Fraction of strength retained from `fromAge` to `toAge` (fromAge < toAge).
 *
 * Integrates the bracketed per-decade loss over the age span: each year in a
 * bracket contributes (1 - loss)^(1/10). For 'active', the whole curve is
 * evaluated at (age - ACTIVE_FUNCTIONAL_AGE_SHIFT) — training shifts
 * functional age back, it doesn't change the shape of the curve.
 */
export function declineFactor(
  fromAge: number,
  toAge: number,
  activityLevel: ActivityLevel = DEFAULT_ACTIVITY_LEVEL
): number {
  if (toAge <= fromAge) return 1;
  const shift = activityLevel === 'active' ? ACTIVE_FUNCTIONAL_AGE_SHIFT : 0;
  let lnFactor = 0;
  for (const bracket of UNTRAINED_DECLINE_BRACKETS) {
    const bracketStart = bracket.startAge + shift;
    const next = UNTRAINED_DECLINE_BRACKETS.find((b) => b.startAge > bracket.startAge);
    const bracketEnd = next ? next.startAge + shift : Infinity;
    const overlap = Math.min(toAge, bracketEnd) - Math.max(fromAge, bracketStart);
    if (overlap > 0) {
      lnFactor += (overlap / 10) * Math.log(1 - bracket.lossPerDecade);
    }
  }
  return Math.exp(lnFactor);
}

/**
 * What you need NOW to hit `targetValue` at `targetAge`.
 *
 * `targetValue` is the capability the user has committed to at `targetAge`.
 * Past the target age, natural decline continues unchecked — this app models
 * a maintenance commitment ending at target age, not a post-target trajectory.
 *
 * When `targetAge <= currentAge` the horizon has passed; return `targetValue`
 * unchanged (the commitment stands). Without this clamp the math would
 * silently prescribe a value *below* the commitment.
 */
export function backcast(
  targetValue: number,
  currentAge: number,
  targetAge: number,
  activityLevel: ActivityLevel = DEFAULT_ACTIVITY_LEVEL
): number {
  if (targetAge <= currentAge) return targetValue;
  return targetValue / declineFactor(currentAge, targetAge, activityLevel);
}

/**
 * The value along the user's trajectory at any age.
 *
 * Anchored at `targetValue` at `targetAge`. Pre-target it ramps up (you need
 * more at younger ages to maintain to target). Post-target it ramps down
 * (natural decline continues). At `age === targetAge` it equals `targetValue`.
 *
 * Unlike `backcast` there is no past-horizon clamp — this function plots
 * roadmap points, where "value at age N > targetAge" is a legitimate
 * projection of continued decline, not a stale commitment.
 */
export function targetAtAge(
  targetValue: number,
  age: number,
  targetAge: number,
  activityLevel: ActivityLevel = DEFAULT_ACTIVITY_LEVEL
): number {
  if (age < targetAge) {
    return targetValue / declineFactor(age, targetAge, activityLevel);
  }
  return targetValue * declineFactor(targetAge, age, activityLevel);
}
