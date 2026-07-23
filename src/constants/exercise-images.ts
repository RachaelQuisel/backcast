/**
 * Exercise banner images, kept in a separate module so `exercises.ts` stays
 * importable from plain Node (verify.ts, unit checks) — Node can't resolve
 * `require(...gif)`, which is a Metro/Expo bundler feature.
 *
 * `Partial<Record<ExerciseId, ...>>`: exercises without a registered image
 * (swim, vo2max — decided 2026-07-23) render their card without a thumbnail;
 * callers must guard on undefined.
 *
 * See `scripts/build-exercise-images.py` to regenerate the GIFs from source.
 */
import type { ImageSourcePropType } from 'react-native';
import type { ExerciseId } from './exercises';

export const EXERCISE_IMAGES: Partial<Record<ExerciseId, ImageSourcePropType>> = {
  ohp: require('../../assets/exercises/ohp.gif'),
  'farmers-walk': require('../../assets/exercises/farmers-walk.gif'),
  deadlift: require('../../assets/exercises/deadlift.gif'),
  tgu: require('../../assets/exercises/tgu.gif'),
  'front-squat': require('../../assets/exercises/front-squat.gif'),
};
