# ng-motion

`ng-motion` is an Angular 21 animation library built on `motion-dom`. It follows a Framer Motion-style mental model, but uses Angular directives, DI, and injection-context hooks.

The project is pre-1.0. Core APIs are usable today, while some advanced areas may still change.

## Requirements

- Angular 21
- standalone components and directives
- browser rendering

## Install

```bash
npm install ng-motion motion-dom motion-utils
```

## Quick Example

```ts
import { Component, signal, type WritableSignal } from '@angular/core';
import { NgmMotionDirective, type TargetAndTransition, type Transition } from 'ng-motion';

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

## Main Concepts

- `ngmMotion`: declarative motion on any element
- `*ngmPresence`: exit animations before Angular removes a view
- `ngmLayoutGroup`: shared-layout grouping across DOM branches
- motion value hooks such as `useMotionValue()`, `useSpring()`, and `useTransform()`
- imperative helpers such as `animate()` and `useAnimate()`

## In This Repository

- [Workspace README](../../README.md)
- [Getting Started](../../docs/getting-started.md)
- [Core Motion](../../docs/core-motion.md)
- [Motion Values](../../docs/motion-values.md)
- [Gestures](../../docs/gestures.md)
- [Presence](../../docs/presence.md)
- [Layout](../../docs/layout.md)
- [Scroll](../../docs/scroll.md)
- [Reorder](../../docs/reorder.md)
- [Imperative Animation](../../docs/imperative-animation.md)
- [Advanced APIs](../../docs/advanced-apis.md)
- [API Reference](../../docs/api-reference.md)
