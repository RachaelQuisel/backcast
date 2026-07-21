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
 * Decline rates by activity level:
 *   - active:    8%/decade (Fitzgerald 1997, Wroblewski 2011)
 *   - sedentary: 13%/decade (population averages, Pollock 1997)
 */

export type ActivityLevel = 'active' | 'sedentary';

/** Retention factor per decade (1 - decline rate). */
export const RETENTION_BY_ACTIVITY: Record<ActivityLevel, number> = {
  active: 0.92, // 8% decline
  sedentary: 0.87, // 13% decline
};

export const DEFAULT_ACTIVITY_LEVEL: ActivityLevel = 'active';

export interface Exercise {
  id: string;
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

export function retentionFor(activityLevel: ActivityLevel = DEFAULT_ACTIVITY_LEVEL): number {
  return RETENTION_BY_ACTIVITY[activityLevel];
}

/**
 * The default `targetValue` the user commits to at `targetAge`.
 *
 * Under this app's model the threshold is age-invariant: whatever your
 * chosen `targetAge`, the default target is Attia's threshold value.
 * Kept as a helper so callers stay decoupled from the field name.
 * `targetAge` and `activityLevel` are unused today but stay in the signature
 * to make future model changes a one-file edit.
 */
export function defaultTargetAt(
  exercise: Pick<Exercise, 'baseValueAt100'>,
  _targetAge: number,
  _activityLevel: ActivityLevel = DEFAULT_ACTIVITY_LEVEL
): number {
  return exercise.baseValueAt100;
}

/**
 * The default minimum target the user is allowed to set at `targetAge`.
 * Same age-invariance rationale as `defaultTargetAt`.
 */
export function minTargetAt(
  exercise: Pick<Exercise, 'minTargetAt100'>,
  _targetAge: number,
  _activityLevel: ActivityLevel = DEFAULT_ACTIVITY_LEVEL
): number {
  return exercise.minTargetAt100;
}

/**
 * What you need NOW to hit `targetValue` at `targetAge`.
 *
 * `targetValue` is the capability the user has committed to at `targetAge`.
 * Past the target age, natural decline continues unchecked — this app models
 * a maintenance commitment ending at target age, not a post-target trajectory.
 *
 * When `targetAge <= currentAge` the horizon has passed; return `targetValue`
 * unchanged (the commitment stands). Without this clamp the negative
 * exponent silently prescribes a value *below* the commitment.
 */
export function backcast(
  targetValue: number,
  currentAge: number,
  targetAge: number,
  activityLevel: ActivityLevel = DEFAULT_ACTIVITY_LEVEL
): number {
  if (targetAge <= currentAge) return targetValue;
  const retention = retentionFor(activityLevel);
  const decadesRemaining = (targetAge - currentAge) / 10;
  return targetValue / Math.pow(retention, decadesRemaining);
}

/**
 * The value along the user's trajectory at any age.
 *
 * Anchored at `targetValue` at `targetAge`. Pre-target it ramps up (you need
 * more at younger ages to maintain to target). Post-target it ramps down
 * (natural decline continues). At `age === targetAge` it equals `targetValue`.
 *
 * Same shape as `backcast` without the past-horizon clamp — this function is
 * used to plot roadmap points, where "value at age N > targetAge" is a
 * legitimate projection of continued decline, not a stale commitment.
 */
export function targetAtAge(
  targetValue: number,
  age: number,
  targetAge: number,
  activityLevel: ActivityLevel = DEFAULT_ACTIVITY_LEVEL
): number {
  const retention = retentionFor(activityLevel);
  const decadesFromTarget = (targetAge - age) / 10;
  return targetValue / Math.pow(retention, decadesFromTarget);
}
