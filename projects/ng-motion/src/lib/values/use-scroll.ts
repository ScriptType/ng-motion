import type { ElementRef } from '@angular/core';
import { motionValue, type MotionValue } from 'motion-dom';
import { scroll } from '../scroll/scroll';
import type { ScrollOffset } from '../scroll/types';
import { onCleanup, outsideZone } from '../utils/injection-context';

export interface UseScrollOptions {
  container?: ElementRef<HTMLElement> | HTMLElement;
  target?: ElementRef<HTMLElement> | HTMLElement;
  axis?: 'x' | 'y';
  offset?: ScrollOffset;
}

export interface ScrollMotionValues {
  scrollX: MotionValue<number>;
  scrollY: MotionValue<number>;
  scrollXProgress: MotionValue<number>;
  scrollYProgress: MotionValue<number>;
}

function resolveElement(ref?: ElementRef<HTMLElement> | HTMLElement): HTMLElement | undefined {
  if (!ref) return undefined;
  return ref instanceof HTMLElement
    ? ref
    : ref.nativeElement;
}

/**
 * Creates scroll-linked MotionValues that track scroll position and progress.
 * Must be called within an Angular injection context.
 */
export function useScroll(options: UseScrollOptions = {}): ScrollMotionValues {
  const values: ScrollMotionValues = {
    scrollX: motionValue(0),
    scrollY: motionValue(0),
    scrollXProgress: motionValue(0),
    scrollYProgress: motionValue(0),
  };

  const resolvedContainer = resolveElement(options.container);
  const resolvedTarget = resolveElement(options.target);

  const runOutside = outsideZone();

  const cleanup = runOutside(() => scroll(
    (
      _progress: number,
      { x, y }: { x: { current: number; progress: number }; y: { current: number; progress: number } },
    ) => {
      values.scrollX.set(x.current);
      values.scrollXProgress.set(x.progress);
      values.scrollY.set(y.current);
      values.scrollYProgress.set(y.progress);
    },
    {
      ...options,
      container: resolvedContainer,
      target: resolvedTarget,
    },
  ));

  onCleanup(() => {
    cleanup();
    values.scrollX.destroy();
    values.scrollY.destroy();
    values.scrollXProgress.destroy();
    values.scrollYProgress.destroy();
  });

  return values;
}
