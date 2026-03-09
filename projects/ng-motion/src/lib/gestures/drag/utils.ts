import type { Point } from 'motion-utils';

export type DragDirection = 'x' | 'y';

export interface PanInfo {
  point: Point;
  delta: Point;
  offset: Point;
  velocity: Point;
}

export function shouldDrag(
  direction: DragDirection | boolean | undefined,
  axis: 'x' | 'y',
): boolean {
  if (direction === true) return true;
  return direction === axis;
}

export function getCurrentDirection(
  offset: Point,
  lockThreshold = 10,
): DragDirection | null {
  const absX = Math.abs(offset.x);
  const absY = Math.abs(offset.y);
  if (absX > lockThreshold || absY > lockThreshold) {
    return absX > absY ? 'x' : 'y';
  }
  return null;
}
