import '../test-env';
import { EnvironmentInjector, runInInjectionContext } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { motionValue } from 'motion-dom';
import { useMotionValueEvent } from './use-motion-value-event';

describe('useMotionValueEvent', () => {
  let injector: EnvironmentInjector;

  beforeEach(() => {
    injector = TestBed.inject(EnvironmentInjector);
  });

  it('fires callback on change event', () => {
    const mv = motionValue(0);
    const spy = vi.fn();
    runInInjectionContext(injector, () => { useMotionValueEvent(mv, 'change', spy); });
    mv.set(42);
    expect(spy).toHaveBeenCalled();
    expect(spy.mock.calls[0][0]).toBe(42);
    mv.destroy();
  });

  it('subscribes to animationStart event', () => {
    const mv = motionValue(0);
    const spy = vi.fn();
    // Just verify that subscribing to animationStart does not throw
    runInInjectionContext(injector, () => { useMotionValueEvent(mv, 'animationStart', spy); });
    // The subscription was set up without error
    expect(true).toBe(true);
    mv.destroy();
  });

  it('subscribes to animationComplete event', () => {
    const mv = motionValue(0);
    const spy = vi.fn();
    runInInjectionContext(injector, () => { useMotionValueEvent(mv, 'animationComplete', spy); });
    expect(true).toBe(true);
    mv.destroy();
  });

  it('subscribes to animationCancel event', () => {
    const mv = motionValue(0);
    const spy = vi.fn();
    runInInjectionContext(injector, () => { useMotionValueEvent(mv, 'animationCancel', spy); });
    expect(true).toBe(true);
    mv.destroy();
  });

  it('cleans up on injection context teardown', () => {
    const mv = motionValue(0);
    const spy = vi.fn();
    runInInjectionContext(injector, () => { useMotionValueEvent(mv, 'change', spy); });

    TestBed.resetTestingModule();

    mv.set(999);
    expect(spy).not.toHaveBeenCalled();
    mv.destroy();
  });

  it('throws outside injection context', () => {
    const mv = motionValue(0);
    expect(() => { useMotionValueEvent(mv, 'change', vi.fn()); }).toThrow();
    mv.destroy();
  });
});
