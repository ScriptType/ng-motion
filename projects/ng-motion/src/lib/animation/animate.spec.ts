import '../test-env';
import { motionValue } from 'motion-dom';
import { animate, stagger } from './animate';
import type { AnimationSequence } from './sequence-types';

describe('animate', () => {
  it('exports stagger from motion-dom', () => {
    expect(typeof stagger).toBe('function');
  });

  it('animates a single numeric value (from → to)', async () => {
    const values: number[] = [];
    const mv = motionValue(0);
    mv.on('change', (v) => values.push(v));

    const controls = animate(mv, 100, { duration: 0.01 });
    await controls.finished;

    expect(values.length).toBeGreaterThan(0);
  });

  it('animates a MotionValue', async () => {
    const mv = motionValue(0);
    const controls = animate(mv, 50, { duration: 0.01 });
    await controls.finished;
    // Value should have changed
    expect(mv.get()).not.toBe(0);
  });

  it('returns GroupAnimationWithThen with .finished', () => {
    const mv = motionValue(0);
    const controls = animate(mv, 100, { duration: 0.01 });
    expect(controls.finished).toBeInstanceOf(Promise);
    expect(typeof controls.stop).toBe('function');
  });

  it('handles sequence animation', () => {
    const mv1 = motionValue(0);
    const mv2 = motionValue(0);
    const sequence: AnimationSequence = [
      [mv1, 100],
      [mv2, 200],
    ];
    const controls = animate(sequence);
    expect(controls.finished).toBeInstanceOf(Promise);
    expect(typeof controls.stop).toBe('function');
  });

  it('handles sequence with relative timing (<)', async () => {
    const mv1 = motionValue(0);
    const mv2 = motionValue(0);
    const sequence: AnimationSequence = [
      [mv1, 100, { duration: 0.01 }],
      [mv2, 200, { at: '<', duration: 0.01 }],
    ];
    const controls = animate(sequence);
    expect(controls.finished).toBeInstanceOf(Promise);
    await controls.finished;
  });

  it('handles sequence with labels', async () => {
    const mv1 = motionValue(0);
    const mv2 = motionValue(0);
    const sequence: AnimationSequence = [
      [mv1, 100, { duration: 0.01 }],
      'midpoint',
      [mv2, 200, { at: 'midpoint', duration: 0.01 }],
    ];
    const controls = animate(sequence);
    expect(controls.finished).toBeInstanceOf(Promise);
    await controls.finished;
  });

  it('stagger() returns a function that computes per-element delay', () => {
    expect(typeof stagger).toBe('function');
    const delayFn = stagger(0.1);
    expect(typeof delayFn).toBe('function');
    expect(delayFn(0, 5)).toBe(0);
    expect(delayFn(2, 5)).toBeCloseTo(0.2, 5);
  });

  it('stop/cancel does not throw on a running animation', () => {
    const mv = motionValue(0);
    const controls = animate(mv, 100, { duration: 10 });
    expect(() => { controls.stop(); }).not.toThrow();
  });

  it('animates through a keyframe array [0, 50, 100]', async () => {
    const mv = motionValue(0);
    const controls = animate(mv, [0, 50, 100], { duration: 0.01 });
    await controls.finished;
    expect(mv.get()).not.toBe(0);
  });

  it('sequence with custom defaultTransition completes', async () => {
    const mv1 = motionValue(0);
    const mv2 = motionValue(0);
    const sequence: AnimationSequence = [
      [mv1, 100],
      [mv2, 200],
    ];
    const controls = animate(sequence, { defaultTransition: { duration: 0.01 } });
    expect(controls.finished).toBeInstanceOf(Promise);
    await controls.finished;
  });

  it('animate returns a thenable (has .then method)', () => {
    const mv = motionValue(0);
    const controls = animate(mv, 100, { duration: 0.01 });
    expect(typeof controls.then).toBe('function');
  });
});
