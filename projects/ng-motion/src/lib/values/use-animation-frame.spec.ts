import '../test-env';
import { EnvironmentInjector, runInInjectionContext } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { useAnimationFrame } from './use-animation-frame';

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe('useAnimationFrame', () => {
  let injector: EnvironmentInjector;

  beforeEach(() => {
    injector = TestBed.inject(EnvironmentInjector);
  });

  it('fires callback with time and delta arguments', async () => {
    const spy = vi.fn();
    runInInjectionContext(injector, () => { useAnimationFrame(spy); });
    await wait(50);
    expect(spy).toHaveBeenCalled();
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- vi.fn mock calls are untyped
    const [time, delta] = spy.mock.calls[0] as [number, number];
    expect(typeof time).toBe('number');
    expect(typeof delta).toBe('number');
    TestBed.resetTestingModule();
  });

  it('fires on multiple frames', async () => {
    const spy = vi.fn();
    runInInjectionContext(injector, () => { useAnimationFrame(spy); });
    await wait(100);
    expect(spy.mock.calls.length).toBeGreaterThan(1);
    TestBed.resetTestingModule();
  });

  it('delta reflects elapsed time', async () => {
    const deltas: number[] = [];
    runInInjectionContext(injector, () =>
      { useAnimationFrame((_time, delta) => {
        deltas.push(delta);
      }); },
    );
    await wait(100);
    expect(deltas.length).toBeGreaterThan(0);
    for (const d of deltas) {
      expect(d).toBeGreaterThanOrEqual(0);
    }
    TestBed.resetTestingModule();
  });

  it('cleanup stops calls', async () => {
    const spy = vi.fn();
    runInInjectionContext(injector, () => { useAnimationFrame(spy); });
    await wait(50);
    const countBeforeCleanup = spy.mock.calls.length;
    expect(countBeforeCleanup).toBeGreaterThan(0);

    TestBed.resetTestingModule();
    spy.mockClear();

    await wait(100);
    expect(spy).not.toHaveBeenCalled();
  });

  it('throws outside injection context', () => {
    expect(() => { useAnimationFrame(vi.fn()); }).toThrow();
  });
});
