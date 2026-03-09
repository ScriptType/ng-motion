import type { AnimationPlaybackControls } from 'motion-dom';
import { noop } from 'motion-utils';
import { attachToAnimation } from './attach-animation';
import { attachToFunction } from './attach-function';
import type { OnScroll, ScrollOptions } from './types';

export function scroll(
  onScroll: OnScroll | AnimationPlaybackControls,
  {
    axis = 'y',
    container: rawContainer,
    ...options
  }: ScrollOptions = {},
): VoidFunction {
  const container = rawContainer ?? document.scrollingElement;
  if (container === null) return noop as VoidFunction; // eslint-disable-line @typescript-eslint/consistent-type-assertions -- motion-utils noop

  const optionsWithDefaults = { axis, container, ...options };

  return typeof onScroll === 'function'
    ? attachToFunction(onScroll, optionsWithDefaults)
    : attachToAnimation(onScroll, optionsWithDefaults);
}
