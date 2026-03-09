# ng-motion

`ng-motion` is an Angular 21 animation library built on `motion-dom`. It is designed to feel familiar if you already know Framer Motion: the same core ideas (`initial`, `animate`, `exit`, `variants`, `layout`, motion values, imperative `animate()`), but expressed with Angular directives, DI providers, and injection-context hooks.

The project is still pre-1.0. The core API is already usable, but some advanced areas may still change.

## Start Here

- [Getting Started](./getting-started.md)
- [Core Motion](./core-motion.md)
- [Motion Values](./motion-values.md)
- [Gestures](./gestures.md)
- [Presence](./presence.md)
- [Layout](./layout.md)
- [Scroll](./scroll.md)
- [Reorder](./reorder.md)
- [Imperative Animation](./imperative-animation.md)
- [Advanced APIs](./advanced-apis.md)
- [API Reference](./api-reference.md)
- [Contributors](./contributors.md)

## Quick Example

```ts
import { Component, signal, type WritableSignal } from '@angular/core';
import { NgmMotionDirective, type TargetAndTransition, type Transition } from '@scripttype/ng-motion';

@Component({
  selector: 'app-demo',
  standalone: true,
  imports: [NgmMotionDirective],
  template: `
    <button
      ngmMotion
      [initial]="{ opacity: 0, y: 16 }"
      [animate]="open() ? openState : closedState"
      [whileHover]="hoverState"
      [whileTap]="tapState"
      [transition]="transition"
      (click)="open.set(!open())"
    >
      Toggle me
    </button>
  `,
})
export class DemoComponent {
  readonly open: WritableSignal<boolean> = signal(true);
  readonly openState: TargetAndTransition = { opacity: 1, y: 0 };
  readonly closedState: TargetAndTransition = { opacity: 0.6, y: 8 };
  readonly hoverState: TargetAndTransition = { scale: 1.04 };
  readonly tapState: TargetAndTransition = { scale: 0.96 };
  readonly transition: Transition = { type: 'spring', stiffness: 320, damping: 24 };
}
```

## Mental Model

If you know Framer Motion, the mapping is straightforward:

- `motion.div` -> a normal Angular element with `ngmMotion`
- `AnimatePresence` -> `*ngmPresence`
- `LayoutGroup` -> `ngmLayoutGroup`
- `useMotionValue`, `useSpring`, `useTransform`, `animate()` -> same names, same job
- `LazyMotion`-style feature loading -> `provideMotionFeatures(...)`

## Design Principles

- Keep the Angular layer thin. Physics, layout projection, and animation state live in `motion-dom`.
- Use Angular `signal()` and `computed()` for application state and declarative animation choices.
- Keep high-frequency animation data in `MotionValue`s.
- Use Angular signals for application state, not for every animation frame.
- Drive directive inputs from `signal()` and `computed()` bindings when state is reactive.
- Prefer declarative APIs first; use imperative APIs when orchestration is the real requirement.
