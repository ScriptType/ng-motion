import { DestroyRef, Directive, inject, input, signal } from '@angular/core';
import type { Axis, Box } from 'motion-utils';
import { REORDER_CONTEXT } from './reorder-context';
import { autoScrollIfNeeded, resetAutoScrollState } from './auto-scroll';

@Directive({
  selector: '[ngmReorderItem]',
  host: {
    '[style.z-index]': 'isDragging() ? 1 : "unset"',
    '[style.position]': 'isDragging() ? "relative" : null',
  },
})
export class NgmReorderItemDirective<T = unknown> {
  readonly value = input.required<T>({ alias: 'ngmReorderItem' });
  readonly layout = input<true | 'position'>(true);

  private readonly reorderContext = inject(REORDER_CONTEXT);
  private readonly destroyRef = inject(DestroyRef);

  /** Whether this item is currently being dragged. */
  readonly isDragging = signal(false);

  constructor() {
    this.destroyRef.onDestroy(() => {
      if (this.isDragging()) {
        resetAutoScrollState();
      }
    });
  }

  /** Call from the host's (onLayoutMeasure) to register layout with the group. */
  registerLayout(measured: Box): void {
    const axis = this.reorderContext.axis;
    const layout: Axis = measured[axis];
    this.reorderContext.registerItem(this.value(), layout);
  }

  /** Call from the host's (dragMove) handler with current offset and velocity. */
  updateOrder(offset: number, velocity: number, pointerPosition?: number): void {
    this.reorderContext.updateOrder(this.value(), offset, velocity);

    if (pointerPosition !== undefined) {
      autoScrollIfNeeded(
        this.reorderContext.groupElement,
        pointerPosition,
        this.reorderContext.axis,
        velocity,
      );
    }
  }

  /** Call from (dragStart). */
  onDragStart(): void {
    this.isDragging.set(true);
  }

  /** Call from (dragEnd). */
  onDragEnd(): void {
    this.isDragging.set(false);
    resetAutoScrollState();
  }

  /** Returns the reorder axis from the parent group. */
  getAxis(): 'x' | 'y' {
    return this.reorderContext.axis;
  }
}
