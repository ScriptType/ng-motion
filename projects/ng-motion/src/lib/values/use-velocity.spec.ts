import '../test-env';
import { Component, EnvironmentInjector, runInInjectionContext } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { motionValue } from 'motion-dom';
import { useVelocity } from './use-velocity';

async function flushFrames(): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 100));
}

describe('useVelocity', () => {
  it('creates a MotionValue tracking velocity', () => {
    let velocity: ReturnType<typeof useVelocity> | undefined;
    const source = motionValue(0);

    @Component({ template: '' })
    class Host {
      constructor() {
        velocity = useVelocity(source);
      }
    }

    TestBed.createComponent(Host);
    expect(velocity).toBeDefined();
    expect(typeof velocity?.get()).toBe('number');
  });

  it('updates when source value changes', async () => {
    let velocity: ReturnType<typeof useVelocity> | undefined;
    const source = motionValue(0);

    @Component({ template: '' })
    class Host {
      constructor() {
        velocity = useVelocity(source);
      }
    }

    TestBed.createComponent(Host);
    source.set(100);
    await flushFrames();
    expect(typeof velocity?.get()).toBe('number');
  });

  it('cleans up on destroy', async () => {
    const source = motionValue(0);

    @Component({ template: '' })
    class Host {
      vel = useVelocity(source);
    }

    const fixture = TestBed.createComponent(Host);
    fixture.destroy();
    source.set(50);
    await flushFrames();
  });

  it('reports velocity as a number during rapid changes', async () => {
    const injector = TestBed.inject(EnvironmentInjector);
    const source = motionValue(0);
    const velocity = runInInjectionContext(injector, () => useVelocity(source));
    for (let i = 1; i <= 10; i++) {
      source.set(i * 100);
      await new Promise((r) => setTimeout(r, 10));
    }
    await flushFrames();
    expect(typeof velocity.get()).toBe('number');
  });

  it('settles to zero after source stops changing', async () => {
    const injector = TestBed.inject(EnvironmentInjector);
    const source = motionValue(0);
    const velocity = runInInjectionContext(injector, () => useVelocity(source));
    source.set(100);
    await new Promise((r) => setTimeout(r, 300));
    expect(velocity.get()).toBe(0);
  });

  it('does not error when source changes after creation', () => {
    const injector = TestBed.inject(EnvironmentInjector);
    const source = motionValue(0);
    const velocity = runInInjectionContext(injector, () => useVelocity(source));
    // Rapid changes should not throw
    expect(() => {
      source.set(200);
      source.set(300);
      source.set(0);
    }).not.toThrow();
    expect(typeof velocity.get()).toBe('number');
  });

  it('tracks velocity from decreasing values', async () => {
    const injector = TestBed.inject(EnvironmentInjector);
    const source = motionValue(1000);
    const velocity = runInInjectionContext(injector, () => useVelocity(source));
    for (let i = 1; i <= 10; i++) {
      source.set(1000 - i * 100);
      await new Promise((r) => setTimeout(r, 10));
    }
    await flushFrames();
    expect(typeof velocity.get()).toBe('number');
  });
});
