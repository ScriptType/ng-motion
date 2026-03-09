import { defaultOffset, interpolate } from 'motion-dom';
import { clamp } from 'motion-utils';
import type { EasingFunction } from 'motion-utils';
import type { ScrollInfo, ScrollInfoOptions } from '../types';
import { calcInset } from './inset';
import { resolveOffset } from './offset';
import { ScrollOffset } from './presets';

const point = { x: 0, y: 0 };

function getTargetSize(target: Element): { width: number; height: number } {
  return 'getBBox' in target && target.tagName !== 'svg'
    ? (target as SVGGraphicsElement).getBBox() // eslint-disable-line @typescript-eslint/consistent-type-assertions -- SVG check
    : { width: target.clientWidth, height: target.clientHeight };
}

export function resolveOffsets(
  container: Element,
  info: ScrollInfo,
  options: ScrollInfoOptions,
): void {
  const { offset: offsetDefinition = ScrollOffset['All'] } = options;
  const { target = container, axis = 'y' } = options;
  const lengthLabel = axis === 'y' ? 'height' : 'width';

  const inset = target !== container ? calcInset(target, container) : point;

  const targetSize =
    target === container
      ? { width: container.scrollWidth, height: container.scrollHeight }
      : getTargetSize(target);

  const containerSize = {
    width: container.clientWidth,
    height: container.clientHeight,
  };

  info[axis].offset.length = 0;

  let hasChanged = !info[axis].interpolate;

  const numOffsets = offsetDefinition.length;
  for (let i = 0; i < numOffsets; i++) {
    const offset = resolveOffset(
      offsetDefinition[i],
      containerSize[lengthLabel],
      targetSize[lengthLabel],
      inset[axis],
    );

    const cachedOffsets = info[axis].interpolatorOffsets;
    if (!hasChanged && cachedOffsets && offset !== cachedOffsets[i]) {
      hasChanged = true;
    }

    info[axis].offset[i] = offset;
  }

  if (hasChanged) {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- motion-dom interop: interpolate returns a broader type
    const interpolated = interpolate(info[axis].offset, defaultOffset(offsetDefinition), {
      clamp: false,
    }) as unknown as EasingFunction;
    info[axis].interpolate = interpolated;
    info[axis].interpolatorOffsets = [...info[axis].offset];
  }

  const interpolateFn = info[axis].interpolate;
  if (interpolateFn) {
    info[axis].progress = clamp(0, 1, interpolateFn(info[axis].current));
  }
}
