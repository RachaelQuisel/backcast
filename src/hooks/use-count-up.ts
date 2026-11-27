import { useEffect, useRef, useState } from 'react';
import { useReduceMotion } from '@/hooks/use-reduce-motion';

const DURATION_MS = 450;

/**
 * Animates a number from its previous value to `target`, so a change of goal
 * age visibly recounts the targets (the one motion moment in the design).
 * Jumps straight to the value when the OS "reduce motion" setting is on.
 */
export function useCountUp(target: number): number {
  // Unknown (null) counts as motion allowed: the recount only runs after a
  // tap, by which time the OS has answered.
  const reduceMotion = useReduceMotion() === true;
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
