/**
 * Backcast exercise definitions based on Peter Attia's Centenarian Decathlon.
 * Base values are targets at age 100. The app backcasts from these using a
 * compound decline formula whose rate depends on the user's activity level:
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
 * What you need NOW to hit `targetValue` at `targetAge`.
 *
 * `targetValue` is the capability the user has committed to maintain UNTIL
 * `targetAge` — by default `Exercise.baseValueAt100`, the centenarian-decathlon
 * threshold from Attia's framework. Past the target age, natural decline
 * continues unchecked (this app doesn't model post-target trajectories as
 * a goal — it's a maintenance commitment ending at target age).
 *
 * The earlier version of this function took `targetAge` and ignored it:
 * `targetAge` cancelled out algebraically because the threshold was
 * double-anchored at age 100. That contradicted the product narrative
 * ("pick what you want at 80, 90, or 100"). Fixed: `targetValue` is now
 * the value AT `targetAge`, not at 100.
 */
export function backcast(
  targetValue: number,
  currentAge: number,
  targetAge: number = 80,
  activityLevel: ActivityLevel = DEFAULT_ACTIVITY_LEVEL
): number {
  const retention = retentionFor(activityLevel);
  const decadesRemaining = (targetAge - currentAge) / 10;
  return targetValue / Math.pow(retention, decadesRemaining);
}

/**
 * The value along the user's trajectory at any age.
 *
 * Anchored at `targetValue` at `targetAge`. Pre-target it ramps up (you need
 * more now than at target). Post-target it ramps down (natural decline
 * continues). At `age === targetAge` it equals `targetValue`.
 *
 * Mathematically identical to `backcast`; kept as a separate name for
 * call-site readability — `backcast(...)` reads as "what I need now",
 * `targetAtAge(...)` reads as "the trajectory's value at age X".
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
