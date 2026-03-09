import { motionValue, type MotionValue } from 'motion-dom';
import { onCleanup } from '../utils/injection-context';

/**
 * Creates a `MotionValue` with automatic cleanup when the injection context is destroyed.
 *
 * Must be called within an Angular injection context (component constructor, `runInInjectionContext`, etc.).
 */
export function useMotionValue<T>(initialValue: T): MotionValue<T> {
  const mv = motionValue(initialValue);
  onCleanup(() => {
    mv.destroy();
  });
  return mv;
}
