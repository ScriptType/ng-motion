/**
 * VisualElement adapter — bridges Angular directive lifecycle to motion-dom's
 * HTMLVisualElement. This is the core of Phase 1.
 */

import {
  HTMLVisualElement,
  buildHTMLStyles,
  isAnimationControls,
  isControllingVariants,
  isVariantNode,
  renderHTML,
  resolveMotionValue,
  resolveVariantFromProps,
  scrapeHTMLMotionValuesFromProps,
  type AnyResolvedKeyframe,
  type DOMVisualElementOptions,
  type HTMLRenderState,
  type MotionNodeOptions,
  type PresenceContextProps,
  type ResolvedValues,
  type VisualElement,
  type VisualElementOptions,
  type VisualState,
} from 'motion-dom';

import { initNgmFeatures } from './feature-init';

/** Creates a fresh HTML render state object. */
export function createHtmlRenderState(): HTMLRenderState {
  return { style: {}, transform: {}, transformOrigin: {}, vars: {} };
}

/** Extracts resolved keyframe values from an object, handling arrays. */
function collectValues(
  source: Record<string, unknown>,
  dest: ResolvedValues,
  takeLastKeyframe: boolean,
): void {
  for (const [key, rawValue] of Object.entries(source)) {
    if (rawValue === null || rawValue === undefined) continue;

    if (Array.isArray(rawValue)) {
      const index = takeLastKeyframe ? rawValue.length - 1 : 0;
      const val: unknown = rawValue[index];
      if (val !== null && val !== undefined) {
        dest[key] = val as AnyResolvedKeyframe; // eslint-disable-line @typescript-eslint/consistent-type-assertions -- motion-dom interop
      }
    } else {
      dest[key] = rawValue as AnyResolvedKeyframe; // eslint-disable-line @typescript-eslint/consistent-type-assertions -- motion-dom interop
    }
  }
}

/** Resolves initial latestValues from props and variants. */
export function makeLatestValues(props: MotionNodeOptions): ResolvedValues {
  const values: ResolvedValues = {};

  // Scrape motion values from style prop
  const motionValues = scrapeHTMLMotionValuesFromProps(props, {});
  for (const key in motionValues) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- motion-dom returns any from scrapeMotionValues
    values[key] = resolveMotionValue(motionValues[key]);
  }

  const { initial, animate } = props;

  // Determine whether initial animation is blocked
  const isInitialBlocked = initial === false;
  const variantToSet = isInitialBlocked ? animate : initial;

  if (
    variantToSet !== undefined &&
    variantToSet !== true &&
    variantToSet !== false &&
    !isAnimationControls(variantToSet)
  ) {
    const list = Array.isArray(variantToSet) ? variantToSet : [variantToSet];

    for (const item of list) {
      const resolved = resolveVariantFromProps(props, item);
      if (resolved !== undefined) {
        const { transitionEnd, transition: _transition, ...target } = resolved;
        collectValues(target, values, isInitialBlocked);

        if (transitionEnd !== undefined) {
          for (const key in transitionEnd) {
            values[key] = transitionEnd[key];
          }
        }
      }
    }
  }

  return values;
}

/** Creates an HTMLVisualState (latestValues + renderState) from props. */
export function createHtmlVisualState(
  props: MotionNodeOptions,
): VisualState<HTMLElement, HTMLRenderState> {
  return {
    latestValues: makeLatestValues(props),
    renderState: createHtmlRenderState(),
  };
}

/** Applies the resolved initial/latest styles directly to a DOM element before mount. */
export function prerenderVisualElementStyles(
  element: HTMLElement,
  props: MotionNodeOptions,
): void {
  const latestValues = makeLatestValues(props);
  if (Object.keys(latestValues).length === 0) return;

  const renderState = createHtmlRenderState();
  buildHTMLStyles(renderState, latestValues, props.transformTemplate);
  renderHTML(element, renderState);
}

export interface CreateVisualElementOptions {
  props: MotionNodeOptions;
  parent?: VisualElement;
  blockInitialAnimation?: boolean;
  presenceContext?: PresenceContextProps | null;
  allowProjection?: boolean;
}

/** Factory that creates an HTMLVisualElement with proper initialization. */
export function createVisualElement(
  options: CreateVisualElementOptions,
): HTMLVisualElement {
  initNgmFeatures();

  const visualState = createHtmlVisualState(options.props);

  const veOptions: VisualElementOptions<HTMLElement, HTMLRenderState> = {
    visualState,
    parent: options.parent,
    presenceContext: options.presenceContext ?? null,
    props: options.props,
    blockInitialAnimation: options.blockInitialAnimation ?? false,
    reducedMotionConfig: 'user',
  };

  const domOptions: DOMVisualElementOptions = {
    allowProjection: options.allowProjection ?? false,
    enableHardwareAcceleration: true,
  };

  return new HTMLVisualElement(veOptions, domOptions);
}

/** Mounts a VisualElement to a DOM element and triggers initial animation. */
export function mountVisualElement(ve: HTMLVisualElement, element: HTMLElement): void {
  ve.mount(element);

  // Force synchronous render of initial values to prevent FOUC.
  // ve.mount() configures the VE but defers DOM rendering to the next
  // animation frame via frame.render(). For dynamically created elements
  // (e.g. inside *ngmPresence), this causes a 1-frame flash at the final
  // position before initial styles (opacity: 0, etc.) are applied.
  // Calling render() flushes latestValues to the DOM element immediately.
   
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- accessing internal render() method not on public VE interface
  (ve as unknown as { render: () => void }).render();

  ve.updateFeatures();
  void ve.animationState?.animateChanges();
}

/** Updates VisualElement props and re-triggers animation. */
export function updateVisualElement(
  ve: HTMLVisualElement,
  props: MotionNodeOptions,
  presenceContext?: PresenceContextProps | null,
): void {
  ve.update(props, presenceContext ?? null);
  ve.updateFeatures();
  void ve.animationState?.animateChanges();
}

/** Updates VE props and features without triggering animation.
 *  Used by orchestration to separate prop update from animation trigger. */
export function updateVisualElementProps(
  ve: HTMLVisualElement,
  props: MotionNodeOptions,
  presenceContext?: PresenceContextProps | null,
): void {
  ve.update(props, presenceContext ?? null);
  ve.updateFeatures();
}

/** Triggers animation on a VE. Returns promise that resolves when animations complete. */
export function triggerVisualElementAnimation(ve: HTMLVisualElement): Promise<void> {
   
  return ve.animationState?.animateChanges() ?? Promise.resolve();
}

/** Unmounts and cleans up a VisualElement. */
export function unmountVisualElement(ve: HTMLVisualElement): void {
  ve.unmount();
}

export { isControllingVariants, isVariantNode };
