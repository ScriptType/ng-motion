import { signal, type Signal } from '@angular/core';
import type { ElementRef } from '@angular/core';
import { onCleanup } from '../utils/injection-context';

export interface UseInViewOptions {
  root?: Element | null;
  margin?: string;
  amount?: 'some' | 'all' | number;
  once?: boolean;
}

export function useInView(
  target: ElementRef | HTMLElement,
  options: UseInViewOptions = {},
): Signal<boolean> {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- ElementRef.nativeElement is typed as any
  const element = target instanceof HTMLElement ? target : (target.nativeElement as HTMLElement);
  const isInView = signal(false);

  const threshold =
    options.amount === 'all'
      ? 1
      : options.amount === 'some'
        ? 0
        : typeof options.amount === 'number'
          ? options.amount
          : 0;

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const inView = entry.isIntersecting;
        isInView.set(inView);
        if (inView && options.once === true) {
          observer.unobserve(element);
        }
      }
    },
    {
      root: options.root ?? null,
      rootMargin: options.margin ?? '0px',
      threshold,
    },
  );

  observer.observe(element);

  onCleanup(() => {
    observer.disconnect();
  });

  return isInView.asReadonly();
}
