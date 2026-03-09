import '../test-env';
import { EnvironmentInjector, runInInjectionContext } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { onCleanup } from './injection-context';

describe('onCleanup', () => {
  it('registers a destroy callback that runs on teardown', () => {
    const injector = TestBed.inject(EnvironmentInjector);
    const spy = vi.fn();

    runInInjectionContext(injector, () => {
      onCleanup(spy);
    });

    expect(spy).not.toHaveBeenCalled();
    TestBed.resetTestingModule();
    expect(spy).toHaveBeenCalledOnce();
  });

  it('throws outside injection context', () => {
    expect(() => {
      onCleanup(() => { /* noop */ });
    }).toThrow();
  });
});
