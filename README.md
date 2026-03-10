# ng-motion

`ng-motion` is an Angular animation library built on `motion-dom`.

It is designed to feel familiar if you already know Framer Motion: the same core ideas like `initial`, `animate`, `exit`, `variants`, `layout`, motion values, and imperative `animate()`, but expressed with Angular directives, providers, and injection-context hooks.

The project is currently pre-1.0. The main API is usable, but advanced areas may still evolve.

## Requirements

- Angular 21
- standalone components and directives
- browser rendering

The docs assume a standalone Angular application created with the Angular CLI.

## Features

- declarative motion via `ngmMotion`
- Framer Motion-style variants, gestures, and exit animations
- motion values and derived hooks like `useSpring()` and `useTransform()`
- layout animations with `layout` and shared transitions via `layoutId`
- scroll-linked motion values and in-view animation
- imperative `animate()` and scoped `useAnimate()`

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
      Toggle
    </button>
  `,
})
export class DemoComponent {
  readonly open: WritableSignal<boolean> = signal(true);
  readonly openState: TargetAndTransition = { opacity: 1, y: 0 };
  readonly closedState: TargetAndTransition = { opacity: 0.7, y: 8 };
  readonly hoverState: TargetAndTransition = { scale: 1.03 };
  readonly tapState: TargetAndTransition = { scale: 0.97 };
  readonly transition: Transition = { type: 'spring', stiffness: 320, damping: 24 };
}
```

## Framer Motion Mental Model

| Framer Motion                                 | ng-motion                    |
| --------------------------------------------- | ---------------------------- |
| `motion.div`                                  | any element with `ngmMotion` |
| `AnimatePresence`                             | `*ngmPresence`               |
| `LayoutGroup`                                 | `ngmLayoutGroup`             |
| `useMotionValue`, `useSpring`, `useTransform` | same names                   |
| `animate()`                                   | same role                    |

This is not a React port. The Angular equivalents use directive inputs, Angular outputs, DI, and Angular injection contexts.

Directive inputs also work well with Angular `signal()` and `computed()` bindings, for example `[variants]="variants()"` or `[transition]="transition()"`.

## Documentation

- [Docs Index](./docs/README.md)
- [Getting Started](./docs/getting-started.md)
- [Core Motion](./docs/core-motion.md)
- [Motion Values](./docs/motion-values.md)
- [Gestures](./docs/gestures.md)
- [Presence](./docs/presence.md)
- [Layout](./docs/layout.md)
- [Scroll](./docs/scroll.md)
- [Reorder](./docs/reorder.md)
- [Imperative Animation](./docs/imperative-animation.md)
- [Advanced APIs](./docs/advanced-apis.md)
- [API Reference](./docs/api-reference.md)
- [Contributor Guide](./docs/contributors.md)

## Install

For package consumers:

```bash
npm install @scripttype/ng-motion motion-dom motion-utils
```

For repository development:

```bash
bun install
```

## Claude Code Skill

ng-motion ships a [Claude Code](https://claude.ai/claude-code) skill that gives Claude full knowledge of the ng-motion API, directives, hooks, and patterns — so it can scaffold, debug, and refactor ng-motion code for you.

```bash
# 1. Add the marketplace
/plugin marketplace add ScriptType/ng-motion-skill

# 2. Install the skill
/plugin install ng-motion@ng-motion-skill
```

Once installed, Claude Code understands `ngmMotion`, motion values, gestures, presence, layout animations, and every other API in the library — no extra prompting needed.

## Development

Run commands from `workspace/`.

```bash
bun ng serve example
bun ng build ng-motion
bun ng lint ng-motion
npx vitest run
npx tsc -p projects/ng-motion/tsconfig.spec.json --noEmit
```

Useful targets:

- `projects/ng-motion`: Angular library
- `projects/example`: example app used to validate behavior manually
- `docs/`: hand-written documentation set

## Project Structure

```text
projects/ng-motion/src/lib/
  core/
  values/
  gestures/
  presence/
  layout/
  scroll/
  reorder/
  animation/
projects/example/src/app/
docs/
```

## Status

Recommended starting points today:

- `ngmMotion`
- motion values and derived hooks
- gestures
- presence
- layout
- imperative animation

More advanced and more likely to change before 1.0:

- reorder primitives
- drag control helpers
- low-level visual element adapter APIs
- manual feature-loading setup
