# Contributors

This guide is for people changing `ng-motion` itself.

## Architecture

`ng-motion` is intentionally a thin Angular integration layer over `motion-dom`.

The core split is:

- `core/`: `NgmMotionDirective`, config, feature init, visual element adapters
- `values/`: injection-context hooks such as `useSpring()` and `useTransform()`
- `gestures/`: hover, tap, focus, drag, and in-view features
- `presence/`: delayed removal and presence context
- `layout/`: projection lifecycle, shared layout handoff, layout groups
- `scroll/`: scroll tracking and scroll info
- `reorder/`: reorder primitives
- `animation/`: top-level `animate()`, sequences, `useAnimate()`

Read [`PLAN.md`](../../PLAN.md) for the original architecture and roadmap context.

## Core Lifecycle

`NgmMotionDirective` is the most critical file.

It is responsible for:

- creating a `VisualElement`
- mounting after render
- translating Angular inputs to `motion-dom` props
- re-running animation changes when reactive inputs change
- cleaning up visual elements and projection nodes on destroy

If you change directive lifecycle behavior, test mount, update, destroy, re-entry, and destroy-while-animating cases.

## Zones, Signals, and MotionValues

The library intentionally runs hot paths outside Angular where possible.

Rules to keep:

- high-frequency work should stay in `MotionValue`s or frame callbacks outside Angular
- do not mirror frame-by-frame animation state into Angular signals unless Angular must re-render
- hook cleanup should use the current injection context via `DestroyRef`

The common failure mode is endless Angular change notifications caused by feeding every frame back into template-bound signals.

## Layout and Presence Are the Highest-Risk Areas

Shared layout, projection cleanup, and presence teardown are the most failure-prone code paths.

Watch for:

- stale projections surviving after destroy
- callbacks firing after directive teardown
- shared `layoutId` handoff breaking during rapid enter/exit
- snapshot loss during DOM replacement
- Angular errors like post-destroy output emission

When you touch layout or presence code, add regression tests.

## Testing

Tests are co-located as `*.spec.ts` and run with Vitest plus Angular Testing Library.

Useful commands from `workspace/`:

```bash
npx vitest run
npx tsc -p projects/ng-motion/tsconfig.spec.json --noEmit
npx ng build ng-motion
```

For high-risk changes, verify all three.

## Documentation Expectations

Public API changes should update:

- the relevant guide in `workspace/docs/`
- `workspace/docs/api-reference.md`
- contributor notes if architecture or risk areas changed
