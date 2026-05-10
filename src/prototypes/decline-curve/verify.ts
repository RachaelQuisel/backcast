import { backcast } from '../../constants/exercises';
const base = 30.2, age = 35, activity = 'active' as const;
// After the fix: targetAge MUST change the result. Younger target = shorter
// maintenance horizon = lower required-now value.
console.log('backcast(target=65) :', backcast(base, age, 65, activity).toFixed(4));
console.log('backcast(target=80) :', backcast(base, age, 80, activity).toFixed(4));
console.log('backcast(target=100):', backcast(base, age, 100, activity).toFixed(4));
console.log('backcast(target=120):', backcast(base, age, 120, activity).toFixed(4));
