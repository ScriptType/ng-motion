# Advanced APIs

This page covers the public APIs that most users do not need on day one.

## Motion Configuration

### `provideMotionConfig(config)`
Provide global defaults through Angular DI.

Good uses:

- default transition duration
- reduced motion policy

### `resolveInput(valueOrSignal)`
Unwrap either a plain value or an Angular `Signal<T>`.

Use this in library-facing TypeScript code when you want to accept both forms explicitly. Normal application code usually does not need it, because template bindings already make signal-driven inputs reactive.

## Feature Loading

`ng-motion` initializes its standard features automatically for normal directive usage. The APIs below are for advanced control:

- `provideMotionFeatures(bundle)`
- `ngmAnimationFeatures`
- `ngmAllFeatures`
- `loadNgmFeatures(features)`
- `initNgmFeatures()`

Use them when you want explicit feature registration or lazy feature bundles. This is the closest equivalent to Framer Motion's `LazyMotion` story.

```ts
import { type ApplicationConfig } from '@angular/core';
import { provideMotionFeatures, ngmAnimationFeatures } from 'ng-motion';

export const appConfig: ApplicationConfig = {
  providers: [provideMotionFeatures(ngmAnimationFeatures)],
};
```

## Raw motion-dom Re-exports

These are available for advanced composition:

- `motionValue`
- `animateValue`
- `animateSingleValue`
- `frame`
- `cancelFrame`

If you use them directly, you are operating closer to `motion-dom` than to the high-level Angular API. That is sometimes correct, but it also means Angular-specific ergonomics and cleanup are more your responsibility.

## Visual Element Adapters

Public advanced exports include:

- `createVisualElement`
- `mountVisualElement`
- `updateVisualElement`
- `unmountVisualElement`
- `createHtmlVisualState`
- `createHtmlRenderState`
- SVG equivalents such as `createSvgVisualElement`

These exist for contributors, experiments, and edge-case integrations. They are not the recommended entry point for application code.

## Advanced Hooks to Treat Carefully

The following are public and useful, but easier to misuse:

- `useAnimationFrame()`
- `useMotionValueEvent()`
- `frame` scheduling helpers
- reorder primitives
- drag control primitives

The common failure mode is routing high-frequency motion updates back through Angular state too aggressively. Keep hot paths in motion values or direct DOM updates.
