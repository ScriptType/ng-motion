import type { ProgressTimeline } from 'motion-dom';
import { scrollInfo } from '../track';
import type { ScrollOptionsWithDefaults } from '../types';
import { canUseNativeTimeline } from './can-use-native-timeline';

type ScrollTimelineConstructor = new (options: { source: Element }) => ProgressTimeline;

type TargetCacheMap = Map<Element | 'self', Map<string, ProgressTimeline>>;

const timelineCache = new WeakMap<Element, TargetCacheMap>();

function scrollTimelineFallback(
  options: ScrollOptionsWithDefaults,
): ProgressTimeline {
  const currentTime = { value: 0 };

  const cancel = scrollInfo((info) => {
    currentTime.value = info[options.axis].progress * 100;
  }, options);

  return { currentTime, cancel };
}

export function getTimeline({
  source,
  container,
  ...options
}: ScrollOptionsWithDefaults): ProgressTimeline {
  const { axis } = options;

  if (source) container = source;

  const containerCache: TargetCacheMap =
    timelineCache.get(container) ?? new Map<Element | 'self', Map<string, ProgressTimeline>>();
  timelineCache.set(container, containerCache);

  const targetKey = options.target ?? 'self';
  const targetCache: Map<string, ProgressTimeline> =
    containerCache.get(targetKey) ?? new Map<string, ProgressTimeline>();

  const axisKey = axis + (options.offset ?? []).join(',');

  const cached = targetCache.get(axisKey);
  if (cached) return cached;

  const ScrollTimelineCtor = (
    window as unknown as { ScrollTimeline?: ScrollTimelineConstructor } // eslint-disable-line @typescript-eslint/consistent-type-assertions -- native ScrollTimeline API
  ).ScrollTimeline;

  const timeline =
    canUseNativeTimeline(options.target) && ScrollTimelineCtor
      ? new ScrollTimelineCtor({ source: container })
      : scrollTimelineFallback({ container, ...options });

  targetCache.set(axisKey, timeline);
  containerCache.set(targetKey, targetCache);

  return timeline;
}
