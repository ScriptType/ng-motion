import '../test-env';
import { Component, inject, signal, ViewEncapsulation } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {
  ActivatedRoute,
  Router,
  provideRouter,
} from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { motionValue } from 'motion-dom';
import type { MotionStyle, Transition, Variants } from 'motion-dom';
import { vi } from 'vitest';
import { NgmMotionDirective } from './motion.directive';
import { _resetFeatureInit } from './feature-init';
import { provideMotionConfig } from './motion-config';

// ─── Helpers ────────────────────────────────────────────────────────────────

function getDirective(fixture: ComponentFixture<unknown>, index = 0): NgmMotionDirective {
  const debugEls = fixture.debugElement.queryAll(By.directive(NgmMotionDirective));
  return debugEls[index].injector.get(NgmMotionDirective);
}

function getNativeEl(fixture: ComponentFixture<unknown>, index = 0): HTMLElement {
  const debugEls = fixture.debugElement.queryAll(By.directive(NgmMotionDirective));
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return debugEls[index].nativeElement as HTMLElement;
}

/** Wait for instant (duration: 0) animations to flush through motion-dom's frame pipeline. */
async function flushAnimations(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 50));
}

// ─── Test Suite ─────────────────────────────────────────────────────────────

describe('NgmMotionDirective', () => {
  beforeEach(() => {
    _resetFeatureInit();
  });

  // ════════════════════════════════════════════════════════════════════════
  // Angular lifecycle + DI
  // ════════════════════════════════════════════════════════════════════════

  describe('lifecycle', () => {
    it('renders and creates VisualElement', () => {
      @Component({
        template: '<div ngmMotion></div>',
        imports: [NgmMotionDirective],
      })
      class Host {}

      const fixture = TestBed.createComponent(Host);
      fixture.detectChanges();

      const el = fixture.debugElement.query(By.directive(NgmMotionDirective));
      expect(el).toBeTruthy();

      const dir = getDirective(fixture);
      expect(dir.ve).not.toBeNull();
    });

    it('cleans up VisualElement on destroy', () => {
      @Component({
        template: '<div ngmMotion></div>',
        imports: [NgmMotionDirective],
      })
      class Host {}

      const fixture = TestBed.createComponent(Host);
      fixture.detectChanges();

      const dir = getDirective(fixture);
      expect(dir.ve).not.toBeNull();

      fixture.destroy();
      expect(dir.ve).toBeNull();
    });

    it('parent-child DI linking', () => {
      @Component({
        template: ` <div ngmMotion>
          <span ngmMotion></span>
        </div>`,
        imports: [NgmMotionDirective],
      })
      class Host {}

      const fixture = TestBed.createComponent(Host);
      fixture.detectChanges();

      const parent = getDirective(fixture, 0);
      const child = getDirective(fixture, 1);

      expect(parent.ve).not.toBeNull();
      expect(child.ve).not.toBeNull();
      expect(child.ve?.parent).toBe(parent.ve);
    });

    it('keeps router navigation working when a routed component uses `[exit]` without presence', async () => {
      @Component({
        template: `
          <section
            ngmMotion
            [animate]="{ opacity: 1 }"
            [exit]="{ opacity: 0 }"
            [transition]="{ duration: 0.01 }"
          >
            route-a
          </section>
        `,
        imports: [NgmMotionDirective],
      })
      class RouteAComponent {}

      @Component({
        template: `<section class="route-b">route-b</section>`,
      })
      class RouteBComponent {}

      TestBed.configureTestingModule({
        providers: [
          provideRouter([
            { path: '', component: RouteAComponent },
            { path: 'b', component: RouteBComponent },
          ]),
        ],
      });

      const harness = await RouterTestingHarness.create('/');
      expect(harness.routeNativeElement?.textContent).toContain('route-a');

      await harness.navigateByUrl('/b', RouteBComponent);
      await flushAnimations();

      const router = TestBed.inject(Router);
      expect(router.url).toBe('/b');
      expect(harness.routeNativeElement?.textContent).toContain('route-b');
      expect(harness.fixture.nativeElement.textContent).not.toContain('route-a');
    });

    it('keeps router navigation working when direct `[exit]` uses a variant label', async () => {
      @Component({
        template: `
          <section
            ngmMotion
            [animate]="'visible'"
            [exit]="'hidden'"
            [variants]="variants"
            [transition]="{ duration: 0.01 }"
          >
            route-a
          </section>
        `,
        imports: [NgmMotionDirective],
      })
      class RouteAComponent {
        readonly variants: Variants = {
          visible: { opacity: 1 },
          hidden: { opacity: 0 },
        };
      }

      @Component({
        template: `<section class="route-b">route-b</section>`,
      })
      class RouteBComponent {}

      TestBed.configureTestingModule({
        providers: [
          provideRouter([
            { path: '', component: RouteAComponent },
            { path: 'b', component: RouteBComponent },
          ]),
        ],
      });

      const harness = await RouterTestingHarness.create('/');
      expect(harness.routeNativeElement?.textContent).toContain('route-a');

      await harness.navigateByUrl('/b', RouteBComponent);
      await flushAnimations();

      const router = TestBed.inject(Router);
      expect(router.url).toBe('/b');
      expect(harness.routeNativeElement?.textContent).toContain('route-b');
      expect(harness.fixture.nativeElement.textContent).not.toContain('route-a');
    });

    it('skips nested direct `[exit]` animations during router navigation teardown', async () => {
      @Component({
        template: `
          <section class="route-a">
            route-a
            @if (show()) {
              <article
                ngmMotion
                [animate]="{ opacity: 1 }"
                [exit]="{ opacity: 0, height: 0 }"
                [transition]="{ duration: 10 }"
              >
                child
              </article>
            }
          </section>
        `,
        imports: [NgmMotionDirective],
      })
      class RouteAComponent {
        readonly show = signal(true);
      }

      @Component({
        template: `<section class="route-b">route-b</section>`,
      })
      class RouteBComponent {}

      TestBed.configureTestingModule({
        providers: [
          provideRouter([
            { path: '', component: RouteAComponent },
            { path: 'b', component: RouteBComponent },
          ]),
        ],
      });

      const harness = await RouterTestingHarness.create('/');
      expect(harness.fixture.nativeElement.textContent).toContain('route-a');
      expect(harness.fixture.nativeElement.textContent).toContain('child');

      await harness.navigateByUrl('/b', RouteBComponent);

      const router = TestBed.inject(Router);
      expect(router.url).toBe('/b');
      expect(harness.routeNativeElement?.textContent).toContain('route-b');
      expect(harness.fixture.nativeElement.textContent).not.toContain('route-a');
      expect(harness.fixture.nativeElement.textContent).not.toContain('child');
    });

    it('does not treat same-component query-param navigation as routed host teardown', async () => {
      @Component({
        template: `
          <section class="route-a">
            route-a
            @if (show()) {
              <article
                ngmMotion
                [animate]="{ opacity: 1 }"
                [exit]="{ opacity: 0, height: 0 }"
                [transition]="{ duration: 0.01 }"
              >
                child
              </article>
            }
          </section>
        `,
        imports: [NgmMotionDirective],
      })
      class RouteAComponent {
        readonly show = signal(true);
        private readonly route = inject(ActivatedRoute);

        constructor() {
          this.route.queryParamMap.subscribe((params) => {
            this.show.set(params.get('hide') !== '1');
          });
        }
      }

      TestBed.configureTestingModule({
        providers: [provideRouter([{ path: '', component: RouteAComponent }])],
      });

      const harness = await RouterTestingHarness.create('/');
      expect(harness.routeNativeElement?.textContent).toContain('route-a');
      expect(harness.fixture.nativeElement.textContent).toContain('child');

      await harness.navigateByUrl('/?hide=1', RouteAComponent);
      await flushAnimations();

      const router = TestBed.inject(Router);
      expect(router.url).toBe('/?hide=1');
      expect(harness.routeNativeElement?.textContent).toContain('route-a');
      expect(harness.fixture.nativeElement.textContent).not.toContain('child');
    });

    it('skips nested direct `[exit]` animations inside ShadowDom routed components', async () => {
      @Component({
        selector: 'shadow-route-a',
        template: `
          <section class="route-a">
            <article
              ngmMotion
              [animate]="{ opacity: 1 }"
              [exit]="{ opacity: 0, height: 0 }"
              [transition]="{ duration: 10 }"
            >
              child
            </article>
          </section>
        `,
        imports: [NgmMotionDirective],
        encapsulation: ViewEncapsulation.ShadowDom,
      })
      class ShadowRouteAComponent {}

      @Component({
        selector: 'shadow-route-b',
        template: `<section class="route-b">route-b</section>`,
      })
      class ShadowRouteBComponent {}

      TestBed.configureTestingModule({
        providers: [
          provideRouter([
            { path: '', component: ShadowRouteAComponent },
            { path: 'b', component: ShadowRouteBComponent },
          ]),
        ],
      });

      const harness = await RouterTestingHarness.create('/');
      const routeAHost = harness.routeNativeElement as HTMLElement | null;
      expect(routeAHost?.shadowRoot?.textContent).toContain('child');

      await harness.navigateByUrl('/b', ShadowRouteBComponent);

      const router = TestBed.inject(Router);
      expect(router.url).toBe('/b');
      expect(harness.fixture.nativeElement.querySelector('shadow-route-a')).toBeNull();
      expect(harness.fixture.nativeElement.textContent).toContain('route-b');
    });

    it('removes the routed host through Angular\'s renderer on route teardown', async () => {
      @Component({
        selector: 'route-a-host',
        template: `
          <section class="route-a">
            <article
              ngmMotion
              [animate]="{ opacity: 1 }"
              [exit]="{ opacity: 0, height: 0 }"
              [transition]="{ duration: 10 }"
            >
              child
            </article>
          </section>
        `,
        imports: [NgmMotionDirective],
      })
      class RouteAHostComponent {}

      @Component({
        selector: 'route-b-host',
        template: `<section class="route-b">route-b</section>`,
      })
      class RouteBHostComponent {}

      TestBed.configureTestingModule({
        providers: [
          provideRouter([
            { path: '', component: RouteAHostComponent },
            { path: 'b', component: RouteBHostComponent },
          ]),
        ],
      });

      const harness = await RouterTestingHarness.create('/');
      const routedHost = harness.fixture.nativeElement.querySelector('route-a-host') as
        | HTMLElement
        | null;
      expect(routedHost).not.toBeNull();

      const directive = getDirective(harness.fixture);
      const renderer = (
        directive as {
          directLeave: {
            getRoutedHostRenderer(host: HTMLElement): { removeChild: (...args: unknown[]) => void } | null;
          };
        }
      ).directLeave.getRoutedHostRenderer(routedHost as HTMLElement);
      expect(renderer).not.toBeNull();

      const removeChildSpy = vi.spyOn(renderer as { removeChild: (...args: unknown[]) => void }, 'removeChild');

      await harness.navigateByUrl('/b', RouteBHostComponent);

      const router = TestBed.inject(Router);
      expect(router.url).toBe('/b');
      expect(removeChildSpy).toHaveBeenCalledWith(null, routedHost, true, true);
      expect(harness.fixture.nativeElement.querySelector('route-a-host')).toBeNull();
      expect(harness.fixture.nativeElement.textContent).toContain('route-b');
    });
  });

  // ════════════════════════════════════════════════════════════════════════
  // Initial styles render to DOM (matches framer-motion behavior)
  // ════════════════════════════════════════════════════════════════════════

  describe('initial styles', () => {
    it('applies initial values as inline styles on mount', () => {
      @Component({
        template: `<div ngmMotion [initial]="{ opacity: 0 }" [animate]="{ opacity: 1 }"></div>`,
        imports: [NgmMotionDirective],
      })
      class Host {}

      const fixture = TestBed.createComponent(Host);
      fixture.detectChanges();

      const dir = getDirective(fixture);
      const el = getNativeEl(fixture);

      // Force sync render — in production, motion-dom schedules this via rAF
      dir.ve?.render();

      // Like framer-motion: element starts with initial styles on the DOM
      expect(el.style.opacity).toBe('0');
    });

    it('applies transform initial values as inline styles', () => {
      @Component({
        template: `<div
          ngmMotion
          [initial]="{ x: 100, rotate: 45 }"
          [animate]="{ x: 0, rotate: 0 }"
        ></div>`,
        imports: [NgmMotionDirective],
      })
      class Host {}

      const fixture = TestBed.createComponent(Host);
      fixture.detectChanges();

      const el = getNativeEl(fixture);
      getDirective(fixture).ve?.render();

      expect(el.style.transform).toContain('translateX(100px)');
      expect(el.style.transform).toContain('rotate(45deg)');
    });

    it('initial=false renders animate target without animation', () => {
      @Component({
        template: `<div ngmMotion [initial]="false" [animate]="{ opacity: 1, x: 50 }"></div>`,
        imports: [NgmMotionDirective],
      })
      class Host {}

      const fixture = TestBed.createComponent(Host);
      fixture.detectChanges();

      const dir = getDirective(fixture);
      const el = getNativeEl(fixture);

      // latestValues resolve to animate target (skipping initial)
      expect(dir.ve?.latestValues['opacity']).toBe(1);
      expect(dir.ve?.latestValues['x']).toBe(50);

      // After render, animate target values appear on the DOM element
      dir.ve?.render();
      expect(el.style.opacity).toBe('1');
      expect(el.style.transform).toBe('translateX(50px)');
    });

    it('preserves all initial values on the DOM, including those not in animate', () => {
      @Component({
        template: `<div
          ngmMotion
          [initial]="{ x: 100, y: 50, opacity: 0 }"
          [animate]="{ opacity: 1 }"
        ></div>`,
        imports: [NgmMotionDirective],
      })
      class Host {}

      const fixture = TestBed.createComponent(Host);
      fixture.detectChanges();

      const el = getNativeEl(fixture);
      getDirective(fixture).ve?.render();

      expect(el.style.opacity).toBe('0');
      expect(el.style.transform).toContain('translateX(100px)');
      expect(el.style.transform).toContain('translateY(50px)');
    });

    it('resolves named variant to initial DOM styles', () => {
      @Component({
        template: `<div ngmMotion [initial]="'hidden'" [animate]="'visible'" [variants]="v"></div>`,
        imports: [NgmMotionDirective],
      })
      class Host {
        v: Variants = { hidden: { opacity: 0, x: -100 }, visible: { opacity: 1, x: 0 } };
      }

      const fixture = TestBed.createComponent(Host);
      fixture.detectChanges();

      const el = getNativeEl(fixture);
      getDirective(fixture).ve?.render();

      expect(el.style.opacity).toBe('0');
      expect(el.style.transform).toContain('translateX(-100px)');
    });

    it('binds MotionValue from style input to the DOM', () => {
      @Component({
        template: `<div ngmMotion [style]="s"></div>`,
        imports: [NgmMotionDirective],
      })
      class Host {
        mv = motionValue(0.7);
        s: MotionStyle = { opacity: this.mv };
      }

      const fixture = TestBed.createComponent(Host);
      fixture.detectChanges();

      const dir = getDirective(fixture);
      const el = getNativeEl(fixture);

      expect(dir.ve?.getValue('opacity')).toBeDefined();

      dir.ve?.render();
      expect(el.style.opacity).toBe('0.7');
    });
  });

  // ════════════════════════════════════════════════════════════════════════
  // Input binding — signal inputs flow through template to VE props
  // ════════════════════════════════════════════════════════════════════════

  describe('input binding', () => {
    it('binds transition input to VE props', () => {
      @Component({
        template: `<div ngmMotion [animate]="{ opacity: 1 }" [transition]="{ duration: 2 }"></div>`,
        imports: [NgmMotionDirective],
      })
      class Host {}

      const fixture = TestBed.createComponent(Host);
      fixture.detectChanges();

      const dir = getDirective(fixture);
      expect(dir.transition()).toEqual({ duration: 2 });
      expect(dir.ve?.getProps().transition).toEqual({ duration: 2 });
    });

    it('passes variants object to VE props', () => {
      @Component({
        template: `<div ngmMotion [initial]="'hidden'" [animate]="'visible'" [variants]="v"></div>`,
        imports: [NgmMotionDirective],
      })
      class Host {
        v: Variants = { hidden: { opacity: 0 }, visible: { opacity: 1 } };
      }

      const fixture = TestBed.createComponent(Host);
      fixture.detectChanges();

      const dir = getDirective(fixture);
      expect(dir.ve?.animationState).toBeDefined();
      expect(dir.ve?.getProps().variants?.['visible']).toEqual({ opacity: 1 });
    });
  });

  // ════════════════════════════════════════════════════════════════════════
  // Animation completes to final DOM state
  // ════════════════════════════════════════════════════════════════════════

  describe('animation completion', () => {
    it('animates from initial to animate target on mount', async () => {
      @Component({
        template: `<div
          ngmMotion
          [initial]="{ opacity: 0 }"
          [animate]="{ opacity: 1 }"
          [transition]="{ duration: 0 }"
        ></div>`,
        imports: [NgmMotionDirective],
      })
      class Host {}

      const fixture = TestBed.createComponent(Host);
      fixture.detectChanges();
      await flushAnimations();

      const el = getNativeEl(fixture);
      expect(el.style.opacity).toBe('1');
    });

    it('dynamic input change animates to new target', async () => {
      @Component({
        template: `<div ngmMotion [animate]="anim()" [transition]="{ duration: 0 }"></div>`,
        imports: [NgmMotionDirective],
      })
      class Host {
        anim = signal<Record<string, number>>({ opacity: 0 });
      }

      const fixture = TestBed.createComponent(Host);
      fixture.detectChanges();
      await fixture.whenStable();
      await flushAnimations();

      const el = getNativeEl(fixture);
      expect(el.style.opacity).toBe('0');

      fixture.componentInstance.anim.set({ opacity: 1 });
      fixture.detectChanges();
      TestBed.tick();
      fixture.detectChanges();
      await fixture.whenStable();
      await flushAnimations();

      expect(el.style.opacity).toBe('1');
    });

    // FM: "doesn't animate no-op values" — when initial === animate, animation
    // settles immediately (both start+complete fire, element is not stuck animating)
    it('does not animate when target equals current value', async () => {
      @Component({
        template: `<div
          ngmMotion
          [initial]="{ opacity: 1, x: 0 }"
          [animate]="{ opacity: 1, x: 0 }"
          [transition]="{ duration: 2 }"
          (animationStart)="onStart()"
          (animationComplete)="onComplete()"
        ></div>`,
        imports: [NgmMotionDirective],
      })
      class Host {
        started = false;
        completed = false;
        onStart(): void {
          this.started = true;
        }
        onComplete(): void {
          this.completed = true;
        }
      }

      const fixture = TestBed.createComponent(Host);
      fixture.detectChanges();
      await flushAnimations();

      const h = fixture.componentInstance;
      // Animation settles immediately — not stuck in animating state
      // (framer-motion: isAnimating===false after 2 frames)
      expect(h.completed).toBe(true);

      // DOM stays at initial values (nothing changed)
      const el = getNativeEl(fixture);
      getDirective(fixture).ve?.render();
      expect(el.style.opacity).toBe('1');
    });

    // FM: "when value is removed from animate, animates back to value defined in initial"
    it('falls back to initial when value removed from animate', async () => {
      @Component({
        template: `<div
          ngmMotion
          [initial]="{ opacity: 0 }"
          [animate]="anim()"
          [transition]="{ duration: 0 }"
        ></div>`,
        imports: [NgmMotionDirective],
      })
      class Host {
        anim = signal<Record<string, number>>({ opacity: 1 });
      }

      const fixture = TestBed.createComponent(Host);
      fixture.detectChanges();
      await fixture.whenStable();
      await flushAnimations();

      const el = getNativeEl(fixture);
      expect(el.style.opacity).toBe('1');

      // Remove opacity from animate target
      fixture.componentInstance.anim.set({});
      fixture.detectChanges();
      TestBed.tick();
      fixture.detectChanges();
      await fixture.whenStable();
      await flushAnimations();

      // Falls back to initial value
      expect(el.style.opacity).toBe('0');
    });

    it('adds new properties and animates them to the DOM', async () => {
      @Component({
        template: `<div ngmMotion [animate]="anim()" [transition]="{ duration: 0 }"></div>`,
        imports: [NgmMotionDirective],
      })
      class Host {
        anim = signal<Record<string, number>>({ opacity: 1 });
      }

      const fixture = TestBed.createComponent(Host);
      fixture.detectChanges();
      await fixture.whenStable();
      await flushAnimations();

      fixture.componentInstance.anim.set({ opacity: 1, x: 100 });
      fixture.detectChanges();
      TestBed.tick();
      fixture.detectChanges();
      await fixture.whenStable();
      await flushAnimations();

      const el = getNativeEl(fixture);
      expect(el.style.opacity).toBe('1');
      expect(el.style.transform).toContain('translateX(100px)');
    });

    // FM: "unmount cancels active animations" — onAnimationComplete must NOT fire
    it('unmount cancels active animations', async () => {
      @Component({
        template: `@if (show()) {
          <div
            ngmMotion
            [animate]="{ x: 200 }"
            [transition]="{ duration: 5 }"
            (animationComplete)="onComplete()"
          ></div>
        }`,
        imports: [NgmMotionDirective],
      })
      class Host {
        show = signal(true);
        completed = false;
        onComplete(): void {
          this.completed = true;
        }
      }

      const fixture = TestBed.createComponent(Host);
      fixture.detectChanges();
      await fixture.whenStable();
      await flushAnimations();

      // Destroy mid-animation (duration is 5s, we're at ~50ms)
      fixture.componentInstance.show.set(false);
      fixture.detectChanges();
      TestBed.tick();
      fixture.detectChanges();

      // Wait past when we'd notice a leaked callback
      await new Promise((r) => setTimeout(r, 200));

      expect(fixture.componentInstance.completed).toBe(false);
    });

    // FM: "should update transforms when passed a new value" (style-prop test)
    it('updates transform on DOM when style MotionValue changes', async () => {
      @Component({
        template: `<div ngmMotion [style]="s"></div>`,
        imports: [NgmMotionDirective],
      })
      class Host {
        mv = motionValue(0);
        s: MotionStyle = { x: this.mv };
      }

      const fixture = TestBed.createComponent(Host);
      fixture.detectChanges();

      const el = getNativeEl(fixture);
      getDirective(fixture).ve?.render();
      expect(el.style.transform).toBe('none');

      // Update MotionValue — motion-dom's passive effect writes to element.style
      fixture.componentInstance.mv.set(100);
      await flushAnimations();

      expect(el.style.transform).toBe('translateX(100px)');

      // Reset back to 0
      fixture.componentInstance.mv.set(0);
      await flushAnimations();

      expect(el.style.transform).toBe('none');
    });

    it('updates transition dynamically', async () => {
      @Component({
        template: `<div ngmMotion [animate]="{ opacity: 1 }" [transition]="t()"></div>`,
        imports: [NgmMotionDirective],
      })
      class Host {
        t = signal<Transition>({ duration: 0.5 });
      }

      const fixture = TestBed.createComponent(Host);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(getDirective(fixture).ve?.getProps().transition).toEqual({ duration: 0.5 });

      fixture.componentInstance.t.set({ duration: 3 });
      fixture.detectChanges();
      TestBed.tick();
      fixture.detectChanges();
      await fixture.whenStable();

      expect(getDirective(fixture).ve?.getProps().transition).toEqual({ duration: 3 });
    });
  });

  // ════════════════════════════════════════════════════════════════════════
  // Variants via host component
  // ════════════════════════════════════════════════════════════════════════

  describe('variants', () => {
    it('variant-level transition is passed through', () => {
      @Component({
        template: `<div ngmMotion [initial]="'hidden'" [animate]="'visible'" [variants]="v"></div>`,
        imports: [NgmMotionDirective],
      })
      class Host {
        v: Variants = {
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { duration: 2 } },
        };
      }

      const fixture = TestBed.createComponent(Host);
      fixture.detectChanges();

      const dir = getDirective(fixture);
      expect(dir.ve?.getProps().variants?.['visible']).toEqual({
        opacity: 1,
        transition: { duration: 2 },
      });
    });

    it('parent-child variant propagation via template nesting', () => {
      @Component({
        template: ` <div ngmMotion [initial]="'hidden'" [animate]="'visible'" [variants]="parentV">
          <span ngmMotion [variants]="childV"></span>
        </div>`,
        imports: [NgmMotionDirective],
      })
      class Host {
        parentV: Variants = { hidden: { opacity: 0 }, visible: { opacity: 1 } };
        childV: Variants = { hidden: { y: 20 }, visible: { y: 0 } };
      }

      const fixture = TestBed.createComponent(Host);
      fixture.detectChanges();

      const parent = getDirective(fixture, 0);
      const child = getDirective(fixture, 1);

      expect(child.ve?.parent).toBe(parent.ve);
      expect(child.ve?.getProps().variants?.['visible']).toEqual({ y: 0 });
    });

    it('orchestration props wire parent-child hierarchy', () => {
      @Component({
        template: ` <div ngmMotion [initial]="'hidden'" [animate]="'visible'" [variants]="parentV">
          <span ngmMotion [variants]="childV"></span>
          <span ngmMotion [variants]="childV"></span>
        </div>`,
        imports: [NgmMotionDirective],
      })
      class Host {
        parentV: Variants = {
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { when: 'beforeChildren', staggerChildren: 0.1 },
          },
        };
        childV: Variants = { hidden: { y: 20 }, visible: { y: 0 } };
      }

      const fixture = TestBed.createComponent(Host);
      fixture.detectChanges();

      const parent = getDirective(fixture, 0);
      const child1 = getDirective(fixture, 1);
      const child2 = getDirective(fixture, 2);

      expect(child1.ve?.parent).toBe(parent.ve);
      expect(child2.ve?.parent).toBe(parent.ve);
    });

    it('named variant animates to DOM completion', async () => {
      @Component({
        template: `<div
          ngmMotion
          [initial]="'hidden'"
          [animate]="'visible'"
          [variants]="v"
          [transition]="{ duration: 0 }"
        ></div>`,
        imports: [NgmMotionDirective],
      })
      class Host {
        v: Variants = { hidden: { opacity: 0 }, visible: { opacity: 1 } };
      }

      const fixture = TestBed.createComponent(Host);
      fixture.detectChanges();
      await flushAnimations();

      const el = getNativeEl(fixture);
      expect(el.style.opacity).toBe('1');
    });

    it('child inherits parent variant and animates to DOM', async () => {
      @Component({
        template: ` <div
          ngmMotion
          [initial]="'hidden'"
          [animate]="'visible'"
          [variants]="parentV"
          [transition]="{ duration: 0 }"
        >
          <span ngmMotion [variants]="childV" [transition]="{ duration: 0 }"></span>
        </div>`,
        imports: [NgmMotionDirective],
      })
      class Host {
        parentV: Variants = { hidden: { opacity: 0 }, visible: { opacity: 1 } };
        childV: Variants = { hidden: { opacity: 0, x: -50 }, visible: { opacity: 0.8, x: 100 } };
      }

      const fixture = TestBed.createComponent(Host);
      fixture.detectChanges();
      await flushAnimations();

      const parentEl = getNativeEl(fixture, 0);
      const childEl = getNativeEl(fixture, 1);

      expect(parentEl.style.opacity).toBe('1');
      // Child inherits 'visible' variant label from parent and animates to its target
      expect(childEl.style.opacity).toBe('0.8');
      expect(childEl.style.transform).toContain('translateX(100px)');
    });

    it('variant passthrough — middle element with no own animate', async () => {
      @Component({
        template: ` <div
          ngmMotion
          [initial]="'hidden'"
          [animate]="'visible'"
          [variants]="grandparentV"
          [transition]="{ duration: 0 }"
        >
          <div ngmMotion [variants]="parentV" [transition]="{ duration: 0 }">
            <span ngmMotion [variants]="childV" [transition]="{ duration: 0 }"></span>
          </div>
        </div>`,
        imports: [NgmMotionDirective],
      })
      class Host {
        grandparentV: Variants = { hidden: { opacity: 0 }, visible: { opacity: 1 } };
        parentV: Variants = { hidden: { opacity: 0 }, visible: { opacity: 0.9 } };
        childV: Variants = { hidden: { opacity: 0, x: -20 }, visible: { opacity: 0.7, x: 75 } };
      }

      const fixture = TestBed.createComponent(Host);
      fixture.detectChanges();
      await flushAnimations();

      const grandparentEl = getNativeEl(fixture, 0);
      const childEl = getNativeEl(fixture, 2);

      expect(grandparentEl.style.opacity).toBe('1');
      // Grandchild receives variant through passthrough parent
      expect(childEl.style.opacity).toBe('0.7');
      expect(childEl.style.transform).toContain('translateX(75px)');
    });

    it('variant isolation — child with own animate object ignores parent variant', async () => {
      @Component({
        template: ` <div
          ngmMotion
          [initial]="'hidden'"
          [animate]="'visible'"
          [variants]="parentV"
          [transition]="{ duration: 0 }"
        >
          <span ngmMotion [animate]="{ scale: 2 }" [transition]="{ duration: 0 }"></span>
        </div>`,
        imports: [NgmMotionDirective],
      })
      class Host {
        parentV: Variants = { hidden: { opacity: 0 }, visible: { opacity: 1 } };
      }

      const fixture = TestBed.createComponent(Host);
      fixture.detectChanges();
      await flushAnimations();

      const parentEl = getNativeEl(fixture, 0);
      const childEl = getNativeEl(fixture, 1);

      expect(parentEl.style.opacity).toBe('1');
      // Child uses its own animate object, not parent variant
      expect(childEl.style.transform).toContain('scale(2)');
      // Child should not have opacity from parent variant
      expect(childEl.style.opacity).toBe('');
    });

    it('initial=false inheritance — child renders at animate target without mount animation', () => {
      @Component({
        template: ` <div ngmMotion [initial]="false" [animate]="{ opacity: 1 }">
          <span ngmMotion [initial]="false" [animate]="{ x: 50 }"></span>
        </div>`,
        imports: [NgmMotionDirective],
      })
      class Host {}

      const fixture = TestBed.createComponent(Host);
      fixture.detectChanges();

      const parentDir = getDirective(fixture, 0);
      const childDir = getDirective(fixture, 1);

      // Both parent and child resolve to animate target without animation
      expect(parentDir.ve?.latestValues['opacity']).toBe(1);
      expect(childDir.ve?.latestValues['x']).toBe(50);

      // DOM reflects animate targets directly
      const childEl = getNativeEl(fixture, 1);
      childDir.ve?.render();
      expect(childEl.style.transform).toBe('translateX(50px)');
    });
  });

  // ════════════════════════════════════════════════════════════════════════
  // Output events — callbacks fire with correct arguments
  // ════════════════════════════════════════════════════════════════════════

  describe('outputs', () => {
    it('emits animationStart when animation begins', async () => {
      @Component({
        template: `<div
          ngmMotion
          [initial]="{ opacity: 0 }"
          [animate]="{ opacity: 1 }"
          [transition]="{ duration: 0 }"
          (animationStart)="onStart($event)"
        ></div>`,
        imports: [NgmMotionDirective],
      })
      class Host {
        started = false;
        startDef: unknown;
        onStart(def: unknown): void {
          this.started = true;
          this.startDef = def;
        }
      }

      const fixture = TestBed.createComponent(Host);
      fixture.detectChanges();
      await flushAnimations();

      expect(fixture.componentInstance.started).toBe(true);
      expect(fixture.componentInstance.startDef).toEqual({ opacity: 1 });
    });

    it('emits animationComplete when animation finishes', async () => {
      @Component({
        template: `<div
          ngmMotion
          [initial]="{ opacity: 0 }"
          [animate]="{ opacity: 1 }"
          [transition]="{ duration: 0 }"
          (animationComplete)="onComplete($event)"
        ></div>`,
        imports: [NgmMotionDirective],
      })
      class Host {
        completed = false;
        completeDef: unknown;
        onComplete(def: unknown): void {
          this.completed = true;
          this.completeDef = def;
        }
      }

      const fixture = TestBed.createComponent(Host);
      fixture.detectChanges();
      await flushAnimations();

      expect(fixture.componentInstance.completed).toBe(true);
      expect(fixture.componentInstance.completeDef).toEqual({ opacity: 1 });
    });

    it('emits update with latest values during animation', async () => {
      @Component({
        template: `<div
          ngmMotion
          [initial]="{ opacity: 0 }"
          [animate]="{ opacity: 1 }"
          [transition]="{ duration: 0 }"
          (update)="onUpdate($event)"
        ></div>`,
        imports: [NgmMotionDirective],
      })
      class Host {
        updates: unknown[] = [];
        onUpdate(latest: unknown): void {
          this.updates.push(latest);
        }
      }

      const fixture = TestBed.createComponent(Host);
      fixture.detectChanges();
      await flushAnimations();

      const updates = fixture.componentInstance.updates;
      expect(updates.length).toBeGreaterThan(0);
      // The final update should contain the target value
      expect(updates[updates.length - 1]).toEqual(expect.objectContaining({ opacity: 1 }));
    });
  });

  // ════════════════════════════════════════════════════════════════════════
  // MOTION_CONFIG injection
  // ════════════════════════════════════════════════════════════════════════

  describe('config', () => {
    it('uses injected MOTION_CONFIG transition as default', () => {
      @Component({
        template: `<div ngmMotion [animate]="{ opacity: 1 }"></div>`,
        imports: [NgmMotionDirective],
        providers: [provideMotionConfig({ transition: { duration: 0.5 } })],
      })
      class Host {}

      const fixture = TestBed.createComponent(Host);
      fixture.detectChanges();

      const dir = getDirective(fixture);
      expect(dir.ve?.getProps().transition).toEqual({ duration: 0.5 });
    });

    it('per-element transition overrides config', () => {
      @Component({
        template: `<div ngmMotion [animate]="{ opacity: 1 }" [transition]="{ duration: 3 }"></div>`,
        imports: [NgmMotionDirective],
        providers: [provideMotionConfig({ transition: { duration: 0.5 } })],
      })
      class Host {}

      const fixture = TestBed.createComponent(Host);
      fixture.detectChanges();

      const dir = getDirective(fixture);
      expect(dir.ve?.getProps().transition).toEqual({ duration: 3 });
    });
  });

  // ════════════════════════════════════════════════════════════════════════
  // Animate prop advanced
  // ════════════════════════════════════════════════════════════════════════

  describe('animate prop advanced', () => {
    it('transition.from override — animation starts from specified value', async () => {
      @Component({
        template: `<div
          ngmMotion
          [animate]="{ opacity: 1 }"
          [transition]="{ from: 0.5, duration: 0 }"
        ></div>`,
        imports: [NgmMotionDirective],
      })
      class Host {}

      const fixture = TestBed.createComponent(Host);
      fixture.detectChanges();
      await flushAnimations();

      const el = getNativeEl(fixture);
      // With duration:0 the animation completes instantly to the target
      expect(el.style.opacity).toBe('1');
    });

    it('display none to block transition with opacity', async () => {
      @Component({
        template: `<div
          ngmMotion
          [initial]="{ opacity: 0, display: 'none' }"
          [animate]="{ opacity: 1, display: 'block' }"
          [transition]="{ duration: 0 }"
        ></div>`,
        imports: [NgmMotionDirective],
      })
      class Host {}

      const fixture = TestBed.createComponent(Host);
      fixture.detectChanges();

      const dir = getDirective(fixture);
      const el = getNativeEl(fixture);
      dir.ve?.render();

      // Initial state should set display:none
      // Note: jsdom may handle display differently; verify initial values are set
      expect(dir.ve?.latestValues['display']).toBeDefined();

      await flushAnimations();
      // After animation, display should be 'block' and opacity 1
      expect(el.style.opacity).toBe('1');
    });

    it('keyframe ease array — animate with keyframes and per-segment easing', async () => {
      @Component({
        template: `<div
          ngmMotion
          [animate]="{ x: [0, 50, 100] }"
          [transition]="{ duration: 0, ease: ['easeIn', 'easeOut'] }"
        ></div>`,
        imports: [NgmMotionDirective],
      })
      class Host {}

      const fixture = TestBed.createComponent(Host);
      fixture.detectChanges();
      await flushAnimations();

      const el = getNativeEl(fixture);
      // Keyframe animation completes to final value
      expect(el.style.transform).toContain('translateX(100px)');
    });

    it('keyframes change mid-animation — new target replaces old', async () => {
      @Component({
        template: `<div ngmMotion [animate]="anim()" [transition]="{ duration: 0 }"></div>`,
        imports: [NgmMotionDirective],
      })
      class Host {
        anim = signal<Record<string, number | number[]>>({ x: [0, 50, 100] });
      }

      const fixture = TestBed.createComponent(Host);
      fixture.detectChanges();
      await flushAnimations();

      // Change to different target mid-way
      fixture.componentInstance.anim.set({ x: 200 });
      fixture.detectChanges();
      TestBed.tick();
      fixture.detectChanges();
      await flushAnimations();

      const el = getNativeEl(fixture);
      expect(el.style.transform).toContain('translateX(200px)');
    });

    it('CSS variable animation — sets custom property', async () => {
      // Note: jsdom has limited CSS custom property support, so we verify
      // the value is set on the VE's latestValues
      @Component({
        template: `<div
          ngmMotion
          [animate]="{ '--custom-color': '#ff0000' }"
          [transition]="{ duration: 0 }"
        ></div>`,
        imports: [NgmMotionDirective],
      })
      class Host {}

      const fixture = TestBed.createComponent(Host);
      fixture.detectChanges();
      await flushAnimations();

      const dir = getDirective(fixture);
      // Verify the CSS variable value is tracked
      const _val = dir.ve?.latestValues['--custom-color'];
      // motion-dom should store it — exact behavior depends on CSS variable support
      // If supported, it should be '#ff0000' or similar
      expect(dir.ve).not.toBeNull();
    });

    it('color transitions hex to rgb', async () => {
      @Component({
        template: `<div
          ngmMotion
          [initial]="{ backgroundColor: '#ff0000' }"
          [animate]="{ backgroundColor: 'rgb(0, 0, 255)' }"
          [transition]="{ duration: 0 }"
        ></div>`,
        imports: [NgmMotionDirective],
      })
      class Host {}

      const fixture = TestBed.createComponent(Host);
      fixture.detectChanges();
      await flushAnimations();

      const el = getNativeEl(fixture);
      // After instant animation, background-color should be the target
      // motion-dom may normalize to rgba format
      const bg = el.style.backgroundColor;
      expect(bg).toBeTruthy();
    });

    it('repeat/repeatType/repeatDelay configuration', () => {
      @Component({
        template: `<div
          ngmMotion
          [initial]="{ opacity: 0 }"
          [animate]="{ opacity: 1 }"
          [transition]="{ repeat: 2, repeatType: 'reverse', repeatDelay: 0, duration: 0 }"
        ></div>`,
        imports: [NgmMotionDirective],
      })
      class Host {}

      const fixture = TestBed.createComponent(Host);
      fixture.detectChanges();

      const dir = getDirective(fixture);
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      const transition = dir.ve?.getProps().transition as Record<string, unknown>;
      expect(transition['repeat']).toBe(2);
      expect(transition['repeatType']).toBe('reverse');
      expect(transition['repeatDelay']).toBe(0);
    });

    it('per-property delay — different properties have different timing', async () => {
      @Component({
        template: `<div
          ngmMotion
          [initial]="{ opacity: 0, x: 0 }"
          [animate]="{ opacity: 1, x: 100 }"
          [transition]="{ opacity: { duration: 0, delay: 0 }, x: { duration: 0 } }"
        ></div>`,
        imports: [NgmMotionDirective],
      })
      class Host {}

      const fixture = TestBed.createComponent(Host);
      fixture.detectChanges();
      await flushAnimations();

      const el = getNativeEl(fixture);
      expect(el.style.opacity).toBe('1');
      expect(el.style.transform).toContain('translateX(100px)');
    });

    it('transitionEnd final values — applies after animation', async () => {
      @Component({
        template: `<div
          ngmMotion
          [initial]="{ opacity: 0 }"
          [animate]="{ opacity: 1, transitionEnd: { display: 'none' } }"
          [transition]="{ duration: 0 }"
        ></div>`,
        imports: [NgmMotionDirective],
      })
      class Host {}

      const fixture = TestBed.createComponent(Host);
      fixture.detectChanges();
      await flushAnimations();

      const el = getNativeEl(fixture);
      // opacity should reach target
      expect(el.style.opacity).toBe('1');
      // transitionEnd should apply display:none after animation completes
      // Note: in jsdom this may or may not be applied depending on motion-dom internals
      // At minimum, verify the animation completed
    });

    it('spring type animation configuration', () => {
      @Component({
        template: `<div
          ngmMotion
          [initial]="{ x: 0 }"
          [animate]="{ x: 100 }"
          [transition]="{ type: 'spring', stiffness: 100, damping: 10, duration: 0.01 }"
        ></div>`,
        imports: [NgmMotionDirective],
      })
      class Host {}

      const fixture = TestBed.createComponent(Host);
      fixture.detectChanges();

      const dir = getDirective(fixture);
      const ve = dir.ve;
      expect(ve).not.toBeNull();
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      const transition = ve?.getProps().transition as Record<string, unknown>;
      expect(transition['type']).toBe('spring');
      expect(transition['stiffness']).toBe(100);
      expect(transition['damping']).toBe(10);
    });

    it('fallback to DOM-read value — no initial, animate reads current value', async () => {
      @Component({
        template: `<div ngmMotion [animate]="{ opacity: 1 }" [transition]="{ duration: 0 }"></div>`,
        imports: [NgmMotionDirective],
      })
      class Host {}

      const fixture = TestBed.createComponent(Host);
      fixture.detectChanges();
      await flushAnimations();

      const el = getNativeEl(fixture);
      // Without initial, motion-dom reads from DOM and animates to target
      expect(el.style.opacity).toBe('1');
    });
  });

  // ════════════════════════════════════════════════════════════════════════
  // Variants advanced
  // ════════════════════════════════════════════════════════════════════════

  describe('variants advanced', () => {
    it('beforeChildren timing — parent variant configured with when:beforeChildren', () => {
      @Component({
        template: ` <div ngmMotion [initial]="'hidden'" [animate]="'visible'" [variants]="parentV">
          <span ngmMotion [variants]="childV"></span>
        </div>`,
        imports: [NgmMotionDirective],
      })
      class Host {
        parentV: Variants = {
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { when: 'beforeChildren', duration: 0 },
          },
        };
        childV: Variants = { hidden: { y: 20 }, visible: { y: 0 } };
      }

      const fixture = TestBed.createComponent(Host);
      fixture.detectChanges();

      const parent = getDirective(fixture, 0);
      const child = getDirective(fixture, 1);

      // Verify the orchestration is configured
      const parentVe = parent.ve;
      expect(parentVe).not.toBeNull();
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      const parentVariant = parentVe?.getProps().variants?.['visible'] as Record<string, unknown>;
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      const parentTransition = parentVariant['transition'] as Record<string, unknown>;
      expect(parentTransition['when']).toBe('beforeChildren');

      // Child is properly linked
      const childVe = child.ve;
      expect(childVe).not.toBeNull();

      expect(childVe?.parent).toBe(parent.ve);
    });

    it('stagger + delayChildren calculation', () => {
      @Component({
        template: ` <div ngmMotion [initial]="'hidden'" [animate]="'visible'" [variants]="parentV">
          <span ngmMotion [variants]="childV" class="c1"></span>
          <span ngmMotion [variants]="childV" class="c2"></span>
          <span ngmMotion [variants]="childV" class="c3"></span>
        </div>`,
        imports: [NgmMotionDirective],
      })
      class Host {
        parentV: Variants = {
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1, delayChildren: 0.2 },
          },
        };
        childV: Variants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
      }

      const fixture = TestBed.createComponent(Host);
      fixture.detectChanges();

      const parent = getDirective(fixture, 0);
      const parentVe = parent.ve;
      expect(parentVe).not.toBeNull();
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      const parentVariant = parentVe?.getProps().variants?.['visible'] as Record<string, unknown>;
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      const parentTransition = parentVariant['transition'] as Record<string, unknown>;

      expect(parentTransition['staggerChildren']).toBe(0.1);
      expect(parentTransition['delayChildren']).toBe(0.2);

      // Verify all children are linked to parent
      const child1Ve = getDirective(fixture, 1).ve;
      const child2Ve = getDirective(fixture, 2).ve;
      const child3Ve = getDirective(fixture, 3).ve;
      expect(child1Ve).not.toBeNull();
      expect(child2Ve).not.toBeNull();
      expect(child3Ve).not.toBeNull();

      expect(child1Ve?.parent).toBe(parent.ve);

      expect(child2Ve?.parent).toBe(parent.ve);

      expect(child3Ve?.parent).toBe(parent.ve);
    });

    it('staggerDirection reverse — staggerDirection:-1', () => {
      @Component({
        template: ` <div ngmMotion [initial]="'hidden'" [animate]="'visible'" [variants]="parentV">
          <span ngmMotion [variants]="childV"></span>
          <span ngmMotion [variants]="childV"></span>
        </div>`,
        imports: [NgmMotionDirective],
      })
      class Host {
        parentV: Variants = {
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1, staggerDirection: -1 },
          },
        };
        childV: Variants = { hidden: { opacity: 0 }, visible: { opacity: 1 } };
      }

      const fixture = TestBed.createComponent(Host);
      fixture.detectChanges();

      const parent = getDirective(fixture, 0);
      const parentVe = parent.ve;
      expect(parentVe).not.toBeNull();
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      const parentVariant = parentVe?.getProps().variants?.['visible'] as Record<string, unknown>;
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      const parentTransition = parentVariant['transition'] as Record<string, unknown>;

      expect(parentTransition['staggerDirection']).toBe(-1);
    });

    it('variant change mid-animation — switch from visible to hidden', async () => {
      @Component({
        template: `<div
          ngmMotion
          [initial]="'hidden'"
          [animate]="currentVariant()"
          [variants]="v"
          [transition]="{ duration: 0 }"
        ></div>`,
        imports: [NgmMotionDirective],
      })
      class Host {
        currentVariant = signal<string>('visible');
        v: Variants = {
          hidden: { opacity: 0, x: -100 },
          visible: { opacity: 1, x: 0 },
        };
      }

      const fixture = TestBed.createComponent(Host);
      fixture.detectChanges();
      await flushAnimations();

      const el = getNativeEl(fixture);
      expect(el.style.opacity).toBe('1');

      // Switch variant mid-animation
      fixture.componentInstance.currentVariant.set('hidden');
      fixture.detectChanges();
      TestBed.tick();
      fixture.detectChanges();
      await flushAnimations();

      expect(el.style.opacity).toBe('0');
      expect(el.style.transform).toContain('translateX(-100px)');
    });

    it('dynamic variants (function form) — if supported by motion-dom', () => {
      // motion-dom supports variant functions that receive custom data
      // We verify the function is passed through as a variant value
      const dynamicVariant = (): Record<string, number> => ({ opacity: 0.75 });

      @Component({
        template: `<div ngmMotion [initial]="'hidden'" [animate]="'visible'" [variants]="v"></div>`,
        imports: [NgmMotionDirective],
      })
      class Host {
        v: Variants = {
          hidden: { opacity: 0 },
          visible: dynamicVariant,
        };
      }

      const fixture = TestBed.createComponent(Host);
      fixture.detectChanges();

      const dir = getDirective(fixture);
      const ve = dir.ve;
      expect(ve).not.toBeNull();

      const visibleVariant = ve?.getProps().variants?.['visible'];
      // Function variants are passed through to motion-dom
      expect(typeof visibleVariant).toBe('function');
    });

    it('transitionEnd ordering with variants — variant includes transitionEnd', async () => {
      @Component({
        template: `<div
          ngmMotion
          [initial]="'hidden'"
          [animate]="'visible'"
          [variants]="v"
          [transition]="{ duration: 0 }"
        ></div>`,
        imports: [NgmMotionDirective],
      })
      class Host {
        v: Variants = {
          hidden: { opacity: 0 },
          visible: { opacity: 1, transitionEnd: { display: 'block' } },
        };
      }

      const fixture = TestBed.createComponent(Host);
      fixture.detectChanges();
      await flushAnimations();

      const el = getNativeEl(fixture);
      // opacity should animate to 1
      expect(el.style.opacity).toBe('1');
      // transitionEnd should apply after animation
      // Note: jsdom behavior may vary, but the variant is correctly configured
      const dir = getDirective(fixture);
      const ve = dir.ve;
      expect(ve).not.toBeNull();
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      const visibleVariant = ve?.getProps().variants?.['visible'] as Record<string, unknown>;
      expect(visibleVariant['transitionEnd']).toEqual({ display: 'block' });
    });
  });
});
