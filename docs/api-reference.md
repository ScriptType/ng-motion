# API Reference

This page groups the current public exports from `ng-motion` by area. It is a reference map, not a replacement for the concept guides.

## Core

- `NgmMotionDirective`: main directive for declarative motion
- `provideMotionConfig(config)`: global DI-based defaults
- `MOTION_CONFIG`: config injection token
- `VERSION`: library version constant

## Core Types

- `MotionValue`
- `MotionConfig`
- `Target`, `TargetAndTransition`, `Transition`
- `Variants`, `Variant`, `VariantLabels`
- `MotionStyle`, `ResolvedValues`
- `AnimationDefinition`, `AnimationPlaybackControls`, `AnimationState`
- `KeyframeOptions`, `SpringOptions`, `InertiaOptions`, `TransformOptions`
- `MotionNodeOptions`, `TargetResolver`, `ReducedMotionConfig`

## Motion Values and Hooks

- `useMotionValue(initial)`
- `useSpring(source, options?)`
- `useTransform(...)`
- `useVelocity(value)`
- `useTime()`
- `useMotionTemplate(strings, ...values)`
- `useMotionValueEvent(value, event, callback)`
- `useAnimationFrame(callback)`
- `useCycle(...items)`
- `useReducedMotion()`
- `useWillChange()`
- `useInView(target, options?)`
- `UseInViewOptions`
- `useScroll(options?)`
- `isMotionValue(value)`

## Gestures and Drag

- `HoverFeature`
- `PressFeature`
- `FocusFeature`
- `InViewFeature`
- `DragGesture`
- `PanGesture`
- `PanSession`
- `VisualElementDragControls`
- `DragControls`
- `useDragControls()`
- `EventInfo`, `PressGestureInfo`, `PanInfo`, `DragDirection`
- `ViewportOptions`, `Constraints`, `BoundingBox`

## Presence

- `NgmPresenceDirective`
- `PRESENCE_CONTEXT`
- `createPresenceContext()`
- `NgmPresenceContext`
- `ExitAnimationFeature`
- `useIsPresent()`
- `usePresence()`
- `usePresenceList()`
- `PresenceListState`, `UsePresenceListOptions`

## Layout

- `NgmLayoutGroupDirective`
- `LAYOUT_GROUP`
- `LayoutGroupContextProps`

## Scroll

- `scroll(onScroll, options?)`
- `scrollInfo(onScroll, options?)`
- `ScrollOffset`: preset offset collections such as `Enter`, `Exit`, `Any`, and `All`
- `ScrollOptions`, `ScrollInfo`, `AxisScrollInfo`
- `OnScroll`, `OnScrollInfo`, `ScrollInfoOptions`, `ScrollOffsetType`
- `UseScrollOptions`, `ScrollMotionValues`

## Reorder

- `NgmReorderGroupDirective`
- `NgmReorderItemDirective`
- `REORDER_CONTEXT`
- `checkReorder()`
- `autoScrollIfNeeded()`
- `resetAutoScrollState()`
- `ReorderContextProps`, `ItemData`

## Imperative Animation

- `animate(...)`
- `stagger(...)`
- `useAnimate()`
- `ScopedAnimate`
- `createAnimationsFromSequence()`
- `AnimationSequence`, `SequenceOptions`, `SequenceTime`

## Feature Loading and Advanced Setup

- `provideMotionFeatures(bundle)`
- `ngmAnimationFeatures`
- `ngmAllFeatures`
- `NgmFeatureBundle`
- `NgmLazyFeatureBundle`
- `initNgmFeatures()`
- `loadNgmFeatures(features)`

## Visual Element Adapters and Utilities

- `createVisualElement()`
- `mountVisualElement()`
- `updateVisualElement()`
- `unmountVisualElement()`
- `createHtmlVisualState()`
- `createHtmlRenderState()`
- `createSvgVisualElement()`
- `createSvgVisualState()`
- `createSvgRenderState()`
- `isSVGElement()`
- `onCleanup()`
- `resolveInput()`
- raw motion-dom re-exports: `motionValue`, `animateValue`, `animateSingleValue`, `frame`, `cancelFrame`
