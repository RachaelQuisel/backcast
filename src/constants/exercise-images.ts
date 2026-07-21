/**
 * Exercise banner images, kept in a separate module so `exercises.ts` stays
 * importable from plain Node (verify.ts, unit checks) — Node can't resolve
 * `require(...gif)`, which is a Metro/Expo bundler feature.
 *
 * If you add an exercise to EXERCISES in `exercises.ts`, also add its image
 * here. `EXERCISE_IDS_WITH_IMAGES` is checked against `EXERCISES` at module
 * load in `exercise-images-check.ts` — a missing entry fails loudly rather
 * than crashing at render time with an undefined Image source.
 *
 * See `scripts/build-exercise-images.py` to regenerate the GIFs from source
 * (Free Exercise DB pairs → composed animated GIF; Wikimedia Commons stills
 * → single-frame GIF).
 */
import type { ImageSourcePropType } from 'react-native';
import { EXERCISES } from './exercises';

export type ExerciseImageId =
  | 'ohp'
  | 'farmers-walk'
  | 'deadlift'
  | 'tgu'
  | 'front-squat'
  | 'swim'
  | 'vo2max';

const IMAGES: Record<ExerciseImageId, ImageSourcePropType> = {
  ohp: require('../../assets/exercises/ohp.gif'),
  'farmers-walk': require('../../assets/exercises/farmers-walk.gif'),
  deadlift: require('../../assets/exercises/deadlift.gif'),
  tgu: require('../../assets/exercises/tgu.gif'),
  'front-squat': require('../../assets/exercises/front-squat.gif'),
  swim: require('../../assets/exercises/swim.gif'),
  vo2max: require('../../assets/exercises/vo2max.gif'),
};

// Fail loudly at module load if an exercise ships without a banner image.
// Runs on first import of this file (the dashboard). Prevents the silent
// "undefined Image source" crash at render time.
{
  const missing = EXERCISES.map((e) => e.id).filter((id) => !(id in IMAGES));
  if (missing.length > 0) {
    throw new Error(
      `EXERCISE_IMAGES missing entries for: ${missing.join(', ')}. ` +
        `Add the GIF under assets/exercises/ and register it in exercise-images.ts.`
    );
  }
}

/**
 * Lookup the banner image for an exercise id. Returns undefined if unknown —
 * the module-load assertion above guarantees every EXERCISES id has a match,
 * so undefined only ever means "called with an id that isn't in EXERCISES."
 */
export function exerciseImage(id: string): ImageSourcePropType | undefined {
  return (IMAGES as Record<string, ImageSourcePropType>)[id];
}
