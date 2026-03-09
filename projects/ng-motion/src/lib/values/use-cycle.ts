import { signal, type Signal } from '@angular/core';

export function useCycle<T>(...items: T[]): [Signal<T>, (next?: number) => void] {
  let index = 0;
  const current = signal(items[0]);

  const cycle = (next?: number): void => {
    if (next !== undefined) {
      index = next;
    } else {
      index = (index + 1) % items.length;
    }
    current.set(items[index]);
  };

  return [current.asReadonly(), cycle];
}
