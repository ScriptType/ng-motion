import {
  motionValue,
  frame,
  cancelFrame,
  transform,
  type MotionValue,
  type TransformOptions,
} from 'motion-dom';
import { onCleanup, outsideZone } from '../utils/injection-context';

/** Single value + function transform. */
export function useTransform<I, O>(
  value: MotionValue<I>,
  transformFn: (input: I) => O,
): MotionValue<O>;

/** Range mapping: maps an input number range to an output range. */
export function useTransform<O>(
  value: MotionValue<number>,
  inputRange: number[],
  outputRange: O[],
  options?: TransformOptions<O>,
): MotionValue<O>;

/** Multi-input: combines multiple MotionValues via a function. */
export function useTransform<O>(
  values: MotionValue[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- user-provided combiner needs variadic any
  combineFn: (...latest: any[]) => O,
): MotionValue<O>;

/**
 * Creates a derived `MotionValue` that updates when its source(s) change.
 *
 * Must be called within an Angular injection context.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- overload implementation union
export function useTransform(...args: any[]): MotionValue<unknown> {
  const firstArg: unknown = args[0];
  const secondArg: unknown = args[1];

  const isMulti = Array.isArray(firstArg);
  const sources = (isMulti ? firstArg : [firstArg]) as MotionValue<unknown>[]; // eslint-disable-line @typescript-eslint/consistent-type-assertions -- overload dispatch

  let mapper: (...values: unknown[]) => unknown;

  if (typeof secondArg === 'function') {
    const fn = secondArg as (...args: unknown[]) => unknown; // eslint-disable-line @typescript-eslint/consistent-type-assertions -- overload dispatch
    mapper = isMulti ? fn : (v: unknown) => fn(v);
  } else {
    const inputRange = secondArg as number[]; // eslint-disable-line @typescript-eslint/consistent-type-assertions -- overload dispatch
    const outputRange = args[2] as unknown[]; // eslint-disable-line @typescript-eslint/consistent-type-assertions -- overload dispatch
    const options = args[3] as TransformOptions<number> | undefined; // eslint-disable-line @typescript-eslint/consistent-type-assertions -- overload dispatch
    const mapFn = transform(inputRange, outputRange as number[], options); // eslint-disable-line @typescript-eslint/consistent-type-assertions -- motion-dom interop
    mapper = (v: unknown) => mapFn(v as number); // eslint-disable-line @typescript-eslint/consistent-type-assertions -- motion-dom interop
  }

  const runOutside = outsideZone();
  const readSources = (): unknown[] => sources.map((s) => s.get());
  const output = motionValue(mapper(...readSources()));

  const update = (): void => {
    output.set(mapper(...readSources()));
  };

  const scheduleUpdate = (): void => {
    runOutside(() => frame.preRender(update));
  };

  const unsubs = sources.map((s) => s.on('change', scheduleUpdate));

  onCleanup(() => {
    for (const unsub of unsubs) unsub();
    cancelFrame(update);
    output.destroy();
  });

  return output;
}
