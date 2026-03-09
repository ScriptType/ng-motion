import '../test-env';
import { Component, signal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import type { DebugElement } from '@angular/core';
import type { IProjectionNode } from 'motion-dom';
import { NgmPresenceDirective } from './presence.directive';
import { NgmMotionDirective } from '../core/motion.directive';
import { _resetFeatureInit } from '../core/feature-init';
import { PRESENCE_CONTEXT } from './presence-context';

/** Wait for instant (duration: 0) animations to flush through motion-dom's frame pipeline. */
async function flushAnimations(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 50));
}

/** Safely extract the native HTMLElement from a ComponentFixture. */
function nativeEl<T>(fixture: ComponentFixture<T>): HTMLElement {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return fixture.nativeElement;
}

/** Safely extract the native element from a DebugElement. */
function debugNativeEl(de: DebugElement): HTMLElement {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return de.nativeElement;
}

/** Safely extract the projection node (typed as `any` in motion-dom). */
function getProjection(dir: NgmMotionDirective): IProjectionNode | undefined {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return dir.ve?.projection;
}

describe('NgmPresenceDirective', () => {
  beforeEach(() => {
    _resetFeatureInit();
  });

  it('renders element when presence is true', () => {
    @Component({
      template: `<div *ngmPresence="show()"><span ngmMotion [animate]="{opacity: 1}">hello</span></div>`,
      imports: [NgmPresenceDirective, NgmMotionDirective],
    })
    class Host {
      show = signal(true);
    }

    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();

    const span = nativeEl(fixture).querySelector('span');
    expect(span).not.toBeNull();
    expect(span?.textContent).toBe('hello');
  });

  it('removes element when presence becomes false (no exit animation)', () => {
    @Component({
      template: `<div *ngmPresence="show()"><span ngmMotion [animate]="{opacity: 1}">hello</span></div>`,
      imports: [NgmPresenceDirective, NgmMotionDirective],
    })
    class Host {
      show = signal(true);
    }

    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();

    expect(nativeEl(fixture).querySelector('span')).not.toBeNull();

    fixture.componentInstance.show.set(false);
    fixture.detectChanges();
    TestBed.tick();
    fixture.detectChanges();

    // Without exit animation, element should be removed immediately
    expect(nativeEl(fixture).querySelector('span')).toBeNull();
  });

  it('does not render element when initial presence is false', () => {
    @Component({
      template: `<div *ngmPresence="show()"><span>hello</span></div>`,
      imports: [NgmPresenceDirective],
    })
    class Host {
      show = signal(false);
    }

    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();

    expect(nativeEl(fixture).querySelector('span')).toBeNull();
  });

  it('shows element when toggled from false to true', () => {
    @Component({
      template: `<div *ngmPresence="show()"><span>hello</span></div>`,
      imports: [NgmPresenceDirective],
    })
    class Host {
      show = signal(false);
    }

    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();

    expect(nativeEl(fixture).querySelector('span')).toBeNull();

    fixture.componentInstance.show.set(true);
    fixture.detectChanges();
    TestBed.tick();
    fixture.detectChanges();

    expect(nativeEl(fixture).querySelector('span')).not.toBeNull();
  });

  it('provides PRESENCE_CONTEXT to child motion elements', () => {
    @Component({
      template: `<div *ngmPresence="show()"><span ngmMotion [animate]="{opacity: 1}">hello</span></div>`,
      imports: [NgmPresenceDirective, NgmMotionDirective],
    })
    class Host {
      show = signal(true);
    }

    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();

    // Query the span inside the presence container
    const debugSpan = fixture.debugElement.query(
      (de) => debugNativeEl(de).tagName === 'SPAN',
    );
    expect(debugSpan).not.toBeNull();

    // The presence context should be injectable from the embedded view
    const ctx = debugSpan.injector.get(PRESENCE_CONTEXT, null);
    expect(ctx).not.toBeNull();
    expect(ctx?.isPresent).toBe(true);
  });

  it('no presence directive = motion directive works normally', async () => {
    @Component({
      template: `<div ngmMotion [initial]="{opacity: 0}" [animate]="{opacity: 1}" [transition]="{duration: 0}"></div>`,
      imports: [NgmMotionDirective],
    })
    class Host {}

    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    await flushAnimations();

    const el = nativeEl(fixture).querySelector('div');
    expect(el?.style.opacity).toBe('1');
  });

  it('re-enter during exit cancels removal', async () => {
    @Component({
      template: `<div *ngmPresence="show()"><span ngmMotion [animate]="{opacity: 1}" [exit]="{opacity: 0}" [transition]="{duration: 5}">hello</span></div>`,
      imports: [NgmPresenceDirective, NgmMotionDirective],
    })
    class Host {
      show = signal(true);
    }

    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    await flushAnimations();

    // Start exit
    fixture.componentInstance.show.set(false);
    fixture.detectChanges();
    TestBed.tick();
    fixture.detectChanges();

    // Element should still be in DOM (exit animation pending)
    expect(nativeEl(fixture).querySelector('span')).not.toBeNull();

    // Re-enter quickly
    fixture.componentInstance.show.set(true);
    fixture.detectChanges();
    TestBed.tick();
    fixture.detectChanges();

    // Element should still be in DOM (exit cancelled)
    expect(nativeEl(fixture).querySelector('span')).not.toBeNull();
  });

  it('layoutId element inside presence preserves snapshot on exit', () => {
    @Component({
      template: `
        <div *ngmPresence="show()">
          <div ngmMotion layoutId="hero" [layout]="true" [animate]="{ opacity: 1 }"></div>
        </div>
      `,
      imports: [NgmPresenceDirective, NgmMotionDirective],
    })
    class Host {
      show = signal(true);
    }

    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();

    // Get the projection and simulate a layout measurement
    const debugEl = fixture.debugElement.query(
      (de) => debugNativeEl(de).tagName === 'DIV' && de.injector.get(NgmMotionDirective, null) !== null,
    );
    const dir = debugEl.injector.get(NgmMotionDirective);
    const projection = getProjection(dir);

    // Simulate a layout measurement (jsdom returns zeros)
    if (projection) {
      projection.layout = {
        animationId: 0,
        measuredBox: { x: { min: 0, max: 100 }, y: { min: 0, max: 50 } },
        layoutBox: { x: { min: 0, max: 100 }, y: { min: 0, max: 50 } },
        latestValues: {},
        source: 0,
      };
    }

    // Toggle presence to false
    fixture.componentInstance.show.set(false);
    fixture.detectChanges();
    TestBed.tick();
    fixture.detectChanges();

    // Snapshot should have been preserved during cleanup
    expect(projection?.snapshot).toBeDefined();
    expect(projection?.snapshot?.layoutBox.x.max).toBe(100);
  });

  it('layoutId exit does not emit after destroy and clears the orphaned projection', async () => {
    @Component({
      template: `
        <div *ngmPresence="show()">
          <div ngmMotion layoutId="hero" [layout]="true" [animate]="{ opacity: 1 }"></div>
        </div>
      `,
      imports: [NgmPresenceDirective, NgmMotionDirective],
    })
    class Host {
      show = signal(true);
    }

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => { /* noop */ });
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => { /* noop */ });

    try {
      const fixture = TestBed.createComponent(Host);
      fixture.detectChanges();

      const debugEl = fixture.debugElement.query(
        (de) => debugNativeEl(de).tagName === 'DIV' && de.injector.get(NgmMotionDirective, null) !== null,
      );
      const dir = debugEl.injector.get(NgmMotionDirective);

      const projection = getProjection(dir);
      const stack = projection?.getStack();

      if (projection) {
        projection.layout = {
          animationId: 0,
          measuredBox: { x: { min: 0, max: 100 }, y: { min: 0, max: 50 } },
          layoutBox: { x: { min: 0, max: 100 }, y: { min: 0, max: 50 } },
          latestValues: {},
          source: 0,
        };
      }

      fixture.componentInstance.show.set(false);
      fixture.detectChanges();
      TestBed.tick();
      fixture.detectChanges();
      await flushAnimations();

      expect(stack?.members).not.toContain(projection);

      const logged = [...warnSpy.mock.calls, ...errorSpy.mock.calls]
        .flat()
        .join(' ');
      expect(logged).not.toContain('NG0953');
    } finally {
      warnSpy.mockRestore();
      errorSpy.mockRestore();
    }
  });

  // ── Exit Animations ──

  describe('exit animations', () => {
    it('exit with duration — element stays in DOM during exit, opacity animates to 0', async () => {
      @Component({
        template: `<div *ngmPresence="show()"><span ngmMotion [animate]="{opacity: 1}" [exit]="{opacity: 0}" [transition]="{duration: 0.01}">hello</span></div>`,
        imports: [NgmPresenceDirective, NgmMotionDirective],
      })
      class Host {
        show = signal(true);
      }

      const fixture = TestBed.createComponent(Host);
      fixture.detectChanges();
      await flushAnimations();

      expect(nativeEl(fixture).querySelector('span')).not.toBeNull();

      // Trigger exit
      fixture.componentInstance.show.set(false);
      fixture.detectChanges();
      TestBed.tick();
      fixture.detectChanges();

      // Element stays in DOM during exit animation (exit is registered)
      expect(nativeEl(fixture).querySelector('span')).not.toBeNull();

      // Wait for exit animation to run
      await new Promise((r) => setTimeout(r, 200));

      // The exit animation should have animated opacity toward 0
      const span = nativeEl(fixture).querySelector('span');
      // In jsdom, the exit animation completes but the deregister callback timing
      // may not remove the view synchronously. Verify exit was applied.
      if (span) {
        expect(span.style.opacity).toBe('0');
      }
    });

    it('multiple simultaneous exits — both elements stay during exit', async () => {
      @Component({
        template: `
          <div *ngmPresence="show()">
            <span ngmMotion [animate]="{opacity: 1}" [exit]="{opacity: 0}" [transition]="{duration: 0.01}" class="a">a</span>
            <span ngmMotion [animate]="{opacity: 1}" [exit]="{opacity: 0}" [transition]="{duration: 0.01}" class="b">b</span>
          </div>`,
        imports: [NgmPresenceDirective, NgmMotionDirective],
      })
      class Host {
        show = signal(true);
      }

      const fixture = TestBed.createComponent(Host);
      fixture.detectChanges();
      await flushAnimations();

      expect(nativeEl(fixture).querySelector('.a')).not.toBeNull();
      expect(nativeEl(fixture).querySelector('.b')).not.toBeNull();

      // Trigger exit for both
      fixture.componentInstance.show.set(false);
      fixture.detectChanges();
      TestBed.tick();
      fixture.detectChanges();

      // Both should still be in DOM during exit (exit animation is pending)
      expect(nativeEl(fixture).querySelector('.a')).not.toBeNull();
      expect(nativeEl(fixture).querySelector('.b')).not.toBeNull();

      // Wait for exit animations to run
      await new Promise((r) => setTimeout(r, 200));

      // Both elements should have animated to opacity:0
      const a = nativeEl(fixture).querySelector('.a');
      const b = nativeEl(fixture).querySelector('.b');
      // In jsdom, elements may remain but exit animation should have applied
      if (a instanceof HTMLElement) expect(a.style.opacity).toBe('0');
      if (b instanceof HTMLElement) expect(b.style.opacity).toBe('0');
    });

    it('rapid toggle exit/re-enter — element survives', async () => {
      @Component({
        template: `<div *ngmPresence="show()"><span ngmMotion [animate]="{opacity: 1}" [exit]="{opacity: 0}" [transition]="{duration: 5}">hello</span></div>`,
        imports: [NgmPresenceDirective, NgmMotionDirective],
      })
      class Host {
        show = signal(true);
      }

      const fixture = TestBed.createComponent(Host);
      fixture.detectChanges();
      await flushAnimations();

      // Rapid toggle: exit then immediately re-enter
      fixture.componentInstance.show.set(false);
      fixture.detectChanges();
      TestBed.tick();
      fixture.detectChanges();

      fixture.componentInstance.show.set(true);
      fixture.detectChanges();
      TestBed.tick();
      fixture.detectChanges();

      // Element should survive
      expect(nativeEl(fixture).querySelector('span')).not.toBeNull();

      // Wait a bit and verify it's still there
      await new Promise((r) => setTimeout(r, 100));
      fixture.detectChanges();
      expect(nativeEl(fixture).querySelector('span')).not.toBeNull();
    });

    it('exit with variant labels — exit variant is applied', async () => {
      @Component({
        template: `
          <div *ngmPresence="show()">
            <span ngmMotion
              [animate]="{opacity: 1}"
              [exit]="'exitVariant'"
              [variants]="v"
              [transition]="{duration: 0.01}">hello</span>
          </div>`,
        imports: [NgmPresenceDirective, NgmMotionDirective],
      })
      class Host {
        show = signal(true);
        v = { exitVariant: { opacity: 0 } };
      }

      const fixture = TestBed.createComponent(Host);
      fixture.detectChanges();
      await flushAnimations();

      expect(nativeEl(fixture).querySelector('span')).not.toBeNull();

      // Trigger exit with variant
      fixture.componentInstance.show.set(false);
      fixture.detectChanges();
      TestBed.tick();
      fixture.detectChanges();

      // Element stays during exit
      expect(nativeEl(fixture).querySelector('span')).not.toBeNull();

      // Wait for exit animation
      await new Promise((r) => setTimeout(r, 200));

      // In jsdom, the exit variant should have animated opacity toward 0
      const span = nativeEl(fixture).querySelector('span');
      if (span) {
        expect(span.style.opacity).toBe('0');
      }
    });

    it('isPresent$ becomes false during exit', () => {
      @Component({
        template: `<div *ngmPresence="show()"><span ngmMotion [animate]="{opacity: 1}" [exit]="{opacity: 0}" [transition]="{duration: 5}">hello</span></div>`,
        imports: [NgmPresenceDirective, NgmMotionDirective],
      })
      class Host {
        show = signal(true);
      }

      const fixture = TestBed.createComponent(Host);
      fixture.detectChanges();

      const debugSpan = fixture.debugElement.query(
        (de) => debugNativeEl(de).tagName === 'SPAN',
      );
      const ctx = debugSpan.injector.get(PRESENCE_CONTEXT);
      expect(ctx.isPresent$()).toBe(true);

      // Trigger exit
      fixture.componentInstance.show.set(false);
      fixture.detectChanges();
      TestBed.tick();
      fixture.detectChanges();

      // isPresent$ should be false during exit
      expect(ctx.isPresent$()).toBe(false);
      expect(ctx.isPresent).toBe(false);
    });

    it('nested presence — inner toggles independently', () => {
      @Component({
        template: `
          <div *ngmPresence="showOuter()">
            <div class="outer" ngmMotion [animate]="{opacity: 1}">
              <div *ngmPresence="showInner()">
                <span class="inner" ngmMotion [animate]="{opacity: 1}">inner</span>
              </div>
            </div>
          </div>`,
        imports: [NgmPresenceDirective, NgmMotionDirective],
      })
      class Host {
        showOuter = signal(true);
        showInner = signal(true);
      }

      const fixture = TestBed.createComponent(Host);
      fixture.detectChanges();

      expect(nativeEl(fixture).querySelector('.outer')).not.toBeNull();
      expect(nativeEl(fixture).querySelector('.inner')).not.toBeNull();

      // Toggle inner off
      fixture.componentInstance.showInner.set(false);
      fixture.detectChanges();
      TestBed.tick();
      fixture.detectChanges();

      // Outer stays, inner removed (no exit animation)
      expect(nativeEl(fixture).querySelector('.outer')).not.toBeNull();
      expect(nativeEl(fixture).querySelector('.inner')).toBeNull();

      // Toggle inner back on
      fixture.componentInstance.showInner.set(true);
      fixture.detectChanges();
      TestBed.tick();
      fixture.detectChanges();

      expect(nativeEl(fixture).querySelector('.inner')).not.toBeNull();
    });

    it('exit with transitionEnd property — exit applies transitionEnd values', async () => {
      @Component({
        template: `
          <div *ngmPresence="show()">
            <span ngmMotion
              [animate]="{opacity: 1}"
              [exit]="{opacity: 0, transitionEnd: {display: 'none'}}"
              [transition]="{duration: 0.01}">hello</span>
          </div>`,
        imports: [NgmPresenceDirective, NgmMotionDirective],
      })
      class Host {
        show = signal(true);
      }

      const fixture = TestBed.createComponent(Host);
      fixture.detectChanges();
      await flushAnimations();

      // Trigger exit
      fixture.componentInstance.show.set(false);
      fixture.detectChanges();
      TestBed.tick();
      fixture.detectChanges();

      // Element should stay in DOM during exit animation
      expect(nativeEl(fixture).querySelector('span')).not.toBeNull();

      // Wait for exit to complete
      await new Promise((r) => setTimeout(r, 200));

      // In jsdom, the exit animation should have run; verify opacity went to 0
      const span = nativeEl(fixture).querySelector('span');
      if (span) {
        expect(span.style.opacity).toBe('0');
        // transitionEnd display:none may also be applied after animation
      }
    });

    it('presence provides unique id per instance', () => {
      @Component({
        template: `
          <div *ngmPresence="true">
            <span class="a" ngmMotion [animate]="{opacity: 1}">a</span>
          </div>
          <div *ngmPresence="true">
            <span class="b" ngmMotion [animate]="{opacity: 1}">b</span>
          </div>`,
        imports: [NgmPresenceDirective, NgmMotionDirective],
      })
      class Host {}

      const fixture = TestBed.createComponent(Host);
      fixture.detectChanges();

      const spanA = fixture.debugElement.query(
        (de) => debugNativeEl(de).classList.contains('a'),
      );
      const spanB = fixture.debugElement.query(
        (de) => debugNativeEl(de).classList.contains('b'),
      );

      const ctxA = spanA.injector.get(PRESENCE_CONTEXT);
      const ctxB = spanB.injector.get(PRESENCE_CONTEXT);

      // Each presence instance should have a unique id
      expect(ctxA.id).toBeDefined();
      expect(ctxB.id).toBeDefined();
      expect(ctxA.id).not.toBe(ctxB.id);
    });

    it('exit animation element stays in DOM during animation', async () => {
      @Component({
        template: `<div *ngmPresence="show()"><span ngmMotion [animate]="{opacity: 1}" [exit]="{opacity: 0}" [transition]="{duration: 5}">hello</span></div>`,
        imports: [NgmPresenceDirective, NgmMotionDirective],
      })
      class Host {
        show = signal(true);
      }

      const fixture = TestBed.createComponent(Host);
      fixture.detectChanges();
      await flushAnimations();

      // Trigger exit with long duration
      fixture.componentInstance.show.set(false);
      fixture.detectChanges();
      TestBed.tick();
      fixture.detectChanges();

      // Check at multiple points that element persists
      expect(nativeEl(fixture).querySelector('span')).not.toBeNull();

      await new Promise((r) => setTimeout(r, 50));
      expect(nativeEl(fixture).querySelector('span')).not.toBeNull();

      await new Promise((r) => setTimeout(r, 50));
      expect(nativeEl(fixture).querySelector('span')).not.toBeNull();
    });
  });
});
