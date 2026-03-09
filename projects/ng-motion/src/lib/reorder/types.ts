import type { Axis } from 'motion-utils';

export interface ItemData<T> {
  value: T;
  layout: Axis;
}

export interface ReorderContextProps<T> {
  readonly axis: 'x' | 'y';
  readonly groupElement: HTMLElement;
  registerItem: (value: T, layout: Axis) => void;
  updateOrder: (item: T, offset: number, velocity: number) => void;
}
