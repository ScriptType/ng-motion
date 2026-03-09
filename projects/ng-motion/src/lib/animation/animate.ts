/**
 * Top-level animate() function — ng-motion's equivalent of framer-motion's animate().
 *
 * Supports element animation, MotionValue animation, single value animation,
 * and sequence orchestration. Re-exports stagger from motion-dom.
 */

import type {
  AnimationPlaybackControlsWithThen,
  AnimationScope,
  DOMKeyframesDefinition,
  AnimationOptions as DynamicAnimationOptions,
  ElementOrSelector,
  MotionValue,
  UnresolvedValueKeyframe,
  ValueAnimationTransition,
} from 'motion-dom';
import {
  animateSingleValue,
  animateTarget,
  DOMVisualElement,
  GroupAnimationWithThen,
  isMotionValue,
  motionValue,
  resolveElements,
  spring,
  visualElementStore,
} from 'motion-dom';
import type { AnimationSequence, SequenceOptions } from './sequence-types';
import { createAnimationsFromSequence } from './sequence';

export { stagger } from 'motion-dom';
export type { AnimationSequence, SequenceOptions } from './sequence-types';

function isSequence(value: unknown): value is AnimationSequence {
  return Array.isArray(value) && value.some(Array.isArray);
}

function isDOMKeyframes(keyframes: unknown): boolean {
  return typeof keyframes === 'object' && keyframes !== null && !Array.isArray(keyframes);
}

function isSingleValue(subject: unknown, keyframes: unknown): boolean {
  return (
    isMotionValue(subject) ||
    typeof subject === 'number' ||
    (typeof subject === 'string' && !isDOMKeyframes(keyframes))
  );
}

/** Ensure an element has a visual element in the store, creating one if needed. */
function ensureVisualElement(el: Element): void {
  if (!visualElementStore.has(el)) {
    // @ts-expect-error -- DOMVisualElement constructor expects internal config shape
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const ve = new DOMVisualElement({
      props: {},
      visualState: {
        renderState: { style: {}, transform: {}, transformOrigin: {} },
        latestValues: {},
      },
    });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    ve.mount(el);
  }
}

/** Get the visual element for an element, throwing if not found. */
function getVisualElement(el: Element): NonNullable<ReturnType<typeof visualElementStore.get>> {
  const ve = visualElementStore.get(el);
  if (ve === undefined) {
    throw new Error('VisualElement not found for element');
  }
  return ve;
}

/**
 * Animate a sequence of animations.
 */
export function animate(
  sequence: AnimationSequence,
  options?: SequenceOptions,
): AnimationPlaybackControlsWithThen;

/**
 * Animate a string MotionValue.
 */
export function animate(
  value: string | MotionValue<string>,
  keyframes: string | UnresolvedValueKeyframe<string>[],
  options?: ValueAnimationTransition<string>,
): AnimationPlaybackControlsWithThen;

/**
 * Animate a number MotionValue.
 */
export function animate(
  value: number | MotionValue<number>,
  keyframes: number | UnresolvedValueKeyframe<number>[],
  options?: ValueAnimationTransition<number>,
): AnimationPlaybackControlsWithThen;

/**
 * Animate a DOM element.
 */
export function animate(
  element: ElementOrSelector,
  keyframes: DOMKeyframesDefinition,
  options?: DynamicAnimationOptions,
): AnimationPlaybackControlsWithThen;

/**
 * Implementation.
 */

export function animate(
  subjectOrSequence: unknown,
  optionsOrKeyframes?: unknown,
  options?: unknown,
): AnimationPlaybackControlsWithThen {
  let animations: AnimationPlaybackControlsWithThen[] = [];

  if (isSequence(subjectOrSequence)) {
    animations = animateSequence(
      subjectOrSequence,
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      optionsOrKeyframes as SequenceOptions | undefined,
    );
  } else if (isSingleValue(subjectOrSequence, optionsOrKeyframes)) {
    animations.push(
      animateSingleValue(
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        subjectOrSequence as MotionValue<number> | number,
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        optionsOrKeyframes as number,
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        options as ValueAnimationTransition<number> | undefined,
      ),
    );
  } else {
    // DOM element animation
    const subject = subjectOrSequence;
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const keyframes = optionsOrKeyframes as DOMKeyframesDefinition;
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const opts = (options ?? {}) as DynamicAnimationOptions;

    let subjects: Element[];
    if (typeof subject === 'string') {
      subjects = resolveElements(subject);
    } else if (subject instanceof NodeList) {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      subjects = Array.from(subject as NodeListOf<Element>);
    } else if (Array.isArray(subject)) {
      subjects = subject.filter((s): s is Element => s != null);
    } else if (subject instanceof Element) {
      subjects = [subject];
    } else {
      subjects = [];
    }

    const numSubjects = subjects.length;
    for (let i = 0; i < numSubjects; i++) {
      const el = subjects[i];

      ensureVisualElement(el);

      const ve = getVisualElement(el);
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      const transition = { ...opts } as Record<string, unknown>;

      if ('delay' in transition && typeof transition['delay'] === 'function') {
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        transition['delay'] = (transition['delay'] as (i: number, total: number) => number)(
          i,
          numSubjects,
        );
      }

      animations.push(
        ...animateTarget(
          ve,
          // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
          { ...(keyframes as Record<string, unknown>), transition } as never,
          {},
        ),
      );
    }
  }

  return new GroupAnimationWithThen(animations);
}

function animateSequence(
  sequence: AnimationSequence,
  options?: SequenceOptions,
  scope?: AnimationScope,
): AnimationPlaybackControlsWithThen[] {
  const animations: AnimationPlaybackControlsWithThen[] = [];

  // Pre-process function segments into MotionValue segments
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const processedSequence = sequence.map((segment) => {
    if (Array.isArray(segment) && typeof segment[0] === 'function') {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      const callback = segment[0] as (value: unknown) => void;
      const mv = motionValue(0);
      mv.on('change', callback);

      const len = segment.length;
      if (len <= 1) {
        return [mv, [0, 1]];
      } else if (len === 2) {
        return [mv, [0, 1], segment[1]];
      }
      return [mv, segment[1], segment[2]];
    }
    return segment;
  }) as AnimationSequence;

  const animationDefinitions = createAnimationsFromSequence(
    processedSequence,
    options,
    scope,
    { spring },
  );

  animationDefinitions.forEach(({ keyframes, transition }, subject) => {
    for (const key in keyframes) {
      const kf = keyframes[key];
      const tr = transition[key];

      if (isMotionValue(subject)) {
        animations.push(
          animateSingleValue(
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            subject as MotionValue<number>,
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            kf as number[],
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            tr as ValueAnimationTransition<number>,
          ),
        );
      } else {
        const el = subject;
        ensureVisualElement(el);

        const ve = getVisualElement(el);
        animations.push(
          ...animateTarget(
            ve,
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            { [key]: kf, transition: tr } as never,
            {},
          ),
        );
      }
    }
  });

  return animations;
}
