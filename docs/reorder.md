# Reorder

The reorder API is public, but it is still one of the more pre-1.0 parts of the library.

If you know Framer Motion, this is the main difference to keep in mind: `ng-motion` does not yet expose a fully turnkey `Reorder.Group` / `Reorder.Item` experience at the same polish level as the rest of the library. The current API is a small set of Angular directives that pair best with `ngmMotion`, `layout`, and drag.

## Minimum Starting Point

```ts
import { Component, signal } from '@angular/core';
import {
  NgmMotionDirective,
  NgmReorderGroupDirective,
  NgmReorderItemDirective,
  type Transition,
} from '@scripttype/ng-motion';

interface TodoItem {
  id: string;
  label: string;
}

@Component({
  standalone: true,
  imports: [NgmMotionDirective, NgmReorderGroupDirective, NgmReorderItemDirective],
  template: `
    <div [ngmReorderGroup]="items()" [axis]="'y'" (reorder)="items.set($event)">
      @for (item of items(); track item.id) {
        <div
          [ngmReorderItem]="item"
          ngmMotion
          [layout]="true"
          [drag]="'y'"
          [dragSnapToOrigin]="true"
          [transition]="spring"
        >
          {{ item.label }}
        </div>
      }
    </div>
  `,
})
export class ReorderExampleComponent {
  readonly items = signal<TodoItem[]>([
    { id: 'a', label: 'First' },
    { id: 'b', label: 'Second' },
    { id: 'c', label: 'Third' },
  ]);

  readonly spring: Transition = { type: 'spring', stiffness: 400, damping: 30 };
}
```

This is the current starter pattern:

- `ngmReorderGroup` owns the ordered array
- `reorder` emits the next array
- each item also gets `ngmMotion`, `layout`, and axis-appropriate `drag`
- `dragSnapToOrigin` snaps the dragged item back to its layout position after drop, so the layout animation handles the final placement

## Available Exports

- `NgmReorderGroupDirective`
- `NgmReorderItemDirective`
- `checkReorder()`
- `autoScrollIfNeeded()` and `resetAutoScrollState()`
- `REORDER_CONTEXT`

## Group Directive

`NgmReorderGroupDirective` owns the current order and emits a reordered array.

```html
<div [ngmReorderGroup]="items()" [axis]="'y'" (reorder)="items.set($event)">...</div>
```

Inputs and outputs:

- `ngmReorderGroup`: required array of values
- `axis`: `'x'` or `'y'`
- `reorder`: emits the next ordered array

## Item Directive

In normal app code, `NgmReorderItemDirective` is usually just applied as `[ngmReorderItem]="item"` on the same element that has `ngmMotion`, `layout`, and drag bindings.

The directive class also exposes helper methods used in lower-level reorder flows:

- `registerLayout(measured)`
- `updateOrder(offset, velocity, pointerPosition?)`
- `onDragStart()`
- `onDragEnd()`
- `isDragging()`

Most consumers should treat those methods as advanced escape hatches rather than the main beginner path.

## Recommended Positioning

For now:

- treat reorder as advanced
- combine it with `ngmMotion`, `layout`, and drag state carefully
- expect API refinement before 1.0

If you need the most stable parts of the library today, start with core motion, motion values, gestures, presence, layout, and imperative animation first.
