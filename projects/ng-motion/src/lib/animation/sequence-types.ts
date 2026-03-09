import type {
  AnimationPlaybackOptions,
  DOMKeyframesDefinition,
  AnimationOptions as DynamicAnimationOptions,
  ElementOrSelector,
  MotionValue,
  Transition,
  UnresolvedValueKeyframe,
  AnyResolvedKeyframe,
} from 'motion-dom';
import type { Easing } from 'motion-utils';

export type ObjectTarget<O> = {
  [K in keyof O]?: O[K] | UnresolvedValueKeyframe[];
};

export type SequenceTime = number | string;

export type SequenceLabel = string;

export interface SequenceLabelWithTime {
  name: SequenceLabel;
  at: SequenceTime;
}

export interface At {
  at?: SequenceTime;
}

export type MotionValueSegment = [MotionValue, UnresolvedValueKeyframe | UnresolvedValueKeyframe[]];

export type MotionValueSegmentWithTransition = [
  MotionValue,
  UnresolvedValueKeyframe | UnresolvedValueKeyframe[],
  Transition & At,
];

export type DOMSegment = [ElementOrSelector, DOMKeyframesDefinition];

export type DOMSegmentWithTransition = [
  ElementOrSelector,
  DOMKeyframesDefinition,
  DynamicAnimationOptions & At,
];

export type ObjectSegment<O extends object = object> = [O, ObjectTarget<O>];

export type ObjectSegmentWithTransition<O extends object = object> = [
  O,
  ObjectTarget<O>,
  DynamicAnimationOptions & At,
];

export type Segment =
  | ObjectSegment
  | ObjectSegmentWithTransition
  | SequenceLabel
  | SequenceLabelWithTime
  | MotionValueSegment
  | MotionValueSegmentWithTransition
  | DOMSegment
  | DOMSegmentWithTransition;

export type AnimationSequence = Segment[];

export interface SequenceOptions extends AnimationPlaybackOptions {
  delay?: number;
  duration?: number;
  defaultTransition?: Transition;
  reduceMotion?: boolean;
}

export interface AbsoluteKeyframe {
  value: AnyResolvedKeyframe | null;
  at: number;
  easing?: Easing;
}

export type ValueSequence = AbsoluteKeyframe[];

export type SequenceMap = Record<string, ValueSequence>;

export interface ResolvedAnimationDefinition {
  keyframes: Record<string, UnresolvedValueKeyframe[]>;
  transition: Record<string, Transition>;
}

export type ResolvedAnimationDefinitions = Map<Element | MotionValue, ResolvedAnimationDefinition>;
