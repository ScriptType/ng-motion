import '../test-env';
import { Component } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NgmMotionDirective } from './motion.directive';
import { MOTION_CONFIG, provideMotionConfig } from './motion-config';
import { _resetFeatureInit } from './feature-init';

// ─── Helpers ────────────────────────────────────────────────────────────────

function getDirective(
  fixture: ComponentFixture<unknown>,
  index = 0,
): NgmMotionDirective {
  const debugEls = fixture.debugElement.queryAll(By.directive(NgmMotionDirective));
  return debugEls[index].injector.get(NgmMotionDirective);
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('MotionConfig', () => {
  beforeEach(() => {
    _resetFeatureInit();
  });

  it('token provides config object correctly', () => {
    const config = { transition: { duration: 0.8 } };

    TestBed.configureTestingModule({
      providers: [provideMotionConfig(config)],
    });

    const injected = TestBed.inject(MOTION_CONFIG);
    expect(injected).toBe(config);
  });

  it('provideMotionConfig returns valid Provider', () => {
    const config = { transition: { duration: 1 } };
    const provider = provideMotionConfig(config);

    expect(provider).toEqual(
      expect.objectContaining({
        provide: MOTION_CONFIG,
        useValue: config,
      }),
    );
  });

  it('nested providers — component-level overrides app-level', () => {
    @Component({
      template: `<div ngmMotion [animate]="{opacity: 1}"></div>`,
      imports: [NgmMotionDirective],
      providers: [provideMotionConfig({ transition: { duration: 0.5 } })],
    })
    class ChildHost {}

    TestBed.configureTestingModule({
      imports: [ChildHost],
      providers: [provideMotionConfig({ transition: { duration: 1 } })],
    });

    const fixture = TestBed.createComponent(ChildHost);
    fixture.detectChanges();

    const dir = getDirective(fixture);
    // Component-level config (0.5) should override module-level (1)
    expect(dir.ve?.getProps().transition).toEqual({ duration: 0.5 });
  });

  it('config without transition — directive works normally', () => {
    @Component({
      template: `<div ngmMotion [animate]="{opacity: 1}"></div>`,
      imports: [NgmMotionDirective],
      providers: [provideMotionConfig({ reducedMotion: 'user' })],
    })
    class Host {}

    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();

    const dir = getDirective(fixture);
    expect(dir.ve).not.toBeNull();
    // No transition from config, no transition input — should be undefined
    expect(dir.ve?.getProps().transition).toBeUndefined();
  });

  it('config with reducedMotion — accessible via injection', () => {
    const config = { reducedMotion: 'always' as const };

    TestBed.configureTestingModule({
      providers: [provideMotionConfig(config)],
    });

    const injected = TestBed.inject(MOTION_CONFIG);
    expect(injected.reducedMotion).toBe('always');
  });

  it('multiple directives share same config transition', () => {
    @Component({
      template: `
        <div ngmMotion [animate]="{opacity: 1}"></div>
        <div ngmMotion [animate]="{x: 100}"></div>
      `,
      imports: [NgmMotionDirective],
      providers: [provideMotionConfig({ transition: { duration: 0.3 } })],
    })
    class Host {}

    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();

    const dir0 = getDirective(fixture, 0);
    const dir1 = getDirective(fixture, 1);

    const ve0 = dir0.ve;
    const ve1 = dir1.ve;
    expect(ve0).not.toBeNull();
    expect(ve1).not.toBeNull();
    expect(ve0?.getProps().transition).toEqual({ duration: 0.3 });
    expect(ve1?.getProps().transition).toEqual({ duration: 0.3 });
  });
});
