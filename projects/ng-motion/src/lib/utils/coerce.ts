import { isSignal, type Signal } from '@angular/core';

/** Unwraps a signal or returns the raw value. */
export function resolveInput<T>(value: T | Signal<T>): T {
  if (isSignal(value)) {
    return value();
  }
  return value;
}

export { isSignal };
