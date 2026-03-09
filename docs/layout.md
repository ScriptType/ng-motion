# Layout

Layout animation is the area where `ng-motion` is most visibly close to Framer Motion. Use it when elements move because the DOM layout changed, not because you are directly animating `x` or `y` yourself.

## `layout`

Enable layout animation on an element whose position or size changes.

```html
<div ngmMotion [layout]="true" [transition]="{ type: 'spring', stiffness: 360, damping: 30 }">
  Layout-aware card
</div>
```

Valid values are:

- `true`
- `'position'`
- `'size'`
- `'preserve-aspect'`

## `layoutDependency`

Use `layoutDependency` when a state change should force layout re-measurement.

```html
<section ngmMotion [layout]="true" [layoutDependency]="expanded()">...</section>
```

This is useful for accordions, filters, toggles, and list expansion.

## Shared Layout with `layoutId`

Give two elements the same `layoutId` to animate between them as if they were the same visual object.

<!-- prettier-ignore -->
```html
@for (tab of tabs; track tab.id) {
  <button (click)="active.set(tab.id)" class="tab">
    @if (active() === tab.id) {
      <div
        ngmMotion
        [layoutId]="'active-indicator'"
        [transition]="{ type: 'spring', stiffness: 500, damping: 36 }"
        class="indicator"
      ></div>
    }
    {{ tab.label }}
  </button>
}
```

## `ngmLayoutGroup`

Wrap related regions in `ngmLayoutGroup` when shared layout transitions should work across different DOM branches.

Today the important part is the grouping boundary itself. Treat `ngmLayoutGroup` as a marker directive; do not rely on the attribute's string value as part of the main public API.

```html
<div ngmLayoutGroup>
  <aside>...</aside>
  <main>...</main>
</div>
```

## Advanced Layout Inputs

- `layoutScroll`: account for scrolling containers during measurement
- `layoutRoot`: treat the element as a projection root

These are public advanced APIs. Reach for them only when normal `layout` or `layoutId` is not enough.

## When to Use Layout Animation

Good fits:

- tabs and active indicators
- expanding cards and accordions
- filtering and reordering lists
- shared element transitions

Poor fits:

- continuous drag transforms
- frame-by-frame physics
- values already expressed as `x`, `y`, `scale`, or `rotate`

## Testing Advice

Layout code is sensitive to teardown order and shared-node cleanup. When you change layout behavior, add tests for mount, re-parenting, destroy, and shared `layoutId` handoff.
