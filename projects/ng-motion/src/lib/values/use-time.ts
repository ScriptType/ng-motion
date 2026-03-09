import { motionValue, frame, cancelFrame, type MotionValue } from 'motion-dom';
import { onCleanup, outsideZone } from '../utils/injection-context';

/**
 * Creates a `MotionValue` that updates with the current animation frame time.
 *
 * Must be called within an Angular injection context.
 */
export function useTime(): MotionValue<number> {
  const runOutside = outsideZone();
  const time = motionValue(0);

  const update = ({ timestamp }: { timestamp: number }): void => {
    time.set(timestamp);
  };

  runOutside(() => frame.update(update, true));

  onCleanup(() => {
    cancelFrame(update);
    time.destroy();
  });

  return time;
}
