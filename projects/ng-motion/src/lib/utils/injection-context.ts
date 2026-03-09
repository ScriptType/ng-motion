import { DestroyRef, inject, NgZone } from '@angular/core';

/** Registers a cleanup callback on the current injection context's DestroyRef. */
export function onCleanup(fn: () => void): void {
  inject(DestroyRef).onDestroy(fn);
}

/** Returns a wrapper that runs the given function outside Angular's zone. */
export function outsideZone(): <T>(fn: () => T) => T {
  const zone = inject(NgZone);
  return <T>(fn: () => T): T => zone.runOutsideAngular(fn);
}
