# Core Motion

`NgmMotionDirective` is the center of the library. Add `ngmMotion` to any element, then bind animation state through directive inputs.

## The Core Inputs

These are the inputs you will use most often:

- `initial`: starting state before the first animation
- `animate`: target state after mount or after state changes
- `transition`: timing, easing, springs, repeats
- `variants`: named animation states
- `style`: inline style object, including `MotionValue`s
- `exit`: exit state — animates before `@if`/`@for` removes the element
- `whileHover`, `whileTap`, `whileFocus`, `whileInView`, `whileDrag`: gesture and interaction states
- `viewport`: IntersectionObserver configuration for `whileInView` (`once`, `amount`, `margin`, `root`)
- `layout`, `layoutId`, `layoutDependency`: layout animation controls

## Basic State Animation

```ts
import { Component, signal, type WritableSignal } from '@angular/core';
import { NgmMotionDirective, type Transition, type Variants } from 'ng-motion';

@Component({
  standalone: true,
  imports: [NgmMotionDirective],
  template: `
    <aside
      ngmMotion
      [initial]="{ opacity: 0, x: -24 }"
      [animate]="open() ? 'open' : 'closed'"
      [variants]="variants"
      [transition]="transition"
    >
      Sidebar content
    </aside>
  `,
})
export class SidebarComponent {
  readonly open: WritableSignal<boolean> = signal(false);
  readonly variants: Variants = {
    open: { opacity: 1, x: 0 },
    closed: { opacity: 0.4, x: -16 },
  };
  readonly transition: Transition = { type: 'spring', stiffness: 260, damping: 24 };
}
```

## Binding Angular Signals

Angular signals work well for state changes such as toggle state, selected tab, filter mode, or route-level UI state.

```ts
@Component({
  standalone: true,
  imports: [NgmMotionDirective],
  template: `<div ngmMotion [animate]="selected() ? active : inactive"></div>`,
})
export class ExampleComponent {
  readonly selected: WritableSignal<boolean> = signal(false);
  readonly active: TargetAndTransition = { opacity: 1, scale: 1 };
  readonly inactive: TargetAndTransition = { opacity: 0.5, scale: 0.95 };
}
```

That is the intended bridge: Angular signals express intent, and `motion-dom` performs the animation.

## Control Flow

Angular's built-in control flow (`@if`, `@for`, `@switch`) is the primary way to add and remove animated elements. `ngmMotion` is an attribute directive — place it directly on the element inside the control flow block. No `ng-template` wrappers are needed.

### `@if` — Conditional Rendering

When Angular creates an element through `@if`, `ngmMotion` mounts and plays the `initial` → `animate` transition automatically:

```html
@if (visible()) {
  <div
    ngmMotion
    [initial]="{ opacity: 0, y: 20 }"
    [animate]="{ opacity: 1, y: 0 }"
    [transition]="{ type: 'spring', stiffness: 300, damping: 24 }"
  >
    Appears with a spring animation
  </div>
}
```

Add an `[exit]` input to animate the element out before Angular removes it. The directive automatically clones the element, plays the exit animation, and removes the clone when done:

```html
@if (visible()) {
  <div
    ngmMotion
    [initial]="{ opacity: 0, y: 20 }"
    [animate]="{ opacity: 1, y: 0 }"
    [exit]="{ opacity: 0, y: -20 }"
    [transition]="{ type: 'spring', stiffness: 300, damping: 24 }"
  >
    Animates in and out
  </div>
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
    Collapses smoothly on exit
  </div>
}
```

No `*ngmPresence` wrapper needed — `[exit]` works directly with `@if`, `@for`, and `@switch`.

For advanced cases where child components need to know about exit state or control removal timing, see [Presence](./presence.md).

### `@for` — Lists

Elements inside `@for` each get their own `ngmMotion` instance. This is how you build animated lists, staggered enters, and layout reorders:

```html
<ul ngmMotion [animate]="'visible'" [variants]="containerVariants">
  @for (item of items(); track item.id) {
    <li ngmMotion [variants]="itemVariants">{{ item.label }}</li>
  }
</ul>
```

When Angular reorders or adds/removes DOM elements via `@for`, `ngmMotion` detects the layout change and animates elements to their new positions (when `[layout]="true"` is set). This works automatically — no manual snapshot or callback is required.

### `@if` + `layoutId` — Shared Layout Elements

Combine `@if` with `[layoutId]` to animate an element moving between different locations in the template. Angular destroys and recreates the element, but `ngmMotion` animates the transition as if it were the same element:

```html
@for (tab of tabs; track tab.id) {
  <button (click)="active.set(tab.id)">
    @if (active() === tab.id) {
      <div
        ngmMotion
        [layoutId]="'indicator'"
        [layoutDependency]="active()"
        class="indicator"
      ></div>
    }
    {{ tab.label }}
  </button>
}
```

### `@for` + `*ngmPresence` — Animated List Removal

For exit animations on list items, use `usePresenceList()` to derive stable visibility and spacing metadata, then bind each item's presence with `*ngmPresence`. The `usePresenceList` helper reacts immediately when an item starts exiting, keeping buttons, spacing, and counters in sync:

```html
@let visibleById = presence.visibleById();
@let gapAfter = presence.gapAfter();

@for (item of items(); track item.id) {
  <div
    *ngmPresence="visibleById[item.id] ?? false"
    ngmMotion
    [initial]="{ opacity: 0, x: -16, height: 0, marginBottom: 0 }"
    [animate]="{ opacity: 1, x: 0, height: 44, marginBottom: gapAfter[item.id] ? 8 : 0 }"
    [exit]="{ opacity: 0, x: 16, height: 0, marginBottom: 0 }"
    [transition]="{ type: 'spring', stiffness: 300, damping: 24 }"
    class="overflow-hidden"
  >
    {{ item.label }}
  </div>
}
```

### Why This Works

`ngmMotion` uses `afterNextRender` to mount after the DOM element exists and `DestroyRef` to clean up when Angular removes it. This means it works with any mechanism that creates or destroys DOM elements — `@if`, `@for`, `@switch`, `*ngIf`, `*ngFor`, or any custom structural directive. An `afterEveryRender` hook detects `@for` reorders where the DOM moves without any directive inputs changing, enabling FLIP animations for shuffled lists.

## Driving Inputs with `signal()` and `computed()`

This works for all directive inputs, including `variants`, `transition`, `style`, `viewport`, and `layoutDependency`.

The important detail is where the reactivity lives:

- the directive input types are plain values like `Variants` and `Transition`
- Angular reactivity comes from the template binding, for example `[variants]="panelVariants()"`
- in other words, bind the current value of the signal or computed, not the signal object itself

```ts
import { Component, computed, signal, type Signal, type WritableSignal } from '@angular/core';
import { NgmMotionDirective, type Transition, type Variants } from 'ng-motion';

@Component({
  standalone: true,
  imports: [NgmMotionDirective],
  template: `
    <section
      ngmMotion
      [animate]="open() ? 'open' : 'closed'"
      [variants]="panelVariants()"
      [transition]="panelTransition()"
      [layoutDependency]="open()"
    >
      Reactive panel
    </section>
  `,
})
export class PanelComponent {
  readonly open: WritableSignal<boolean> = signal(false);
  readonly panelVariants: Signal<Variants> = computed(() => ({
    open: { opacity: 1, height: 240 },
    closed: { opacity: 0.6, height: 120 },
  }));
  readonly panelTransition: Signal<Transition> = computed(() =>
    this.open()
      ? { type: 'spring', stiffness: 280, damping: 24 }
      : { duration: 0.2, ease: 'easeOut' },
  );
}
```

## Variant Propagation

When a parent has `[animate]` and children have `[variants]` (without their own `[animate]`), the children inherit the active variant label from the parent. This lets you orchestrate staggered or sequenced animations.

```ts
import { Component, signal, type WritableSignal } from '@angular/core';
import { NgmMotionDirective, type Transition, type Variants } from 'ng-motion';

@Component({
  standalone: true,
  imports: [NgmMotionDirective],
  template: `
    <ul
      ngmMotion
      [animate]="open() ? 'visible' : 'hidden'"
      [variants]="containerVariants"
    >
      @for (item of items; track item) {
        <li ngmMotion [variants]="itemVariants">{{ item }}</li>
      }
    </ul>
  `,
})
export class StaggerListComponent {
  readonly open: WritableSignal<boolean> = signal(false);
  readonly items = ['Alpha', 'Beta', 'Gamma'];

  readonly containerVariants: Variants = {
    visible: {
      transition: { staggerChildren: 0.08, delayChildren: 0.1 },
    },
    hidden: {},
  };

  readonly itemVariants: Variants = {
    visible: { opacity: 1, y: 0 },
    hidden: { opacity: 0, y: 16 },
  };
}
```

Key orchestration properties inside a variant's `transition`:

- `staggerChildren`: delay between each child's animation start (seconds)
- `delayChildren`: delay before the first child starts (seconds)
- `when`: `'beforeChildren'` or `'afterChildren'` to sequence parent and child animations

Children only inherit the variant label if they do not set their own `[animate]` input.

## MotionValue Styles

When a value changes every frame, pass it through `style` as a `MotionValue`. Define these as component field initializers (inside the injection context):

```ts
import { Component } from '@angular/core';
import {
  NgmMotionDirective,
  useMotionValue,
  useTransform,
  type MotionStyle,
  type MotionValue,
} from 'ng-motion';

@Component({
  standalone: true,
  imports: [NgmMotionDirective],
  template: `<div ngmMotion [style]="motionStyle"></div>`,
})
export class MotionStyleComponent {
  readonly x: MotionValue<number> = useMotionValue(0);
  readonly opacity: MotionValue<number> = useTransform(this.x, [-200, 0, 200], [0.2, 1, 0.2]);
  readonly motionStyle: MotionStyle = { x: this.x, opacity: this.opacity };
}
```

## SVG Support

The `ngmMotion` directive works on SVG elements just like HTML elements. Animate SVG-specific attributes like `cx`, `cy`, `r`, `pathLength`, `fill`, `stroke`, and `opacity` directly.

```ts
import { Component, signal } from '@angular/core';
import { NgmMotionDirective } from 'ng-motion';

@Component({
  imports: [NgmMotionDirective],
  template: `
    <svg viewBox="0 0 200 200" width="200" height="200">
      <!-- Animated circle -->
      <circle
        ngmMotion
        [initial]="{ r: 0, opacity: 0 }"
        [animate]="{ r: 80, opacity: 1 }"
        [transition]="{ type: 'spring', stiffness: 200, damping: 15 }"
        cx="100" cy="100"
        fill="none" stroke="currentColor" stroke-width="2"
      />

      <!-- Path drawing via pathLength -->
      <path
        ngmMotion
        [initial]="{ pathLength: 0 }"
        [animate]="{ pathLength: 1 }"
        [transition]="{ duration: 1.5, ease: 'easeInOut' }"
        d="M 20 100 Q 100 20, 180 100"
        fill="none" stroke="currentColor" stroke-width="2"
        pathLength="1"
        stroke-dasharray="1"
        stroke-dashoffset="0"
      />
    </svg>
  `,
})
export class SvgAnimationComponent {}
```

Animatable SVG properties include: `cx`, `cy`, `r`, `rx`, `ry`, `pathLength`, `fill`, `stroke`, `strokeWidth`, and `opacity`.

## Outputs

`NgmMotionDirective` exposes Angular outputs for common lifecycle and gesture events:

- `animationStart`, `animationComplete`, `update`
- `hoverStart`, `hoverEnd`
- `tap`, `tapStart`, `tapCancel`
- `viewportEnter`, `viewportLeave`
- `dragStart`, `dragMove`, `dragEnd`, `directionLock`
- `layoutAnimationStart`, `layoutAnimationComplete`

Use these when Angular state should respond to a motion event. Avoid using them to mirror frame-by-frame motion back into Angular unless you actually need Angular to react.

## Best Practices

- Keep transforms, opacity, and springs in motion values or directive state.
- Use `variants` when multiple elements need the same named states.
- Use `[exit]` directly with `@if`/`@for` for exit animations. Reach for `*ngmPresence` only when you need `useIsPresent()`, `usePresence()`, or `usePresenceList()` hooks.
- Use `layout` for DOM layout changes, not for continuous dragging effects.
