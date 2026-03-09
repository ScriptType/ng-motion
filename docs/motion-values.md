# Motion Values

`MotionValue`s are the right tool for high-frequency animated state. They update outside Angular's change detection path and feed directly into motion styles and animation pipelines.

## Signals vs MotionValues

Angular signals and MotionValues serve different purposes. Use the right tool for the job:

| | Signal | MotionValue |
| --- | --- | --- |
| Update frequency | Low (UI state) | High (60fps animation) |
| Change detection | Triggers re-render | Bypasses entirely |
| Template binding | `{{ signal() }}` | `[style]="motionStyle"` |
| Composability | `computed()` | `useTransform` / `useSpring` |
| Best for | App state, form values | Animated styles, gestures |

## `useMotionValue`

Creates a mutable value that drives animation and style. Call `.set()` to update it — the DOM updates on the next animation frame with zero change detection cycles.

```ts
import { useMotionValue, type MotionStyle } from 'ng-motion';

export class MyComponent {
  // Create a motion value with an initial value
  readonly x = useMotionValue(0);

  // Pass it to the directive via a MotionStyle object
  readonly style: MotionStyle = { x: this.x };

  // Update imperatively — no change detection triggered
  onSliderChange(event: Event): void {
    const val = Number((event.target as HTMLInputElement).value);
    this.x.set(val);
  }
}
```

## `useSpring`

Wraps a value or another MotionValue with spring physics. The returned MotionValue follows its source with natural, springy easing. Configure `stiffness`, `damping`, and `mass` to tune the feel.

```ts
import { useMotionValue, useSpring, type SpringOptions } from 'ng-motion';

export class SpringComponent {
  readonly springOpts: SpringOptions = {
    stiffness: 320,
    damping: 28,
  };

  // Raw value — jumps instantly
  readonly rawX = useMotionValue(0);

  // Spring value — follows rawX with physics
  readonly x = useSpring(this.rawX, this.springOpts);

  // You can also spring a static number
  readonly scale = useSpring(1, { stiffness: 200, damping: 15 });
}
```

## `useTransform`

Creates a derived MotionValue that updates whenever its source changes. Three signatures cover the common cases:

```ts
import { useMotionValue, useTransform } from 'ng-motion';

export class TransformComponent {
  readonly x = useMotionValue(0);

  // Range mapping: input 0–300 → opacity 0–1
  readonly opacity = useTransform(this.x, [0, 300], [0, 1]);

  // Function transform: any custom logic
  readonly rounded = useTransform(this.x, (v) => Math.round(v));

  // Multi-input: combine multiple values
  readonly y = useMotionValue(0);
  readonly distance = useTransform(
    [this.x, this.y],
    (px, py) => Math.sqrt(px * px + py * py)
  );
}
```

## `useVelocity`

Track the instantaneous velocity of a MotionValue in px/s. Useful for skew-on-drag, trail effects, and velocity-dependent visuals.

```ts
import { useMotionValue, useVelocity, useTransform } from 'ng-motion';

export class DragSkewComponent {
  readonly x = useMotionValue(0);
  readonly xVelocity = useVelocity(this.x);
  // Map velocity to skew: fast drags tilt the element
  readonly skew = useTransform(this.xVelocity, [-1000, 0, 1000], [-15, 0, 15]);
}
```

## `useMotionTemplate`

Build reactive CSS strings from MotionValues using a tagged template literal. The result is a `MotionValue<string>` that updates whenever any interpolated value changes.

```ts
import { useMotionValue, useMotionTemplate } from 'ng-motion';
import type { MotionStyle } from 'ng-motion';

export class HueShiftComponent {
  readonly hue = useMotionValue(0);
  readonly background = useMotionTemplate`hsl(${this.hue}, 70%, 50%)`;
  readonly style: MotionStyle = { background: this.background };
}
```

## `useTime`

Returns a MotionValue that updates every frame with milliseconds since mount. Use for continuous rotation, pulsing, or any time-based effect without manual requestAnimationFrame.

```ts
import { useTime, useTransform } from 'ng-motion';

export class SpinnerComponent {
  readonly time = useTime(); // ms since mount, updates every frame
  readonly rotate = useTransform(this.time, (t) => (t / 1000) * 360 % 360);
  // Continuous rotation: bind [style]="{ rotate }"
}
```

## `useAnimationFrame`

Register a per-frame callback with `(time, delta)` arguments. Automatically cleaned up when the component is destroyed. Use for physics simulations, particles, or manual animation loops.

```ts
import { useAnimationFrame } from 'ng-motion';

export class ParticleComponent {
  constructor() {
    useAnimationFrame((time, delta) => {
      // Runs every frame — use delta for frame-rate-independent updates
      // Automatically stopped on component destroy
    });
  }
}
```

## `useMotionValueEvent`

Subscribe to MotionValue lifecycle events outside Angular's zone. Events: `'change'`, `'animationStart'`, `'animationComplete'`, `'animationCancel'`.

```ts
import { signal, inject, NgZone } from '@angular/core';
import { useMotionValue, useMotionValueEvent } from 'ng-motion';

export class ThresholdComponent {
  private readonly zone = inject(NgZone);
  readonly x = useMotionValue(0);
  readonly pastThreshold = signal(false);

  constructor() {
    // "change" fires on every value update (outside Angular zone)
    useMotionValueEvent(this.x, 'change', (latest) => {
      const crossed = latest > 200;
      if (crossed !== this.pastThreshold()) {
        // Enter Angular zone only when the flag changes
        this.zone.run(() => this.pastThreshold.set(crossed));
      }
    });

    // Track animation lifecycle
    useMotionValueEvent(this.x, 'animationStart', () => {
      console.log('Animation started');
    });
    useMotionValueEvent(this.x, 'animationComplete', () => {
      console.log('Animation settled');
    });
  }
}
```

## `useCycle`

Rotate between a fixed list of values. Returns `[signal, cycleFn]`.

## `useReducedMotion`

Returns a `Signal<boolean>` that tracks the `prefers-reduced-motion` media query. Use it to swap spring animations for instant transitions when the user prefers reduced motion.

```ts
import { computed } from '@angular/core';
import { useReducedMotion } from 'ng-motion';

export class AccessibleComponent {
  readonly prefersReduced = useReducedMotion();
  // Signal<boolean> — true when reduced motion is enabled
  readonly transition = computed(() =>
    this.prefersReduced() ? { duration: 0 } : { type: 'spring' }
  );
}
```

## `useWillChange`

Creates a MotionValue that automatically manages the `will-change` CSS property during animations, providing GPU compositing hints for smoother performance.

```ts
import { useMotionValue, useWillChange } from 'ng-motion';
import type { MotionStyle } from 'ng-motion';

export class OptimizedComponent {
  readonly x = useMotionValue(0);
  readonly willChange = useWillChange();

  // willChange automatically adds/removes CSS will-change during animations
  readonly style: MotionStyle = { x: this.x, willChange: this.willChange };
}
```

## Putting It Together

A complete example combining `useMotionValue`, `useSpring`, and `useTransform` to build a spring-driven slider with derived opacity:

```ts
import { Component } from '@angular/core';
import { NgmMotionDirective } from 'ng-motion';
import {
  useMotionValue,
  useSpring,
  useTransform,
} from 'ng-motion';
import type { MotionStyle, SpringOptions } from 'ng-motion';

@Component({
  standalone: true,
  imports: [NgmMotionDirective],
  template: `
    <div ngmMotion [style]="style" class="dot"></div>
    <input
      type="range"
      min="0" max="300"
      [value]="150"
      (input)="setX($event)"
    />
  `,
})
export class MotionValueComponent {
  readonly springOpts: SpringOptions = {
    stiffness: 320,
    damping: 28,
  };

  readonly rawX = useMotionValue(150);
  readonly x = useSpring(this.rawX, this.springOpts);
  readonly opacity = useTransform(
    this.x, [0, 150, 300], [0.3, 1, 0.3]
  );
  readonly style: MotionStyle = {
    x: this.x,
    opacity: this.opacity,
  };

  setX(event: Event): void {
    const value = Number(
      (event.target as HTMLInputElement).value
    );
    this.rawX.set(value);
  }
}
```

## Hook Reference

| Hook | Description |
| --- | --- |
| `useMotionValue` | Create a mutable value that drives animation and style. |
| `useSpring` | Wrap a value or MotionValue with spring physics for natural easing. |
| `useTransform` | Derive values via mapping function, input/output ranges, or multi-input combiner. |
| `useVelocity` | Track the instantaneous velocity of a MotionValue (px/s). |
| `useMotionTemplate` | Build CSS strings from motion values: `` useMotionTemplate`hsl(${hue}, 70%, 50%)` ``. |
| `useTime` | Animation-frame timestamp as a MotionValue. Useful for continuous effects. |
| `useAnimationFrame` | Per-frame callback with (time, delta). For advanced manual animation loops. |
| `useMotionValueEvent` | Subscribe to change, animationStart, animationComplete, or animationCancel events. |
| `useCycle` | Rotate between a list of values. Returns [signal, cycleFn]. |
| `useReducedMotion` | Returns an Angular signal tracking the prefers-reduced-motion media query. |
| `useWillChange` | Creates a MotionValue for manual will-change CSS property control. |

## Injection Context

Most hooks register cleanup logic through Angular's injection context. This means they must be called from one of three places:

- **Field initializer** — the most common. Declare as a class property and it runs during construction.
- **Constructor body** — use when you need imperative setup logic.
- **`runInInjectionContext()`** — for deferred creation, e.g. inside an `afterNextRender` callback.

```ts
// Field initializer — preferred
export class MyComponent {
  readonly x = useMotionValue(0);       // injection context
  readonly springX = useSpring(this.x);  // injection context
}

// Constructor body
export class MyComponent {
  readonly x: MotionValue<number>;
  constructor() {
    this.x = useMotionValue(0);          // injection context
  }
}

// Deferred with runInInjectionContext
export class MyComponent {
  private injector = inject(Injector);

  ngAfterViewInit(): void {
    runInInjectionContext(this.injector, () => {
      const x = useMotionValue(0);       // injection context
    });
  }
}
```

## Performance Best Practices

MotionValues bypass change detection by design. Follow these rules to keep it that way:

- **Don't mirror into template state.** Avoid copying every MotionValue change into a signal or subject just to display it. Use `[style]` bindings with a `MotionStyle` object instead.
- **Keep hot paths in MotionValue land.** Chain `useTransform` and `useSpring` to derive values reactively without triggering Angular's zone.
- **Use `useMotionValueEvent` for side effects.** When you need to react to a value crossing a threshold, `useMotionValueEvent` fires outside the zone — you decide when to enter it.
- **Prefer `useSpring` over manual animation.** Springs automatically settle and stop updating. A manual `useAnimationFrame` loop runs every frame until you stop it.
