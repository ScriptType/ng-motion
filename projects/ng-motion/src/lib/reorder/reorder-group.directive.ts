import { Directive, ElementRef, inject, input, output } from '@angular/core';
import type { Axis } from 'motion-utils';
import { REORDER_CONTEXT } from './reorder-context';
import { checkReorder } from './check-reorder';
import type { ItemData, ReorderContextProps } from './types';

@Directive({
  selector: '[ngmReorderGroup]',
  host: { style: 'overflow-anchor: none' },
  providers: [
    {
      provide: REORDER_CONTEXT,
      useFactory: (): ReorderContextProps<unknown> => {
        const dir = inject(NgmReorderGroupDirective);
        return dir.context;
      },
    },
  ],
})
export class NgmReorderGroupDirective<T = unknown> {
  readonly values = input.required<T[]>({ alias: 'ngmReorderGroup' });
  readonly axis = input<'x' | 'y'>('y');
  readonly reorder = output<T[]>();

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- Angular ElementRef.nativeElement is typed as any
  private readonly element: HTMLElement = inject(ElementRef).nativeElement;

  private readonly order: ItemData<T>[] = [];
  private isReordering = false;

  /** @internal Provided to children via REORDER_CONTEXT. */
  readonly context: ReorderContextProps<T> = {
    get axis(): 'x' | 'y' {
      return 'y'; // overridden by getter below
    },
    get groupElement(): HTMLElement {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- overridden by Object.defineProperty in constructor
      return null!;
    },
    registerItem: (value: T, layout: Axis) => {
      const idx = this.order.findIndex((entry) => value === entry.value);
      if (idx !== -1) {
        this.order[idx].layout = layout;
      } else {
        this.order.push({ value, layout });
      }
      this.order.sort(compareMin);
    },
    updateOrder: (item: T, offset: number, velocity: number) => {
      if (this.isReordering) return;

      const newOrder = checkReorder(this.order, item, offset, velocity);

      if (this.order !== newOrder) {
        this.isReordering = true;
        this.order.splice(0, this.order.length, ...newOrder);
        const values = this.values();
        this.reorder.emit(
          this.order.map((entry) => entry.value).filter((v) => values.includes(v)),
        );
        // Reset after microtask (equivalent to React's useEffect reset)
        queueMicrotask(() => {
          this.isReordering = false;
        });
      }
    },
  };

  constructor() {
    // Wire dynamic getters so context stays in sync with signal inputs
    Object.defineProperty(this.context, 'axis', {
      get: () => this.axis(),
      enumerable: true,
    });
    Object.defineProperty(this.context, 'groupElement', {
      get: () => this.element,
      enumerable: true,
    });
  }
}

function compareMin<T>(a: ItemData<T>, b: ItemData<T>): number {
  return a.layout.min - b.layout.min;
}
