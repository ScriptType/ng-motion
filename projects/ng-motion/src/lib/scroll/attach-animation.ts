import { observeTimeline, type AnimationPlaybackControls } from 'motion-dom';
import type { ScrollOptionsWithDefaults } from './types';
import { getTimeline } from './utils/get-timeline';

export function attachToAnimation(
  animation: AnimationPlaybackControls,
  options: ScrollOptionsWithDefaults,
): VoidFunction {
  const timeline = getTimeline(options);

  return animation.attachTimeline({
    timeline: options.target ? undefined : timeline,
    observe: (valueAnimation) => {
      valueAnimation.pause();

      return observeTimeline((p: number) => {
        valueAnimation.time = valueAnimation.iterationDuration * p;
      }, timeline);
    },
  });
}
