# Imperative Animation

Use the imperative APIs when the animation is driven by a command, a sequence, or a one-off orchestration rather than template state.

## `animate()`

`animate()` works with DOM elements, selectors, motion values, raw numbers, raw strings, and animation sequences.

### Animate a MotionValue

```ts
import { animate, useMotionValue, type MotionValue } from 'ng-motion';

const opacity: MotionValue<number> = useMotionValue(0);
animate(opacity, 1, { duration: 0.3 });
```

### Animate a DOM element

```ts
animate('.card', { opacity: [0, 1], y: [24, 0] }, { duration: 0.5 });
```

### Animate a sequence

```ts
import { animate, type AnimationSequence } from 'ng-motion';

const sequence: AnimationSequence = [
  ['.badge', { scale: [1, 1.2, 1] }, { duration: 0.3 }],
  ['.label', { opacity: [0, 1] }, { at: '<', duration: 0.2 }],
];

animate(sequence);
```

`stagger()` is re-exported for sequence timing.

## `useAnimate()`

Use `useAnimate()` when animations should be scoped to a specific container and automatically stopped on destroy. It returns a `[scope, animate]` tuple. The scope needs a real DOM element, which is only available after render, so the example uses `afterNextRender` to wire it up.

```ts
import { afterNextRender, Component, ElementRef, viewChild } from '@angular/core';
import { useAnimate, type ScopedAnimate } from 'ng-motion';

@Component({
  standalone: true,
  template: `<div #box class="box"></div>`,
})
export class ScopedAnimationComponent {
  private readonly boxRef = viewChild<ElementRef<HTMLElement>>('box');
  private readonly animateApi = useAnimate<HTMLElement>();
  private readonly scope = this.animateApi[0];
  private readonly animateInScope: ScopedAnimate = this.animateApi[1];

  constructor() {
    afterNextRender(() => {
      const box = this.boxRef();
      if (box) this.scope.current = box.nativeElement;
    });
  }

  async run(): Promise<void> {
    await this.animateInScope(this.scope.current, { scale: 1.2 }, { duration: 0.2 }).finished;
    await this.animateInScope(this.scope.current, { rotate: 180 }, { duration: 0.3 }).finished;
  }
}
```

## When to Prefer Imperative APIs

Use imperative animation for:

- command-style interactions
- timelines and sequences
- coordinating multiple targets from one event handler
- effects that are easier to describe as steps than states

If the animation is mostly just "state A to state B", stay declarative with `ngmMotion`.
