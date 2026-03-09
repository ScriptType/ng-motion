# Scroll

`ng-motion` supports both declarative and imperative scroll-driven animation.

Hooks on this page should run inside an Angular injection context.

## `useScroll()`

`useScroll()` returns motion values for position and normalized progress. Called with no arguments, it tracks the page (document) scroll position.

```ts
import { Component } from '@angular/core';
import {
  NgmMotionDirective,
  useScroll,
  useSpring,
  useTransform,
  type MotionStyle,
  type MotionValue,
  type ScrollMotionValues,
  type SpringOptions,
} from '@scripttype/ng-motion';

@Component({
  standalone: true,
  imports: [NgmMotionDirective],
  template: `
    <div ngmMotion [style]="progressStyle" class="progress"></div>
    <section ngmMotion [style]="heroStyle">Parallax content</section>
  `,
})
export class ScrollComponent {
  readonly spring: SpringOptions = { stiffness: 200, damping: 30 };
  private readonly scroll: ScrollMotionValues = useScroll();
  readonly smoothProgress: MotionValue<number> = useSpring(
    this.scroll.scrollYProgress,
    this.spring,
  );
  readonly scaleX: MotionValue<number> = this.smoothProgress;
  readonly heroY: MotionValue<number> = useTransform(
    this.scroll.scrollYProgress,
    [0, 1],
    [0, -180],
  );

  readonly progressStyle: MotionStyle = { scaleX: this.scaleX, transformOrigin: '0% 50%' };
  readonly heroStyle: MotionStyle = { y: this.heroY };
}
```

Returned motion values:

- `scrollX`
- `scrollY`
- `scrollXProgress`
- `scrollYProgress`

## Targeted Scroll Tracking

`useScroll()` accepts either an `ElementRef<HTMLElement>` or an `HTMLElement` for `container` and `target`.

The easiest copyable pattern is a directive or component that can inject the host `ElementRef` directly:

```ts
import { Directive, ElementRef, inject } from '@angular/core';
import { useScroll, type MotionValue, type ScrollMotionValues } from '@scripttype/ng-motion';

@Directive({
  selector: '[appTrackScrollSection]',
  standalone: true,
})
export class TrackScrollSectionDirective {
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly values: ScrollMotionValues = useScroll({
    target: this.element,
    offset: ['start end', 'end start'],
  });

  readonly progress: MotionValue<number> = this.values.scrollYProgress;
}
```

If you already have a scrolling container reference, pass it the same way through `container`.

## `ScrollOffset` Presets

`ScrollOffset` provides preset offset collections for common scroll-tracking patterns:

- `ScrollOffset.Enter` — fires when the target enters the viewport
- `ScrollOffset.Exit` — fires when the target exits the viewport
- `ScrollOffset.Any` — fires for any viewport intersection
- `ScrollOffset.All` — fires when the target is fully within the viewport

```ts
import { useScroll, ScrollOffset } from '@scripttype/ng-motion';

const { scrollYProgress } = useScroll({
  target: this.element,
  offset: ScrollOffset.Enter,
});
```

## `whileInView` vs `useInView`

Use `whileInView` when visibility should only affect animation.

Use `useInView()` when Angular state should respond to visibility.

```ts
import { Directive, ElementRef, inject, type Signal } from '@angular/core';
import { useInView } from '@scripttype/ng-motion';

@Directive({
  selector: '[appTrackInView]',
  standalone: true,
})
export class TrackInViewDirective {
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly visible: Signal<boolean> = useInView(this.element, { once: true, amount: 0.5 });
}
```

`useInView()` returns an Angular signal, not a motion value.

## Imperative Scroll APIs

### `scroll(callback, options?)`

Run a callback or animation in response to scroll progress.

### `scrollInfo(callback, options?)`

Get the full measured scroll info object, including velocity and offsets.

These are useful when you need lower-level control than `useScroll()` provides.

## Best Practices

- Use `useScroll()` for most component-level scroll effects.
- Combine scroll progress with `useTransform()` and `useSpring()` for polished output.
- Prefer `whileInView` over manual observers when the effect is purely visual.
