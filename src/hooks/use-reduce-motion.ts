import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

/**
 * The OS "reduce motion" setting, kept current. `null` until the OS has
 * answered, so callers can avoid starting motion they would then have to stop.
 *
 * Uses React Native's built-in AccessibilityInfo rather than Reanimated's
 * hook, which would pull the whole Reanimated library (~0.8 MB) into the web
 * bundle for one boolean.
 */
export function useReduceMotion(): boolean | null {
  const [reduce, setReduce] = useState<boolean | null>(null);
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduce);
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduce);
    return () => sub.remove();
  }, []);
  return reduce;
}
