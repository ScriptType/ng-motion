/**
 * SVG VisualElement adapter — bridges Angular directive lifecycle to motion-dom's
 * SVGVisualElement. Mirrors the HTML adapter for SVG elements.
 */

import {
  SVGVisualElement,
  isSVGElement as _isSVGElement,
  isSVGSVGElement as _isSVGSVGElement,
  scrapeSVGMotionValuesFromProps,
  isAnimationControls,
  resolveMotionValue,
  resolveVariantFromProps,
  type AnyResolvedKeyframe,
  type DOMVisualElementOptions,
  type MotionNodeOptions,
  type PresenceContextProps,
  type ResolvedValues,
  type SVGRenderState,
  type VisualElement,
  type VisualElementOptions,
  type VisualState,
} from 'motion-dom';

import { initNgmFeatures } from './feature-init';

/** Re-export motion-dom's SVG element detection. */
export const isSVGElement: (element: unknown) => element is SVGElement = _isSVGElement;

/** Re-export motion-dom's SVGSVGElement detection (root <svg> tag). */
export const isSVGSVGElement: (element: unknown) => element is SVGSVGElement = _isSVGSVGElement;

/** Creates a fresh SVG render state object. */
export function createSvgRenderState(): SVGRenderState {
  return { style: {}, transform: {}, transformOrigin: {}, vars: {}, attrs: {} };
}

/** Resolves initial latestValues from props for SVG elements. */
function makeSvgLatestValues(props: MotionNodeOptions): ResolvedValues {
  const values: ResolvedValues = {};

  const motionValues = scrapeSVGMotionValuesFromProps(props, {});
  for (const key in motionValues) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- motion-dom returns any from scrapeMotionValues
    values[key] = resolveMotionValue(motionValues[key]);
  }

  const { initial, animate } = props;
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
        for (const [key, rawValue] of Object.entries(target)) {
          if (Array.isArray(rawValue)) {
            const index = isInitialBlocked ? rawValue.length - 1 : 0;
            const val: unknown = rawValue[index];
            if (val !== null && val !== undefined) {
              values[key] = val as AnyResolvedKeyframe; // eslint-disable-line @typescript-eslint/consistent-type-assertions -- motion-dom interop
            }
          } else {
            values[key] = rawValue;  
          }
        }
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

/** Creates an SVG VisualState (latestValues + renderState) from props. */
export function createSvgVisualState(
  props: MotionNodeOptions,
): VisualState<SVGElement, SVGRenderState> {
  return {
    latestValues: makeSvgLatestValues(props),
    renderState: createSvgRenderState(),
  };
}

export interface CreateSvgVisualElementOptions {
  props: MotionNodeOptions;
  parent?: VisualElement;
  blockInitialAnimation?: boolean;
  presenceContext?: PresenceContextProps | null;
  allowProjection?: boolean;
}

/** Factory that creates an SVGVisualElement with proper initialization. */
export function createSvgVisualElement(
  options: CreateSvgVisualElementOptions,
): SVGVisualElement {
  initNgmFeatures();

  const visualState = createSvgVisualState(options.props);

  const veOptions: VisualElementOptions<SVGElement, SVGRenderState> = {
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

  return new SVGVisualElement(veOptions, domOptions);
}
