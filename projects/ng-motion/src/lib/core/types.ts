/**
 * Core type definitions for ng-motion.
 *
 * Re-exports common motion-dom types for ergonomic imports,
 * plus Angular-specific types for the directive layer.
 */

// ── Re-exports from motion-dom ──

export type {
  AnimationDefinition,
  AnimationPlaybackControls,
  AnimationState,
  InertiaOptions,
  KeyframeOptions,
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
} from 'motion-dom';

export { MotionValue } from 'motion-dom';

// ── Angular-specific types ──

import type { ReducedMotionConfig, Transition } from 'motion-dom';

/** Global motion configuration provided via DI. */
export interface MotionConfig {
  transition?: Transition;
  reducedMotion?: ReducedMotionConfig;
}
