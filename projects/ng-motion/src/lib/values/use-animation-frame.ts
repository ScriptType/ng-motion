import { frame, cancelFrame } from 'motion-dom';
import { onCleanup, outsideZone } from '../utils/injection-context';

export function useAnimationFrame(callback: (time: number, delta: number) => void): void {
  const runOutside = outsideZone();
  let prevTime = performance.now();

  const handler = (): void => {
    const now = performance.now();
    const delta = now - prevTime;
    prevTime = now;
    callback(now, delta);
  };

  // keep-alive: true means it re-schedules each frame
  runOutside(() => frame.update(handler, true));

  onCleanup(() => {
    cancelFrame(handler);
  });
}
