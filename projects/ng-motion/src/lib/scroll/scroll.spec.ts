import '../test-env';
import { resolveEdge, namedEdges } from './offsets/edge';
import { resolveOffset } from './offsets/offset';
import { createScrollInfo } from './info';
import { ScrollOffset } from './offsets/presets';
import { canUseNativeTimeline } from './utils/can-use-native-timeline';

describe('resolveEdge', () => {
  it('resolves named edge "start" to 0', () => {
    expect(resolveEdge('start', 100)).toBe(0);
  });

  it('resolves named edge "center" to half length', () => {
    expect(resolveEdge('center', 200)).toBe(100);
  });

  it('resolves named edge "end" to full length', () => {
    expect(resolveEdge('end', 300)).toBe(300);
  });

  it('resolves px units', () => {
    expect(resolveEdge('50px', 100)).toBe(50);
  });

  it('resolves percentage units', () => {
    expect(resolveEdge('50%', 200)).toBe(100);
  });

  it('resolves numeric values as fraction of length', () => {
    expect(resolveEdge(0.5, 400)).toBe(200);
  });

  it('adds inset to result', () => {
    expect(resolveEdge(0, 100, 25)).toBe(25);
  });

  it('resolves numeric string without unit as number', () => {
    expect(resolveEdge('0.5', 400)).toBe(200);
  });
});

describe('namedEdges', () => {
  it('has start=0, center=0.5, end=1', () => {
    expect(namedEdges.start).toBe(0);
    expect(namedEdges.center).toBe(0.5);
    expect(namedEdges.end).toBe(1);
  });
});

describe('resolveOffset', () => {
  it('resolves a number offset', () => {
    const result = resolveOffset(0.5, 500, 100, 0);
    // targetPoint = resolveEdge(0.5, 100, 0) = 50
    // containerPoint = resolveEdge(0.5, 500) = 250
    expect(result).toBe(50 - 250);
  });

  it('resolves a string offset with space', () => {
    const result = resolveOffset('start end', 500, 100, 0);
    // targetPoint = resolveEdge('start', 100, 0) = 0
    // containerPoint = resolveEdge('end', 500) = 500
    expect(result).toBe(0 - 500);
  });

  it('resolves a ProgressIntersection tuple', () => {
    const result = resolveOffset([0, 1], 400, 200, 0);
    // targetPoint = resolveEdge(0, 200, 0) = 0
    // containerPoint = resolveEdge(1, 400) = 400
    expect(result).toBe(0 - 400);
  });
});

describe('createScrollInfo', () => {
  it('returns proper structure with x and y axes', () => {
    const info = createScrollInfo();
    expect(info.time).toBe(0);
    expect(info.x.current).toBe(0);
    expect(info.x.progress).toBe(0);
    expect(info.x.offset).toEqual([]);
    expect(info.y.current).toBe(0);
    expect(info.y.progress).toBe(0);
    expect(info.y.velocity).toBe(0);
    expect(info.y.scrollLength).toBe(0);
    expect(info.y.targetOffset).toBe(0);
    expect(info.y.targetLength).toBe(0);
    expect(info.y.containerLength).toBe(0);
  });
});

describe('ScrollOffset presets', () => {
  it('Enter preset', () => {
    expect(ScrollOffset['Enter']).toEqual([
      [0, 1],
      [1, 1],
    ]);
  });

  it('Exit preset', () => {
    expect(ScrollOffset['Exit']).toEqual([
      [0, 0],
      [1, 0],
    ]);
  });

  it('Any preset', () => {
    expect(ScrollOffset['Any']).toEqual([
      [1, 0],
      [0, 1],
    ]);
  });

  it('All preset', () => {
    expect(ScrollOffset['All']).toEqual([
      [0, 0],
      [1, 1],
    ]);
  });
});

describe('canUseNativeTimeline', () => {
  it('returns a boolean', () => {
    const result = canUseNativeTimeline();
    expect(typeof result).toBe('boolean');
  });

  it('returns false when target is provided', () => {
    const el = document.createElement('div');
    expect(canUseNativeTimeline(el)).toBe(false);
  });
});
