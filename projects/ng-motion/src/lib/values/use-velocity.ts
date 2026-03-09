import { motionValue, frame, cancelFrame, type MotionValue } from 'motion-dom';
import { onCleanup, outsideZone } from '../utils/injection-context';

/**
 * Creates a `MotionValue` that tracks the velocity of another `MotionValue`.
 *
 * Must be called within an Angular injection context.
 */
export function useVelocity(value: MotionValue<number>): MotionValue<number> {
  const runOutside = outsideZone();
  const velocity = motionValue(value.getVelocity());

  const updateVelocity = (): void => {
    const latest = value.getVelocity();
    velocity.set(latest);

    if (latest !== 0) runOutside(() => frame.update(updateVelocity));
  };

  const unsub = value.on('change', () => {
    runOutside(() => frame.update(updateVelocity, false, true));
  });

  onCleanup(() => {
    unsub();
    cancelFrame(updateVelocity);
    velocity.destroy();
  });

  return velocity;
}
