import type { Edge, NamedEdges } from '../types';

export const namedEdges: Record<NamedEdges, number> = {
  start: 0,
  center: 0.5,
  end: 1,
};

export function resolveEdge(edge: Edge, length: number, inset = 0): number {
  let delta = 0;

  if (typeof edge === 'string' && edge in namedEdges) {
    edge = namedEdges[edge as NamedEdges]; // eslint-disable-line @typescript-eslint/consistent-type-assertions -- known key
  }

  if (typeof edge === 'string') {
    const asNumber = parseFloat(edge);

    if (edge.endsWith('px')) {
      delta = asNumber;
    } else if (edge.endsWith('%')) {
      edge = asNumber / 100;
    } else if (edge.endsWith('vw')) {
      delta = (asNumber / 100) * document.documentElement.clientWidth;
    } else if (edge.endsWith('vh')) {
      delta = (asNumber / 100) * document.documentElement.clientHeight;
    } else {
      edge = asNumber;
    }
  }

  if (typeof edge === 'number') {
    delta = length * edge;
  }

  return inset + delta;
}
