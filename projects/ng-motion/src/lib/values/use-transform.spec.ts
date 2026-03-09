import '../test-env';
import { EnvironmentInjector, runInInjectionContext } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { motionValue, frame } from 'motion-dom';
import { useTransform } from './use-transform';

/** Flush one frame loop so preRender callbacks execute. */
function flushFrame(): Promise<void> {
  return new Promise((resolve) => {
    frame.postRender(() => {
      resolve();
    });
  });
}

describe('useTransform', () => {
  let injector: EnvironmentInjector;

  beforeEach(() => {
    injector = TestBed.inject(EnvironmentInjector);
  });

  describe('function form', () => {
    it('computes initial value from the source', () => {
      const source = motionValue(10);
      const output = runInInjectionContext(injector, () =>
        useTransform(source, (v: number) => v * 2),
      );
      expect(output.get()).toBe(20);
      source.destroy();
    });

    it('updates reactively when source changes', async () => {
      const source = motionValue(5);
      const output = runInInjectionContext(injector, () =>
        useTransform(source, (v: number) => v + 1),
      );

      source.set(10);
      await flushFrame();
      expect(output.get()).toBe(11);

      source.destroy();
    });
  });

  describe('range mapping form', () => {
    it('maps a value through input/output ranges', () => {
      const source = motionValue(50);
      const output = runInInjectionContext(injector, () =>
        useTransform(source, [0, 100], [0, 1]),
      );
      expect(output.get()).toBe(0.5);
      source.destroy();
    });

    it('clamps by default', () => {
      const source = motionValue(200);
      const output = runInInjectionContext(injector, () =>
        useTransform(source, [0, 100], [0, 1]),
      );
      expect(output.get()).toBe(1);
      source.destroy();
    });

    it('updates reactively on source change', async () => {
      const source = motionValue(0);
      const output = runInInjectionContext(injector, () =>
        useTransform(source, [0, 100], ['#000000', '#ffffff']),
      );

      source.set(100);
      await flushFrame();
      // motion-dom normalises colors to rgba format
      expect(output.get()).toBe('rgba(255, 255, 255, 1)');

      source.destroy();
    });

    it('interpolates colors at intermediate values', () => {
      const source = motionValue(50);
      const output = runInInjectionContext(injector, () =>
        useTransform(source, [0, 100], ['#000000', '#ffffff']),
      );
      const val = output.get();
      expect(typeof val).toBe('string');
      // At 50%, should be roughly mid-gray
      expect(val).not.toBe('rgba(0, 0, 0, 1)');
      expect(val).not.toBe('rgba(255, 255, 255, 1)');
      source.destroy();
    });

    it('interpolates string values with units', () => {
      const source = motionValue(50);
      const output = runInInjectionContext(injector, () =>
        useTransform(source, [0, 100], ['10px', '100px']),
      );
      const val = output.get();
      expect(typeof val).toBe('string');
      source.destroy();
    });

    it('allows extrapolation with clamp:false', () => {
      const source = motionValue(200);
      const output = runInInjectionContext(injector, () =>
        useTransform(source, [0, 100], [0, 1], { clamp: false }),
      );
      expect(output.get()).toBe(2);
      source.destroy();
    });
  });

  describe('multi-input form', () => {
    it('combines multiple MotionValues', () => {
      const x = motionValue(3);
      const y = motionValue(4);
      const output = runInInjectionContext(injector, () =>
        useTransform([x, y], (a: number, b: number) => a + b),
      );
      expect(output.get()).toBe(7);

      x.destroy();
      y.destroy();
    });

    it('updates when any source changes', async () => {
      const x = motionValue(1);
      const y = motionValue(2);
      const output = runInInjectionContext(injector, () =>
        useTransform([x, y], (a: number, b: number) => a * b),
      );

      x.set(5);
      await flushFrame();
      expect(output.get()).toBe(10);

      y.set(3);
      await flushFrame();
      expect(output.get()).toBe(15);

      x.destroy();
      y.destroy();
    });

    it('combines three or more sources', () => {
      const a = motionValue(1);
      const b = motionValue(2);
      const c = motionValue(3);
      const output = runInInjectionContext(injector, () =>
        useTransform([a, b, c], (x: number, y: number, z: number) => x + y + z),
      );
      expect(output.get()).toBe(6);
      a.destroy();
      b.destroy();
      c.destroy();
    });
  });

  describe('chaining', () => {
    it('supports nested transform chains for initial values', () => {
      const source = motionValue(10);
      const doubled = runInInjectionContext(injector, () =>
        useTransform(source, (v: number) => v * 2),
      );
      const plusTen = runInInjectionContext(injector, () =>
        useTransform(doubled, (v: number) => v + 10),
      );
      expect(doubled.get()).toBe(20);
      expect(plusTen.get()).toBe(30);

      source.destroy();
    });
  });

  describe('cleanup', () => {
    it('stops updating after injection context teardown', async () => {
      const source = motionValue(1);
      const output = runInInjectionContext(injector, () =>
        useTransform(source, (v: number) => v * 10),
      );
      expect(output.get()).toBe(10);

      TestBed.resetTestingModule();

      source.set(5);
      await flushFrame();
      // Output should not have updated after cleanup
      expect(output.get()).toBe(10);

      source.destroy();
    });
  });

  it('throws outside injection context', () => {
    const source = motionValue(0);
    expect(() => useTransform(source, (v: number) => v)).toThrow();
    source.destroy();
  });
});
