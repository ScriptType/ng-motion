import '../test-env';
import { EnvironmentInjector, runInInjectionContext } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { useMotionValue } from './use-motion-value';

describe('useMotionValue', () => {
  let injector: EnvironmentInjector;

  beforeEach(() => {
    injector = TestBed.inject(EnvironmentInjector);
  });

  it('creates a MotionValue with the given initial value', () => {
    const mv = runInInjectionContext(injector, () => useMotionValue(42));
    expect(mv.get()).toBe(42);
  });

  it('supports .set() to update the value', () => {
    const mv = runInInjectionContext(injector, () => useMotionValue(0));
    mv.set(100);
    expect(mv.get()).toBe(100);
  });

  it('supports string values', () => {
    const mv = runInInjectionContext(injector, () => useMotionValue('#ff0000'));
    expect(mv.get()).toBe('#ff0000');
  });

  it('fires change callbacks via .on()', () => {
    const mv = runInInjectionContext(injector, () => useMotionValue(0));
    const spy = vi.fn();
    mv.on('change', spy);
    mv.set(5);
    expect(spy).toHaveBeenCalled();
    expect(spy.mock.calls[0][0]).toBe(5);
  });

  it('destroys the MotionValue on injection context teardown', () => {
    const mv = runInInjectionContext(injector, () => useMotionValue(0));
    const spy = vi.fn();
    mv.on('change', spy);

    TestBed.resetTestingModule();

    // After destroy, change listeners should no longer fire
    mv.set(99);
    expect(spy).not.toHaveBeenCalled();
  });

  it('throws outside injection context', () => {
    expect(() => useMotionValue(0)).toThrow();
  });

  it('getVelocity() returns a number', () => {
    const mv = runInInjectionContext(injector, () => useMotionValue(0));
    mv.set(10);
    mv.set(20);
    expect(typeof mv.getVelocity()).toBe('number');
  });

  it('getPrevious() returns prior value', () => {
    const mv = runInInjectionContext(injector, () => useMotionValue(0));
    mv.set(42);
    expect(mv.getPrevious()).toBe(0);
  });

  it('animationStart and animationComplete events can be subscribed', () => {
    const mv = runInInjectionContext(injector, () => useMotionValue(0));
    const startSpy = vi.fn();
    const completeSpy = vi.fn();
    const unsubStart = mv.on('animationStart', startSpy);
    const unsubComplete = mv.on('animationComplete', completeSpy);
    // Verify subscriptions don't throw
    expect(typeof unsubStart).toBe('function');
    expect(typeof unsubComplete).toBe('function');
    unsubStart();
    unsubComplete();
  });

  it('multiple change listeners fire in order', () => {
    const mv = runInInjectionContext(injector, () => useMotionValue(0));
    const order: number[] = [];
    mv.on('change', () => order.push(1));
    mv.on('change', () => order.push(2));
    mv.set(10);
    expect(order).toEqual([1, 2]);
  });
});
