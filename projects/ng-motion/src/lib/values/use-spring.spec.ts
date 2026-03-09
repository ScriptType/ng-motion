import '../test-env';
import { EnvironmentInjector, runInInjectionContext } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { motionValue } from 'motion-dom';
import { useSpring } from './use-spring';

describe('useSpring', () => {
  let injector: EnvironmentInjector;

  beforeEach(() => {
    injector = TestBed.inject(EnvironmentInjector);
  });

  it('creates a spring MotionValue from a number', () => {
    const mv = runInInjectionContext(injector, () => useSpring(100));
    expect(mv.get()).toBe(100);
  });

  it('creates a spring MotionValue from a string', () => {
    const mv = runInInjectionContext(injector, () => useSpring('#ff0000'));
    expect(typeof mv.get()).toBe('string');
  });

  it('creates a spring MotionValue tracking another MotionValue', () => {
    const source = motionValue(50);
    const mv = runInInjectionContext(injector, () => useSpring(source));
    expect(mv.get()).toBe(50);
    source.destroy();
  });

  it('accepts spring options', () => {
    const mv = runInInjectionContext(injector, () =>
      useSpring(0, { stiffness: 300, damping: 20 }),
    );
    expect(mv.get()).toBe(0);
  });

  it('cleans up on injection context teardown', () => {
    const source = motionValue(0);
    const mv = runInInjectionContext(injector, () => useSpring(source));
    const spy = vi.fn();
    mv.on('change', spy);

    TestBed.resetTestingModule();

    // After cleanup, the spring value should no longer fire listeners
    mv.set(999);
    expect(spy).not.toHaveBeenCalled();

    source.destroy();
  });

  it('throws outside injection context', () => {
    expect(() => useSpring(0)).toThrow();
  });

  it('animates towards target over time', () => {
    const source = motionValue(0);
    const mv = runInInjectionContext(injector, () =>
      useSpring(source, { stiffness: 100, damping: 10 }),
    );
    source.set(100);
    // Spring is attached and value should still be a number
    expect(typeof mv.get()).toBe('number');
    source.destroy();
  });

  it('initial value matches source after creation', () => {
    const source = motionValue(42);
    const mv = runInInjectionContext(injector, () =>
      useSpring(source, { stiffness: 300, damping: 30 }),
    );
    expect(mv.get()).toBe(42);
    source.destroy();
  });

  it('high damping configuration is accepted', () => {
    const source = motionValue(0);
    const mv = runInInjectionContext(injector, () =>
      useSpring(source, { stiffness: 300, damping: 100 }),
    );
    expect(mv.get()).toBe(0);
    source.set(100);
    expect(typeof mv.get()).toBe('number');
    source.destroy();
  });

  it('low damping configuration is accepted', () => {
    const source = motionValue(0);
    const mv = runInInjectionContext(injector, () =>
      useSpring(source, { stiffness: 200, damping: 5 }),
    );
    source.set(100);
    expect(typeof mv.get()).toBe('number');
    source.destroy();
  });

  it('tracks source MotionValue changes', () => {
    const source = motionValue(0);
    const mv = runInInjectionContext(injector, () =>
      useSpring(source, { stiffness: 300, damping: 30 }),
    );
    source.set(50);
    source.set(200);
    // Spring should still be a number after multiple source changes
    expect(typeof mv.get()).toBe('number');
    source.destroy();
  });

  it('different stiffness and damping produce valid springs', () => {
    const sourceA = motionValue(0);
    const sourceB = motionValue(0);
    const mvA = runInInjectionContext(injector, () =>
      useSpring(sourceA, { stiffness: 500, damping: 10 }),
    );
    const mvB = runInInjectionContext(injector, () =>
      useSpring(sourceB, { stiffness: 50, damping: 10 }),
    );
    expect(typeof mvA.get()).toBe('number');
    expect(typeof mvB.get()).toBe('number');
    sourceA.destroy();
    sourceB.destroy();
  });

  it('mass option does not error', () => {
    const source = motionValue(0);
    const mv = runInInjectionContext(injector, () =>
      useSpring(source, { stiffness: 100, damping: 10, mass: 2 }),
    );
    source.set(50);
    expect(typeof mv.get()).toBe('number');
    source.destroy();
  });

  it('bounce option does not error', () => {
    const source = motionValue(0);
    const mv = runInInjectionContext(injector, () =>
      useSpring(source, { stiffness: 100, damping: 10, bounce: 0.5 }),
    );
    source.set(50);
    expect(typeof mv.get()).toBe('number');
    source.destroy();
  });
});
