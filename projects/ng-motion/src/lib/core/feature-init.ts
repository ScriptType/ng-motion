/**
 * Feature initialization for ng-motion.
 *
 * Ports AnimationFeature from framer-motion and provides
 * idempotent feature registration via setFeatureDefinitions.
 */

import {
  createAnimationState,
  Feature,
  HTMLProjectionNode,
  isAnimationControls,
  getFeatureDefinitions,
  setFeatureDefinitions,
} from 'motion-dom';
import { HoverFeature } from '../gestures/hover';
import { PressFeature } from '../gestures/press';
import { FocusFeature } from '../gestures/focus';
import { InViewFeature } from '../gestures/in-view';
import { PanGesture } from '../gestures/drag/pan-gesture';
import { DragGesture } from '../gestures/drag/drag-gesture';
import { ExitAnimationFeature } from '../presence/exit-animation';

export type FeatureDefinitions = ReturnType<typeof getFeatureDefinitions>;

/**
 * AnimationFeature — creates and manages AnimationState on a VisualElement.
 * Ported from framer-motion's animation feature (~20 lines).
 */
export class AnimationFeature extends Feature {
  private unmountControls?: () => void;

  constructor(node: AnimationFeature['node']) {
    super(node);
    node.animationState ??= createAnimationState(node);
  }

  private updateAnimationControlsSubscription(): void {
    const { animate } = this.node.getProps();
    if (isAnimationControls(animate)) {
      this.unmountControls = animate.subscribe(this.node);
    }
  }

  override mount(): void {
    this.updateAnimationControlsSubscription();
  }

  override update(): void {
    const { animate } = this.node.getProps();
    const { animate: prevAnimate } = this.node.prevProps ?? {};
    if (animate !== prevAnimate) {
      this.updateAnimationControlsSubscription();
    }
  }

  override unmount(): void {
    this.node.animationState?.reset();
    this.unmountControls?.();
  }
}

let initialized = false;

/** Register core animation features with motion-dom. Idempotent. */
export function initNgmFeatures(): void {
  if (initialized) return;
  initialized = true;

  setFeatureDefinitions({
    animation: {
      // @ts-expect-error Feature<any> constructor takes VisualElement, not unknown — motion-dom FeatureClass type is overly broad
      Feature: AnimationFeature,
      isEnabled: (props) =>
        props.animate !== undefined ||
        props.variants !== undefined ||
        props.whileHover !== undefined ||
        props.whileTap !== undefined ||
        props.whileDrag !== undefined ||
        props.whileFocus !== undefined ||
        props.whileInView !== undefined,
    },
    hover: {
      // @ts-expect-error Feature<any> constructor takes VisualElement, not unknown — motion-dom FeatureClass type is overly broad
      Feature: HoverFeature,
      isEnabled: (props) =>
        props.whileHover !== undefined ||
        props.onHoverStart !== undefined ||
        props.onHoverEnd !== undefined,
    },
    tap: {
      // @ts-expect-error Feature<any> constructor takes VisualElement, not unknown — motion-dom FeatureClass type is overly broad
      Feature: PressFeature,
      isEnabled: (props) =>
        props.whileTap !== undefined ||
        props.onTap !== undefined ||
        props.onTapStart !== undefined ||
        props.onTapCancel !== undefined,
    },
    focus: {
      // @ts-expect-error Feature<any> constructor takes VisualElement, not unknown — motion-dom FeatureClass type is overly broad
      Feature: FocusFeature,
      isEnabled: (props) => props.whileFocus !== undefined,
    },
    inView: {
      // @ts-expect-error Feature<any> constructor takes VisualElement, not unknown — motion-dom FeatureClass type is overly broad
      Feature: InViewFeature,
      isEnabled: (props) => props.whileInView !== undefined,
    },
    pan: {
      // @ts-expect-error Feature<any> constructor takes VisualElement, not unknown — motion-dom FeatureClass type is overly broad
      Feature: PanGesture,
      isEnabled: (props) => {
        const p = props as Record<string, unknown>; // eslint-disable-line @typescript-eslint/consistent-type-assertions -- motion-dom interop
        return (
          p['onPan'] !== undefined || p['onPanStart'] !== undefined || p['onPanEnd'] !== undefined
        );
      },
    },
    drag: {
      // @ts-expect-error Feature<any> constructor takes VisualElement, not unknown — motion-dom FeatureClass type is overly broad
      Feature: DragGesture,
      isEnabled: (props) => {
        const p = props as Record<string, unknown>; // eslint-disable-line @typescript-eslint/consistent-type-assertions -- motion-dom interop
        return p['drag'] !== undefined && p['drag'] !== false;
      },
    },
    exit: {
      // @ts-expect-error Feature<any> constructor takes VisualElement, not unknown — motion-dom FeatureClass type is overly broad
      Feature: ExitAnimationFeature,
      isEnabled: (props) => props.exit !== undefined,
    },
    layout: {
      ProjectionNode: HTMLProjectionNode,
      isEnabled: (props) => {
        const p = props as Record<string, unknown>; // eslint-disable-line @typescript-eslint/consistent-type-assertions -- motion-dom interop
        return p['layout'] !== undefined || p['layoutId'] !== undefined;
      },
    },
  });
}

/** Merge additional feature definitions (for future gesture/layout features). */
export function loadNgmFeatures(features: FeatureDefinitions): void {
  setFeatureDefinitions({ ...getFeatureDefinitions(), ...features });
}

/** Exposed for testing: reset the initialization flag. */
export function _resetFeatureInit(): void {
  initialized = false;
}

export { getFeatureDefinitions };
