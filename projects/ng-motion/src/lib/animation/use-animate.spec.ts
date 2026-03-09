import '../test-env';
import { EnvironmentInjector, runInInjectionContext } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { motionValue } from 'motion-dom';
import { useAnimate } from './use-animate';

describe('useAnimate', () => {
  let injector: EnvironmentInjector;

  beforeEach(() => {
    injector = TestBed.inject(EnvironmentInjector);
  });

  // ── 1. Basic shape ──────────────────────────────────────────────────

  it('returns a [scope, animate] tuple', () => {
    const result = runInInjectionContext(injector, () => useAnimate());
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(2);
    const [scope, animate] = result;
    expect(scope).toHaveProperty('current');
    expect(scope).toHaveProperty('animations');
    expect(Array.isArray(scope.animations)).toBe(true);
    expect(typeof animate).toBe('function');
  });

  it('scope.animations starts empty', () => {
    const [scope] = runInInjectionContext(injector, () => useAnimate());
    expect(scope.animations).toHaveLength(0);
  });

  it('scope.current starts as null (cast as T)', () => {
    const [scope] = runInInjectionContext(injector, () => useAnimate());
    // Implementation does `null! as T`, so runtime value is null
    expect(scope.current).toBeNull();
  });

  // ── 2. Returned controls shape ──────────────────────────────────────

  it('animate returns object with .finished promise', () => {
    const [, animate] = runInInjectionContext(injector, () => useAnimate());
    const mv = motionValue(0);
    const controls = animate(mv, 100, { duration: 0.01 });
    expect(controls.finished).toBeInstanceOf(Promise);
  });

  it('animate returns object with .stop() method', () => {
    const [, animate] = runInInjectionContext(injector, () => useAnimate());
    const mv = motionValue(0);
    const controls = animate(mv, 100, { duration: 0.01 });
    expect(typeof controls.stop).toBe('function');
  });

  it('animate returns object with .then() method', () => {
    const [, animate] = runInInjectionContext(injector, () => useAnimate());
    const mv = motionValue(0);
    const controls = animate(mv, 100, { duration: 0.01 });
    expect(typeof controls.then).toBe('function');
  });

  // ── 3. Single MotionValue animation ─────────────────────────────────

  it('animates a numeric MotionValue (single value)', async () => {
    const [scope, animate] = runInInjectionContext(injector, () => useAnimate());
    const mv = motionValue(0);

    const controls = animate(mv, 100, { duration: 0.01 });
    expect(scope.animations.length).toBeGreaterThanOrEqual(1);

    await controls.finished;
  });

  it('animates a string MotionValue', async () => {
    const [scope, animate] = runInInjectionContext(injector, () => useAnimate());
    const mv = motionValue('#000000');

    const controls = animate(mv, '#ffffff', { duration: 0.01 });
    expect(scope.animations.length).toBeGreaterThanOrEqual(1);

    await controls.finished;
  });

  it('animates a numeric MotionValue with keyframe array', async () => {
    const [scope, animate] = runInInjectionContext(injector, () => useAnimate());
    const mv = motionValue(0);

    const controls = animate(mv, [0, 50, 100], { duration: 0.01 });
    expect(scope.animations.length).toBeGreaterThanOrEqual(1);

    await controls.finished;
  });

  // ── 4. Tracking & auto-removal ──────────────────────────────────────

  it('tracks multiple concurrent animations in scope.animations', () => {
    const [scope, animate] = runInInjectionContext(injector, () => useAnimate());
    const mv1 = motionValue(0);
    const mv2 = motionValue(0);

    animate(mv1, 100, { duration: 10 });
    animate(mv2, 200, { duration: 10 });

    expect(scope.animations.length).toBe(2);
  });

  it('auto-removes animation from scope.animations on completion', async () => {
    const [scope, animate] = runInInjectionContext(injector, () => useAnimate());
    const mv = motionValue(0);

    const controls = animate(mv, 100, { duration: 0.01 });
    expect(scope.animations.length).toBe(1);

    await controls.finished;

    // After finished resolves, the .then handler removes it from the array
    expect(scope.animations).toHaveLength(0);
  });

  it('stopping an animation prevents it from reaching the target value', () => {
    const [, animate] = runInInjectionContext(injector, () => useAnimate());
    const mv = motionValue(0);

    const controls = animate(mv, 100, { duration: 10 });
    controls.stop();

    // After stopping immediately, the value should not have reached the target
    expect(mv.get()).not.toBe(100);
  });

  it('handles multiple sequential animations correctly', async () => {
    const [scope, animate] = runInInjectionContext(injector, () => useAnimate());
    const mv = motionValue(0);

    const first = animate(mv, 50, { duration: 0.01 });
    await first.finished;
    expect(scope.animations).toHaveLength(0);

    const second = animate(mv, 100, { duration: 0.01 });
    expect(scope.animations.length).toBe(1);
    await second.finished;
    expect(scope.animations).toHaveLength(0);
  });

  // ── 5. Destroy cleanup ─────────────────────────────────────────────

  it('stops all animations on destroy', () => {
    const [scope, animate] = runInInjectionContext(injector, () => useAnimate());
    const mv = motionValue(0);

    animate(mv, 100, { duration: 10 });
    expect(scope.animations.length).toBeGreaterThanOrEqual(1);

    // Destroy the injector
    TestBed.resetTestingModule();

    // All animations should be stopped and cleared
    expect(scope.animations).toHaveLength(0);
  });

  it('clears scope.animations on destroy even with multiple active animations', () => {
    const [scope, animate] = runInInjectionContext(injector, () => useAnimate());
    const mv1 = motionValue(0);
    const mv2 = motionValue(10);
    const mv3 = motionValue(20);

    animate(mv1, 100, { duration: 10 });
    animate(mv2, 200, { duration: 10 });
    animate(mv3, 300, { duration: 10 });

    expect(scope.animations.length).toBe(3);

    TestBed.resetTestingModule();

    expect(scope.animations).toHaveLength(0);
  });

  // ── 6. Injection context guard ──────────────────────────────────────

  it('throws outside injection context', () => {
    expect(() => useAnimate()).toThrow();
  });
});
