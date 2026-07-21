/**
 * PROTOTYPE — throwaway TUI shell over the real backcast math in
 * src/constants/exercises.ts. Drives backcast() / targetAtAge() through
 * edge cases by hand. Delete when the question is answered.
 */
import * as readline from 'node:readline';
import {
  EXERCISES,
  RETENTION_BY_ACTIVITY,
  type ActivityLevel,
  type Exercise,
  backcast,
  targetAtAge,
} from '../../constants/exercises';

const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';
const RED = '\x1b[31m';
const RESET = '\x1b[0m';

interface State {
  exerciseIdx: number;
  currentAge: number;
  targetAge: number;
  activity: ActivityLevel;
}

const initial: State = {
  exerciseIdx: 0,
  currentAge: 35,
  targetAge: 80,
  activity: 'active',
};

function flag(s: State): string | null {
  if (s.targetAge < s.currentAge) return 'targetAge < currentAge';
  if (s.targetAge > 100) return 'targetAge > 100 (extrapolating past base age)';
  if (s.currentAge < 0 || s.targetAge < 0) return 'negative age';
  if (s.currentAge > 100) return 'currentAge > 100';
  return null;
}

function render(s: State): void {
  process.stdout.write('\x1b[2J\x1b[H');
  const ex: Exercise = EXERCISES[s.exerciseIdx];
  const atTarget = ex.baseValueAt100;
  const need = backcast(atTarget, s.currentAge, s.targetAge, s.activity);

  console.log(`${BOLD}Backcast decline-curve prototype${RESET}`);
  console.log();
  console.log(`  ${BOLD}exercise${RESET}        ${ex.name}  ${DIM}(${ex.description})${RESET}`);
  console.log(`  ${BOLD}base @100${RESET}       ${ex.baseValueAt100} ${ex.unit}  ${DIM}min target ${ex.minTargetAt100}${RESET}`);
  console.log(`  ${BOLD}current age${RESET}     ${s.currentAge}`);
  console.log(`  ${BOLD}target age${RESET}      ${s.targetAge}`);
  console.log(`  ${BOLD}activity${RESET}        ${s.activity}  ${DIM}(retention/decade ${RETENTION_BY_ACTIVITY[s.activity]})${RESET}`);
  console.log();
  console.log(`  ${BOLD}target value at age ${s.targetAge}${RESET}  ${atTarget.toFixed(2)} ${ex.unit}`);
  console.log(`  ${BOLD}need NOW (age ${s.currentAge})${RESET}      ${need.toFixed(2)} ${ex.unit}`);

  const f = flag(s);
  if (f) console.log(`\n  ${RED}${BOLD}⚠ edge case:${RESET} ${RED}${f}${RESET}`);

  // Show the per-decade roadmap, anchored on the value at target age.
  console.log(`\n${DIM}roadmap (every 10 years from current to 100):${RESET}`);
  for (let age = s.currentAge; age <= 100; age += 10) {
    const v = targetAtAge(atTarget, age, s.targetAge, s.activity);
    console.log(`  ${DIM}age ${age}${RESET}  ${v.toFixed(2)} ${ex.unit}`);
  }

  console.log();
  console.log(`${DIM}actions:${RESET}`);
  console.log(`  ${BOLD}[n]${RESET} ${DIM}next exercise${RESET}    ${BOLD}[p]${RESET} ${DIM}prev exercise${RESET}`);
  console.log(`  ${BOLD}[a/A]${RESET} ${DIM}current age -/+${RESET}  ${BOLD}[t/T]${RESET} ${DIM}target age -/+${RESET}`);
  console.log(`  ${BOLD}[s]${RESET} ${DIM}toggle activity${RESET}   ${BOLD}[r]${RESET} ${DIM}reset${RESET}    ${BOLD}[q]${RESET} ${DIM}quit${RESET}`);
}

function step(s: State, cmd: string): State {
  switch (cmd) {
    case 'n': return { ...s, exerciseIdx: (s.exerciseIdx + 1) % EXERCISES.length };
    case 'p': return { ...s, exerciseIdx: (s.exerciseIdx - 1 + EXERCISES.length) % EXERCISES.length };
    case 'a': return { ...s, currentAge: s.currentAge - 1 };
    case 'A': return { ...s, currentAge: s.currentAge + 1 };
    case 't': return { ...s, targetAge: s.targetAge - 1 };
    case 'T': return { ...s, targetAge: s.targetAge + 1 };
    case 's': return { ...s, activity: s.activity === 'active' ? 'sedentary' : 'active' };
    case 'r': return initial;
    default: return s;
  }
}

let state = initial;
render(state);

const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: false });
rl.on('line', (line) => {
  const cmd = line.trim();
  if (cmd === 'q') { rl.close(); return; }
  state = step(state, cmd);
  render(state);
});
rl.on('close', () => process.exit(0));
