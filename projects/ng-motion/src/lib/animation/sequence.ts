/**
 * Animation sequence engine — ported from framer-motion's animation/sequence/create.ts.
 *
 * Resolves a declarative AnimationSequence into concrete keyframes and transitions
 * for each element/value combination, handling relative timing, labels, springs,
 * stagger, and repeat.
 */

import type {
  AnimationScope,
  DOMKeyframesDefinition,
  AnimationOptions as DynamicAnimationOptions,
  GeneratorFactory,
  MotionValue,
  Transition,
  UnresolvedValueKeyframe,
  AnyResolvedKeyframe,
} from 'motion-dom';
import {
  createGeneratorEasing,
  defaultOffset,
  fillOffset,
  isGenerator,
  isMotionValue,
  mixNumber,
  resolveElements,
} from 'motion-dom';
import {
  Easing,
  getEasingForSegment,
  invariant,
  progress,
  removeItem,
  secondsToMilliseconds,
} from 'motion-utils';
import type {
  AnimationSequence,
  At,
  ResolvedAnimationDefinitions,
  SequenceMap,
  SequenceOptions,
  SequenceTime,
  ValueSequence,
} from './sequence-types';

// ── Utility functions (ported from framer-motion/src/animation/sequence/utils/) ──

function calcNextTime(
  current: number,
  next: SequenceTime,
  prev: number,
  labels: Map<string, number>,
): number {
  if (typeof next === 'number') return next;
  if (next.startsWith('-') || next.startsWith('+')) return Math.max(0, current + parseFloat(next));
  if (next === '<') return prev;
  if (next.startsWith('<')) return Math.max(0, prev + parseFloat(next.slice(1)));
  return labels.get(next) ?? current;
}

function calculateRepeatDuration(duration: number, repeat: number, _repeatDelay: number): number {
  return duration * (repeat + 1);
}

function normalizeTimes(times: number[], repeat: number): void {
  for (let i = 0; i < times.length; i++) {
    times[i] = times[i] / (repeat + 1);
  }
}

function compareByTime(
  a: { at: number; value: AnyResolvedKeyframe | null },
  b: { at: number; value: AnyResolvedKeyframe | null },
): number {
  if (a.at === b.at) {
    if (a.value === null) return 1;
    if (b.value === null) return -1;
    return 0;
  }
  return a.at - b.at;
}

function eraseKeyframes(sequence: ValueSequence, startTime: number, endTime: number): void {
  for (let i = 0; i < sequence.length; i++) {
    const keyframe = sequence[i];
    if (keyframe.at > startTime && keyframe.at < endTime) {
      removeItem(sequence, keyframe);
      i--;
    }
  }
}

function addKeyframes(
  sequence: ValueSequence,
  keyframes: UnresolvedValueKeyframe[],
  easing: Easing | Easing[],
  offset: number[],
  startTime: number,
  endTime: number,
): void {
  eraseKeyframes(sequence, startTime, endTime);
  for (let i = 0; i < keyframes.length; i++) {
    sequence.push({
      value: keyframes[i],
      at: mixNumber(startTime, endTime, offset[i]),
      easing: getEasingForSegment(easing, i),
    });
  }
}

function keyframesAsList(
  keyframes: UnresolvedValueKeyframe | UnresolvedValueKeyframe[],
): UnresolvedValueKeyframe[] {
  return Array.isArray(keyframes) ? keyframes : [keyframes];
}

function getValueTransition(
  transition: DynamicAnimationOptions & At,
  key: string,
): DynamicAnimationOptions {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const rec = transition as unknown as Record<string, unknown>;
  return rec[key] !== undefined && rec[key] !== null
    ? {
        ...transition,
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        ...(rec[key] as Transition),
      }
    : { ...transition };
}

const isNumber = (keyframe: unknown): keyframe is number => typeof keyframe === 'number';
const isNumberKeyframesArray = (keyframes: UnresolvedValueKeyframe[]): keyframes is number[] =>
  keyframes.every(isNumber);

function isDOMKeyframes(keyframes: unknown): boolean {
  return typeof keyframes === 'object' && keyframes !== null && !Array.isArray(keyframes);
}

function resolveSubjects<O extends object>(
  subject: string | Element | Element[] | NodeListOf<Element> | O | O[] | null | undefined,
  keyframes: DOMKeyframesDefinition,
  scope?: AnimationScope,
  selectorCache?: Record<string, Element[]>,
): Element[] {
  if (subject == null) return [];
  if (typeof subject === 'string' && isDOMKeyframes(keyframes)) {
    // @ts-expect-error -- SelectorCache type mismatch (NodeListOf vs Element[])
    return resolveElements(subject, scope, selectorCache);
  } else if (subject instanceof NodeList) {
    return Array.from(subject);
  } else if (Array.isArray(subject)) {
    return subject.filter((s): s is Element => s instanceof Element);
  }
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return [subject] as unknown as Element[];
}

// ── Main sequence builder ──

const defaultSegmentEasing = 'easeInOut';
const MAX_REPEAT = 20;

export function createAnimationsFromSequence(
  sequence: AnimationSequence,
  { defaultTransition = {}, ...sequenceTransition }: SequenceOptions = {},
  scope?: AnimationScope,
  generators?: Record<string, GeneratorFactory>,
): ResolvedAnimationDefinitions {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const dtRec = defaultTransition as unknown as Record<string, unknown>;
  const defaultDuration = (typeof dtRec['duration'] === 'number' ? dtRec['duration'] : null) ?? 0.3;
  const animationDefinitions: ResolvedAnimationDefinitions = new Map();
  const sequences = new Map<Element | MotionValue, SequenceMap>();
  const elementCache = {};
  const timeLabels = new Map<string, number>();

  let prevTime = 0;
  let currentTime = 0;
  let totalDuration = 0;

  for (const segment of sequence) {
    if (typeof segment === 'string') {
      timeLabels.set(segment, currentTime);
      continue;
    } else if (!Array.isArray(segment)) {
      timeLabels.set(
        segment.name,
        calcNextTime(currentTime, segment.at, prevTime, timeLabels),
      );
      continue;
    }

    // eslint-disable-next-line prefer-const, @typescript-eslint/consistent-type-assertions
    let [subject, keyframes, transition] = segment as [
      unknown,
      unknown,
      DynamicAnimationOptions & At,
    ];

    // Segments with only [subject, keyframes] have no transition object.
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    transition ??= {} as DynamicAnimationOptions & At;

    if (transition.at !== undefined) {
      currentTime = calcNextTime(currentTime, transition.at, prevTime, timeLabels);
    }

    let maxDuration = 0;

    const resolveValueSequence = (
      valueKeyframes: UnresolvedValueKeyframe | UnresolvedValueKeyframe[],
      valueTransition: Transition | DynamicAnimationOptions,
      valueSequence: ValueSequence,
      elementIndex = 0,
      numSubjects = 0,
    ): void => {
      const valueKeyframesAsList = keyframesAsList(valueKeyframes);
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      const vt = valueTransition as unknown as Record<string, unknown>;
      const {
        delay = 0,
        times = defaultOffset(valueKeyframesAsList),
        type = (typeof dtRec['type'] === 'string' ? dtRec['type'] : null) ?? 'keyframes',
        repeat,
        repeatDelay = 0,
        ...remainingTransition
      } = vt;
      let { ease = (typeof dtRec['ease'] === 'string' ? dtRec['ease'] : null) ?? 'easeOut', duration } =
        vt;

      const calculatedDelay =
        typeof delay === 'function'
          // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
          ? (delay as (i: number, total: number) => number)(elementIndex, numSubjects)
          // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
          : (delay as number);

      const numKeyframes = valueKeyframesAsList.length;
      const typeKey = typeof type === 'string' && type.length > 0 ? type : 'keyframes';
      // @ts-expect-error -- isGenerator expects AnimationGeneratorType but we pass string from transition
      const createGenerator = isGenerator(type)
        ? (type)
        : generators?.[typeKey];

      if (numKeyframes <= 2 && createGenerator) {
        let absoluteDelta = 100;
        if (numKeyframes === 2 && isNumberKeyframesArray(valueKeyframesAsList)) {
          absoluteDelta = Math.abs(valueKeyframesAsList[1] - valueKeyframesAsList[0]);
        }

        const springTransition: Record<string, unknown> = {
          // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
          ...(defaultTransition as unknown as Record<string, unknown>),
          ...remainingTransition,
        };
        if (duration !== undefined) {
          // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
          springTransition['duration'] = secondsToMilliseconds(duration as number);
        }

        const springEasing = createGeneratorEasing(
          // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
          springTransition as Parameters<typeof createGeneratorEasing>[0],
          absoluteDelta,
          createGenerator,
        );

        ease = springEasing.ease;
        duration = springEasing.duration;
      }

      duration ??= defaultDuration;

      const startTime = currentTime + calculatedDelay;

      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      const timesArr = times as number[];
      if (timesArr.length === 1 && timesArr[0] === 0) {
        timesArr[1] = 1;
      }

      const remainder = timesArr.length - valueKeyframesAsList.length;
      if (remainder > 0) fillOffset(timesArr, remainder);

      if (valueKeyframesAsList.length === 1) {
        valueKeyframesAsList.unshift(null);
      }

      if (typeof repeat === 'number' && repeat > 0) {
        invariant(
          repeat < MAX_REPEAT,
          'Repeat count too high, must be less than 20',
        );

        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        duration = calculateRepeatDuration(duration as number, repeat, repeatDelay as number);

        const originalKeyframes = [...valueKeyframesAsList];
        const originalTimes = [...timesArr];
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-unsafe-assignment
        ease = Array.isArray(ease) ? [...ease] : [ease as Easing];
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        const originalEase = [...(ease as Easing[])];

        for (let repeatIndex = 0; repeatIndex < repeat; repeatIndex++) {
          valueKeyframesAsList.push(...originalKeyframes);
          for (let ki = 0; ki < originalKeyframes.length; ki++) {
            timesArr.push(originalTimes[ki] + (repeatIndex + 1));
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            (ease as Easing[]).push(
              ki === 0 ? 'linear' : getEasingForSegment(originalEase, ki - 1),
            );
          }
        }

        normalizeTimes(timesArr, repeat);
      }

      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      const targetTime = startTime + (duration as number);

      addKeyframes(
        valueSequence,
        valueKeyframesAsList,
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        ease as Easing | Easing[],
        timesArr,
        startTime,
        targetTime,
      );

      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      maxDuration = Math.max(calculatedDelay + (duration as number), maxDuration);
      totalDuration = Math.max(targetTime, totalDuration);
    };

    if (isMotionValue(subject)) {
      const subjectSequence = getSubjectSequence(subject, sequences);
      resolveValueSequence(
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        keyframes as AnyResolvedKeyframe,
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        transition as Transition,
        getValueSequence('default', subjectSequence),
      );
    } else {
      const subjects = resolveSubjects(
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        subject as Element,
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        keyframes as DOMKeyframesDefinition,
        scope,
        elementCache,
      );

      const numSubjects = subjects.length;

      for (let subjectIndex = 0; subjectIndex < numSubjects; subjectIndex++) {
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        const kf = keyframes as DOMKeyframesDefinition;
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        const tr = transition as DynamicAnimationOptions;

        const thisSubject = subjects[subjectIndex];
        const subjectSequence = getSubjectSequence(thisSubject, sequences);

        for (const key in kf) {
          resolveValueSequence(
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            kf[key as keyof typeof kf] as UnresolvedValueKeyframe,
            getValueTransition(tr, key),
            getValueSequence(key, subjectSequence),
            subjectIndex,
            numSubjects,
          );
        }
      }
    }

    prevTime = currentTime;
    currentTime += maxDuration;
  }

  // Second pass: convert absolute times to relative offsets
  sequences.forEach((valueSequences, element) => {
    for (const key in valueSequences) {
      const valueSequence = valueSequences[key];
      valueSequence.sort(compareByTime);

      const kf: UnresolvedValueKeyframe[] = [];
      const valueOffset: number[] = [];
      const valueEasing: Easing[] = [];

      for (const frame of valueSequence) {
        const { at, value, easing } = frame;
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        kf.push(value as UnresolvedValueKeyframe);
        valueOffset.push(progress(0, totalDuration, at));
        valueEasing.push(easing ?? 'easeOut');
      }

      if (valueOffset[0] !== 0) {
        valueOffset.unshift(0);
        kf.unshift(kf[0]);
        valueEasing.unshift(defaultSegmentEasing);
      }

      if (valueOffset[valueOffset.length - 1] !== 1) {
        valueOffset.push(1);
        kf.push(null);
      }

      if (!animationDefinitions.has(element)) {
        animationDefinitions.set(element, { keyframes: {}, transition: {} });
      }

      const definition = animationDefinitions.get(element);
      if (definition === undefined) {
        throw new Error('Definition not found for element');
      }
      definition.keyframes[key] = kf;

      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      const { type: _type, ...remainingDefaultTransition } = defaultTransition as Transition & {
        type?: string;
      };
      definition.transition[key] = {
        ...remainingDefaultTransition,
        duration: totalDuration,
        ease: valueEasing,
        times: valueOffset,
        ...sequenceTransition,
      };
    }
  });

  return animationDefinitions;
}

function getSubjectSequence<O extends object>(
  subject: Element | MotionValue | O,
  sequences: Map<Element | MotionValue | O, SequenceMap>,
): SequenceMap {
  if (!sequences.has(subject)) sequences.set(subject, {});
  const result = sequences.get(subject);
  if (result === undefined) {
    throw new Error('Subject sequence not found');
  }
  return result;
}

function getValueSequence(name: string, sequences: SequenceMap): ValueSequence {
  sequences[name] ??= [];
  return sequences[name];
}
