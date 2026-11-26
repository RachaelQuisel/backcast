import React from 'react';
import { Image, type ImageStyle, type StyleProp, type ViewStyle } from 'react-native';
import { useVideoPlayer, VideoView, type VideoSource } from 'expo-video';
import { EXERCISE_IMAGES, EXERCISE_VIDEOS } from '@/constants/exercise-images';
import type { ExerciseId } from '@/constants/exercises';
import { useReduceMotion } from '@/hooks/use-reduce-motion';

type Props = {
  id: ExerciseId;
  /** Shared by the video and image, e.g. the card banner size and radius. */
  style: StyleProp<ViewStyle & ImageStyle>;
  accessibilityLabel: string;
};

/**
 * The demo for one exercise: its looping video if it has one, else its image,
 * else nothing.
 */
export function ExerciseMedia({ id, style, accessibilityLabel }: Props) {
  const video = EXERCISE_VIDEOS[id];
  if (video) {
    return <ExerciseVideo source={video} style={style} accessibilityLabel={accessibilityLabel} />;
  }
  const image = EXERCISE_IMAGES[id];
  if (image) {
    return (
      <Image
        source={image}
        style={style as StyleProp<ImageStyle>}
        resizeMode="cover"
        accessibilityLabel={accessibilityLabel}
      />
    );
  }
  return null;
}

/**
 * Muted, looping, no controls: it plays like the GIFs it replaces. Muted is
 * also what lets browsers autoplay it. With "reduce motion" on, it holds on
 * its first frame instead of playing.
 */
function ExerciseVideo({
  source,
  style,
  accessibilityLabel,
}: {
  source: VideoSource;
  style: StyleProp<ViewStyle>;
  accessibilityLabel: string;
}) {
  const reduceMotion = useReduceMotion();
  const player = useVideoPlayer(source, (p) => {
    p.loop = true;
    p.muted = true;
  });

  React.useEffect(() => {
    // Wait for the OS answer: playing first and pausing after would flash
    // motion and reject the browser's play() promise.
    if (reduceMotion === null) return;
    if (reduceMotion) player.pause();
    else player.play();
  }, [player, reduceMotion]);

  return (
    <VideoView
      player={player}
      style={style}
      contentFit="cover"
      nativeControls={false}
      allowsPictureInPicture={false}
      accessibilityLabel={accessibilityLabel}
    />
  );
}
