import { supportsScrollTimeline } from 'motion-dom';

export function canUseNativeTimeline(target?: Element): boolean {
  return typeof window !== 'undefined' && !target && supportsScrollTimeline();
}
