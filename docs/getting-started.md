# Getting Started

## Requirements

`ng-motion` currently targets:

- Angular 21
- standalone components and directives
- browser rendering

The docs assume a standalone Angular application created with the Angular CLI.

## Install

```bash
npm install @scripttype/ng-motion motion-dom motion-utils
```

## Optional Global Defaults

Use `provideMotionConfig()` to define app-wide motion defaults.

```ts
import { type ApplicationConfig } from '@angular/core';
import { provideMotionConfig, type MotionConfig } from '@scripttype/ng-motion';

const motionConfig: MotionConfig = {
  transition: { duration: 0.4 },
  reducedMotion: 'user',
};

export const appConfig: ApplicationConfig = {
  providers: [provideMotionConfig(motionConfig)],
};
```

## Your First Animated Component

```ts
import { Component, signal, type WritableSignal } from '@angular/core';
import { NgmMotionDirective, type TargetAndTransition, type Transition } from '@scripttype/ng-motion';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [NgmMotionDirective],
  template: `
    <section
      ngmMotion
      [initial]="{ opacity: 0, y: 24, scale: 0.96 }"
      [animate]="expanded() ? expandedState : collapsedState"
      [transition]="transition"
      [whileHover]="hoverState"
      (click)="expanded.set(!expanded())"
      class="card"
    >
      <h2>Angular motion, Framer Motion mental model</h2>
      <p>Click to animate between states.</p>
    </section>
  `,
})
export class CardComponent {
  readonly expanded: WritableSignal<boolean> = signal(false);
  readonly collapsedState: TargetAndTransition = { opacity: 0.9, y: 0, height: 120 };
  readonly expandedState: TargetAndTransition = { opacity: 1, y: -6, height: 180 };
  readonly hoverState: TargetAndTransition = { scale: 1.01 };
  readonly transition: Transition = { type: 'spring', stiffness: 280, damping: 24 };
}
```

## Framer Motion to ng-motion

| Framer Motion | ng-motion |
| --- | --- |
| `motion.div` | any element with `ngmMotion` |
| `initial`, `animate`, `exit`, `variants` | same names on the directive |
| `AnimatePresence` | `*ngmPresence` |
| `LayoutGroup` | `ngmLayoutGroup` |
| `useMotionValue`, `useSpring`, `useTransform` | same hook names |
| `animate()` | same top-level function |

The API is not a literal React port. The Angular equivalents use:

- `@if`, `@for`, `@switch` to add and remove animated elements (no `ng-template` wrappers needed)
- directive inputs instead of JSX props
- Angular outputs instead of callback props in JSX
- Angular DI for global config
- injection-context hooks instead of React hooks

## Reactivity Quick Guide

Use the three reactive tools for different jobs:

- Angular `signal()` and `computed()`: application state and declarative animation state
- `MotionValue`: high-frequency animated values such as drag position, springs, transforms, and scroll progress
- Angular outputs like `(animationComplete)`: when Angular state needs to react to a motion event

Examples:

- `[animate]="open() ? expanded : collapsed"`: Angular signal-driven state
- `[variants]="cardVariants()"`: computed variants
- `[style]="{ x, opacity }"`: `MotionValue`-driven visual state

Rule of thumb:

- if Angular should decide what state the UI is in, use `signal()` or `computed()`
- if a value updates every frame, use `MotionValue`

## Recommended Reading Order

1. [Core Motion](./core-motion.md)
2. [Motion Values](./motion-values.md)
3. [Gestures](./gestures.md)
4. [Presence](./presence.md)
5. [Layout](./layout.md)

## Important Notes

- `ng-motion` is pre-1.0. Treat advanced APIs as more likely to change.
- Many hooks must run inside an Angular injection context, such as a component field initializer, constructor, directive, or `runInInjectionContext(...)`.
- Any directive input can be driven from `signal()` or `computed()` by binding its current value, for example `[variants]="variants()"` or `[layoutDependency]="expanded()"`.
- For frame-driven values, prefer `MotionValue`s over pushing every frame into Angular signals.
