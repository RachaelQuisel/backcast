/**
 * Exercise banner images, kept in a separate module so `exercises.ts` stays
 * importable from plain Node (verify.ts, unit checks) — Node can't resolve
 * `require(...gif)`, which is a Metro/Expo bundler feature.
 */
import type { ImageSourcePropType } from 'react-native';

export const EXERCISE_IMAGES: Record<string, ImageSourcePropType> = {
  ohp: require('../../assets/exercises/ohp.gif'),
  'farmers-walk': require('../../assets/exercises/farmers-walk.gif'),
  deadlift: require('../../assets/exercises/deadlift.gif'),
  tgu: require('../../assets/exercises/tgu.gif'),
  'front-squat': require('../../assets/exercises/front-squat.gif'),
  swim: require('../../assets/exercises/swim.gif'),
  vo2max: require('../../assets/exercises/vo2max.gif'),
};
