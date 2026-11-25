import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

const DURATION_MS = 450;

/**
 * The OS "reduce motion" setting, kept current. Uses React Native's built-in
 * AccessibilityInfo rather than Reanimated's hook, which would pull the whole
 * Reanimated library (~0.8 MB) into the web bundle for one boolean.
 */
function useReduceMotion(): boolean {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduce);
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduce);
    return () => sub.remove();
  }, []);
  return reduce;
}

/**
 * Animates a number from its previous value to `target`, so a change of goal
 * age visibly recounts the targets (the one motion moment in the design).
 * Jumps straight to the value when the OS "reduce motion" setting is on.
 */
export function useCountUp(target: number): number {
  const reduceMotion = useReduceMotion();
  const [value, setValue] = useState(target);
  const from = useRef(target);

  useEffect(() => {
    if (reduceMotion || from.current === target) {
      from.current = target;
      setValue(target);
      return;
    }

    const start = from.current;
    const startedAt = Date.now();
    let frame = 0;

    const tick = () => {
      const t = Math.min(1, (Date.now() - startedAt) / DURATION_MS);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
      setValue(start + (target - start) * eased);
      if (t < 1) frame = requestAnimationFrame(tick);
      else from.current = target;
    };
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      from.current = target;
    };
  }, [target, reduceMotion]);

  return value;
}
