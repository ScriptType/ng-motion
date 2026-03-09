import { observeTimeline } from 'motion-dom';
import { scrollInfo } from './track';
import type { OnScroll, OnScrollWithInfo, ScrollOptionsWithDefaults } from './types';
import { getTimeline } from './utils/get-timeline';

function isOnScrollWithInfo(onScroll: OnScroll): onScroll is OnScrollWithInfo {
  return onScroll.length === 2;
}

export function attachToFunction(
  onScroll: OnScroll,
  options: ScrollOptionsWithDefaults,
): VoidFunction {
  if (isOnScrollWithInfo(onScroll)) {
    return scrollInfo((info) => {
      onScroll(info[options.axis].progress, info);
    }, options);
  } else {
    return observeTimeline(onScroll, getTimeline(options));
  }
}
