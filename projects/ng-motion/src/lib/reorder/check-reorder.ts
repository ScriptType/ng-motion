import { mixNumber } from 'motion-dom';
import { moveItem } from 'motion-utils';
import type { ItemData } from './types';

export function checkReorder<T>(
  order: ItemData<T>[],
  value: T,
  offset: number,
  velocity: number,
): ItemData<T>[] {
  if (velocity === 0) return order;

  const index = order.findIndex((item) => item.value === value);
  if (index === -1) return order;

  const nextOffset = velocity > 0 ? 1 : -1;
  const nextIndex = index + nextOffset;
  if (nextIndex < 0 || nextIndex >= order.length) return order;

  const nextItem = order[nextIndex];
  const item = order[index];
  const nextLayout = nextItem.layout;
  const nextItemCenter = mixNumber(nextLayout.min, nextLayout.max, 0.5);

  if (
    (nextOffset === 1 && item.layout.max + offset > nextItemCenter) ||
    (nextOffset === -1 && item.layout.min + offset < nextItemCenter)
  ) {
    return moveItem(order, index, index + nextOffset);
  }

  return order;
}
