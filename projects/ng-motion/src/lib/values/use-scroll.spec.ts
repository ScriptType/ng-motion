import '../test-env';
import { ElementRef, EnvironmentInjector, runInInjectionContext } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { useScroll } from './use-scroll';

describe('useScroll', () => {
  let injector: EnvironmentInjector;
  let container: HTMLDivElement;

  beforeEach(() => {
    injector = TestBed.inject(EnvironmentInjector);
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it('creates 4 motion values', () => {
    const values = runInInjectionContext(injector, () => useScroll({ container }));
    expect(values.scrollX).toBeDefined();
    expect(values.scrollY).toBeDefined();
    expect(values.scrollXProgress).toBeDefined();
    expect(values.scrollYProgress).toBeDefined();
  });

  it('initial values are 0', () => {
    const values = runInInjectionContext(injector, () => useScroll({ container }));
    expect(values.scrollX.get()).toBe(0);
    expect(values.scrollY.get()).toBe(0);
    expect(values.scrollXProgress.get()).toBe(0);
    expect(values.scrollYProgress.get()).toBe(0);
  });

  it('accepts ElementRef containers', () => {
    const elRef = new ElementRef(container);
    const values = runInInjectionContext(injector, () =>
      useScroll({ container: elRef }),
    );
    expect(values.scrollY).toBeDefined();
  });

  it('accepts HTMLElement containers', () => {
    const values = runInInjectionContext(injector, () =>
      useScroll({ container }),
    );
    expect(values.scrollY).toBeDefined();
  });

  it('cleans up on destroy', () => {
    const values = runInInjectionContext(injector, () => useScroll({ container }));
    const spy = vi.fn();
    values.scrollY.on('change', spy);

    TestBed.resetTestingModule();

    // After destroy, listeners should not fire
    values.scrollY.set(99);
    expect(spy).not.toHaveBeenCalled();
  });

  it('throws outside injection context', () => {
    expect(() => useScroll({ container })).toThrow();
  });
});
