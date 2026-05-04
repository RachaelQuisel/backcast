/**
 * Backcast exercise definitions based on Peter Attia's Centenarian Decathlon.
 * Base values are targets at age 100. The app backcasts from these using
 * a 15% decline per decade compound formula.
 */

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
 * Backcast formula: what you need NOW to hit the base value at your target age.
 * Uses 15% decline per decade (Attia's model).
 *
 * current_target = base_value_at_target / (0.85 ^ decades_remaining)
 *
 * Since we store base values at age 100, we first compute what the value
 * would be at the user's target age, then backcast to their current age.
 */
export function backcast(
  baseValueAt100: number,
  currentAge: number,
  targetAge: number = 80
): number {
  const decadesFromTargetTo100 = (100 - targetAge) / 10;
  const valueAtTargetAge = baseValueAt100 / Math.pow(0.85, decadesFromTargetTo100);
  const decadesRemaining = (targetAge - currentAge) / 10;
  return valueAtTargetAge / Math.pow(0.85, decadesRemaining);
}

/**
 * Get the target value at a specific age (for the progress table).
 */
export function targetAtAge(baseValueAt100: number, age: number): number {
  const decadesFrom100 = (100 - age) / 10;
  return baseValueAt100 / Math.pow(0.85, decadesFrom100);
}
