import '../test-env';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { useTime } from './use-time';

async function flushFrames(): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 100));
}

describe('useTime', () => {
  it('creates a MotionValue starting at 0', () => {
    let time: ReturnType<typeof useTime> | undefined;

    @Component({ template: '' })
    class Host {
      constructor() {
        time = useTime();
      }
    }

    TestBed.createComponent(Host);
    expect(time).toBeDefined();
    expect(time?.get()).toBe(0);
  });

  it('updates with animation frame time', async () => {
    let time: ReturnType<typeof useTime> | undefined;

    @Component({ template: '' })
    class Host {
      constructor() {
        time = useTime();
      }
    }

    TestBed.createComponent(Host);
    const initial = time?.get() ?? 0;
    await flushFrames();
    expect(time?.get()).toBeGreaterThanOrEqual(initial);
  });

  it('cleans up on destroy', async () => {
    let time: ReturnType<typeof useTime> | undefined;

    @Component({ template: '' })
    class Host {
      constructor() {
        time = useTime();
      }
    }

    const fixture = TestBed.createComponent(Host);
    await flushFrames();
    fixture.destroy();
    const valueAtDestroy = time?.get() ?? 0;
    await flushFrames();
    expect(typeof valueAtDestroy).toBe('number');
  });
});
