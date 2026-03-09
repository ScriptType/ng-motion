import { motionValue, type MotionValue } from 'motion-dom';
import { onCleanup } from '../utils/injection-context';

export function useWillChange(): MotionValue<string> {
  const mv = motionValue('auto');

  onCleanup(() => {
    mv.destroy();
  });

  return mv;
}
