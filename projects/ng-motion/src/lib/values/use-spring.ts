import {
  motionValue,
  attachSpring,
  isMotionValue,
  type MotionValue,
  type SpringOptions,
} from 'motion-dom';
import { onCleanup, outsideZone } from '../utils/injection-context';

/**
 * Creates a spring-animated `MotionValue` that tracks a static value or another `MotionValue`.
 *
 * Must be called within an Angular injection context.
 */
export function useSpring<T extends number | string>(
  source: T | MotionValue<T>,
  options?: SpringOptions,
): MotionValue<T> {
   
  const runOutside = outsideZone();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- isMotionValue narrows to MotionValue<any>; .get() returns any
  const initial: T = isMotionValue(source) ? source.get() : source;
  const mv = motionValue(initial);
  const detach = runOutside(() => attachSpring(mv, source, options));

  onCleanup(() => {
    detach();
    mv.destroy();
  });

  return mv;
}
