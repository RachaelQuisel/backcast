/**
 * Exercise demo media, kept in a separate module so `exercises.ts` stays
 * importable from plain Node (verify.ts, unit checks) — Node can't resolve
 * `require(...gif)` or `require(...mp4)`, which are Metro/Expo bundler features.
 *
 * An exercise shows its video if it has one, else its image, else nothing
 * (vo2max — decided 2026-07-23). Render through `ExerciseMedia`
 * (src/components/exercise-media.tsx), which handles that order.
 *
 * Videos are short muted MP4 loops (about 125 KB each; the same clip as a GIF
 * is about 4.5 MB). See `scripts/build-exercise-images.py` to rebuild them.
 * `ohp.gif` and `deadlift.gif` (the earlier line drawings) are kept in
 * assets/exercises/ but no longer bundled.
 */
import type { ImageSourcePropType } from 'react-native';
import type { VideoSource } from 'expo-video';
import type { ExerciseId } from './exercises';

export const EXERCISE_VIDEOS: Partial<Record<ExerciseId, VideoSource>> = {
  ohp: require('../../assets/exercises/ohp.mp4'),
  deadlift: require('../../assets/exercises/deadlift.mp4'),
};

export const EXERCISE_IMAGES: Partial<Record<ExerciseId, ImageSourcePropType>> = {
  'farmers-walk': require('../../assets/exercises/farmerswalk.gif'),
  tgu: require('../../assets/exercises/tgu.gif'),
  'front-squat': require('../../assets/exercises/frontsquat.gif'),
  swim: require('../../assets/exercises/swim.gif'),
};
