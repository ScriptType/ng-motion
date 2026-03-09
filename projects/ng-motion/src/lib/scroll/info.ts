import { progress, velocityPerSecond } from 'motion-utils';
import type { AxisScrollInfo, ScrollInfo } from './types';

const maxElapsed = 50;

const createAxisInfo = (): AxisScrollInfo => ({
  current: 0,
  offset: [],
  progress: 0,
  scrollLength: 0,
  targetOffset: 0,
  targetLength: 0,
  containerLength: 0,
  velocity: 0,
});

export const createScrollInfo = (): ScrollInfo => ({
  time: 0,
  x: createAxisInfo(),
  y: createAxisInfo(),
});

const keys = {
  x: { length: 'Width', position: 'Left' },
  y: { length: 'Height', position: 'Top' },
} as const;

function updateAxisInfo(
  element: Element,
  axisName: 'x' | 'y',
  info: ScrollInfo,
  time: number,
): void {
  const axis = info[axisName];
  const { length, position } = keys[axisName];

  const prev = axis.current;
  const prevTime = info.time;

  axis.current = element[`scroll${position}` as keyof Element] as number; // eslint-disable-line @typescript-eslint/consistent-type-assertions -- DOM property access
  axis.scrollLength =
    (element[`scroll${length}` as keyof Element] as number) - // eslint-disable-line @typescript-eslint/consistent-type-assertions -- DOM property access
    (element[`client${length}` as keyof Element] as number); // eslint-disable-line @typescript-eslint/consistent-type-assertions -- DOM property access

  axis.offset.length = 0;
  axis.offset[0] = 0;
  axis.offset[1] = axis.scrollLength;
  axis.progress = progress(0, axis.scrollLength, axis.current);

  const elapsed = time - prevTime;
  axis.velocity =
    elapsed > maxElapsed ? 0 : velocityPerSecond(axis.current - prev, elapsed);
}

export function updateScrollInfo(
  element: Element,
  info: ScrollInfo,
  time: number,
): void {
  updateAxisInfo(element, 'x', info, time);
  updateAxisInfo(element, 'y', info, time);
  info.time = time;
}
