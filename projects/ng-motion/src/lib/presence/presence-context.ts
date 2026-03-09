import { InjectionToken, signal, type WritableSignal } from '@angular/core';
import type { PresenceContextProps } from 'motion-dom';

/**
 * Extended presence context with Angular signal for reactive tracking.
 */
export interface NgmPresenceContext extends PresenceContextProps {
  isPresent$: WritableSignal<boolean>;
  /** Called by the presence directive to register a removal callback. */
  setExitCompleteCallback: (fn: (() => void) | undefined) => void;
}

export const PRESENCE_CONTEXT = new InjectionToken<NgmPresenceContext>('NgmPresenceContext');

let idCounter = 0;

export function createPresenceContext(isPresent: boolean): NgmPresenceContext {
  const id = String(++idCounter);
  const registrations = new Set<string | number>();
  const isPresent$ = signal(isPresent);
  let exitCompleteCallback: (() => void) | undefined;

  return {
    id,
    isPresent,
    isPresent$,
    register: (childId: string | number) => {
      registrations.add(childId);
      return () => {
        registrations.delete(childId);
        if (registrations.size === 0) {
          exitCompleteCallback?.();
        }
      };
    },
    onExitComplete: (_childId: string | number) => {
      // Called by motion-dom when a child's exit animation completes.
      // We track via register/deregister instead (the deregister function
      // checks if all children are done and invokes the callback).
    },
    setExitCompleteCallback: (fn: (() => void) | undefined) => {
      exitCompleteCallback = fn;
      // If no children registered for exit, fire immediately
      if (fn && registrations.size === 0) {
        fn();
      }
    },
  };
}
