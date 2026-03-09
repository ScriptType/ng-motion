import { inject, signal, type Signal } from '@angular/core';
import { PRESENCE_CONTEXT } from './presence-context';

/**
 * Returns a signal indicating whether the component is present.
 * If no presence context exists, returns a constant `true` signal.
 */
export function useIsPresent(): Signal<boolean> {
  const ctx = inject(PRESENCE_CONTEXT, { optional: true });
  if (!ctx) {
    return signal(true).asReadonly();
  }
  return ctx.isPresent$;
}

/**
 * Returns [isPresent signal, safeToRemove callback].
 * The safeToRemove callback should be called when exit animations complete.
 * If no presence context exists, returns [constant true, noop].
 */
export function usePresence(): [Signal<boolean>, () => void] {
  const ctx = inject(PRESENCE_CONTEXT, { optional: true });
  if (!ctx) {
    return [signal(true).asReadonly(), () => { /* noop */ }];
  }

  const id = String(Symbol());
  const deregister = ctx.register(id);

  return [ctx.isPresent$, deregister];
}
