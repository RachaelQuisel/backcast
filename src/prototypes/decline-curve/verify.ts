/**
 * Assertion-based sanity check for the exercises.ts math. Not a full unit
 * suite (no runner is installed) — just cheap coverage for the surfaces the
 * app quietly depends on. Run: `npx tsx src/prototypes/decline-curve/verify.ts`.
 * Non-zero exit on any failure.
 *
 * Model under test (2026-07-23): age-bracketed decline for untrained adults —
 * 0%/decade before 30, 7.5%/decade ages 30-49, 13.5%/decade ages 50-69,
 * 30%/decade at 70+ — with 'active' evaluating the curve at (age - 15),
 * the functional-age shift regular resistance training buys.
 */
import assert from 'node:assert/strict';
import {
  EXERCISES,
  ACTIVE_FUNCTIONAL_AGE_SHIFT,
  declineFactor,
  backcast,
  targetAtAge,
} from '../../constants/exercises';

const ohp = EXERCISES.find((e) => e.id === 'ohp')!;
const active = 'active' as const;
const sedentary = 'sedentary' as const;
const eq = (a: number, b: number, eps = 1e-6) =>
  assert.ok(Math.abs(a - b) < eps, `expected ${a} ≈ ${b}`);

// --- declineFactor: bracket math ---

// Entirely before 30: no decline
eq(declineFactor(20, 29, sedentary), 1);
// One full decade inside 30-49 (sedentary): 7.5% loss
eq(declineFactor(35, 45, sedentary), 0.925);
// One full decade inside 50-69 (sedentary): 13.5% loss
eq(declineFactor(52, 62, sedentary), 0.865);
// One full decade at 70+ (sedentary): 30% loss
eq(declineFactor(70, 80, sedentary), 0.70);
// Crossing the 70 boundary splits the decade: 5y at 13.5% + 5y at 30%
eq(declineFactor(65, 75, sedentary), Math.pow(0.865, 0.5) * Math.pow(0.70, 0.5));
// Multi-bracket span 41→80 (sedentary): 9y@7.5 + 20y@13.5 + 10y@30
eq(
  declineFactor(41, 80, sedentary),
  Math.pow(0.925, 0.9) * Math.pow(0.865, 2) * 0.70
);

// --- the active functional-age shift ---

assert.equal(ACTIVE_FUNCTIONAL_AGE_SHIFT, 15);
// Active 45→55 declines like sedentary 30→40
eq(declineFactor(45, 55, active), declineFactor(30, 40, sedentary));
// Active under effective age 30: no decline yet
eq(declineFactor(38, 44, active), 1);
// Active is never steeper than sedentary over the same span
assert.ok(declineFactor(41, 80, active) > declineFactor(41, 80, sedentary));

// --- backcast ---

// Past-horizon clamp — no silent underprescription
eq(backcast(30, 82, 80, active), 30);
eq(backcast(30, 80, 80, active), 30);
eq(backcast(30, 100, 50, active), 30);

// backcast = target / declineFactor
eq(
  backcast(ohp.baseValueAt100, 41, 80, sedentary),
  ohp.baseValueAt100 / declineFactor(41, 80, sedentary)
);

// backcast moves with targetAge
const at65 = backcast(ohp.baseValueAt100, 35, 65, active);
const at80 = backcast(ohp.baseValueAt100, 35, 80, active);
const at100 = backcast(ohp.baseValueAt100, 35, 100, active);
assert.ok(at65 < at80, `earlier goal age should need less now (got ${at65} vs ${at80})`);
assert.ok(at80 < at100, `earlier goal age should need less now (got ${at80} vs ${at100})`);

// Sedentary requires more now for the same target — steeper curve
assert.ok(backcast(30, 35, 80, sedentary) > backcast(30, 35, 80, active));

// Acceleration: the decade 70→80 costs more than the decade 40→50 (sedentary)
assert.ok(declineFactor(70, 80, sedentary) < declineFactor(40, 50, sedentary));

// --- targetAtAge trajectory ---

// At targetAge: the target itself
eq(targetAtAge(30, 80, 80, active), 30);
// Pre-target: needs more
assert.ok(targetAtAge(30, 70, 80, active) > 30);
// Post-target: continued decline
assert.ok(targetAtAge(30, 90, 80, active) < 30);
// Post-target math: value at 90 for target 30@80 (sedentary) = 30 * factor(80→90)
eq(targetAtAge(30, 90, 80, sedentary), 30 * declineFactor(80, 90, sedentary));

console.log('backcast(41→80, sedentary):', backcast(ohp.baseValueAt100, 41, 80, sedentary).toFixed(2));
console.log('backcast(41→80, active)   :', backcast(ohp.baseValueAt100, 41, 80, active).toFixed(2));
console.log('\nOK — all assertions passed.');
