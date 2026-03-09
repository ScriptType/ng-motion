import '../test-env';
import { EnvironmentInjector, runInInjectionContext } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { useReducedMotion } from './use-reduced-motion';

let _changeHandler: ((e: { matches: boolean }) => void) | null = null;

beforeEach(() => {
  _changeHandler = null;
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    addEventListener: (_: string, handler: (e: { matches: boolean }) => void) => {
      _changeHandler = handler;
    },
    removeEventListener: () => {
      _changeHandler = null;
    },
  }));
});

describe('useReducedMotion', () => {
  let injector: EnvironmentInjector;

  beforeEach(() => {
    injector = TestBed.inject(EnvironmentInjector);
  });

  it('returns a signal', () => {
    const result = runInInjectionContext(injector, () => useReducedMotion());
    expect(typeof result()).toBe('boolean');
  });

  it('initial value reflects media query (likely false in test env)', () => {
    const result = runInInjectionContext(injector, () => useReducedMotion());
    expect(result()).toBe(false);
  });

  it('returns a readonly signal', () => {
    const result = runInInjectionContext(injector, () => useReducedMotion());
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- verify signal is readonly by checking for missing 'set'
    expect((result as unknown as Record<string, unknown>)['set']).toBeUndefined();
  });

  it('throws outside injection context', () => {
    expect(() => useReducedMotion()).toThrow();
  });
});
