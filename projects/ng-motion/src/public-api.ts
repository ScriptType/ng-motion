/*
 * Public API Surface of ng-motion
 */

export const VERSION = '0.4.2';

// ── Core types ──
export type {
  AnimationDefinition,
  AnimationPlaybackControls,
  AnimationState,
  InertiaOptions,
  KeyframeOptions,
  MotionConfig,
  MotionNodeOptions,
  MotionStyle,
  ReducedMotionConfig,
  ResolvedValues,
  SpringOptions,
  Target,
  TargetAndTransition,
  TargetResolver,
  Transition,
  Variant,
  VariantLabels,
  Variants,
} from './lib/core/types';
export { MotionValue } from './lib/core/types';

// ── Motion directive ──
export { NgmMotionDirective } from './lib/core/motion.directive';

// ── Configuration ──
export { provideMotionConfig, MOTION_CONFIG } from './lib/core/motion-config';

// ── Feature initialization ──
export { initNgmFeatures, loadNgmFeatures } from './lib/core/feature-init';

// ── VisualElement adapter ──
export {
  createHtmlRenderState,
  createHtmlVisualState,
  createVisualElement,
  mountVisualElement,
  unmountVisualElement,
  updateVisualElement,
} from './lib/core/visual-element-adapter';

// ── SVG support ──
export {
  createSvgRenderState,
  createSvgVisualElement,
  createSvgVisualState,
  isSVGElement,
} from './lib/core/svg-visual-element-adapter';

// ── Utility re-exports from motion-dom ──
export { animateValue, animateSingleValue, motionValue, frame, cancelFrame } from 'motion-dom';

// ── Motion values ──
export { useMotionValue } from './lib/values/use-motion-value';
export { useSpring } from './lib/values/use-spring';
export { useTransform } from './lib/values/use-transform';
export { useVelocity } from './lib/values/use-velocity';
export { useTime } from './lib/values/use-time';
export type { TransformOptions } from './lib/values/types';
export { isMotionValue } from './lib/values/types';

// ── Motion value hooks ──
export { useMotionTemplate } from './lib/values/use-motion-template';
export { useMotionValueEvent } from './lib/values/use-motion-value-event';
export { useAnimationFrame } from './lib/values/use-animation-frame';

// ── Gestures ──
export { HoverFeature } from './lib/gestures/hover';
export { PressFeature } from './lib/gestures/press';
export { FocusFeature } from './lib/gestures/focus';
export type { EventInfo, PressGestureInfo } from './lib/gestures/types';
export { InViewFeature } from './lib/gestures/in-view';
export type { ViewportOptions } from './lib/gestures/in-view';
export { PanSession } from './lib/gestures/drag/pan-session';
export { PanGesture } from './lib/gestures/drag/pan-gesture';
export { DragGesture } from './lib/gestures/drag/drag-gesture';
export { VisualElementDragControls } from './lib/gestures/drag/drag-controls';
export type { PanInfo, DragDirection } from './lib/gestures/drag/utils';
export type { Constraints } from './lib/gestures/drag/constraints';
export type { BoundingBox } from 'motion-utils';

// ── Presence ──
export { NgmPresenceDirective } from './lib/presence/presence.directive';
export {
  PRESENCE_CONTEXT,
  createPresenceContext,
  type NgmPresenceContext,
} from './lib/presence/presence-context';
export { ExitAnimationFeature } from './lib/presence/exit-animation';

// ── Scroll ──
export { scroll } from './lib/scroll/scroll';
export { scrollInfo } from './lib/scroll/track';
export { ScrollOffset } from './lib/scroll/offsets/presets';
export type {
  ScrollOptions,
  ScrollInfo,
  AxisScrollInfo,
  OnScroll,
  OnScrollInfo,
  ScrollOffset as ScrollOffsetType,
  ScrollInfoOptions,
} from './lib/scroll/types';

// ── Scroll values ──
export { useScroll, type UseScrollOptions, type ScrollMotionValues } from './lib/values/use-scroll';

// ── Layout ──
export { LAYOUT_GROUP, type LayoutGroupContextProps } from './lib/layout/layout-group-context';
export { NgmLayoutGroupDirective } from './lib/layout/layout-group.directive';

// ── Reorder ──
export { REORDER_CONTEXT } from './lib/reorder/reorder-context';
export { NgmReorderGroupDirective } from './lib/reorder/reorder-group.directive';
export { NgmReorderItemDirective } from './lib/reorder/reorder-item.directive';
export { checkReorder } from './lib/reorder/check-reorder';
export { autoScrollIfNeeded, resetAutoScrollState } from './lib/reorder/auto-scroll';
export type { ReorderContextProps, ItemData } from './lib/reorder/types';

// ── Animation API (v0.4) ──
export { animate, stagger } from './lib/animation/animate';
export type { AnimationSequence, SequenceOptions, SequenceTime } from './lib/animation/sequence-types';
export { useAnimate, type ScopedAnimate } from './lib/animation/use-animate';
export { createAnimationsFromSequence } from './lib/animation/sequence';

// ── Lazy feature loading ──
export {
  provideMotionFeatures,
  ngmAnimationFeatures,
  ngmAllFeatures,
  type NgmFeatureBundle,
  type NgmLazyFeatureBundle,
} from './lib/core/lazy-features';

// ── Drag controls ──
export { DragControls, useDragControls } from './lib/gestures/drag/use-drag-controls';

// ── Utility hooks ──
export { useReducedMotion } from './lib/values/use-reduced-motion';
export { useWillChange } from './lib/values/use-will-change';
export { useCycle } from './lib/values/use-cycle';

// ── View detection ──
export { useInView, type UseInViewOptions } from './lib/values/use-in-view';

// ── Presence hooks ──
export { useIsPresent, usePresence } from './lib/presence/use-presence';
export {
  usePresenceList,
  type PresenceListState,
  type UsePresenceListOptions,
} from './lib/presence/use-presence-list';

// ── Utils ──
export { onCleanup } from './lib/utils/injection-context';
export { resolveInput } from './lib/utils/coerce';
