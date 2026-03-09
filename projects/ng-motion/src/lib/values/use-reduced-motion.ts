import { signal, type Signal } from '@angular/core';
import { onCleanup } from '../utils/injection-context';

export function useReducedMotion(): Signal<boolean> {
  const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
  const reduced = signal(mql.matches);

  const handler = (e: MediaQueryListEvent): void => {
    reduced.set(e.matches);
  };

  mql.addEventListener('change', handler);

  onCleanup(() => {
    mql.removeEventListener('change', handler);
  });

  return reduced.asReadonly();
}
