import type { Edge, EdgeString, Intersection, ProgressIntersection } from '../types';
import { namedEdges, resolveEdge } from './edge';

const defaultOffsetValue: ProgressIntersection = [0, 0];

export function resolveOffset(
  offset: Edge | Intersection | ProgressIntersection,
  containerLength: number,
  targetLength: number,
  targetInset: number,
): number {
  let offsetDefinition: ProgressIntersection | [EdgeString, EdgeString] =
    Array.isArray(offset) ? offset : defaultOffsetValue;

  if (typeof offset === 'number') {
    offsetDefinition = [offset, offset] as ProgressIntersection; // eslint-disable-line @typescript-eslint/consistent-type-assertions -- tuple construction
  } else if (typeof offset === 'string') {
    offset = offset.trim() as EdgeString; // eslint-disable-line @typescript-eslint/consistent-type-assertions -- string narrowing

    if (offset.includes(' ')) {
      offsetDefinition = offset.split(' ') as [EdgeString, EdgeString]; // eslint-disable-line @typescript-eslint/consistent-type-assertions -- string split
    } else {
      offsetDefinition = [
        offset,
        (offset in namedEdges ? offset : '0') as EdgeString, // eslint-disable-line @typescript-eslint/consistent-type-assertions -- edge string
      ];
    }
  }

  const targetPoint = resolveEdge(offsetDefinition[0], targetLength, targetInset);
  const containerPoint = resolveEdge(offsetDefinition[1], containerLength);

  return targetPoint - containerPoint;
}
