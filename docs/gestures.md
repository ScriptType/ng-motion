# Gestures

`ng-motion` supports the same interaction model many Framer Motion users expect: hover, tap, focus, in-view animation, and drag.

All gesture inputs are part of `NgmMotionDirective`. Add `imports: [NgmMotionDirective]` to your component.

## Hover, Tap, and Focus

```html
<button
  ngmMotion
  [whileHover]="{ scale: 1.04, y: -2 }"
  [whileTap]="{ scale: 0.96 }"
  [whileFocus]="{ boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.2)' }"
  (tap)="save()"
>
  Save
</button>
```

Use:

- `whileHover` for pointer hover state
- `whileTap` for pressed state
- `whileFocus` for keyboard focus state

## In-View Animation

For pure animation on viewport entry, use `whileInView`.

```html
<section
  ngmMotion
  [initial]="{ opacity: 0, y: 32 }"
  [whileInView]="{ opacity: 1, y: 0 }"
  [viewport]="{ once: true, amount: 0.4 }"
>
  Reveal me once
</section>
```

Use `viewport` to configure:

- `once`
- `amount`
- `margin`
- `root`

If you need Angular state instead of pure animation, use [`useInView`](./scroll.md#whileinview-vs-useinview) instead.

## Drag

```html
<div
  ngmMotion
  drag="x"
  [dragConstraints]="dragBounds()"
  [dragElastic]="0.15"
  [dragMomentum]="true"
  [whileDrag]="{ scale: 1.05 }"
  (dragStart)="dragging.set(true)"
  (dragEnd)="dragging.set(false)"
>
  Drag me
</div>
```

Supported drag-related inputs include:

- `drag`: `true`, `'x'`, or `'y'`
- `whileDrag`
- `dragConstraints`
- `dragElastic`
- `dragMomentum`
- `dragTransition`
- `dragSnapToOrigin`
- `dragDirectionLock`
- `dragListener`
- `dragPropagation`

## Gesture Outputs

These outputs are available when Angular needs to respond to gesture state:

- `hoverStart`, `hoverEnd`
- `tap`, `tapStart`, `tapCancel`
- `viewportEnter`, `viewportLeave`
- `dragStart`, `dragMove`, `dragEnd`, `directionLock`

## Advanced Note on Drag Controls

`DragControls`, `useDragControls()`, and `VisualElementDragControls` are public advanced exports, but they are not part of the main beginner path yet. Treat them as pre-1.0 APIs.
