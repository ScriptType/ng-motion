import { type MotionValue } from 'motion-dom';
import { onCleanup } from '../utils/injection-context';

export function useMotionValueEvent<V>(
  value: MotionValue<V>,
  event: 'change' | 'animationStart' | 'animationComplete' | 'animationCancel',
  callback: (latest: V) => void,
): void {
  const unsub = value.on(event, callback);
  onCleanup(unsub);
}
