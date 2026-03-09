import '../test-env';
import { signal } from '@angular/core';
import { usePresenceList } from './use-presence-list';

describe('usePresenceList', () => {
  it('derives visible ids and gap lookups from items and exiting ids', () => {
    const items = signal([
      { id: 1, label: 'One' },
      { id: 2, label: 'Two' },
      { id: 3, label: 'Three' },
    ]);
    const exitingIds = signal<ReadonlySet<number>>(new Set([2]));

    const list = usePresenceList(items, {
      getId: (item) => item.id,
      exitingIds,
    });

    expect(list.visibleIds()).toEqual([1, 3]);
    expect(list.visibleById()).toEqual({ 1: true, 3: true });
    expect(list.gapAfter()).toEqual({ 1: true });
  });

  it('updates gap lookups when items change', () => {
    const items = signal([
      { id: 1, label: 'One' },
      { id: 2, label: 'Two' },
    ]);

    const list = usePresenceList(items, {
      getId: (item) => item.id,
    });

    expect(list.gapAfter()).toEqual({ 1: true });

    items.update((current) => [...current, { id: 3, label: 'Three' }]);

    expect(list.visibleIds()).toEqual([1, 2, 3]);
    expect(list.visibleById()).toEqual({ 1: true, 2: true, 3: true });
    expect(list.gapAfter()).toEqual({ 1: true, 2: true });
  });

  it('removes the trailing gap as soon as the last visible item starts exiting', () => {
    const items = signal([
      { id: 1, label: 'One' },
      { id: 2, label: 'Two' },
      { id: 3, label: 'Three' },
    ]);
    const exitingIds = signal<ReadonlySet<number>>(new Set());

    const list = usePresenceList(items, {
      getId: (item) => item.id,
      exitingIds,
    });

    expect(list.gapAfter()).toEqual({ 1: true, 2: true });

    exitingIds.set(new Set([3]));

    expect(list.visibleIds()).toEqual([1, 2]);
    expect(list.visibleById()).toEqual({ 1: true, 2: true });
    expect(list.gapAfter()).toEqual({ 1: true });
  });
});
