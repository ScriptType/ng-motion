import { motionValue, frame, cancelFrame, type MotionValue } from 'motion-dom';
import { onCleanup, outsideZone } from '../utils/injection-context';

export function useMotionTemplate(
  strings: TemplateStringsArray,
  ...values: MotionValue[]
): MotionValue<string> {
  const buildString = (): string => {
    let result = strings[0];
    for (let i = 0; i < values.length; i++) {
      result += String(values[i].get()) + strings[i + 1];
    }
    return result;
  };

  const runOutside = outsideZone();
  const output = motionValue(buildString());

  const update = (): void => {
    output.set(buildString());
  };

  const scheduleUpdate = (): void => {
    runOutside(() => frame.preRender(update));
  };

  const unsubs = values.map((v) => v.on('change', scheduleUpdate));

  onCleanup(() => {
    for (const unsub of unsubs) unsub();
    cancelFrame(update);
    output.destroy();
  });

  return output;
}
