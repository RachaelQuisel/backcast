/**
 * Backcast exercise definitions based on Peter Attia's Centenarian Decathlon.
 * Base values are targets at age 100. The app backcasts from these using
 * an 8% decline per decade compound formula, which aligns with research on
 * trained adults (Fitzgerald 1997: 5%/decade VO2 active, Wroblewski 2011:
 * minimal strength loss in master's athletes through age 81).
 */

/** Compound retention factor per decade (1 - decline rate). 0.92 = 8% decline. */
export const DECLINE_RETENTION_PER_DECADE = 0.92;

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

/**
 * What you need NOW to hit the base value at your target age.
 * Base values are stored at age 100, so we compound the retention factor
 * across the decades between the user's age and 100.
 */
export function backcast(
  baseValueAt100: number,
  currentAge: number,
  targetAge: number = 80
): number {
  const decadesFromTargetTo100 = (100 - targetAge) / 10;
  const valueAtTargetAge =
    baseValueAt100 / Math.pow(DECLINE_RETENTION_PER_DECADE, decadesFromTargetTo100);
  const decadesRemaining = (targetAge - currentAge) / 10;
  return valueAtTargetAge / Math.pow(DECLINE_RETENTION_PER_DECADE, decadesRemaining);
}

export function targetAtAge(baseValueAt100: number, age: number): number {
  const decadesFrom100 = (100 - age) / 10;
  return baseValueAt100 / Math.pow(DECLINE_RETENTION_PER_DECADE, decadesFrom100);
}
