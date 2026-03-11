# Presence & Exit Animations

## Default: `@if` / `@for` + `[exit]`

The simplest way to animate elements out is to add `[exit]` directly on `ngmMotion` inside Angular's built-in control flow. No extra directive needed — the directive keeps the element in the DOM, plays the exit animation, and removes it when done.

```ts
import { Component, signal } from '@angular/core';
import { NgmMotionDirective } from '@scripttype/ng-motion';
import type { Transition } from '@scripttype/ng-motion';

@Component({
  standalone: true,
  imports: [NgmMotionDirective],
  template: `
    <button (click)="visible.set(!visible())">Toggle</button>

    @if (visible()) {
      <article
        ngmMotion
        [initial]="{ opacity: 0, scale: 0.92, y: 12 }"
        [animate]="{ opacity: 1, scale: 1, y: 0 }"
        [exit]="{ opacity: 0, scale: 0.92, y: -12 }"
        [transition]="transition"
      >
        I animate in and out.
      </article>
    }
  `,
})
export class ExitComponent {
  readonly visible = signal(true);
  readonly transition: Transition = { type: 'spring', stiffness: 280, damping: 24 };
}
```

When exit includes `height` and `marginBottom`, surrounding siblings collapse smoothly:

```html
@if (visible()) {
  <div
    ngmMotion
    [initial]="{ opacity: 0, height: 0, marginBottom: 0 }"
    [animate]="{ opacity: 1, height: 'auto', marginBottom: 24 }"
    [exit]="{ opacity: 0, height: 0, marginBottom: 0 }"
    [transition]="{ type: 'spring', stiffness: 300, damping: 26 }"
    class="overflow-hidden"
  >
    Collapses smoothly
  </div>
}
```

This also works with `@for` — each item gets its own exit animation when removed from the array.

## Advanced: `*ngmPresence`

Use `*ngmPresence` when you need the presence context hooks (`useIsPresent`, `usePresence`, `usePresenceList`). It keeps the element mounted with a presence context while the exit animation runs, enabling child components to react to the exiting state.

```ts
import { Component, signal } from '@angular/core';
import { NgmMotionDirective, NgmPresenceDirective } from '@scripttype/ng-motion';
import type { Transition } from '@scripttype/ng-motion';

@Component({
  standalone: true,
  imports: [NgmMotionDirective, NgmPresenceDirective],
  template: `
    <button (click)="visible.set(!visible())">Toggle</button>

    <article
      *ngmPresence="visible()"
      ngmMotion
      [initial]="{ opacity: 0, scale: 0.92, y: 12 }"
      [animate]="{ opacity: 1, scale: 1, y: 0 }"
      [exit]="{ opacity: 0, scale: 0.92, y: -12 }"
      [transition]="transition"
    >
      I animate in and out.
    </article>
  `,
})
export class PresenceComponent {
  readonly visible = signal(true);
  readonly transition: Transition = { type: 'spring', stiffness: 280, damping: 24 };
}
```

When the `*ngmPresence` expression flips from `true` to `false`:

1. the child view stays mounted in the DOM
2. the presence context switches `isPresent` to `false`
3. `ngmMotion` runs the `exit` animation
4. the view is removed only after exit completes

## `useIsPresent()`

Use `useIsPresent()` when a child component needs to know whether it is entering or exiting.

```ts
import { type Signal } from '@angular/core';
import { useIsPresent } from '@scripttype/ng-motion';

const isPresent: Signal<boolean> = useIsPresent();
```

## `usePresence()`

Use `usePresence()` when the child needs explicit control over when it is safe to remove.

```ts
import { type Signal } from '@angular/core';
import { usePresence } from '@scripttype/ng-motion';

const [isPresent, safeToRemove]: [Signal<boolean>, () => void] = usePresence();
```

Call `safeToRemove()` when your custom exit work is complete.

## `usePresenceList()`

Use `usePresenceList()` to derive stable layout metadata for presence-driven lists. It bridges the gap between your data array (which hasn't removed items yet) and the visual state (mid-exit-animation), so spacing, visibility, and buttons react the moment an item starts exiting.

```ts
import { signal } from '@angular/core';
import { usePresenceList } from '@scripttype/ng-motion';

interface Item { id: number; label: string; }

export class ListComponent {
  readonly items = signal<Item[]>([...]);
  readonly removingIds = signal(new Set<number>());

  readonly presence = usePresenceList(this.items, {
    getId: (item) => item.id,
    exitingIds: this.removingIds,
  });
  // Returns:
  // presence.visibleIds()   — ordered IDs excluding exiting items
  // presence.visibleById()  — { [id]: boolean } for *ngmPresence binding
  // presence.gapAfter()     — { [id]: boolean } which items have a sibling below
}
```

## Animated List Removal

Combine `@for` with `*ngmPresence` to animate items as they are added and removed from a list. Each item gets its own presence context, so removals animate independently. Animate the row wrapper's `height` and `marginBottom` as part of the enter and exit states for smooth collapse. The `usePresenceList()` helper keeps `visibleIds`, `visibleById`, and spacing metadata in sync from the moment an item starts exiting.

```ts
import { Component, DestroyRef, inject, signal } from '@angular/core';
import {
  NgmMotionDirective,
  NgmPresenceDirective,
  usePresenceList,
} from '@scripttype/ng-motion';

interface Item {
  id: number;
  label: string;
}

@Component({
  standalone: true,
  imports: [NgmMotionDirective, NgmPresenceDirective],
  template: `
    @let visibleById = presence.visibleById();
    @let gapAfter = presence.gapAfter();

    @for (item of items(); track item.id) {
      <div
        *ngmPresence="visibleById[item.id] ?? false"
        ngmMotion
        [initial]="{ opacity: 0, x: -20, height: 0, marginBottom: 0 }"
        [animate]="{
          opacity: 1,
          x: 0,
          height: 56,
          marginBottom: gapAfter[item.id] ? 12 : 0,
        }"
        [exit]="{ opacity: 0, x: 20, height: 0, marginBottom: 0 }"
        [transition]="{ type: 'spring', stiffness: 300, damping: 25 }"
        class="overflow-hidden"
      >
        {{ item.label }}
        <button (click)="remove(item.id)">Remove</button>
      </div>
    }
  `,
})
export class AnimatedListComponent {
  private readonly pendingTimers: ReturnType<typeof setTimeout>[] = [];
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    this.destroyRef.onDestroy(() => this.pendingTimers.forEach(clearTimeout));
  }

  readonly items = signal<Item[]>([
    { id: 0, label: 'First' },
    { id: 1, label: 'Second' },
    { id: 2, label: 'Third' },
  ]);
  private readonly removingIds = signal(new Set<number>());
  readonly presence = usePresenceList(this.items, {
    getId: (item) => item.id,
    exitingIds: this.removingIds,
  });

  remove(id: number): void {
    if (this.removingIds().has(id)) return;

    // 1. Mark the item as exiting — usePresenceList reacts immediately
    this.removingIds.update((set) => {
      const next = new Set(set);
      next.add(id);
      return next;
    });

    // 2. After the exit animation finishes, remove from the data array
    this.pendingTimers.push(setTimeout(() => {
      this.items.update((list) => list.filter((item) => item.id !== id));
      this.removingIds.update((set) => {
        const next = new Set(set);
        next.delete(id);
        return next;
      });
    }, 500));
  }
}
```

## Common Use Cases

- modals
- drawers
- toast stacks
- routed content
- removable list items

## When to Use Which

- **`@if` / `@for` + `[exit]`** — the default. Use for simple enter/exit animations. No extra imports needed beyond `NgmMotionDirective`.
- **`*ngmPresence`** — use when child components need `useIsPresent()` or `usePresence()` for custom exit logic (e.g. canvas/WebGL teardown).
- **`*ngmPresence` + `usePresenceList()`** — use for `@for` lists where the UI needs to respond immediately to removals (disable buttons, adjust spacing, update counters) while exit animations are still running.

## Best Practices

- Start with `@if` + `[exit]`. Reach for `*ngmPresence` only when you need presence hooks.
- Keep enter and exit transitions symmetric unless asymmetry is intentional.
- For shared-layout exits, combine presence with `layoutId` or `layout` carefully and add tests for teardown behavior.
