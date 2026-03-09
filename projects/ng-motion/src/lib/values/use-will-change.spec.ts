import '../test-env';
import { EnvironmentInjector, runInInjectionContext } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { useWillChange } from './use-will-change';

describe('useWillChange', () => {
  let injector: EnvironmentInjector;

  beforeEach(() => {
    injector = TestBed.inject(EnvironmentInjector);
  });

  it('creates a MotionValue with auto initial value', () => {
    const mv = runInInjectionContext(injector, () => useWillChange());
    expect(mv.get()).toBe('auto');
  });

  it('can be updated to track properties', () => {
    const mv = runInInjectionContext(injector, () => useWillChange());
    mv.set('transform, opacity');
    expect(mv.get()).toBe('transform, opacity');
  });

  it('cleanup destroys the MotionValue', () => {
    const mv = runInInjectionContext(injector, () => useWillChange());
    const spy = vi.fn();
    mv.on('change', spy);

    TestBed.resetTestingModule();

    mv.set('transform');
    expect(spy).not.toHaveBeenCalled();
  });
});
