/**
 * Deferred feature loading for ng-motion — Angular equivalent of framer-motion's LazyMotion.
 *
 * Provides provideMotionFeatures() to selectively register feature bundles,
 * and pre-built bundles for common configurations.
 */

import { provideAppInitializer, type EnvironmentProviders } from '@angular/core';
import {
  HTMLProjectionNode,
  setFeatureDefinitions,
  getFeatureDefinitions,
  type MotionNodeOptions,
} from 'motion-dom';
import { AnimationFeature, type FeatureDefinitions } from './feature-init';
import { HoverFeature } from '../gestures/hover';
import { PressFeature } from '../gestures/press';
import { FocusFeature } from '../gestures/focus';
import { InViewFeature } from '../gestures/in-view';
import { PanGesture } from '../gestures/drag/pan-gesture';
import { DragGesture } from '../gestures/drag/drag-gesture';
import { ExitAnimationFeature } from '../presence/exit-animation';

export type NgmFeatureBundle = Partial<FeatureDefinitions>;
export type NgmLazyFeatureBundle = () => Promise<NgmFeatureBundle>;

/**
 * Provide motion features via Angular DI. Accepts a sync bundle or an async loader.
 *
 * Sync:  `provideMotionFeatures(ngmAnimationFeatures)`
 * Async: `provideMotionFeatures(() => import('./my-features').then(m => m.features))`
 */
export function provideMotionFeatures(features: NgmFeatureBundle | NgmLazyFeatureBundle): EnvironmentProviders {
  if (typeof features === 'function') {
    return provideAppInitializer(async (): Promise<void> => {
      const bundle = await (features)();
      setFeatureDefinitions({ ...getFeatureDefinitions(), ...bundle });
    });
  }

  return provideAppInitializer((): void => {
    setFeatureDefinitions({ ...getFeatureDefinitions(), ...features });
  });
}

const animationDef = {
  Feature: AnimationFeature,
  isEnabled: (props: MotionNodeOptions) =>
    props.animate !== undefined ||
    props.variants !== undefined ||
    props.whileHover !== undefined ||
    props.whileTap !== undefined ||
    props.whileDrag !== undefined ||
    props.whileFocus !== undefined ||
    props.whileInView !== undefined,
};

const hoverDef = {
  Feature: HoverFeature,
  isEnabled: (props: MotionNodeOptions) =>
    props.whileHover !== undefined ||
    props.onHoverStart !== undefined ||
    props.onHoverEnd !== undefined,
};

const tapDef = {
  Feature: PressFeature,
  isEnabled: (props: MotionNodeOptions) =>
    props.whileTap !== undefined ||
    props.onTap !== undefined ||
    props.onTapStart !== undefined ||
    props.onTapCancel !== undefined,
};

const focusDef = {
  Feature: FocusFeature,
  isEnabled: (props: MotionNodeOptions) => props.whileFocus !== undefined,
};

const inViewDef = {
  Feature: InViewFeature,
  isEnabled: (props: MotionNodeOptions) => props.whileInView !== undefined,
};

const panDef = {
  Feature: PanGesture,
  isEnabled: (props: MotionNodeOptions) => {
    const p = props as Record<string, unknown>; // eslint-disable-line @typescript-eslint/consistent-type-assertions -- motion-dom interop
    return p['onPan'] !== undefined || p['onPanStart'] !== undefined || p['onPanEnd'] !== undefined;
  },
};

const dragDef = {
  Feature: DragGesture,
  isEnabled: (props: MotionNodeOptions) => {
    const p = props as Record<string, unknown>; // eslint-disable-line @typescript-eslint/consistent-type-assertions -- motion-dom interop
    return p['drag'] !== undefined && p['drag'] !== false;
  },
};

const exitDef = {
  Feature: ExitAnimationFeature,
  isEnabled: (props: MotionNodeOptions) => props.exit !== undefined,
};

const layoutDef = {
  ProjectionNode: HTMLProjectionNode,
  isEnabled: (props: MotionNodeOptions) => {
    const p = props as Record<string, unknown>; // eslint-disable-line @typescript-eslint/consistent-type-assertions -- motion-dom interop
    return p['layout'] !== undefined || p['layoutId'] !== undefined;
  },
};

/** Animation features: animation engine + all gestures + exit. */
// eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- FeatureDefinition.Feature type is overly restrictive
export const ngmAnimationFeatures = {
  animation: animationDef,
  hover: hoverDef,
  tap: tapDef,
  focus: focusDef,
  inView: inViewDef,
  pan: panDef,
  exit: exitDef,
} as NgmFeatureBundle;

/** All features: animation + gestures + drag + layout projection. */
// eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- FeatureDefinition.Feature type is overly restrictive
export const ngmAllFeatures = {
  ...ngmAnimationFeatures,
  drag: dragDef,
  layout: layoutDef,
} as NgmFeatureBundle;
