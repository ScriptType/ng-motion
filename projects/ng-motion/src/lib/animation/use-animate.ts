import { DestroyRef, inject } from '@angular/core';
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
  resolveElements,
  visualElementStore,
} from 'motion-dom';
import { removeItem } from 'motion-utils';
import { MOTION_CONFIG } from '../core/motion-config';

/** The scoped animate function returned by useAnimate. */
export interface ScopedAnimate {
  (
    value: string | MotionValue<string>,
    keyframes: string | UnresolvedValueKeyframe<string>[],
    options?: ValueAnimationTransition<string>,
  ): AnimationPlaybackControlsWithThen;
  (
    value: number | MotionValue<number>,
    keyframes: number | UnresolvedValueKeyframe<number>[],
    options?: ValueAnimationTransition<number>,
  ): AnimationPlaybackControlsWithThen;
  (
    element: ElementOrSelector,
    keyframes: DOMKeyframesDefinition,
    options?: DynamicAnimationOptions,
  ): AnimationPlaybackControlsWithThen;
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
 * Creates a scoped animation function with auto-cleanup.
 *
 * Must be called within an Angular injection context. Returns `[scope, animate]` tuple.
 * The `scope` ref should be assigned to the container element. All animations are
 * automatically stopped when the injection context is destroyed.
 */
export function useAnimate<T extends Element = Element>(): [AnimationScope<T>, ScopedAnimate] {
  const destroyRef = inject(DestroyRef);
  const _config = inject(MOTION_CONFIG, { optional: true });

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const scope = { current: null, animations: [] } as unknown as AnimationScope<T>;

  function scopedAnimate(
    subject: ElementOrSelector | MotionValue<string> | MotionValue<number> | number | string,
    keyframes: DOMKeyframesDefinition | string | number | UnresolvedValueKeyframe<string | number>[],
    options?: DynamicAnimationOptions | ValueAnimationTransition<string | number>,
  ): AnimationPlaybackControlsWithThen {
    const animations: AnimationPlaybackControlsWithThen[] = [];

    if (isSingleValue(subject, keyframes)) {
      animations.push(
        animateSingleValue(
          // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
          subject as MotionValue<number> | number,
          // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
          keyframes as number,
          // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
          options as ValueAnimationTransition<number> | undefined,
        ),
      );
    } else {
      // Resolve elements (string selector or Element)
      let subjects: Element[];
      if (typeof subject === 'string') {
        subjects = resolveElements(subject, scope);
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
        const transition = { ...options } as Record<string, unknown>;

        // Resolve stagger delay
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

    const animation = new GroupAnimationWithThen(animations);

    // Prune completed animations to prevent unbounded growth
    scope.animations = scope.animations.filter(
      (a: AnimationPlaybackControlsWithThen) => a.state !== 'finished',
    );
    scope.animations.push(animation);
    animation.finished
      .then(() => {
        removeItem(scope.animations, animation);
      })
      .catch(() => {
        // Animation was cancelled/stopped — just remove from tracking
        removeItem(scope.animations, animation);
      });

    return animation;
  }

  destroyRef.onDestroy(() => {
    scope.animations.forEach((a: AnimationPlaybackControlsWithThen) => { a.stop(); });
    scope.animations.length = 0;
  });

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return [scope, scopedAnimate as ScopedAnimate];
}
