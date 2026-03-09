import type { BoundingBox } from 'motion-utils';

export interface AxisConstraints {
  min?: number;
  max?: number;
}

export interface Constraints {
  x?: AxisConstraints;
  y?: AxisConstraints;
}

export function resolveDragElastic(
  dragElastic: boolean | number | Partial<BoundingBox> | undefined,
): BoundingBox {
  if (dragElastic === false) return { top: 0, right: 0, bottom: 0, left: 0 };
  if (dragElastic === true || dragElastic === undefined)
    return { top: 0.35, right: 0.35, bottom: 0.35, left: 0.35 };
  if (typeof dragElastic === 'number')
    return { top: dragElastic, right: dragElastic, bottom: dragElastic, left: dragElastic };
  return {
    top: dragElastic.top ?? 0.35,
    right: dragElastic.right ?? 0.35,
    bottom: dragElastic.bottom ?? 0.35,
    left: dragElastic.left ?? 0.35,
  };
}

export function calcRelativeConstraints(
  elementRect: DOMRect,
  containerRect: DOMRect,
): Constraints {
  return {
    x: {
      min: containerRect.left - elementRect.left,
      max: containerRect.right - elementRect.right,
    },
    y: {
      min: containerRect.top - elementRect.top,
      max: containerRect.bottom - elementRect.bottom,
    },
  };
}

export function resolveConstraints(
  dragConstraints: BoundingBox | HTMLElement | undefined,
  elementRect: DOMRect | undefined,
): Constraints | undefined {
  if (!dragConstraints) return undefined;

  if (dragConstraints instanceof HTMLElement) {
    if (!elementRect) return undefined;
    const containerRect = dragConstraints.getBoundingClientRect();
    return calcRelativeConstraints(elementRect, containerRect);
  }

  return {
    x: { min: dragConstraints.left, max: dragConstraints.right },
    y: { min: dragConstraints.top, max: dragConstraints.bottom },
  };
}

export function applyConstraints(
  value: number,
  constraints: AxisConstraints | undefined,
  elastic: number,
): number {
  if (!constraints) return value;

  const { min, max } = constraints;
  if (min !== undefined && value < min) {
    return elastic > 0 ? min + (value - min) * elastic : min;
  }
  if (max !== undefined && value > max) {
    return elastic > 0 ? max + (value - max) * elastic : max;
  }
  return value;
}
