/**
 * Assertion-based sanity check for the exercises.ts math. Not a full unit
 * suite (no runner is installed) — just cheap coverage for the surfaces the
 * app quietly depends on. Run: `npx tsx src/prototypes/decline-curve/verify.ts`.
 * Non-zero exit on any failure.
 */
import assert from 'node:assert/strict';
import {
  EXERCISES,
  RETENTION_BY_ACTIVITY,
  backcast,
  targetAtAge,
} from '../../constants/exercises';

const ohp = EXERCISES.find((e) => e.id === 'ohp')!;
const active = 'active' as const;
const sedentary = 'sedentary' as const;
const eq = (a: number, b: number, eps = 1e-4) =>
  assert.ok(Math.abs(a - b) < eps, `expected ${a} ≈ ${b}`);

// backcast prints — kept from earlier verify runs
console.log('backcast(target=65) :', backcast(ohp.baseValueAt100, 35, 65, active).toFixed(4));
console.log('backcast(target=80) :', backcast(ohp.baseValueAt100, 35, 80, active).toFixed(4));
console.log('backcast(target=100):', backcast(ohp.baseValueAt100, 35, 100, active).toFixed(4));
console.log('backcast(target=120):', backcast(ohp.baseValueAt100, 35, 120, active).toFixed(4));

// backcast moves with targetAge — this is the branch's whole point
const at65 = backcast(ohp.baseValueAt100, 35, 65, active);
const at80 = backcast(ohp.baseValueAt100, 35, 80, active);
const at100 = backcast(ohp.baseValueAt100, 35, 100, active);
assert.ok(at65 < at80, `earlier goal age should need less now (got ${at65} vs ${at80})`);
assert.ok(at80 < at100, `earlier goal age should need less now (got ${at80} vs ${at100})`);

// Past-horizon clamp — no negative-exponent silent underprescription
eq(backcast(30, 82, 80, active), 30);
eq(backcast(30, 80, 80, active), 30);
eq(backcast(30, 100, 50, active), 30);

// backcast formula on a normal case
const expected80 = ohp.baseValueAt100 / Math.pow(RETENTION_BY_ACTIVITY.active, (80 - 35) / 10);
eq(backcast(ohp.baseValueAt100, 35, 80, active), expected80);

// Sedentary requires more now for the same target — steeper decline
const activeReq = backcast(30, 35, 80, active);
const sedentaryReq = backcast(30, 35, 80, sedentary);
assert.ok(sedentaryReq > activeReq, `sedentary should need more now (got ${sedentaryReq} vs ${activeReq})`);

// targetAtAge trajectory: value at targetAge equals the target itself
eq(targetAtAge(30, 80, 80, active), 30);
// Pre-target: needs more (younger = higher on the curve)
assert.ok(targetAtAge(30, 70, 80, active) > 30);
// Post-target: less (natural decline)
assert.ok(targetAtAge(30, 90, 80, active) < 30);

console.log('\nOK — all assertions passed.');
