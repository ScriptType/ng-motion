import { computed, type Signal } from '@angular/core';

export interface PresenceListState<Id extends string | number> {
  visibleIds: Signal<readonly Id[]>;
  visibleById: Signal<Partial<Record<Id, boolean>>>;
  gapAfter: Signal<Partial<Record<Id, boolean>>>;
}

export interface UsePresenceListOptions<Item, Id extends string | number> {
  getId: (item: Item) => Id;
  exitingIds?: Signal<ReadonlySet<Id>>;
}

/**
 * Derives stable layout metadata for presence-driven lists.
 *
 * This is useful when exiting items stay mounted for their exit animation and
 * spacing should follow the currently visible items rather than the raw array.
 */
export function usePresenceList<Item, Id extends string | number>(
  items: Signal<readonly Item[]>,
  options: UsePresenceListOptions<Item, Id>,
): PresenceListState<Id> {
  const visibleIds = computed(() => {
    const exitingIds = options.exitingIds?.();

    return items()
      .map(options.getId)
      .filter((id) => !(exitingIds?.has(id) ?? false));
  });

  const gapAfter = computed(() => {
    const ids = visibleIds();
    const lookup: Partial<Record<Id, boolean>> = {};

    for (let index = 0; index < ids.length - 1; index++) {
      lookup[ids[index]] = true;
    }

    return lookup;
  });

  const visibleById = computed(() => {
    const ids = visibleIds();
    const lookup: Partial<Record<Id, boolean>> = {};

    for (const id of ids) {
      lookup[id] = true;
    }

    return lookup;
  });

  return {
    visibleIds,
    visibleById,
    gapAfter,
  };
}
