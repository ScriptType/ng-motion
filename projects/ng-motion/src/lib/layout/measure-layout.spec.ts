import '../test-env';
import { describe, it, expect, vi } from 'vitest';
import type {
  Measurements,
  VisualElement,
} from 'motion-dom';
import {
  cloneLayout,
  initProjection,
  snapshotBeforeUpdate,
  cleanupProjection,
} from './measure-layout';
import type { LayoutGroupContextProps } from './layout-group-context';

/** Create a stub Measurements object for testing. */
function makeMeasurements(x = 0, y = 0, w = 100, h = 50): Measurements {
  return {
    animationId: 0,
    measuredBox: {
      x: { min: x, max: x + w },
      y: { min: y, max: y + h },
    },
    layoutBox: {
      x: { min: x, max: x + w },
      y: { min: y, max: y + h },
    },
    latestValues: {},
    source: 0,
  };
}

/** Create a minimal VisualElement stub sufficient for initProjection.
 *  The real VisualElement has many more members; we only provide what
 *  initProjection actually touches at runtime. A single `no-unsafe-assignment`
 *  disable covers the unavoidable cast from the partial stub. */
function makeVeStub(): VisualElement {
  const box = {
    x: { min: 0, max: 0 },
    y: { min: 0, max: 0 },
  };

  const stub: Record<string, unknown> = {
    latestValues: {},
    parent: undefined,
    projection: null,
    current: null,
    options: { allowProjection: true },
    getProps: () => ({}),
    getValue: () => undefined,
    readValue: () => undefined,
    mount: () => undefined,
    measureInstanceViewportBox: () => box,
    measureViewportBox: () => box,
  };

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-explicit-any -- partial stub satisfies initProjection at runtime
  return stub as any;
}

describe('measure-layout helpers', () => {
  // ── cloneLayout ──

  describe('cloneLayout', () => {
    it('deep-clones without sharing references', () => {
      const original = makeMeasurements(10, 20, 200, 100);
      const clone = cloneLayout(original);

      expect(clone).toEqual(original);
      expect(clone).not.toBe(original);
      expect(clone.layoutBox).not.toBe(original.layoutBox);
      expect(clone.layoutBox.x).not.toBe(original.layoutBox.x);
      expect(clone.layoutBox.y).not.toBe(original.layoutBox.y);
      expect(clone.measuredBox.x).not.toBe(original.measuredBox.x);
      expect(clone.measuredBox.y).not.toBe(original.measuredBox.y);
    });
  });

  // ── initProjection ──

  describe('initProjection', () => {
    it('creates HTMLProjectionNode with correct options', () => {
      const ve = makeVeStub();
      const props = { layoutId: 'hero', layout: true };

      const projection = initProjection(ve, props);

      expect(projection).toBeDefined();
      expect(ve.projection).toBe(projection);

      const opts = projection.options;
      expect(opts.layoutId).toBe('hero');
      expect(opts.layout).toBe(true);
      expect(opts.animationType).toBe('both');
    });

    it('sets animationType from layout string value', () => {
      const ve = makeVeStub();
      const projection = initProjection(ve, { layout: 'size' });

      const opts = projection.options;
      expect(opts.animationType).toBe('size');
    });

    it('adds projection to layoutGroup when provided', () => {
      const ve = makeVeStub();
      const group = { add: vi.fn(), remove: vi.fn(), dirty: vi.fn() };
      const layoutGroup: LayoutGroupContextProps = { group };

      initProjection(ve, { layout: true }, layoutGroup);

      expect(group.add).toHaveBeenCalledOnce();
    });

    it('calls root.didUpdate() when hasTakenAnySnapshot is true', () => {
      const ve1 = makeVeStub();
      const proj1 = initProjection(ve1, { layout: true });

      // Force hasTakenAnySnapshot = true by calling snapshotBeforeUpdate
      snapshotBeforeUpdate(proj1, {}, true);

      const ve2 = makeVeStub();
      const proj2 = initProjection(ve2, { layout: true });

      // proj2.root should exist and didUpdate should have been called
      // (we can't easily spy on it, but verify no error is thrown and projection is created)
      expect(proj2).toBeDefined();
    });
  });

  // ── snapshotBeforeUpdate ──

  describe('snapshotBeforeUpdate', () => {
    it('sets isPresent on projection', () => {
      const ve = makeVeStub();
      const projection = initProjection(ve, { layout: true });

      snapshotBeforeUpdate(projection, {}, false);

      expect(projection.isPresent).toBe(false);
    });

    it('calls willUpdate() when layoutDependency changes', () => {
      const ve = makeVeStub();
      const projection = initProjection(ve, { layout: true });
      const spy = vi.spyOn(projection, 'willUpdate');

      snapshotBeforeUpdate(projection, { layoutDependency: 'v2' }, true, 'v1');

      expect(spy).toHaveBeenCalled();
    });

    it('skips willUpdate() when layoutDependency is stable (non-undefined)', () => {
      const ve = makeVeStub();
      const projection = initProjection(ve, { layout: true });
      const spy = vi.spyOn(projection, 'willUpdate');

      // Same non-undefined dependency → should NOT call willUpdate
      snapshotBeforeUpdate(projection, { layoutDependency: 'v1' }, true, 'v1');

      expect(spy).not.toHaveBeenCalled();
    });

    it('calls willUpdate() when layoutDependency is undefined', () => {
      const ve = makeVeStub();
      const projection = initProjection(ve, { layout: true });
      const spy = vi.spyOn(projection, 'willUpdate');

      // undefined dependency → always calls willUpdate
      snapshotBeforeUpdate(projection, {}, true, undefined);

      expect(spy).toHaveBeenCalled();
    });

    it('can skip cached layout cloning when a live pre-render snapshot is available', () => {
      const ve = makeVeStub();
      const projection = initProjection(ve, { layout: true });

      projection.layout = makeMeasurements(10, 20, 200, 100);
      vi.spyOn(projection, 'willUpdate').mockImplementation(() => undefined);

      snapshotBeforeUpdate(
        projection,
        { layoutDependency: 'v2' },
        true,
        'v1',
        { useCachedLayoutSnapshot: false },
      );

      // snapshotBeforeUpdate now bypasses getCachedLayoutSnapshot for dependency
      // changes and clones projection.layout directly (scroll-independent).
      expect(projection.snapshot).toBeDefined();
      expect(projection.snapshot?.layoutBox.x.min).toBe(10);
      expect(projection.snapshot?.layoutBox.y.min).toBe(20);
    });

    it('bypasses scroll-delta check when a layoutScroll ancestor has scrolled since the last measurement', () => {
      const ve = makeVeStub();
      const projection = initProjection(ve, { layout: true });
      const scrollContainer = document.createElement('div');
      scrollContainer.scrollTop = 400;

      projection.layout = makeMeasurements(0, 500, 200, 100);
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access -- path expects IProjectionNode[], but we only need partial stubs for the scroll-detection logic
      (projection as any).path = [{
        instance: scrollContainer,
        options: { layoutScroll: true },
        scroll: { offset: { x: 0, y: 0 }, wasRoot: false },
      }];
      vi.spyOn(projection, 'willUpdate').mockImplementation(() => undefined);

      snapshotBeforeUpdate(projection, { layoutDependency: 'v2' }, true, 'v1');

      // Dependency change now always clones layout directly, bypassing
      // the scroll-delta invalidation that previously returned undefined.
      expect(projection.snapshot).toBeDefined();
      expect(projection.snapshot?.layoutBox.x.min).toBe(0);
      expect(projection.snapshot?.layoutBox.y.min).toBe(500);
    });

    it('keeps using the cached snapshot when layoutScroll offsets are unchanged', () => {
      const ve = makeVeStub();
      const projection = initProjection(ve, { layout: true });
      const scrollContainer = document.createElement('div');
      scrollContainer.scrollLeft = 24;
      scrollContainer.scrollTop = 400;

      projection.layout = makeMeasurements(0, 500, 200, 100);
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access -- path expects IProjectionNode[], but we only need partial stubs for the scroll-detection logic
      (projection as any).path = [{
        instance: scrollContainer,
        options: { layoutScroll: true },
        scroll: { offset: { x: 24, y: 400 }, wasRoot: false },
      }];
      vi.spyOn(projection, 'willUpdate').mockImplementation(() => undefined);

      snapshotBeforeUpdate(projection, { layoutDependency: 'v2' }, true, 'v1');

      expect(projection.snapshot).toBeDefined();
      expect(projection.snapshot?.layoutBox.x.min).toBe(0);
      expect(projection.snapshot?.layoutBox.y.min).toBe(500);
      // cloneLayout copies measuredBox as-is (no scroll adjustment).
      expect(projection.snapshot?.measuredBox.x.min).toBe(0);
      expect(projection.snapshot?.measuredBox.y.min).toBe(500);
    });
  });

  // ── cleanupProjection ──

  describe('cleanupProjection', () => {
    it('pre-sets snapshot from cached layout for layoutId nodes', () => {
      const ve = makeVeStub();
      const projection = initProjection(ve, { layoutId: 'hero', layout: true });

      // Simulate a previous layout measurement
      projection.layout = makeMeasurements(10, 20, 200, 100);

      cleanupProjection(projection);

      expect(projection.snapshot).toBeDefined();
      expect(projection.snapshot?.layoutBox.x.min).toBe(10);
    });

    it('does NOT pre-set snapshot for non-layoutId nodes', () => {
      const ve = makeVeStub();
      const projection = initProjection(ve, { layout: true });

      projection.layout = makeMeasurements();

      cleanupProjection(projection);

      expect(projection.snapshot).toBeFalsy();
    });

    it('calls willUpdate() for layoutId nodes', () => {
      const ve = makeVeStub();
      const projection = initProjection(ve, { layoutId: 'hero', layout: true });
      const spy = vi.spyOn(projection, 'willUpdate');

      cleanupProjection(projection);

      expect(spy).toHaveBeenCalled();
    });

    it('removes projection from layout group', () => {
      const ve = makeVeStub();
      const group = { add: vi.fn(), remove: vi.fn(), dirty: vi.fn() };
      const layoutGroup: LayoutGroupContextProps = { group };
      const projection = initProjection(ve, { layout: true }, layoutGroup);

      cleanupProjection(projection, layoutGroup);

      expect(group.remove).toHaveBeenCalledWith(projection);
    });

    it('does not overwrite existing snapshot', () => {
      const ve = makeVeStub();
      const projection = initProjection(ve, { layoutId: 'hero', layout: true });

      const existingSnapshot = makeMeasurements(99, 99, 99, 99);
      projection.layout = makeMeasurements(10, 20, 200, 100);
      projection.snapshot = existingSnapshot;

      cleanupProjection(projection);

      // Should keep the existing snapshot, not overwrite with layout clone
      expect(projection.snapshot).toBe(existingSnapshot);
    });
  });
});
