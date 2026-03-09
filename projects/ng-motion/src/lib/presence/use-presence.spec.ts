import '../test-env';
import { EnvironmentInjector, runInInjectionContext } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { PRESENCE_CONTEXT, createPresenceContext } from './presence-context';
import { useIsPresent, usePresence } from './use-presence';

describe('useIsPresent', () => {
  it('returns true signal without presence context', () => {
    const injector = TestBed.inject(EnvironmentInjector);
    const result = runInInjectionContext(injector, () => useIsPresent());
    expect(result()).toBe(true);
  });

  it('returns true signal with context where isPresent=true', () => {
    TestBed.configureTestingModule({
      providers: [{ provide: PRESENCE_CONTEXT, useValue: createPresenceContext(true) }],
    });
    const injector = TestBed.inject(EnvironmentInjector);
    const result = runInInjectionContext(injector, () => useIsPresent());
    expect(result()).toBe(true);
  });

  it('returns false signal when context isPresent$ is set to false', () => {
    const ctx = createPresenceContext(true);
    ctx.isPresent$.set(false);
    TestBed.configureTestingModule({
      providers: [{ provide: PRESENCE_CONTEXT, useValue: ctx }],
    });
    const injector = TestBed.inject(EnvironmentInjector);
    const result = runInInjectionContext(injector, () => useIsPresent());
    expect(result()).toBe(false);
  });

  it('is reactive to context changes', () => {
    const ctx = createPresenceContext(true);
    TestBed.configureTestingModule({
      providers: [{ provide: PRESENCE_CONTEXT, useValue: ctx }],
    });
    const injector = TestBed.inject(EnvironmentInjector);
    const result = runInInjectionContext(injector, () => useIsPresent());
    expect(result()).toBe(true);
    ctx.isPresent$.set(false);
    expect(result()).toBe(false);
  });

  it('throws outside injection context', () => {
    expect(() => useIsPresent()).toThrow();
  });
});

describe('usePresence', () => {
  it('returns [true signal, noop] without presence context', () => {
    const injector = TestBed.inject(EnvironmentInjector);
    const [isPresent, safeToRemove] = runInInjectionContext(injector, () => usePresence());
    expect(isPresent()).toBe(true);
    expect(typeof safeToRemove).toBe('function');
    safeToRemove();
  });

  it('returns [signal, safeToRemove fn] with presence context', () => {
    const ctx = createPresenceContext(true);
    TestBed.configureTestingModule({
      providers: [{ provide: PRESENCE_CONTEXT, useValue: ctx }],
    });
    const injector = TestBed.inject(EnvironmentInjector);
    const [isPresent, safeToRemove] = runInInjectionContext(injector, () => usePresence());
    expect(isPresent()).toBe(true);
    expect(typeof safeToRemove).toBe('function');
  });

  it('safeToRemove triggers exit complete callback when registrations hit 0', () => {
    const ctx = createPresenceContext(true);
    TestBed.configureTestingModule({
      providers: [{ provide: PRESENCE_CONTEXT, useValue: ctx }],
    });
    const injector = TestBed.inject(EnvironmentInjector);
    const [, safeToRemove] = runInInjectionContext(injector, () => usePresence());

    // Set exit callback after registration so it doesn't fire immediately
    const exitComplete = vi.fn();
    ctx.setExitCompleteCallback(exitComplete);
    expect(exitComplete).not.toHaveBeenCalled();

    safeToRemove();
    expect(exitComplete).toHaveBeenCalledOnce();
  });

  it('tracks presence changes reactively', () => {
    const ctx = createPresenceContext(true);
    TestBed.configureTestingModule({
      providers: [{ provide: PRESENCE_CONTEXT, useValue: ctx }],
    });
    const injector = TestBed.inject(EnvironmentInjector);
    const [isPresent] = runInInjectionContext(injector, () => usePresence());
    expect(isPresent()).toBe(true);
    ctx.isPresent$.set(false);
    expect(isPresent()).toBe(false);
  });
});
