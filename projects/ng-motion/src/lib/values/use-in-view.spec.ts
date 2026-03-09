import '../test-env';
import { Component, EnvironmentInjector, runInInjectionContext } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { useInView } from './use-in-view';

let mockObserverCallback: IntersectionObserverCallback;
let mockObserverInstance: {
  observe: ReturnType<typeof vi.fn>;
  unobserve: ReturnType<typeof vi.fn>;
  disconnect: ReturnType<typeof vi.fn>;
};
let lastObserverOptions: IntersectionObserverInit | undefined;

const OriginalIntersectionObserver = globalThis.IntersectionObserver;

beforeEach(() => {
  mockObserverInstance = {
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  };
  // eslint-disable-next-line @typescript-eslint/no-extraneous-class, @typescript-eslint/consistent-type-assertions -- mock class requires cast
  globalThis.IntersectionObserver = class MockIntersectionObserver {
    constructor(cb: IntersectionObserverCallback, opts?: IntersectionObserverInit) {
      mockObserverCallback = cb;
      lastObserverOptions = opts;
      Object.assign(this, mockObserverInstance);
    }
  } as unknown as typeof IntersectionObserver;
});

afterEach(() => {
  globalThis.IntersectionObserver = OriginalIntersectionObserver;
});

function triggerIntersection(isIntersecting: boolean): void {
  mockObserverCallback(
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- partial mock of IntersectionObserverEntry
    [{ isIntersecting } as IntersectionObserverEntry],
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- partial mock of IntersectionObserver
    mockObserverInstance as unknown as IntersectionObserver,
  );
}

describe('useInView', () => {
  let injector: EnvironmentInjector;

  beforeEach(() => {
    injector = TestBed.inject(EnvironmentInjector);
  });

  it('returns false initially', () => {
    const el = document.createElement('div');
    const result = runInInjectionContext(injector, () => useInView(el));
    expect(result()).toBe(false);
  });

  it('returns true when element enters viewport', () => {
    const el = document.createElement('div');
    const result = runInInjectionContext(injector, () => useInView(el));
    triggerIntersection(true);
    expect(result()).toBe(true);
  });

  it('returns false when element leaves viewport', () => {
    const el = document.createElement('div');
    const result = runInInjectionContext(injector, () => useInView(el));
    triggerIntersection(true);
    expect(result()).toBe(true);
    triggerIntersection(false);
    expect(result()).toBe(false);
  });

  it('unobserves after entering when once is true', () => {
    const el = document.createElement('div');
    runInInjectionContext(injector, () => useInView(el, { once: true }));
    triggerIntersection(true);
    expect(mockObserverInstance.unobserve).toHaveBeenCalledWith(el);
  });

  it('passes correct threshold for amount option', () => {
    const el = document.createElement('div');
    runInInjectionContext(injector, () => useInView(el, { amount: 'all' }));
    expect(lastObserverOptions?.threshold).toBe(1);

    runInInjectionContext(injector, () => useInView(el, { amount: 'some' }));
    expect(lastObserverOptions?.threshold).toBe(0);

    runInInjectionContext(injector, () => useInView(el, { amount: 0.5 }));
    expect(lastObserverOptions?.threshold).toBe(0.5);
  });

  it('disconnects observer on cleanup', () => {
    const el = document.createElement('div');

    @Component({ template: '' })
    class Host {
      constructor() {
        useInView(el);
      }
    }

    const fixture = TestBed.createComponent(Host);
    fixture.destroy();
    expect(mockObserverInstance.disconnect).toHaveBeenCalled();
  });

  it('throws outside injection context', () => {
    const el = document.createElement('div');
    expect(() => useInView(el)).toThrow();
  });
});
