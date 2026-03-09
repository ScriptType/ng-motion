import '../test-env';
import { Component } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NgmMotionDirective } from '../core/motion.directive';
import { _resetFeatureInit } from '../core/feature-init';
import { _resetObserverPool } from './in-view';

// ─── IntersectionObserver Mock ───────────────────────────────────────────────

let mockObserverCallback: IntersectionObserverCallback;
let mockObserverInstance: { observe: ReturnType<typeof vi.fn>; unobserve: ReturnType<typeof vi.fn>; disconnect: ReturnType<typeof vi.fn> };
let mockObserverOptions: IntersectionObserverInit | undefined;

function triggerIntersection(element: Element, isIntersecting: boolean): void {
  mockObserverCallback(
    [
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      {
        target: element,
        isIntersecting,
        intersectionRatio: isIntersecting ? 1 : 0,
      } as IntersectionObserverEntry,
    ],
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    mockObserverInstance as unknown as IntersectionObserver,
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getNativeEl(fixture: ComponentFixture<unknown>, index = 0): HTMLElement {
  const debugEls = fixture.debugElement.queryAll(By.directive(NgmMotionDirective));
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return debugEls[index].nativeElement as HTMLElement;
}

async function flushAnimations(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 50));
}

// ─── Test Suite ──────────────────────────────────────────────────────────────

describe('InViewFeature', () => {
  beforeEach(() => {
    _resetFeatureInit();
    _resetObserverPool();

    mockObserverInstance = {
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    };

    class MockIntersectionObserver {
      constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
        mockObserverCallback = callback;
        mockObserverOptions = options;
      }
      observe = mockObserverInstance.observe;
      unobserve = mockObserverInstance.unobserve;
      disconnect = mockObserverInstance.disconnect;
      root = null;
      rootMargin = '0px';
      thresholds = [0];
      takeRecords = vi.fn().mockReturnValue([]);
    }
    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('whileInView applies animation when element enters viewport', async () => {
    @Component({
      template: `<div ngmMotion
        [initial]="{opacity: 0}"
        [animate]="{opacity: 0}"
        [whileInView]="{opacity: 1}"
        [transition]="{duration: 0}"></div>`,
      imports: [NgmMotionDirective],
    })
    class Host {}

    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    await flushAnimations();

    const el = getNativeEl(fixture);

    triggerIntersection(el, true);
    await flushAnimations();

    expect(el.style.opacity).toBe('1');
  });

  it('whileInView reverts when element leaves viewport', async () => {
    @Component({
      template: `<div ngmMotion
        [initial]="{opacity: 0}"
        [animate]="{opacity: 0}"
        [whileInView]="{opacity: 1}"
        [transition]="{duration: 0}"></div>`,
      imports: [NgmMotionDirective],
    })
    class Host {}

    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    await flushAnimations();

    const el = getNativeEl(fixture);

    // Enter viewport
    triggerIntersection(el, true);
    await flushAnimations();
    expect(el.style.opacity).toBe('1');

    // Leave viewport
    triggerIntersection(el, false);
    await flushAnimations();
    expect(el.style.opacity).toBe('0');
  });

  it('viewport.once prevents re-triggering after first entry', async () => {
    @Component({
      template: `<div ngmMotion
        [initial]="{opacity: 0}"
        [animate]="{opacity: 0}"
        [whileInView]="{opacity: 1}"
        [viewport]="{once: true}"
        [transition]="{duration: 0}"></div>`,
      imports: [NgmMotionDirective],
    })
    class Host {}

    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    await flushAnimations();

    const el = getNativeEl(fixture);

    // Enter viewport — observer should be removed after this
    triggerIntersection(el, true);
    await flushAnimations();
    expect(el.style.opacity).toBe('1');

    // After once triggers, the observer should have been cleaned up
    expect(mockObserverInstance.unobserve).toHaveBeenCalled();
  });

  it('viewportEnter and viewportLeave outputs fire', async () => {
    @Component({
      template: `<div ngmMotion
        [whileInView]="{opacity: 1}"
        [transition]="{duration: 0}"
        (viewportEnter)="onEnter()"
        (viewportLeave)="onLeave()"></div>`,
      imports: [NgmMotionDirective],
    })
    class Host {
      entered = false;
      left = false;
      onEnter(): void {
        this.entered = true;
      }
      onLeave(): void {
        this.left = true;
      }
    }

    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    await flushAnimations();

    const el = getNativeEl(fixture);

    triggerIntersection(el, true);
    expect(fixture.componentInstance.entered).toBe(true);

    triggerIntersection(el, false);
    expect(fixture.componentInstance.left).toBe(true);
  });

  it('viewport.amount=all passes threshold=1 to IntersectionObserver', () => {
    @Component({
      template: `<div ngmMotion
        [whileInView]="{opacity: 1}"
        [viewport]="{amount: 'all'}"></div>`,
      imports: [NgmMotionDirective],
    })
    class Host {}

    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();

    expect(mockObserverOptions?.threshold).toEqual([1]);
  });

  it('does not create observer when whileInView is not set', () => {
    @Component({
      template: `<div ngmMotion [animate]="{opacity: 1}"></div>`,
      imports: [NgmMotionDirective],
    })
    class Host {}

    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();

    expect(mockObserverInstance.observe).not.toHaveBeenCalled();
  });
});
