import '../test-env';
import { EnvironmentInjector, runInInjectionContext } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { motionValue, frame } from 'motion-dom';
import { useMotionTemplate } from './use-motion-template';

function flushFrame(): Promise<void> {
  return new Promise((resolve) => {
    frame.postRender(() => { resolve(); });
  });
}

describe('useMotionTemplate', () => {
  let injector: EnvironmentInjector;

  beforeEach(() => {
    injector = TestBed.inject(EnvironmentInjector);
  });

  it('composes an initial value from template and MotionValues', () => {
    const x = motionValue(50);
    const mv = runInInjectionContext(injector, () => useMotionTemplate`translateX(${x}px)`);
    expect(mv.get()).toBe('translateX(50px)');
    x.destroy();
  });

  it('reactively updates when a source value changes', async () => {
    const x = motionValue(0);
    const mv = runInInjectionContext(injector, () => useMotionTemplate`translateX(${x}px)`);
    x.set(100);
    await flushFrame();
    expect(mv.get()).toBe('translateX(100px)');
    x.destroy();
  });

  it('handles multiple embedded MotionValues', () => {
    const x = motionValue(10);
    const y = motionValue(20);
    const mv = runInInjectionContext(
      injector,
      () => useMotionTemplate`translate(${x}px, ${y}px)`,
    );
    expect(mv.get()).toBe('translate(10px, 20px)');
    x.destroy();
    y.destroy();
  });

  it('mixes static text with MotionValues', () => {
    const scale = motionValue(1.5);
    const mv = runInInjectionContext(
      injector,
      () => useMotionTemplate`scale(${scale}) rotate(45deg)`,
    );
    expect(mv.get()).toBe('scale(1.5) rotate(45deg)');
    scale.destroy();
  });

  it('cleans up on injection context teardown', async () => {
    const x = motionValue(0);
    const mv = runInInjectionContext(injector, () => useMotionTemplate`translateX(${x}px)`);
    const spy = vi.fn();
    mv.on('change', spy);

    TestBed.resetTestingModule();

    x.set(999);
    await flushFrame();
    expect(spy).not.toHaveBeenCalled();
    x.destroy();
  });

  it('throws outside injection context', () => {
    const x = motionValue(0);
    expect(() => useMotionTemplate`translateX(${x}px)`).toThrow();
    x.destroy();
  });
});
